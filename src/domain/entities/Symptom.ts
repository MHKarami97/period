import { DateOnly } from "../valueObjects/DateOnly";
import { Mood } from "../valueObjects/Mood";
import { FlowLevel } from "../valueObjects/FlowLevel";

export interface SymptomProps {
  id: string;
  date: DateOnly;
  mood: Mood | null;
  painLevel: number;
  flowLevel: FlowLevel;
  note: string | null;
}

/**
 * Symptom - Entity (not a Value Object) because it has a stable identity
 * (`id`) that survives updates to its attributes across the app lifecycle.
 * One Symptom instance exists per logged day.
 */
export class Symptom {
  private constructor(private props: SymptomProps) {}

  public static create(input: {
    id: string;
    date: DateOnly;
    mood?: Mood | null;
    painLevel?: number;
    flowLevel?: FlowLevel;
    note?: string | null;
  }): Symptom {
    const painLevel = input.painLevel ?? 0;
    if (painLevel < 0 || painLevel > 4) {
      throw new RangeError("painLevel must be between 0 (none) and 4 (severe).");
    }

    return new Symptom({
      id: input.id,
      date: input.date,
      mood: input.mood ?? null,
      painLevel,
      flowLevel: input.flowLevel ?? FlowLevel.None,
      note: input.note ?? null,
    });
  }

  public get id(): string {
    return this.props.id;
  }

  public get date(): DateOnly {
    return this.props.date;
  }

  public get mood(): Mood | null {
    return this.props.mood;
  }

  public get painLevel(): number {
    return this.props.painLevel;
  }

  public get flowLevel(): FlowLevel {
    return this.props.flowLevel;
  }

  public get note(): string | null {
    return this.props.note;
  }

  public updateMood(mood: Mood | null): Symptom {
    return new Symptom({ ...this.props, mood });
  }

  public updatePainLevel(painLevel: number): Symptom {
    if (painLevel < 0 || painLevel > 4) {
      throw new RangeError("painLevel must be between 0 (none) and 4 (severe).");
    }
    return new Symptom({ ...this.props, painLevel });
  }

  public updateFlowLevel(flowLevel: FlowLevel): Symptom {
    return new Symptom({ ...this.props, flowLevel });
  }

  public toPlainObject(): SymptomProps {
    return { ...this.props };
  }
}
