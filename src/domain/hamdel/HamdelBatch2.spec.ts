import { describe, expect, it } from "vitest";
import { ChallengeProgress, toggleChallengeDay } from "./challenge";
import { HamdelEntry } from "./HamdelEntry";
import { HamdelValidationError } from "./HamdelValidationError";
import { buildMeetingBrief } from "./meetingBrief";
import { buildTimeline } from "./timeline";
import { DateOnly } from "../valueObjects/DateOnly";

const NOW = "2026-10-21T10:00:00.000Z";
let counter = 0;

function entry(section: string, values: Record<string, string>): HamdelEntry {
  counter += 1;
  return HamdelEntry.create({ id: String(counter), profileId: "p", section, values, nowIso: NOW });
}

describe("challenge progress", () => {
  const challenge = entry("challenges", { title: "هر روز یک تعریف", startAt: "2026-10-18", length: "7" });
  const today = DateOnly.fromIsoString("2026-10-21");

  it("builds one day per challenge day and marks today and the future", () => {
    const progress = ChallengeProgress.from(challenge, today);
    expect(progress.length).toBe(7);
    expect(progress.days.filter((day) => day.isFuture)).toHaveLength(3);
    expect(progress.days.find((day) => day.isToday)?.iso).toBe("2026-10-21");
  });

  it("toggles a day on and off", () => {
    const checked = challenge.withFieldValue("done", toggleChallengeDay(challenge, "2026-10-18", today), NOW);
    expect(ChallengeProgress.from(checked, today).doneCount).toBe(1);
    const unchecked = checked.withFieldValue("done", toggleChallengeDay(checked, "2026-10-18", today), NOW);
    expect(ChallengeProgress.from(unchecked, today).doneCount).toBe(0);
  });

  it("rejects future and out-of-range days", () => {
    expect(() => toggleChallengeDay(challenge, "2026-10-23", today)).toThrow(HamdelValidationError);
    expect(() => toggleChallengeDay(challenge, "2026-09-01", today)).toThrow(HamdelValidationError);
  });

  it("counts the streak up to today, or up to yesterday when today is still open", () => {
    const withDays = challenge.withFieldValue("done", "2026-10-19,2026-10-20", NOW);
    expect(ChallengeProgress.from(withDays, today).currentStreak).toBe(2);
    const withToday = challenge.withFieldValue("done", "2026-10-19,2026-10-20,2026-10-21", NOW);
    expect(ChallengeProgress.from(withToday, today).currentStreak).toBe(3);
    const gap = challenge.withFieldValue("done", "2026-10-18,2026-10-21", NOW);
    expect(ChallengeProgress.from(gap, today).currentStreak).toBe(1);
  });
});

describe("meeting brief", () => {
  const today = DateOnly.fromIsoString("2026-10-21");
  const entries = [
    entry("dislikes", { category: "food", value: "قارچ" }),
    entry("stress", { trigger: "شلوغی", severity: "4" }),
    entry("calming", { way: "پیاده‌روی", effect: "high" }),
    entry("sadness", { date: "2026-10-10", title: "دعوا با دوست" }),
    entry("sadness", { date: "2026-07-01", title: "خیلی قدیمی" }),
    entry("promises", { promise: "سفر شمال", givenAt: "2026-09-01", status: "open" }),
    entry("promises", { promise: "قول انجام‌شده", givenAt: "2026-09-02", status: "done" }),
    entry("occasionNotes", { context: "party", title: "زود برگردیم", note: "ساعت ۱۰ خسته می‌شود" }),
  ];

  it("puts the user's own notes first and prefixes categories", () => {
    const groups = buildMeetingBrief("party", entries, today);
    expect(groups[0].key).toBe("occasionNotes");
    expect(groups.find((group) => group.key.startsWith("dislikes"))?.lines[0]).toContain("غذا: قارچ");
  });

  it("limits sadness to the last 30 days and skips finished promises", () => {
    const party = buildMeetingBrief("party", entries, today);
    expect(party.find((group) => group.key.startsWith("sadness"))?.lines).toHaveLength(1);
    const trip = buildMeetingBrief("trip", entries, today);
    expect(trip.find((group) => group.key.startsWith("promises"))?.lines).toEqual(["سفر شمال"]);
  });

  it("omits empty groups", () => {
    expect(buildMeetingBrief("family", [], today)).toEqual([]);
  });
});

describe("timeline", () => {
  const entries = [
    entry("diary", { date: "2026-10-01", title: "قدم‌زدن", text: "خوب بود" }),
    entry("memories", { date: "2026-10-05", title: "سالگرد" }),
    entry("sadness", { date: "2026-10-03", title: "ناراحتی" }),
    entry("dislikes", { category: "food", value: "قارچ" }),
  ];

  it("merges only enabled, dated sections newest first", () => {
    const items = buildTimeline(entries, new Set(["diary", "memories", "dislikes"]));
    expect(items.map((item) => item.title)).toEqual(["سالگرد", "قدم‌زدن"]);
    expect(items[1].text).toBe("خوب بود");
  });
});
