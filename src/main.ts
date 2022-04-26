import { buildServer } from "./server";

async function start() {
  const PORT = parseFloat(process.env.PORT);
  if (!Number.isInteger(PORT)) {
    throw new Error("PORT must be provided");
  }

  const server = buildServer();

  try {
    await server.listen(PORT);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();
