import Fastify from "fastify";
import bearerAuthPlugin from "fastify-bearer-auth";
import { authorizationTokens } from "./authorizationTokens";
import { insertSecret, loadSecrets, updateSecret } from "./persist";
import { generateToken, isValidToken } from "./utils";

// [ ] discuss:
const MAX_SECRET_LENGTH = 500000;

// [ ] discuss:
const MAX_TOKENS_AT_ONCE = 100;

export function buildServer() {
  const server = Fastify({
    // [ ] discuss: where are logs piped?
    logger: { level: "error" },
  });

  // [ ] discuss: anything that results in an Internal Server Error should be looked at immediately
  server.setErrorHandler((error, request, reply) => {
    reply.send({ error: "Internal Server Error" });
    server.log.error(error);
  });

  // [ ] discuss: this middleware will cause print an error to the console
  server.register(bearerAuthPlugin, { keys: authorizationTokens });

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
    if (tokens.length > MAX_TOKENS_AT_ONCE) {
      reply.code(414);
      return { error: `At most ${MAX_TOKENS_AT_ONCE} tokens may be given at once.` };
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
    if (secret.length > MAX_SECRET_LENGTH) {
      reply.code(413);
      return { error: `Secret length must be less than ${MAX_SECRET_LENGTH} .` };
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
    if (secret.length > MAX_SECRET_LENGTH) {
      reply.code(413);
      return { error: `Secret length must be less than ${MAX_SECRET_LENGTH} .` };
    }

    // [ ] discuss: Should be token be replaced on update?
    // what happens if a secret is updated while reads are occuring?
    // if a token is replaced then the old value should be given a time to live before it is deleted
    await updateSecret(token, secret);

    return { token };
  });

  server.delete("/tokens/:t", async (request, reply) => {
    reply.code(204);
    return null;
  });

  return server;
}
