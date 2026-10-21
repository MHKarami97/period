import type { HamdelEntry } from "./HamdelEntry";

export interface TimelineSource {
  readonly section: string;
  readonly label: string;
  readonly icon: string;
  /** Textarea field shown as the item's body. */
  readonly textField: string;
  readonly enabledByDefault: boolean;
}

export const TIMELINE_SOURCES: readonly TimelineSource[] = [
  { section: "diary", label: "دفترچه", icon: "📖", textField: "text", enabledByDefault: true },
  { section: "memories", label: "خاطرات مهم", icon: "📜", textField: "details", enabledByDefault: true },
  { section: "happiness", label: "خوشحالی‌ها", icon: "😊", textField: "details", enabledByDefault: true },
  { section: "sadness", label: "ناراحتی‌ها", icon: "😔", textField: "details", enabledByDefault: false },
  { section: "reactions", label: "هدیه و قرار", icon: "💬", textField: "note", enabledByDefault: false },
];

export interface TimelineItem {
  readonly entry: HamdelEntry;
  readonly dateIso: string;
  readonly source: TimelineSource;
  readonly title: string;
  readonly text: string;
}

const TITLE_FIELD_BY_SECTION: Readonly<Record<string, string>> = {
  diary: "title",
  memories: "title",
  happiness: "title",
  sadness: "title",
  reactions: "what",
};

/** Merges the enabled sections into one list, newest first. Undated entries are left out. */
export function buildTimeline(entries: readonly HamdelEntry[], enabledSections: ReadonlySet<string>): TimelineItem[] {
  const items: TimelineItem[] = [];
  for (const entry of entries) {
    const source = TIMELINE_SOURCES.find((candidate) => candidate.section === entry.section);
    const dateIso = entry.dateIso;
    if (!source || !dateIso || !enabledSections.has(entry.section)) {
      continue;
    }
    items.push({
      entry,
      dateIso,
      source,
      title: entry.valueOf(TITLE_FIELD_BY_SECTION[entry.section] ?? "title"),
      text: entry.valueOf(source.textField),
    });
  }
  return items.sort((left, right) =>
    left.dateIso === right.dateIso ? (left.entry.createdAtIso < right.entry.createdAtIso ? 1 : -1) : left.dateIso < right.dateIso ? 1 : -1,
  );
}
