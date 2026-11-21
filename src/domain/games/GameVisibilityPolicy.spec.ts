import { describe, expect, it } from "vitest";
import { GameVisibilityPolicy } from "./GameVisibilityPolicy";

describe("GameVisibilityPolicy", () => {
  it("keeps the open games available without a password", () => {
    for (const id of ["conversation-cards", "daily-challenges", "dual-dice", "truth-or-dare", "two-questions", "scratch-cards"]) {
      expect(GameVisibilityPolicy.isOpen(id)).toBe(true);
      expect(GameVisibilityPolicy.isVisible(id, false)).toBe(true);
    }
  });

  it("hides every other game until the password is accepted", () => {
    for (const id of ["snake-ladder", "positions"]) {
      expect(GameVisibilityPolicy.isVisible(id, false)).toBe(false);
      expect(GameVisibilityPolicy.isVisible(id, true)).toBe(true);
    }
  });
});
