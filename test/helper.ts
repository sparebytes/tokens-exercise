// helper.ts

import { buildServer } from "../src/server";

const keys = new Set(process.env.API_AUTHENTICATION_SUPER_KEYS?.split(","));

export async function withServer(
  callback: (server: ReturnType<typeof buildServer>) => Promise<unknown>,
) {
  const server = buildServer({ keys });
  await server.ready();
  try {
    await callback(server);
  } finally {
    void server.close();
  }
}
