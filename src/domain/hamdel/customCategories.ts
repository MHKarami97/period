import type { HamdelFieldOption } from "./HamdelSectionDefinition";
import { HAMDEL_SECTIONS } from "./hamdelSections";

const STORAGE_KEY = "period-tracker:hamdel-custom-categories-v1";

export interface CustomCategoryRecord {
  readonly sectionId: string;
  readonly fieldKey: string;
  readonly value: string;
  readonly label: string;
}

function loadStoredRecords(): CustomCategoryRecord[] {
  if (typeof window === "undefined" || !window.localStorage) {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CustomCategoryRecord[];
  } catch {
    return [];
  }
}

function persistRecords(records: readonly CustomCategoryRecord[]): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // ignore quota errors
  }
}

/**
 * Initializes and injects any previously saved custom categories into HAMDEL_SECTIONS.
 */
export function initCustomCategories(): void {
  const records = loadStoredRecords();
  for (const record of records) {
    applyCategoryToCatalog(record.sectionId, record.fieldKey, record.value, record.label);
  }
}

function applyCategoryToCatalog(sectionId: string, fieldKey: string, value: string, label: string): void {
  const section = HAMDEL_SECTIONS.find((s) => s.id === sectionId);
  if (!section) return;
  const field = section.fields.find((f) => f.key === fieldKey);
  if (!field || field.kind !== "select") return;

  const currentOptions = field.options ? [...field.options] : [];
  if (!currentOptions.some((o) => o.value === value)) {
    currentOptions.push({ value, label });
    // Update the field's options array
    (field as { options: readonly HamdelFieldOption[] }).options = currentOptions;
  }
}

/**
 * Adds a new custom category for a specific section and field, persisting it to localStorage.
 */
export function addCustomCategory(sectionId: string, fieldKey: string, categoryLabel: string): HamdelFieldOption {
  const trimmed = categoryLabel.trim();
  if (!trimmed) {
    throw new Error("نام دسته نمی‌تواند خالی باشد.");
  }
  const value = trimmed;
  applyCategoryToCatalog(sectionId, fieldKey, value, trimmed);

  const existing = loadStoredRecords();
  if (!existing.some((r) => r.sectionId === sectionId && r.fieldKey === fieldKey && r.value === value)) {
    const next = [...existing, { sectionId, fieldKey, value, label: trimmed }];
    persistRecords(next);
  }

  return { value, label: trimmed };
}
