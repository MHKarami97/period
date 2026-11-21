import { describe, expect, it } from "vitest";
import { GameVisibilityPolicy } from "./GameVisibilityPolicy";

describe("GameVisibilityPolicy", () => {
  it("keeps the conversation game and daily challenges open without a password", () => {
    expect(GameVisibilityPolicy.isOpen("conversation-cards")).toBe(true);
    expect(GameVisibilityPolicy.isVisible("conversation-cards", false)).toBe(true);
    expect(GameVisibilityPolicy.isOpen("daily-challenges")).toBe(true);
    expect(GameVisibilityPolicy.isVisible("daily-challenges", false)).toBe(true);
  });

  it("hides every other game until the password is accepted", () => {
    for (const id of ["snake-ladder", "dual-dice", "truth-or-dare", "two-questions", "scratch-cards", "positions"]) {
      expect(GameVisibilityPolicy.isVisible(id, false)).toBe(false);
      expect(GameVisibilityPolicy.isVisible(id, true)).toBe(true);
    }
  });
});
