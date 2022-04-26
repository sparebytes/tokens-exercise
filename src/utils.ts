import { v4 } from "uuid";

const tokenFormatRegex =
  /^dp\.token\.([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;

export function isValidToken(token: string) {
  return typeof token === "string" && tokenFormatRegex.test(token);
}

export function parseTokenUuid(token: string) {
  const uuid = tokenFormatRegex.exec(token)?.[1];
  if (uuid === undefined) {
    throw new Error("Invalid token format.");
  }
  return uuid;
}

export function generateToken() {
  // Note: Went with a uuid for uniqueness and performant storability
  return `dp.token.${v4()}`;
}
