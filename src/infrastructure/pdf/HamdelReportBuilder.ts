import { ChallengeProgress } from "@domain/hamdel/challenge";
import type { HamdelEntry } from "@domain/hamdel/HamdelEntry";
import type { HamdelFieldDefinition, HamdelSectionDefinition } from "@domain/hamdel/HamdelSectionDefinition";
import { HAMDEL_GROUP_IDS, HAMDEL_GROUP_LABELS_FA } from "@domain/hamdel/HamdelSectionDefinition";
import { HAMDEL_SECTIONS } from "@domain/hamdel/hamdelSections";
import type { CountItem, HamdelStats } from "@domain/hamdel/hamdelStats";
import type { DateOnly } from "@domain/valueObjects/DateOnly";

export interface HamdelReportInput {
  readonly profileName: string;
  /** Jalali label of the report date, e.g. "1405/07/29". */
  readonly generatedLabel: string;
  readonly today: DateOnly;
  readonly stats: HamdelStats;
  readonly entries: readonly HamdelEntry[];
  /** ISO date -> Jalali label. */
  readonly formatDate: (iso: string) => string;
  /** Diary entry id -> data URLs of its photos (empty when photos are not included). */
  readonly photos: ReadonlyMap<string, readonly string[]>;
  /** Absolute URL prefix used to load the self-hosted font in the print window. */
  readonly fontBaseUrl: string;
}

const MAX_PHOTO_WIDTH_PX = 220;

export function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function compareNewestFirst(left: HamdelEntry, right: HamdelEntry): number {
  const leftKey = left.dateIso ?? left.createdAtIso;
  const rightKey = right.dateIso ?? right.createdAtIso;
  return leftKey === rightKey ? (left.createdAtIso < right.createdAtIso ? 1 : -1) : leftKey < rightKey ? 1 : -1;
}

function displayValue(field: HamdelFieldDefinition, value: string, formatDate: (iso: string) => string): string {
  if (field.kind === "select") return field.options?.find((option) => option.value === value)?.label ?? value;
  if (field.kind === "date") return formatDate(value);
  return value;
}

function toPercent(part: number, total: number): string {
  return total === 0 ? "—" : `${Math.round((part / total) * 100).toLocaleString("fa-IR")}٪`;
}

function countRow(label: string, value: string): string {
  return `<tr><td>${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>`;
}

function distributionRows(title: string, items: readonly CountItem[]): string[] {
  const total = items.reduce((sum, item) => sum + item.count, 0);
  return total === 0 ? [] : items.filter((item) => item.count > 0).map((item) => countRow(`${title}: ${item.label}`, item.count.toLocaleString("fa-IR")));
}

function buildSummary(input: HamdelReportInput): string {
  const { stats } = input;
  const mood = stats.mood;
  const rows = [
    countRow("کل یادداشت‌ها", stats.totalEntries.toLocaleString("fa-IR")),
    countRow("خوشحالی‌های ۳۰ روز اخیر", mood.happiness.toLocaleString("fa-IR")),
    countRow("ناراحتی‌های ۳۰ روز اخیر", mood.sadness.toLocaleString("fa-IR")),
    countRow("سهم روزهای خوب (۳۰ روز اخیر)", mood.positiveRatio === null ? "—" : toPercent(mood.positiveRatio, 1)),
    ...distributionRows("قول‌ها", stats.promises),
    ...distributionRows("هدیه‌ها", stats.gifts),
    ...distributionRows("واکنش‌ها", stats.reactions),
    ...distributionRows("آرزوها", stats.wishlist),
    countRow("پیام‌های محبت‌آمیز گفته‌شده", stats.messagesSaid.toLocaleString("fa-IR")),
    countRow("چالش‌های کامل‌شده", stats.challenges.completed.toLocaleString("fa-IR")),
  ];
  return `<h2>خلاصه و آمار</h2><table><thead><tr><th>مورد</th><th>مقدار</th></tr></thead><tbody>${rows.join("")}</tbody></table>`;
}

