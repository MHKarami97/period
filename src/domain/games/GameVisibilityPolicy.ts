/**
 * GameVisibilityPolicy - Domain Service deciding which games exist for the user
 * before and after the games password has been entered.
 *
 * Open games are always visible and playable. Every other game is hidden
 * (not just disabled) until the password is accepted in Settings.
 */
export class GameVisibilityPolicy {
  private static readonly OPEN_GAME_IDS: ReadonlySet<string> = new Set(["conversation-cards"]);

  public static isOpen(gameId: string): boolean {
    return GameVisibilityPolicy.OPEN_GAME_IDS.has(gameId);
  }

  public static isVisible(gameId: string, isUnlocked: boolean): boolean {
    return isUnlocked || GameVisibilityPolicy.isOpen(gameId);
  }
}
