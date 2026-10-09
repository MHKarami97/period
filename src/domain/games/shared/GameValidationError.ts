/** Raised when a game setting violates an invariant. The message is user-facing (Persian). */
export class GameValidationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "GameValidationError";
  }
}