function buildEntryRow(entry: HamdelEntry, section: HamdelSectionDefinition, input: HamdelReportInput): string {
  const headline = entry.valueOf(section.titleField);
  const details = section.fields
    .filter((field) => !field.hidden && field.key !== section.titleField && entry.valueOf(field.key))
    .map((field) => `<div><span class="label">${escapeHtml(field.label)}:</span> ${escapeHtml(displayValue(field, entry.valueOf(field.key), input.formatDate))}</div>`);

  if (section.id === "challenges") {
    const progress = ChallengeProgress.from(entry, input.today);
    details.push(`<div><span class="label">پیشرفت:</span> ${progress.doneCount.toLocaleString("fa-IR")} از ${progress.length.toLocaleString("fa-IR")} روز</div>`);
  }
  const photos = (input.photos.get(entry.id) ?? [])
    .map((url) => `<img src="${url}" alt="" style="max-width:${MAX_PHOTO_WIDTH_PX}px;max-height:${MAX_PHOTO_WIDTH_PX}px;margin:4px 0 0 6px;border-radius:6px" />`)
    .join("");

  return `<tr><td class="headline">${escapeHtml(headline)}</td><td>${details.join("")}${photos ? `<div>${photos}</div>` : ""}</td></tr>`;
}

function buildSection(section: HamdelSectionDefinition, input: HamdelReportInput): string {
  const entries = input.entries.filter((entry) => entry.section === section.id).sort(compareNewestFirst);
  if (entries.length === 0) return "";
  const rows = entries.map((entry) => buildEntryRow(entry, section, input)).join("");
  return `<h3>${section.icon} ${escapeHtml(section.title)} (${entries.length.toLocaleString("fa-IR")})</h3><table><tbody>${rows}</tbody></table>`;
}

/** Builds the complete, print-ready HTML document of the whole Hamdel notebook (pure: no DOM access). */
export function buildHamdelReportHtml(input: HamdelReportInput): string {
  const groups = HAMDEL_GROUP_IDS.map((groupId) => {
    const body = HAMDEL_SECTIONS.filter((section) => section.group === groupId).map((section) => buildSection(section, input)).join("");
    return body ? `<h2>${escapeHtml(HAMDEL_GROUP_LABELS_FA[groupId])}</h2>${body}` : "";
  }).join("");
  const name = input.profileName.trim();

  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8" />
<title>گزارش همدل</title>
<style>
@font-face { font-family: Vazirmatn; src: url("${escapeHtml(input.fontBaseUrl)}/Vazirmatn-Regular.woff2") format("woff2"); font-weight: 400; }
@font-face { font-family: Vazirmatn; src: url("${escapeHtml(input.fontBaseUrl)}/Vazirmatn-Bold.woff2") format("woff2"); font-weight: 700; }
* { box-sizing: border-box; }
body { font-family: Vazirmatn, sans-serif; direction: rtl; color: #0f172a; padding: 24px; line-height: 1.8; }
h1 { font-size: 20px; margin: 0 0 4px; }
.subtitle { color: #64748b; font-size: 13px; margin-bottom: 20px; }
h2 { font-size: 16px; margin: 28px 0 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px; break-after: avoid; }
h3 { font-size: 14px; margin: 18px 0 6px; break-after: avoid; }
table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 8px; }
th, td { border: 1px solid #e2e8f0; padding: 6px 10px; text-align: right; vertical-align: top; }
th { background: #334155; color: #fff; }
tr { break-inside: avoid; }
td.headline { width: 30%; font-weight: 700; }
.label { color: #64748b; }
@media print { @page { size: A4; margin: 14mm; } }
</style>
</head>
<body>
<h1>گزارش همدل${name ? ` - ${escapeHtml(name)}` : ""}</h1>
<p class="subtitle">${escapeHtml(input.generatedLabel)} · این گزارش شخصی است؛ آن را با دقت نگه دارید.</p>
${buildSummary(input)}
${groups || "<p>هنوز یادداشتی ثبت نشده است.</p>"}
<script>document.fonts.ready.then(function () { window.focus(); window.print(); });</script>
</body>
</html>`;
}
