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
  /** Ids from SYMPTOM_TAGS (multi-select). */
  tags: readonly string[];
  sleepHours: number | null;
  /** Basal body temperature in Celsius. */
  temperatureC: number | null;
  hadIntimacy: boolean;
}

const MAX_TAGS = 12;
const MIN_TEMPERATURE_C = 34;
const MAX_TEMPERATURE_C = 42;
const MAX_SLEEP_HOURS = 24;

/**
 * Symptom - Entity: one logged day (mood, pain, flow, tags, sleep, temperature, intimacy, note).
 * Stable identity (id) survives updates. Every extra field is optional so old records keep loading.
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
    tags?: readonly string[] | null;
    sleepHours?: number | null;
    temperatureC?: number | null;
    hadIntimacy?: boolean | null;
  }): Symptom {
    const painLevel = input.painLevel ?? 0;
    if (painLevel < 0 || painLevel > 4) {
      throw new RangeError("painLevel must be between 0 (none) and 4 (severe).");
    }
    const sleepHours = input.sleepHours ?? null;
    if (sleepHours !== null && (sleepHours < 0 || sleepHours > MAX_SLEEP_HOURS)) {
      throw new RangeError("sleepHours must be between 0 and 24.");
    }
    const temperatureC = input.temperatureC ?? null;
    if (temperatureC !== null && (temperatureC < MIN_TEMPERATURE_C || temperatureC > MAX_TEMPERATURE_C)) {
      throw new RangeError("temperatureC must be a realistic body temperature.");
    }

    return new Symptom({
      id: input.id,
      date: input.date,
      mood: input.mood ?? null,
      painLevel,
      flowLevel: input.flowLevel ?? FlowLevel.None,
      note: input.note ?? null,
      tags: [...new Set(input.tags ?? [])].slice(0, MAX_TAGS),
      sleepHours,
      temperatureC,
      hadIntimacy: input.hadIntimacy ?? false,
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

  public get tags(): readonly string[] {
    return this.props.tags;
  }

  public get sleepHours(): number | null {
    return this.props.sleepHours;
  }

  public get temperatureC(): number | null {
    return this.props.temperatureC;
  }

  public get hadIntimacy(): boolean {
    return this.props.hadIntimacy;
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
