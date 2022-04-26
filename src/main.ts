import { buildServer } from "./server";

async function start() {
  const PORT = parseFloat(process.env.PORT);
  if (!Number.isInteger(PORT)) {
    throw new Error("PORT must be provided");
  }

  const keys = new Set(process.env.API_AUTHENTICATION_SUPER_KEYS?.split(","));

  const server = buildServer({ keys });

  try {
    await server.listen(PORT);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();
