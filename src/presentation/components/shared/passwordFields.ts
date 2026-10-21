export interface PasswordField {
  readonly key: string;
  readonly label: string;
  /** "new" fields are checked with the secret policy; "confirm" must equal the "new" one; "current" is only required. */
  readonly role: "current" | "new" | "confirm";
}
