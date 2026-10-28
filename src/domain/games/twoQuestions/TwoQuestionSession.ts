import type { IRandomSource } from "../IRandomSource";
import { QUESTION_BANK, type QuestionTier } from "./questionBank";

export const MIN_DURATION_MINUTES = 1;
export const MAX_DURATION_MINUTES = 10;
export const DEFAULT_DURATION_MINUTES = 3;

const TOTAL_STEPS = 4;
const MAX_NAME_LENGTH = 30;

export type QuestionKind = "TOUCH_YOU" | "TOUCH_ME";

export interface SessionStep {
  questionKind: QuestionKind;
  askerName: string;
  answererName: string;
  performerName: string;
  receiverName: string;
  questionText: string;
  instructionText: string;
}

/**
 * TwoQuestionSession - Aggregate Root for the "two questions" game.
 *
 * Each round, the asker poses two questions to the partner:
 *   1) "How would you like me to touch you for N minutes?"  (asker touches)
 *   2) "How would you like to touch me for N minutes?"      (partner touches)
 * After both, the roles swap, so a full session has 4 steps.
 * Immutable: `advance` returns a new session.
 */
export class TwoQuestionSession {
  private constructor(
    private readonly names: readonly [string, string],
    private readonly firstAskerIndex: 0 | 1,
    private readonly durationMinutes: number,
    private readonly stepIndex: number,
    private readonly questionTemplates: readonly string[],
    private readonly seen: ReadonlySet<string> = new Set(),
    private readonly resetOccurred: boolean = false,
  ) {}

  public static isValidDuration(minutes: number): boolean {
    return Number.isInteger(minutes) && minutes >= MIN_DURATION_MINUTES && minutes <= MAX_DURATION_MINUTES;
  }

  public static start(input: {
    womanName: string;
    manName: string;
    durationMinutes: number;
    firstAskerIndex?: 0 | 1;
    random?: IRandomSource;
    seenTemplates?: ReadonlySet<string> | readonly string[];
  }): TwoQuestionSession {
    const names: [string, string] = [input.womanName.trim(), input.manName.trim()];
    if (names.some((name) => name.length === 0 || name.length > MAX_NAME_LENGTH)) {
      throw new Error(`Player names must be 1-${MAX_NAME_LENGTH} characters.`);
    }
    if (!TwoQuestionSession.isValidDuration(input.durationMinutes)) {
      throw new RangeError(`Duration must be between ${MIN_DURATION_MINUTES} and ${MAX_DURATION_MINUTES} minutes.`);
    }
    const { templates, nextSeen, wasReset } = TwoQuestionSession.pickTemplates(input.random, input.seenTemplates);
    return new TwoQuestionSession(
      names,
      input.firstAskerIndex ?? 0,
      input.durationMinutes,
      0,
      templates,
      nextSeen,
      wasReset,
    );
  }

  public get totalSteps(): number {
    return TOTAL_STEPS;
  }

  public get stepNumber(): number {
    return Math.min(this.stepIndex + 1, TOTAL_STEPS);
  }

  public get durationInSeconds(): number {
    return this.durationMinutes * 60;
  }

  public get isFinished(): boolean {
    return this.stepIndex >= TOTAL_STEPS;
  }

  public get currentStep(): SessionStep | null {
    return this.isFinished ? null : this.buildStep(this.stepIndex);
  }

  public get seenTemplates(): ReadonlySet<string> {
    return this.seen;
  }

  public get wasReset(): boolean {
    return this.resetOccurred;
  }

  public advance(): TwoQuestionSession {
    if (this.isFinished) {
      return this;
    }
    return new TwoQuestionSession(
      this.names,
      this.firstAskerIndex,
      this.durationMinutes,
      this.stepIndex + 1,
      this.questionTemplates,
      this.seen,
      this.resetOccurred,
    );
  }

  private buildStep(index: number): SessionStep {
    const round = Math.floor(index / 2);
    const askerIndex = (this.firstAskerIndex + round) % 2;
    const askerName = this.names[askerIndex];
    const answererName = this.names[1 - askerIndex];
    const questionKind: QuestionKind = index % 2 === 0 ? "TOUCH_YOU" : "TOUCH_ME";

    const performerName = questionKind === "TOUCH_YOU" ? askerName : answererName;
    const receiverName = questionKind === "TOUCH_YOU" ? answererName : askerName;
    const minutes = this.durationMinutes;

    const question = this.questionTemplates[index].replaceAll("{m}", String(minutes));

    return {
      questionKind,
      askerName,
      answererName,
      performerName,
      receiverName,
      questionText: `${askerName} از ${answererName} می‌پرسد: «${question}»`,
      instructionText: `${performerName} به مدت ${minutes} دقیقه، همان‌طور که ${receiverName} خواسته، او را لمس می‌کند. ${receiverName} هر لحظه می‌تواند بگوید «آرام‌تر» یا «بس است».`,
    };
  }

  /** One template per step: WARM questions in round 1, HOT in round 2; never repeats until full pool is exhausted. */
  public static pickTemplates(
    random?: IRandomSource,
    seenInput?: ReadonlySet<string> | readonly string[],
  ): { templates: string[]; nextSeen: Set<string>; wasReset: boolean } {
    const seen = new Set(seenInput ?? []);
    let wasReset = false;
    const tiers: QuestionTier[] = ["WARM", "HOT"];
    const kinds: QuestionKind[] = ["TOUCH_YOU", "TOUCH_ME"];

    const templates: string[] = [];
    for (const tier of tiers) {
      for (const kind of kinds) {
        const pool = QUESTION_BANK[kind][tier];
        let unseen: readonly string[] = pool.filter((q) => !seen.has(q));
        if (unseen.length === 0) {
          for (const q of pool) {
            seen.delete(q);
          }
          unseen = pool;
          wasReset = true;
        }
        const picked = unseen[random ? random.nextInt(0, unseen.length - 1) : 0];
        seen.add(picked);
        templates.push(picked);
      }
    }
    return { templates, nextSeen: seen, wasReset };
  }
}
