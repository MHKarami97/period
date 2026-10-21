import { describe, expect, it } from "vitest";
import { jalaliYearlyCalendar } from "@infrastructure/calendar/JalaliYearlyCalendar";
import { DateOnly } from "../valueObjects/DateOnly";
import { HamdelEntry } from "./HamdelEntry";
import { buildCountdowns, describeDaysLeft, nextOccurrence, type YearlyCalendar } from "./importantDates";
import { planHamdelReminders } from "./reminderPlanner";

const NOW = "2026-10-21T10:00:00.000Z";
const TODAY = DateOnly.fromIsoString("2026-10-21");
let counter = 0;

/** Gregorian stand-in so the rules can be tested without depending on Jalali year boundaries. */
const gregorian: YearlyCalendar = {
  yearOf: (day) => Number(day.toIsoString().slice(0, 4)),
  addYears: (day, years) => {
    const [year, month, date] = day.toIsoString().split("-").map(Number);
    return DateOnly.fromIsoString(`${String(year + years).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(date).padStart(2, "0")}`);
  },
};

function dateEntry(values: Record<string, string>): HamdelEntry {
  counter += 1;
  return HamdelEntry.create({
    id: String(counter),
    profileId: "p",
    section: "dates",
    values: { title: "تولد", type: "birthday", date: "1995-11-20", repeat: "yearly", remind: "standard", ...values },
    nowIso: NOW,
  });
}

function callEntry(values: Record<string, string>): HamdelEntry {
  counter += 1;
  return HamdelEntry.create({
    id: String(counter),
    profileId: "p",
    section: "calls",
    values: { title: "امتحان", date: "2026-10-25", when: "sameDay", status: "pending", ...values },
    nowIso: NOW,
  });
}

describe("nextOccurrence", () => {
  it("keeps a future date and rolls a past yearly date to the next year", () => {
    expect(nextOccurrence(DateOnly.fromIsoString("2026-12-01"), TODAY, "yearly", gregorian)?.toIsoString()).toBe("2026-12-01");
    expect(nextOccurrence(DateOnly.fromIsoString("1995-10-01"), TODAY, "yearly", gregorian)?.toIsoString()).toBe("2027-10-01");
    expect(nextOccurrence(DateOnly.fromIsoString("1995-11-20"), TODAY, "yearly", gregorian)?.toIsoString()).toBe("2026-11-20");
  });

  it("counts today as an occurrence and drops past one-time dates", () => {
    expect(nextOccurrence(TODAY, TODAY, "once", gregorian)?.toIsoString()).toBe("2026-10-21");
    expect(nextOccurrence(DateOnly.fromIsoString("2020-01-01"), TODAY, "once", gregorian)).toBeNull();
  });

  it("repeats on the same Jalali day every Jalali year", () => {
    const nowruz1399 = DateOnly.fromIsoString("2020-03-20");
    const next = nextOccurrence(nowruz1399, TODAY, "yearly", jalaliYearlyCalendar);
    expect(next).not.toBeNull();
    expect(jalaliYearlyCalendar.yearOf(next as DateOnly)).toBe(jalaliYearlyCalendar.yearOf(TODAY) + 1);
    expect((next as DateOnly).diffInDays(TODAY)).toBeGreaterThanOrEqual(150);
    expect((next as DateOnly).diffInDays(TODAY)).toBeLessThanOrEqual(152);
  });
});

describe("countdowns", () => {
  it("lists upcoming dates nearest first and past one-time dates last", () => {
    const entries = [
      dateEntry({ title: "دور", date: "1990-12-30" }),
      dateEntry({ title: "نزدیک", date: "1990-10-25" }),
      dateEntry({ title: "گذشته", date: "2020-01-01", repeat: "once" }),
    ];
    const titles = buildCountdowns(entries, TODAY, gregorian).map((item) => item.entry.valueOf("title"));
    expect(titles).toEqual(["نزدیک", "دور", "گذشته"]);
  });

  it("describes days left in Persian", () => {
    expect(describeDaysLeft(0)).toBe("امروز");
    expect(describeDaysLeft(1)).toBe("فردا");
    expect(describeDaysLeft(10)).toContain("روز دیگر");
    expect(describeDaysLeft(95)).toContain("ماه");
  });
});

describe("planHamdelReminders", () => {
  it("plans 1 month, 1 week and 1 day before the next birthday", () => {
    const events = planHamdelReminders([dateEntry({})], TODAY, gregorian);
    expect(events.map((event) => [event.targetDate, event.leadDays])).toEqual([
      ["2026-11-20", 30],
      ["2026-11-20", 7],
      ["2026-11-20", 1],
    ]);
    expect(events.every((event) => event.kind === "HAMDEL_DATE" && event.label === "تولد")).toBe(true);
  });

  it("drops reminders whose sending day has already passed and adds the day itself when asked", () => {
    const events = planHamdelReminders([dateEntry({ date: "1995-10-31", remind: "standardDay" })], TODAY, gregorian);
    expect(events.map((event) => event.leadDays)).toEqual([7, 1, 0]);
  });

  it("plans nothing when reminders are off", () => {
    expect(planHamdelReminders([dateEntry({ remind: "off" })], TODAY, gregorian)).toEqual([]);
  });

  it("plans call reminders by their timing and skips finished or past ones", () => {
    const both = planHamdelReminders([callEntry({ when: "both" })], TODAY, gregorian);
    expect(both.map((event) => [event.kind, event.leadDays])).toEqual([["HAMDEL_CALL", 1], ["HAMDEL_CALL", 0]]);
    expect(planHamdelReminders([callEntry({ status: "done" })], TODAY, gregorian)).toEqual([]);
    expect(planHamdelReminders([callEntry({ date: "2026-10-01" })], TODAY, gregorian)).toEqual([]);
  });

  it("truncates long labels to the server limit", () => {
    const events = planHamdelReminders([dateEntry({ title: "ا".repeat(80) })], TODAY, gregorian);
    expect(events[0].label.length).toBeLessThanOrEqual(80);
  });
});
