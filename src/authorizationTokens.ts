export const authorizationTokens = new Set(process.env.AUTHORIZATION_TOKENS?.split(","));

if (authorizationTokens.size < 1) {
  throw new Error("At least one key must be provided.");
}
for (const key of authorizationTokens) {
  if (key.length !== 64) {
    throw new Error("One of the AUTHORIZATION_TOKENS values is invalid");
  }
}
