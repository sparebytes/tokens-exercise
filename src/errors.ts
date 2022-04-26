export class ReplacedSecretError extends Error {
  readonly code: "X_REPLACED_SECRET_ERROR";
  constructor(oldToken: string) {
    super(`This old token has already been replaced: ${JSON.stringify(oldToken)}`);
    this.code = "X_REPLACED_SECRET_ERROR";
  }
}
