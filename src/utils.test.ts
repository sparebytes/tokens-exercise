import { generateToken, isValidToken } from "./utils";

test("Generated tokens must be valid", () => {
  for (let i = 0; i < 1000; i++) {
    const token = generateToken();
    expect(isValidToken(token)).toBe(true);
  }
});
