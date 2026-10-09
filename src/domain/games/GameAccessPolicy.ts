/**
 * GameAccessPolicy - Domain Service guarding entry into the "Games" section.
 * The password is intentionally hard-coded (client-side only): it is a casual
 * privacy gate, NOT a security boundary, because everything shipped to the
 * browser is readable by whoever owns the device.
 */
export class GameAccessPolicy {
  private static readonly PASSWORD = "ThisIsMyPassword";

  public static isValid(candidate: string): boolean {
    return candidate.trim() === GameAccessPolicy.PASSWORD;
  }
}
