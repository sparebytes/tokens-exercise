import crypto from "crypto";

const tokenFormatRegex = /^dp\.token\.[a-zA-Z0-9]+$/;

export function isValidToken(token: string) {
  return typeof token === "string" && tokenFormatRegex.test(token);
}

export function generateToken() {
  return `dp.token.${generateRandomString()}`;
}

export function generateRandomString(size = 32) {
  return crypto.randomBytes(size).toString("base64").slice(0, size);
}
