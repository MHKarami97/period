/** Raised when a Hamdel entry breaks a section rule. The message is user-facing Persian. */
export class HamdelValidationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "HamdelValidationError";
  }
}
