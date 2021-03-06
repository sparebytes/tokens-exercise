import crypto from "crypto";

// AES-256-GCM encryption using a pre-computed key and random IV
// [ ] discuss: integrity and confidentiality
export function encrypt(plaintext: string, key: string) {
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv("aes-256-gcm", Buffer.from(key, "hex"), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString("hex");
}

export function decrypt(ciphertext: string, key: string) {
  const data = Buffer.from(ciphertext, "hex");
  const iv = data.slice(0, 16);
  const tag = data.slice(16, 32);
  const text = data.slice(32);

  const decipher = crypto.createDecipheriv("aes-256-gcm", Buffer.from(key, "hex"), iv);
  decipher.setAuthTag(tag);

  return decipher.update(text, "binary", "utf8") + decipher.final("utf8");
}
