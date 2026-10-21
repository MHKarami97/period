import { describe, expect, it } from "vitest";
import type { IRandomSource } from "./IRandomSource";
import { DEFAULT_ACTIONS, DEFAULT_BODY_PARTS } from "./dualDice/defaultFaces";
import { DualDiceSettings } from "./dualDice/DualDiceSettings";
import { DEFAULT_SCRATCH_CARDS } from "./scratchCards/defaultScratchCards";
import { QUESTION_BANK } from "./twoQuestions/questionBank";
import { TwoQuestionSession } from "./twoQuestions/TwoQuestionSession";

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

const hasNoDuplicates = (items: readonly string[]): boolean => new Set(items).size === items.length;

describe("default game content", () => {
  it("keeps dice faces unique and loadable", () => {
    expect(hasNoDuplicates(DEFAULT_BODY_PARTS)).toBe(true);
    expect(hasNoDuplicates(DEFAULT_ACTIONS)).toBe(true);
    expect(DualDiceSettings.defaults().actions).toHaveLength(DEFAULT_ACTIONS.length);
    expect(DualDiceSettings.defaults().bodyParts).toHaveLength(DEFAULT_BODY_PARTS.length);
  });

  it("keeps scratch cards unique by id and text", () => {
    expect(hasNoDuplicates(DEFAULT_SCRATCH_CARDS.map((card) => card.id))).toBe(true);
    expect(hasNoDuplicates(DEFAULT_SCRATCH_CARDS.map((card) => card.text))).toBe(true);
  });

  it("keeps every question template unique and parameterised by minutes", () => {
    const all = Object.values(QUESTION_BANK).flatMap((tiers) => Object.values(tiers).flat());
    expect(hasNoDuplicates(all)).toBe(true);
    expect(all.every((template) => template.includes("{m}"))).toBe(true);
  });

  it("never asks the same question twice in one session", () => {
    for (let seed = 1; seed <= 50; seed += 1) {
      let session = TwoQuestionSession.start({ womanName: "a", manName: "b", durationMinutes: 3, random: new SeededRandom(seed) });
      const texts: string[] = [];
      while (!session.isFinished) {
        texts.push(session.currentStep?.questionText.split("«")[1] ?? "");
        session = session.advance();
      }
      expect(hasNoDuplicates(texts)).toBe(true);
      expect(texts.every((text) => !text.includes("{m}"))).toBe(true);
    }
  });
});
