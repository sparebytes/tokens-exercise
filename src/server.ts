import Fastify from "fastify";
import bearerAuthPlugin from "fastify-bearer-auth";
import helmet from "fastify-helmet";
import { insertSecret, loadSecrets, updateSecret } from "./persist";
import { generateToken, isValidToken } from "./utils";

export function buildServer(options: { keys: Set<string> }) {
  if (options.keys.size < 1) {
    throw new Error("At least one key must be provided.");
  }
  for (const key of options.keys) {
    if (key.length !== 64) {
      throw new Error("One of the API_AUTHENTICATION_SUPER_KEYS values is invalid");
    }
  }

  const server = Fastify();

  server.register(
    helmet,
    // Example disables the `contentSecurityPolicy` middleware but keeps the rest.
    { contentSecurityPolicy: false },
  );

  server.register(bearerAuthPlugin, { keys: options.keys });

  server.get("/tokens", async (request, reply) => {
    const tokensStr: string = request.query.t;
    if (tokensStr === undefined) {
      reply.code(400);
      return { error: `Query string "t" must be provided.` };
    }
    if (tokensStr.length === 0) {
      reply.code(400);
      return { error: `Query string "t" must not be empty.` };
    }

    const tokens = tokensStr.split(",");
    // discuss: allow 100 tokens at once?
    if (tokens.length > 100) {
      reply.code(414);
      return { error: `At most 100 tokens may be given at once.` };
    }

    for (const token of tokens) {
      if (!isValidToken(token)) {
        reply.code(400);
        return { error: `Query string "t" contains an improperly formatted token.`, token };
      }
    }

    const results = await loadSecrets(tokens);
    return results;
  });

  server.post("/tokens", async (request, reply) => {
    const secret: string = request.body?.secret;
    if (secret === undefined) {
      reply.code(400);
      return { error: `Body property "secret" must be provided.` };
    }
    if (typeof secret !== "string") {
      reply.code(400);
      return { error: `Body property "secret" must be a string.` };
    }

    const token = generateToken();
    await insertSecret(token, secret);
    return { token };
  });

  server.put("/tokens/:t", async (request, reply) => {
    const token: string = request.params.t;
    if (token === undefined) {
      reply.code(400);
      return { error: `Token parameter must be provided.` };
    }
    if (token.length === 0) {
      reply.code(400);
      return { error: `Token parameter "t" must not be empty.` };
    }
    if (!isValidToken(token)) {
      reply.code(400);
      return { error: `Token parameter is improperly formatted.`, token };
    }

    const secret: string = request.body?.secret;
    if (secret === undefined) {
      reply.code(400);
      return { error: `Body property "secret" must be provided.` };
    }
    if (typeof secret !== "string") {
      reply.code(400);
      return { error: `Body property "secret" must be a string.` };
    }

    await updateSecret(token, secret);

    return { token };
  });

  server.delete("/tokens/:t", async (request, reply) => {
    reply.code(204);
    return null;
  });

  return server;
}
