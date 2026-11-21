import { describe, expect, it } from "vitest";
import { buildWeeklyChallengesReportHtml } from "./WeeklyChallengesReportBuilder";
import type { WeeklyChallengeSchedule } from "@domain/games/dailyChallenges/DailyChallengeTypes";

describe("WeeklyChallengesReportBuilder", () => {
  const dummySchedule: WeeklyChallengeSchedule = {
    weekStartIso: "2026-11-21",
    weekEndIso: "2026-11-27",
    weekTitle: "شنبه ۱ آذر تا جمعه ۷ آذر",
    createdAt: "2026-11-21T00:00:00.000Z",
    updatedAt: "2026-11-21T00:00:00.000Z",
    days: [
      {
        date: "2026-11-21",
        dayOfWeekIndex: 0,
        dayName: "شنبه",
        jalaliDateLabel: "۱ آذر ۱۴۰۵",
        challengeTitle: "یک پیام عاشقانه",
        challengeDescription: "صبح یک پیام قشنگ بفرست",
        challengeTimeTags: ["day"],
        status: "completed",
        isOff: false,
        completionNote: "خیلی خوشحال شد",
      },
      {
        date: "2026-11-22",
        dayOfWeekIndex: 1,
        dayName: "یکشنبه",
        jalaliDateLabel: "۲ آذر ۱۴۰۵",
        challengeTitle: "پیاده‌روی دونفره",
        status: "off",
        isOff: true,
        offReason: "مهمانی بودیم",
      },
    ],
  };

  it("builds a print-ready HTML document containing schedule rows and statistics", () => {
    const html = buildWeeklyChallengesReportHtml({
      schedule: dummySchedule,
      weekStartJalali: "1405/09/01",
      weekEndJalali: "1405/09/07",
      profileName: "سارا",
      fontBaseUrl: "http://localhost:5173/fonts",
    });

    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("گزارش هفتگی چالش‌های دونفره");
    expect(html).toContain("سارا");
    expect(html).toContain("شنبه");
    expect(html).toContain("یک پیام عاشقانه");
    expect(html).toContain("روز استراحت / آف (مهمانی بودیم)");
    expect(html).toContain("خیلی خوشحال شد");
    expect(html).toContain("window.print()");
  });
});
