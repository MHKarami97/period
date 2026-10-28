import { describe, expect, it } from "vitest";
import type { IRandomSource } from "./IRandomSource";
import { DualDiceSettings } from "./dualDice/DualDiceSettings";
import { CardDeck } from "./shared/CardDeck";
import { GameValidationError } from "./shared/GameValidationError";
import { StringList } from "./shared/StringList";
import { DEFAULT_CARDS } from "./truthOrDare/defaultCards";
import { CardIntensity, CardType, TruthOrDareCardFactory } from "./truthOrDare/TruthOrDareCard";
import { TruthOrDareGame } from "./truthOrDare/TruthOrDareGame";
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

describe("StringList", () => {
  const options = { minItems: 1, maxItems: 3, maxLength: 10 };

  it("rejects duplicates and blank text", () => {
    const list = StringList.create(["a"], options);
    expect(() => list.add("a")).toThrow(GameValidationError);
    expect(() => list.add("   ")).toThrow(GameValidationError);
  });

  it("never allows removing the last item", () => {
    expect(() => StringList.create(["a"], options).removeAt(0)).toThrow(GameValidationError);
  });
});

describe("DualDiceSettings", () => {
  it("rolls values that exist on the dice", () => {
    const settings = DualDiceSettings.defaults();
    const result = settings.roll(new SeededRandom(7));
    expect(settings.actions).toContain(result.action);
    expect(settings.bodyParts).toContain(result.bodyPart);
  });

  it("round-trips through a JSON snapshot", () => {
    const settings = DualDiceSettings.defaults().withAction("تست");
    const restored = DualDiceSettings.fromSnapshot(JSON.parse(JSON.stringify(settings.toSnapshot())));
    expect(restored.actions).toContain("تست");
  });
});

describe("CardDeck", () => {
  it("draws every card once before repeating", () => {
    const random = new SeededRandom(3);
    let deck = CardDeck.create([1, 2, 3, 4], random);
    const drawn: number[] = [];
    for (let i = 0; i < 4; i += 1) {
      const next = deck.draw(random);
      drawn.push(next.card);
      deck = next.deck;
    }
    expect([...drawn].sort()).toEqual([1, 2, 3, 4]);
  });
});

describe("TruthOrDareGame", () => {
  const random = new SeededRandom(11);

  it("only uses cards at or below the chosen intensity", () => {
    const cards = [
      TruthOrDareCardFactory.create({ id: "1", type: CardType.Truth, intensity: CardIntensity.Soft, text: "soft" }),
      TruthOrDareCardFactory.create({ id: "2", type: CardType.Truth, intensity: CardIntensity.Bold, text: "bold" }),
      TruthOrDareCardFactory.create({ id: "3", type: CardType.Dare, intensity: CardIntensity.Soft, text: "dare" }),
    ];
    let game = TruthOrDareGame.start({ womanName: "a", manName: "b", intensity: CardIntensity.Soft, cards, random });
    for (let i = 0; i < 5; i += 1) {
      game = game.draw(CardType.Truth, random);
      expect(game.drawnCard?.text).toBe("soft");
      game = game.finishTurn();
    }
  });

  it("fills placeholders and alternates turns", () => {
    const game = TruthOrDareGame.start({
      womanName: "سارا",
      manName: "علی",
      intensity: CardIntensity.Bold,
      cards: DEFAULT_CARDS,
      random,
      firstTurnIndex: 0,
    });
    const drawn = game.draw(CardType.Dare, random);
    expect(drawn.drawnCard?.text).not.toContain("{partner}");
    expect(drawn.drawnCard?.playerName).toBe("سارا");
    expect(drawn.finishTurn().currentPlayerName).toBe("علی");
    expect(() => drawn.draw(CardType.Truth, random)).toThrow();
  });

  it("does not repeat cards until all eligible cards are seen, then resets", () => {
    const cards = [
      TruthOrDareCardFactory.create({ id: "t1", type: CardType.Truth, intensity: CardIntensity.Soft, text: "t1" }),
      TruthOrDareCardFactory.create({ id: "t2", type: CardType.Truth, intensity: CardIntensity.Soft, text: "t2" }),
      TruthOrDareCardFactory.create({ id: "t3", type: CardType.Truth, intensity: CardIntensity.Soft, text: "t3" }),
    ];
    let game = TruthOrDareGame.start({ womanName: "a", manName: "b", intensity: CardIntensity.Soft, cards, random });
    const drawnIds: string[] = [];

    // First cycle of 3 cards
    for (let i = 0; i < 3; i += 1) {
      game = game.draw(CardType.Truth, random);
      drawnIds.push(game.drawnCard!.id);
      game = game.finishTurn();
    }
    expect(new Set(drawnIds).size).toBe(3);
    expect(drawnIds.sort()).toEqual(["t1", "t2", "t3"]);

    // Next draw triggers auto-reset and draws from the full pool again
    game = game.draw(CardType.Truth, random);
    expect(game.wasReset).toBe(true);
    expect(["t1", "t2", "t3"]).toContain(game.drawnCard!.id);
  });
});

describe("TwoQuestionSession", () => {
  it("runs 4 steps and swaps the asker after the second step", () => {
    let session = TwoQuestionSession.start({ womanName: "سارا", manName: "علی", durationMinutes: 3, firstAskerIndex: 0 });
    const askers: string[] = [];
    while (!session.isFinished) {
      askers.push(session.currentStep?.askerName ?? "");
      session = session.advance();
    }
    expect(askers).toEqual(["سارا", "سارا", "علی", "علی"]);
    expect(session.currentStep).toBeNull();
  });

  it("does not repeat questions across sessions until pool is exhausted", () => {
    let seen = new Set<string>();
    // Run 5 sessions (20 questions total)
    for (let i = 0; i < 5; i += 1) {
      const session = TwoQuestionSession.start({
        womanName: "سارا",
        manName: "علی",
        durationMinutes: 2,
        seenTemplates: seen,
      });
      expect(session.seenTemplates.size).toBe(seen.size + 4);
      seen = new Set(session.seenTemplates);
    }
    expect(seen.size).toBe(20);
  });

  it("makes the asker touch on the first question and the partner touch on the second", () => {
    const session = TwoQuestionSession.start({ womanName: "سارا", manName: "علی", durationMinutes: 2, firstAskerIndex: 0 });
    expect(session.currentStep?.performerName).toBe("سارا");
    expect(session.advance().currentStep?.performerName).toBe("علی");
  });

  it("rejects an invalid duration", () => {
    expect(() => TwoQuestionSession.start({ womanName: "a", manName: "b", durationMinutes: 0 })).toThrow(RangeError);
  });
});
