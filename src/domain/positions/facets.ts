/** The searchable/filterable dimensions of a position, in the order they appear in the filter UI. */
export enum FacetKey {
  PositionType = "positionType",
  Stimulation = "stimulation",
  Penetrations = "penetrations",
  Petting = "petting",
  Activity = "activity",
  Complexity = "complexity",
  Other = "other",
}

export const FACET_KEYS: readonly FacetKey[] = Object.values(FacetKey);

export const FACET_LABELS_FA: Record<FacetKey, string> = {
  [FacetKey.PositionType]: "نوع پوزیشن",
  [FacetKey.Stimulation]: "تحریک",
  [FacetKey.Penetrations]: "نفوذ",
  [FacetKey.Petting]: "نوازش و بازی",
  [FacetKey.Activity]: "فعالیت",
  [FacetKey.Complexity]: "سختی",
  [FacetKey.Other]: "سایر تگ‌ها",
};

/** Data uses underscores as word separators ("داگ_استایل"); users see spaces. */
export function toDisplayLabel(value: string): string {
  return value.replaceAll("_", " ");
}
