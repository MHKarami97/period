import type { HamdelFieldDefinition, HamdelSectionDefinition } from "./HamdelSectionDefinition";
import { getHamdelSection } from "./hamdelSections";
import { HamdelValidationError } from "./HamdelValidationError";

export type HamdelValues = Readonly<Record<string, string>>;

export interface HamdelEntryProps {
  readonly id: string;
  readonly profileId: string;
  readonly section: string;
  readonly values: HamdelValues;
  readonly createdAtIso: string;
  readonly updatedAtIso: string;
}

const DEFAULT_TEXT_LIMIT = 200;
const DEFAULT_TEXTAREA_LIMIT = 1000;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isRealIsoDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) {
    return false;
  }
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function normalizeField(field: HamdelFieldDefinition, raw: string | undefined): string {
  const value = (raw ?? "").trim();
  if (value.length === 0) {
    if (field.required) {
      throw new HamdelValidationError(`«${field.label}» را وارد کنید.`);
    }
    return "";
  }

  const limit = field.maxLength ?? (field.kind === "textarea" ? DEFAULT_TEXTAREA_LIMIT : DEFAULT_TEXT_LIMIT);
  if ((field.kind === "text" || field.kind === "textarea") && value.length > limit) {
    throw new HamdelValidationError(`«${field.label}» حداکثر ${limit} نویسه می‌تواند باشد.`);
  }
  if (field.kind === "select" && !field.options?.some((option) => option.value === value)) {
    throw new HamdelValidationError(`مقدار «${field.label}» نامعتبر است.`);
  }
  if (field.kind === "date" && !isRealIsoDate(value)) {
    throw new HamdelValidationError(`تاریخ «${field.label}» نامعتبر است.`);
  }
  return value;
}

function normalizeValues(definition: HamdelSectionDefinition, raw: HamdelValues): HamdelValues {
  const values: Record<string, string> = {};
  for (const field of definition.fields) {
    values[field.key] = normalizeField(field, raw[field.key]);
  }
  return values;
}

/**
 * HamdelEntry - immutable Entity: one note inside a Hamdel section (an interest,
 * a sad day, a promise, ...). Shape and rules come from the section definition,
 * so every section shares the same persistence, backup and reporting code.
 * Mutations return a NEW entry (safe with shallowRef-based Pinia stores).
 */
export class HamdelEntry {
  private constructor(private readonly props: HamdelEntryProps) {}

  public static create(input: { id: string; profileId: string; section: string; values: HamdelValues; nowIso: string }): HamdelEntry {
    const definition = getHamdelSection(input.section);
    return new HamdelEntry({
      id: input.id,
      profileId: input.profileId,
      section: input.section,
      values: normalizeValues(definition, input.values),
      createdAtIso: input.nowIso,
      updatedAtIso: input.nowIso,
    });
  }

  /** Rebuilds a stored entry without re-validating, so old data is never lost to a stricter rule. */
  public static reconstitute(props: HamdelEntryProps): HamdelEntry {
    return new HamdelEntry({ ...props, values: { ...props.values } });
  }

  public get id(): string {
    return this.props.id;
  }

  public get profileId(): string {
    return this.props.profileId;
  }

  public get section(): string {
    return this.props.section;
  }

  public get values(): HamdelValues {
    return this.props.values;
  }

  public get createdAtIso(): string {
    return this.props.createdAtIso;
  }

  public get updatedAtIso(): string {
    return this.props.updatedAtIso;
  }

  /** ISO date used for sorting and the timeline, or null when the section has no date field. */
  public get dateIso(): string | null {
    const dateField = getHamdelSection(this.props.section).dateField;
    const value = dateField ? this.props.values[dateField] : "";
    return value ? value : null;
  }

  public valueOf(fieldKey: string): string {
    return this.props.values[fieldKey] ?? "";
  }

  public withValues(values: HamdelValues, nowIso: string): HamdelEntry {
    const definition = getHamdelSection(this.props.section);
    return new HamdelEntry({ ...this.props, values: normalizeValues(definition, values), updatedAtIso: nowIso });
  }

  public withFieldValue(fieldKey: string, value: string, nowIso: string): HamdelEntry {
    return this.withValues({ ...this.props.values, [fieldKey]: value }, nowIso);
  }

  public toPlainObject(): HamdelEntryProps {
    return { ...this.props, values: { ...this.props.values } };
  }
}
