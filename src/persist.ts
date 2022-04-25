import { decrypt, encrypt } from "./encryption";
import { isValidToken } from "./utils";

const data = new Map<string, string>();

const { ENCRYPTION_KEY } = process.env;
if (typeof ENCRYPTION_KEY !== "string" || !/^[0-9a-zA-Z]{64}$/.test(ENCRYPTION_KEY)) {
  throw new Error("ENCRYPTION_KEY is invalid");
}

export async function loadSecret(token: string): Promise<string> {
  if (!isValidToken(token)) {
    throw new Error("Invalid token format");
  }
  if (!data.has(token)) {
    throw new Error(`There is no secret with the given token: ${token}`);
  }
  const encrypted = data.get(token);
  const value = decrypt(encrypted, ENCRYPTION_KEY);
  return value;
}

export async function loadSecrets(tokens: string[]): Promise<string[]> {
  const entries = await Promise.all(tokens.map((token) => [token, loadSecret(token)]));
  const secrets = Object.fromEntries(entries);
  return secrets;
}

export async function insertSecret(token: string, value: string): Promise<void> {
  if (!isValidToken(token)) {
    throw new Error("Invalid token format");
  }
  if (data.has(token)) {
    throw new Error(`There is no secret with the given token: ${token}`);
  }
  const encrypted = encrypt(value, ENCRYPTION_KEY);
  data.set(token, encrypted);
}

export async function updateSecret(token: string, value: string): Promise<void> {
  if (!data.has(token)) {
    throw new Error(`A secret has already been inserted with the given token: ${token}`);
  }
  const encrypted = encrypt(value, ENCRYPTION_KEY);
  data.set(token, encrypted);
}
