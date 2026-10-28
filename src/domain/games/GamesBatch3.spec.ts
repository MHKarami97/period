import { describe, expect, it } from "vitest";
import { ConversationCategory } from "./conversation/ConversationCard";
import { ConversationSession } from "./conversation/ConversationSession";
import { DEFAULT_CONVERSATION_CARDS } from "./conversation/defaultConversationCards";
import type { IRandomSource } from "./IRandomSource";
import { DEFAULT_SCRATCH_CARDS } from "./scratchCards/defaultScratchCards";
import { ScratchCategory } from "./scratchCards/ScratchCard";
import { ScratchSheet } from "./scratchCards/ScratchSheet";
import { GameValidationError } from "./shared/GameValidationError";

class SeededRandom implements IRandomSource {
  private state: number;

  public constructor(seed: number) {
    this.state = seed;
  }

  public nextInt(minInclusive: number, maxInclusive: number): number {
    this.state = (this.state * 1664525 + 1013904223) % 4294967296;
    return minInclusive + Math.floor((this.state / 4294967296) * (maxInclusive - minInclusive + 1));
  }
}

describe("ConversationSession", () => {
  it("shows every card of the chosen categories once before repeating", () => {
    const random = new SeededRandom(5);
    let session = ConversationSession.start(DEFAULT_CONVERSATION_CARDS, [ConversationCategory.Family], random);
    const seen = new Set<string>();
    for (let i = 0; i < 8; i += 1) {
      session = session.draw(random);
      seen.add(session.currentCard?.id ?? "");
    }
    expect(seen.size).toBe(8);
    expect([...seen].every((id) => id.includes("family"))).toBe(true);
  });

  it("resets automatically when all eligible cards have been seen", () => {
    const random = new SeededRandom(5);
    const familyCards = DEFAULT_CONVERSATION_CARDS.filter((c) => c.category === ConversationCategory.Family);
    const total = familyCards.length;

    let session = ConversationSession.start(familyCards, [ConversationCategory.Family], random);
    const seen = new Set<string>();
    for (let i = 0; i < total; i += 1) {
      session = session.draw(random);
      seen.add(session.currentCard!.id);
    }
    expect(seen.size).toBe(total);

    // Drawing one more triggers auto-reset
    session = session.draw(random);
    expect(session.wasReset).toBe(true);
    expect(familyCards.map((c) => c.id)).toContain(session.currentCard!.id);
  });

  it("refuses to draw when no card matches", () => {
    const session = ConversationSession.start([], [ConversationCategory.Couple], new SeededRandom(1));
    expect(session.hasCards).toBe(false);
    expect(() => session.draw(new SeededRandom(1))).toThrow(GameValidationError);
  });
});

describe("ScratchSheet", () => {
  const random = new SeededRandom(9);
  const categories = Object.values(ScratchCategory);

  it("deals the requested number of cards and skips completed ones", () => {
    const completed = new Set(DEFAULT_SCRATCH_CARDS.slice(0, 20).map((card) => card.id));
    const sheet = ScratchSheet.deal({ pool: DEFAULT_SCRATCH_CARDS, categories, completedIds: completed, random });
    expect(sheet.slots).toHaveLength(6);
    expect(sheet.slots.every((slot) => !completed.has(slot.card.id))).toBe(true);
  });

  it("moves a slot hidden -> revealed -> done and ignores skipped steps", () => {
    const sheet = ScratchSheet.deal({ pool: DEFAULT_SCRATCH_CARDS, categories, completedIds: new Set(), random });
    const id = sheet.slots[0].card.id;
    expect(sheet.complete(id).slots[0].status).toBe("hidden");
    const revealed = sheet.reveal(id);
    expect(revealed.slots[0].status).toBe("revealed");
    expect(revealed.complete(id).doneCount).toBe(1);
  });

  it("throws when everything is completed", () => {
    const all = new Set(DEFAULT_SCRATCH_CARDS.map((card) => card.id));
    expect(() => ScratchSheet.deal({ pool: DEFAULT_SCRATCH_CARDS, categories, completedIds: all, random })).toThrow(GameValidationError);
  });
});
