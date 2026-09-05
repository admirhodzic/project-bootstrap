export class UserError extends Error {
  public constructor(
    message: string,
    public readonly exitCode = 2,
  ) {
    super(message);
    this.name = 'UserError';
  }
}
