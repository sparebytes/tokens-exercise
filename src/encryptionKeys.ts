if (!process.env.ENCRYPTION_KEYS) {
  throw new Error("ENCRYPTION_KEYS must be provided");
}

export const encryptionKeys = new Map<number, string>();
for (const [indexStr, value] of Object.entries(JSON.parse(process.env.ENCRYPTION_KEYS))) {
  const index = parseFloat(indexStr);
  if (!Number.isInteger(index)) {
    throw new Error("ENCRYPTION_KEYS has malformed key: " + indexStr);
  }
  if (typeof value !== "string" || !/^[0-9a-zA-Z]{64}$/.test(value)) {
    throw new Error(`ENCRYPTION_KEYS[${JSON.stringify(index)}] is invalid.`);
  }
  encryptionKeys.set(index, value);
}

if (encryptionKeys.size === 0) {
  throw new Error("ENCRYPTION_KEYS is empty.");
}

const _primaryEncryptionKey = Array.from(encryptionKeys.entries())[0];

// [ ] discuss: this function allows us to chnage the key mid-process
export function getPrimaryEncryptionKey() {
  return _primaryEncryptionKey;
}

export function getEncryptionKey(index: number): string {
  const key = encryptionKeys.get(index);
  if (key === undefined) {
    throw new Error("Unknown encryption key at index " + index);
  }
  return key;
}
