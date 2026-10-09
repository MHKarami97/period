/** Raised when a board edit would break a Snake & Ladder invariant. The message is user-facing (Persian). */
export class BoardValidationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "BoardValidationError";
  }
}
