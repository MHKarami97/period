import { DateOnly } from "../valueObjects/DateOnly";
import type { HamdelEntry } from "./HamdelEntry";
import { getHamdelSection } from "./hamdelSections";

export type MeetingContextId = "party" | "trip" | "special" | "family";

export interface MeetingContext {
  readonly id: MeetingContextId;
  readonly label: string;
  readonly icon: string;
}

export const MEETING_CONTEXTS: readonly MeetingContext[] = [
  { id: "party", label: "مهمانی", icon: "🎉" },
  { id: "trip", label: "سفر", icon: "🧳" },
  { id: "special", label: "قرار یا موقعیت خاص", icon: "🌹" },
  { id: "family", label: "دیدار خانوادگی", icon: "🏡" },
];

export interface BriefGroup {
  readonly key: string;
  readonly title: string;
  readonly icon: string;
  readonly lines: readonly string[];
}

interface BriefRule {
  readonly section: string;
  readonly title: string;
  readonly icon: string;
  /** Only entries whose `field` is one of `values` are used. */
  readonly only?: { readonly field: string; readonly values: readonly string[] };
  /** Only entries dated within this many days before today are used. */
  readonly withinDays?: number;
  /** Skip entries whose status field equals one of these (e.g. finished items). */
  readonly skip?: { readonly field: string; readonly values: readonly string[] };
  readonly limit?: number;
}

const DISLIKES: BriefRule = { section: "dislikes", title: "از این‌ها دوری کن", icon: "🚫" };
const STRESS: BriefRule = { section: "stress", title: "چیزهایی که استرسش می‌دهد", icon: "⚡" };
const CALMING: BriefRule = { section: "calming", title: "اگر ناراحت یا مضطرب شد", icon: "🕊" };
const OPEN_PROMISES: BriefRule = { section: "promises", title: "قول‌های باز", icon: "🤝", skip: { field: "status", values: ["done", "cancelled"] } };
const RECENT_SADNESS: BriefRule = { section: "sadness", title: "ناراحتی‌های ماه اخیر", icon: "😔", withinDays: 30, limit: 5 };

const RULES: Readonly<Record<MeetingContextId, readonly BriefRule[]>> = {
  party: [
    DISLIKES,
    STRESS,
    CALMING,
    { section: "interests", title: "سلیقه‌ی او (غذا و موسیقی)", icon: "🎯", only: { field: "category", values: ["food", "music"] } },
    { section: "family", title: "درباره‌ی دوستان و آشنایان", icon: "👥", only: { field: "relation", values: ["friend", "colleague", "family"] } },
    RECENT_SADNESS,
  ],
  trip: [
    DISLIKES,
    STRESS,
    CALMING,
    { section: "dreams", title: "آرزوهای سفر", icon: "🌠", only: { field: "type", values: ["travel"] }, skip: { field: "status", values: ["done"] } },
    { section: "foods", title: "غذا و رستوران‌های مورد علاقه", icon: "🍽", limit: 8 },
    { section: "measurements", title: "اندازه‌ها (برای خرید در مسیر)", icon: "📏" },
    OPEN_PROMISES,
  ],
  special: [
    { section: "interests", title: "گل، رنگ و سلیقه‌ی او", icon: "🌹", only: { field: "category", values: ["flower", "color", "food", "music", "movie"] } },
    DISLIKES,
    { section: "hints", title: "چیزهایی که اشاره کرده", icon: "💡", skip: { field: "status", values: ["bought", "skipped"] } },
    { section: "reactions", title: "قرارها و هدیه‌هایی که عاشقشان شد", icon: "😍", only: { field: "reaction", values: ["loved"] }, limit: 5 },
    CALMING,
    OPEN_PROMISES,
  ],
  family: [
    { section: "family", title: "نکات درباره‌ی خانواده و دوستان", icon: "👨‍👩‍👧" },
    DISLIKES,
    STRESS,
    CALMING,
    RECENT_SADNESS,
  ],
};

const MAX_NOTE_LENGTH = 120;

function describe(entry: HamdelEntry): string {
  const definition = getHamdelSection(entry.section);
  const filter = definition.fields.find((field) => field.key === definition.filterField);
  const prefix = filter?.options?.find((option) => option.value === entry.valueOf(filter.key))?.label;
  const title = entry.valueOf(definition.titleField);
  const noteField = definition.fields.find((field) => field.kind === "textarea" && field.key !== definition.titleField);
  const note = noteField ? entry.valueOf(noteField.key).replaceAll("\n", " ") : "";
  const shortNote = note.length > MAX_NOTE_LENGTH ? `${note.slice(0, MAX_NOTE_LENGTH)}…` : note;
  const head = prefix ? `${prefix}: ${title}` : title;
  return shortNote ? `${head} - ${shortNote}` : head;
}

function matches(entry: HamdelEntry, rule: BriefRule, today: DateOnly): boolean {
  if (rule.only && !rule.only.values.includes(entry.valueOf(rule.only.field))) {
    return false;
  }
  if (rule.skip && rule.skip.values.includes(entry.valueOf(rule.skip.field))) {
    return false;
  }
  if (rule.withinDays !== undefined) {
    const dateIso = entry.dateIso;
    if (!dateIso) return false;
    const ageInDays = today.diffInDays(DateOnly.fromIsoString(dateIso));
    return ageInDays >= 0 && ageInDays <= rule.withinDays;
  }
  return true;
}

/**
 * Builds the "before the meeting" cheat sheet: what to avoid, what calms her down,
 * what she likes... picked from the notebook according to the situation, plus the
 * user's own occasion notes for that situation. Empty groups are omitted.
 */
export function buildMeetingBrief(context: MeetingContextId, entries: readonly HamdelEntry[], today: DateOnly): BriefGroup[] {
  const ordered = [...entries].sort((left, right) => ((left.dateIso ?? left.createdAtIso) < (right.dateIso ?? right.createdAtIso) ? 1 : -1));

  const groups: BriefGroup[] = [];
  const ownNotes = ordered.filter((entry) => entry.section === "occasionNotes" && entry.valueOf("context") === context);
  if (ownNotes.length > 0) {
    groups.push({ key: "occasionNotes", title: "یادداشت‌های خودت برای این موقعیت", icon: "🧭", lines: ownNotes.map(describe) });
  }

  for (const rule of RULES[context]) {
    const lines = ordered
      .filter((entry) => entry.section === rule.section && matches(entry, rule, today))
      .slice(0, rule.limit ?? Number.POSITIVE_INFINITY)
      .map(describe);
    if (lines.length > 0) {
      groups.push({ key: `${rule.section}:${rule.title}`, title: rule.title, icon: rule.icon, lines });
    }
  }
  return groups;
}

export function briefToPlainText(contextLabel: string, groups: readonly BriefGroup[]): string {
  const body = groups.map((group) => `${group.icon} ${group.title}\n${group.lines.map((line) => `- ${line}`).join("\n")}`);
  return [`نکته‌های قبل از ${contextLabel}`, ...body].join("\n\n");
}
