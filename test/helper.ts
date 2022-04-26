// helper.ts

import { buildServer } from "../src/server";

export async function withServer(
  callback: (server: ReturnType<typeof buildServer>) => Promise<unknown>,
) {
  const server = buildServer();
  await server.ready();
  try {
    await callback(server);
  } finally {
    void server.close();
  }
}
