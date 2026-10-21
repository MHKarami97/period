import type { HamdelSectionDefinition } from "./HamdelSectionDefinition";

/** Blank values for a new entry; date fields flagged `defaultToday` start at today. */
export function buildDefaultValues(definition: HamdelSectionDefinition, todayIso: string): Record<string, string> {
  return Object.fromEntries(
    definition.fields.map((field) => [field.key, field.kind === "date" && field.defaultToday ? todayIso : ""]),
  );
}

/** Values for adding a preset: defaults first, then the preset's own values on top. */
export function buildPresetValues(
  definition: HamdelSectionDefinition,
  preset: Readonly<Record<string, string>>,
  todayIso: string,
): Record<string, string> {
  return { ...buildDefaultValues(definition, todayIso), ...preset };
}
