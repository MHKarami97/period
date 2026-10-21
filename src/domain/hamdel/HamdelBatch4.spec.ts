import { describe, expect, it } from "vitest";
import { buildHamdelReportHtml, escapeHtml } from "@infrastructure/pdf/HamdelReportBuilder";
import { jalaliPeriodBucketer } from "@infrastructure/calendar/JalaliPeriodBucketer";
import { DateOnly } from "../valueObjects/DateOnly";
import { HamdelEntry } from "./HamdelEntry";
import { buildHamdelStats, buildTrend, distribution, type PeriodBucketer } from "./hamdelStats";

const NOW = "2026-10-21T10:00:00.000Z";
const TODAY = DateOnly.fromIsoString("2026-10-21");
let counter = 0;

function entry(section: string, values: Record<string, string>): HamdelEntry {
  counter += 1;
  return HamdelEntry.create({ id: String(counter), profileId: "p", section, values, nowIso: NOW });
}

const happy = (date: string, intensity = ""): HamdelEntry => entry("happiness", { date, title: "خوش", intensity });
const sad = (date: string, intensity = ""): HamdelEntry => entry("sadness", { date, title: "غم", intensity });

/** Plain Gregorian months, so the bucketing rules are tested independently of the Jalali calendar. */
const gregorianMonths: PeriodBucketer = {
  keyOf: (day) => day.toIsoString().slice(0, 7),
  labelOf: (day) => day.toIsoString().slice(0, 7),
};

describe("buildTrend", () => {
  it("returns the requested number of periods, oldest first, with empty ones kept", () => {
    const points = buildTrend([happy("2026-10-02"), happy("2026-10-03"), sad("2026-08-15")], TODAY, gregorianMonths, "month", 4);
    expect(points.map((point) => point.key)).toEqual(["2026-07", "2026-08", "2026-09", "2026-10"]);
    expect(points.map((point) => [point.happiness, point.sadness])).toEqual([[0, 0], [0, 1], [0, 0], [2, 0]]);
  });

  it("ignores undated or unrelated entries", () => {
    const points = buildTrend([entry("dislikes", { category: "food", value: "قارچ" })], TODAY, gregorianMonths, "month", 2);
    expect(points.every((point) => point.happiness === 0 && point.sadness === 0)).toBe(true);
  });

  it("builds Saturday-based Jalali weeks", () => {
    const points = buildTrend([happy("2026-10-21")], TODAY, jalaliPeriodBucketer, "week", 3);
    expect(points).toHaveLength(3);
    const last = points[2];
    expect(last.happiness).toBe(1);
    // 2026-10-21 is a Wednesday; its Iranian week started on Saturday 2026-10-17.
    expect(last.key).toBe("2026-10-17");
  });
});

describe("buildHamdelStats", () => {
  it("summarises the last 30 days of mood with average intensity", () => {
    const stats = buildHamdelStats([happy("2026-10-20", "4"), happy("2026-10-10", "2"), sad("2026-10-19", "5"), sad("2026-08-01", "5")], TODAY);
    expect(stats.mood.happiness).toBe(2);
    expect(stats.mood.sadness).toBe(1);
    expect(stats.mood.positiveRatio).toBeCloseTo(2 / 3);
    expect(stats.mood.averageHappinessIntensity).toBe(3);
    expect(stats.mood.averageSadnessIntensity).toBe(5);
  });

  it("has no ratio when nothing was logged", () => {
    expect(buildHamdelStats([], TODAY).mood.positiveRatio).toBeNull();
  });

  it("counts statuses, said messages and challenges", () => {
    const stats = buildHamdelStats(
      [
        entry("promises", { promise: "الف", givenAt: "2026-10-01", status: "done" }),
        entry("promises", { promise: "ب", givenAt: "2026-10-02", status: "open" }),
        entry("messages", { text: "سلام", category: "love", status: "said", saidAt: "2026-10-20" }),
        entry("messages", { text: "درود", category: "love", status: "idea" }),
        entry("challenges", { title: "قدیمی", startAt: "2026-09-01", length: "7", done: "" }),
        entry("challenges", { title: "جاری", startAt: "2026-10-20", length: "14", done: "" }),
        entry("calls", { title: "امتحان", date: "2026-10-25", when: "sameDay", status: "pending" }),
      ],
      TODAY,
    );
    expect(stats.promises.find((item) => item.value === "done")?.count).toBe(1);
    expect(stats.messagesSaid).toBe(1);
    expect(stats.messagesSaidLast30Days).toBe(1);
    expect(stats.challenges).toEqual({ active: 1, completed: 0, ended: 1 });
    expect(stats.pendingCalls).toBe(1);
  });

  it("keeps declared option order in distributions", () => {
    const items = distribution([], "gifts", "status");
    expect(items.map((item) => item.value)).toEqual(["idea", "bought", "given"]);
  });
});

describe("HTML report", () => {
  const entries = [
    entry("interests", { category: "flower", value: "<b>رز</b>" }),
    entry("memories", { date: "2026-10-01", title: "سالگرد", details: "روز خوب" }),
    entry("challenges", { title: "تعریف", startAt: "2026-10-18", length: "7", done: "2026-10-18,2026-10-19" }),
  ];
  const html = buildHamdelReportHtml({
    profileName: "سارا",
    generatedLabel: "امروز",
    today: TODAY,
    stats: buildHamdelStats(entries, TODAY),
    entries,
    formatDate: (iso) => `J(${iso})`,
    photos: new Map(),
    fontBaseUrl: "https://example.test/fonts",
  });

  it("escapes user text", () => {
    expect(escapeHtml("<a>&\"")).toBe("&lt;a&gt;&amp;&quot;");
    expect(html).not.toContain("<b>رز</b>");
    expect(html).toContain("&lt;b&gt;رز&lt;/b&gt;");
  });

  it("includes filled sections only, with labelled and formatted values", () => {
    expect(html).toContain("علایق");
    expect(html).toContain("J(2026-10-01)");
    expect(html).not.toContain("محرک‌های استرس");
    expect(html).toContain("سارا");
  });

  it("shows challenge progress from the hidden field", () => {
    expect(html).toContain("پیشرفت");
    expect(html).toContain("۲ از ۷ روز");
  });
});
