/** The typed password could not decrypt the positions data. */
export class InvalidAccessPasswordError extends Error {
  public constructor() {
    super("Invalid access password.");
    this.name = "InvalidAccessPasswordError";
  }
}

/** The encrypted files are missing, unreachable or malformed. */
export class PositionsDataError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "PositionsDataError";
  }
}
