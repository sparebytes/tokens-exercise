import Fastify from "fastify";
import bearerAuthPlugin from "fastify-bearer-auth";
import { authorizationTokens } from "./authorizationTokens";
import { ReplacedSecretError } from "./errors";
import { insertSecret, loadSecrets, updateSecret } from "./persist";
import { generateToken, isValidToken } from "./utils";

// [ ] discuss:
const MAX_SECRET_LENGTH = 500000;

// [ ] discuss:
const MAX_TOKENS_AT_ONCE = 100;

export function buildServer(opts?: any) {
  const server = Fastify({
    // [ ] discuss: where are logs piped?
    // - HTTP, Error, and other logs cannot contain secret information
    logger: { level: "error" },
    ...opts,
  });

  // [ ] discuss: Anything that results in an Internal Server Error should be looked at immediately
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
    if (Buffer.from(secret, "utf-8").length > MAX_SECRET_LENGTH) {
      reply.code(413);
      return { error: `Secret length must be less than ${MAX_SECRET_LENGTH} .` };
    }

    const token = generateToken();
    await insertSecret(token, secret);
    return { token };
  });

  server.put("/tokens/:t", async (request, reply) => {
    const oldToken: string = request.params.t;
    if (oldToken === undefined) {
      reply.code(400);
      return { error: `Token parameter must be provided.` };
    }
    if (oldToken.length === 0) {
      reply.code(400);
      return { error: `Token parameter "t" must not be empty.` };
    }
    if (!isValidToken(oldToken)) {
      reply.code(400);
      return { error: `Token parameter is improperly formatted.`, token: oldToken };
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

    const newToken = generateToken();

    // [ ] discuss: The old token expires after 2 minutes and a new token is generated.
    //     Once a token has been superseeded, it cannot be updated again.
    //     This gives time for temporarily cached copies of tokens to be used
    //     while preventing race conditions for a period of time
    //
    //     😱 What happens if the client API has an error and is unable to write the new updated token to storage?
    //        That could result in the loss of the secret. Consider storing a map of oldToken -> newToken, which would
    //        allow the client API to recover
    try {
      await updateSecret(oldToken, newToken, secret);
    } catch (error) {
      if (error instanceof ReplacedSecretError) {
        reply.code(400);
        return { error: `secret has already been replaced with another token.` };
      }
      throw error;
    }

    return { token: newToken };
  });

  server.delete("/tokens/:t", async (request, reply) => {
    reply.code(204);
    return null;
  });

  return server;
}
