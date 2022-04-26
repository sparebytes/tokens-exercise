import { decrypt, encrypt } from "./encryption";
import { parseTokenUuid } from "./utils";

// Note: Using Uuids for improved database performance (when we use a database later)

const data = new Map<string, string>();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;
if (typeof ENCRYPTION_KEY !== "string" || !/^[0-9a-zA-Z]{64}$/.test(ENCRYPTION_KEY)) {
  throw new Error("ENCRYPTION_KEY is invalid");
}

export async function loadSecret(token: string): Promise<string> {
  const uuid = parseTokenUuid(token);
  const encrypted = data.get(uuid);
  if (encrypted === undefined) {
    throw new Error(`There is no secret with the given token: ${token}`);
  }
  const value = decrypt(encrypted, ENCRYPTION_KEY);
  return value;
}

export async function loadSecrets(tokens: string[]): Promise<string[]> {
  const entries = await Promise.all(tokens.map(async (token) => [token, await loadSecret(token)]));
  const secrets = Object.fromEntries(entries);
  return secrets;
}

export async function insertSecret(token: string, value: string): Promise<void> {
  const uuid = parseTokenUuid(token);
  if (data.has(uuid)) {
    throw new Error(`There is no secret with the given token: ${token}`);
  }
  const encrypted = encrypt(value, ENCRYPTION_KEY);
  data.set(uuid, encrypted);
}

export async function updateSecret(token: string, value: string): Promise<void> {
  const uuid = parseTokenUuid(token);
  if (!data.has(uuid)) {
    throw new Error(`A secret has already been inserted with the given token: ${token}`);
  }
  const encrypted = encrypt(value, ENCRYPTION_KEY);
  data.set(uuid, encrypted);
}
