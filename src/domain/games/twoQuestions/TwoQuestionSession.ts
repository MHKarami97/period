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
  ) {}

  public static isValidDuration(minutes: number): boolean {
    return Number.isInteger(minutes) && minutes >= MIN_DURATION_MINUTES && minutes <= MAX_DURATION_MINUTES;
  }

  public static start(input: {
    womanName: string;
    manName: string;
    durationMinutes: number;
    firstAskerIndex?: 0 | 1;
  }): TwoQuestionSession {
    const names: [string, string] = [input.womanName.trim(), input.manName.trim()];
    if (names.some((name) => name.length === 0 || name.length > MAX_NAME_LENGTH)) {
      throw new Error(`Player names must be 1-${MAX_NAME_LENGTH} characters.`);
    }
    if (!TwoQuestionSession.isValidDuration(input.durationMinutes)) {
      throw new RangeError(`Duration must be between ${MIN_DURATION_MINUTES} and ${MAX_DURATION_MINUTES} minutes.`);
    }
    return new TwoQuestionSession(names, input.firstAskerIndex ?? 0, input.durationMinutes, 0);
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

  public advance(): TwoQuestionSession {
    if (this.isFinished) {
      return this;
    }
    return new TwoQuestionSession(this.names, this.firstAskerIndex, this.durationMinutes, this.stepIndex + 1);
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

    const question =
      questionKind === "TOUCH_YOU"
        ? `دوست داری ${minutes} دقیقه چطور لمست کنم؟`
        : `دوست داری ${minutes} دقیقه چطور لمسم کنی؟`;

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
}
