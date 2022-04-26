import { decrypt, encrypt } from "./encryption";
import { getEncryptionKey, getPrimaryEncryptionKey } from "./encryptionKeys";
import { ReplacedSecretError } from "./errors";
import { parseTokenUuid } from "./utils";

const EXPIRATION_TTL = 120000;

// [ ] discuss: Using Uuids for improved database performance (when we use a database later)

const data = new Map<
  string,
  {
    ciphertext: string;
    encryptionKeyIndex: number;
    supersededByUuid?: string;
    expiresEpoch?: number;
  }
>();

export async function loadSecret(token: string): Promise<string> {
  const uuid = parseTokenUuid(token);
  const record = data.get(uuid);
  if (
    record === undefined ||
    (record.expiresEpoch != null && new Date().valueOf() > record.expiresEpoch)
  ) {
    throw new Error(`There is no secret with the given token: ${token}`);
  }
  const decrypted = decrypt(record.ciphertext, getEncryptionKey(record.encryptionKeyIndex));
  return decrypted;
}

export async function loadSecrets(tokens: string[]): Promise<string[]> {
  const entries = await Promise.all(tokens.map(async (token) => [token, await loadSecret(token)]));
  const secrets = Object.fromEntries(entries);
  return secrets;
}

export async function insertSecret(token: string, plaintext: string): Promise<void> {
  const uuid = parseTokenUuid(token);
  if (data.has(uuid)) {
    throw new Error(`A secret has already been inserted with the given token: ${token}`);
  }
  await _saveSecret(uuid, plaintext);
}

export async function updateSecret(
  oldToken: string,
  newToken: string,
  plaintext: string,
): Promise<void> {
  const oldUuid = parseTokenUuid(oldToken);
  const newUuid = parseTokenUuid(newToken);
  const oldReocrd = data.get(oldUuid);
  if (oldReocrd === undefined) {
    throw new Error(`There is no secret with the given token: ${oldToken}`);
  }
  if (oldReocrd.supersededByUuid !== undefined) {
    throw new ReplacedSecretError(oldToken);
  }
  if (data.has(newUuid)) {
    throw new Error(`There is already a secret with the given token: ${newToken}`);
  }

  // [ ] discuss: use db transaction here and lock the
  await _saveSecret(newUuid, plaintext);
  if (oldReocrd.supersededByUuid !== undefined) {
    throw new ReplacedSecretError(oldToken);
  }
  // [ ] discuss: expire replaced values after 2 minutes
  oldReocrd.supersededByUuid = newUuid;
  oldReocrd.expiresEpoch = new Date().valueOf() + EXPIRATION_TTL;
}

async function _saveSecret(uuid: string, plaintext: string): Promise<void> {
  if (typeof plaintext !== "string") {
    throw new Error("Secret value must be a string.");
  }
  const [encryptionKeyIndex, keyValue] = getPrimaryEncryptionKey();
  const ciphertext = encrypt(plaintext, keyValue);
  data.set(uuid, { ciphertext, encryptionKeyIndex });
}
