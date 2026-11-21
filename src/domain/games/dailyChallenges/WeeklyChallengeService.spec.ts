import { describe, it, expect } from "vitest";
import { DateOnly } from "@domain/valueObjects/DateOnly";
import { WeeklyChallengeService } from "./WeeklyChallengeService";
import { DEFAULT_CHALLENGES } from "./defaultChallenges";

describe("WeeklyChallengeService", () => {
  it("computes the Saturday week start correctly for any day of the week", () => {
    // 2026-11-21 is Saturday
    const sat = DateOnly.fromIsoString("2026-11-21");
    expect(WeeklyChallengeService.getSaturdayWeekStart(sat).toIsoString()).toBe("2026-11-21");

    // 2026-11-22 is Sunday
    const sun = DateOnly.fromIsoString("2026-11-22");
    expect(WeeklyChallengeService.getSaturdayWeekStart(sun).toIsoString()).toBe("2026-11-21");

    // 2026-11-27 is Friday
    const fri = DateOnly.fromIsoString("2026-11-27");
    expect(WeeklyChallengeService.getSaturdayWeekStart(fri).toIsoString()).toBe("2026-11-21");

    // 2026-11-28 is next Saturday
    const nextSat = DateOnly.fromIsoString("2026-11-28");
    expect(WeeklyChallengeService.getSaturdayWeekStart(nextSat).toIsoString()).toBe("2026-11-28");
  });

  it("generates 7 days starting from Saturday to Friday with correct day names", () => {
    const sat = DateOnly.fromIsoString("2026-11-21");
    const plan = WeeklyChallengeService.generateWeeklyPlan(sat, DEFAULT_CHALLENGES);

    expect(plan.days).toHaveLength(7);
    expect(plan.days[0].dayName).toBe("شنبه");
    expect(plan.days[0].date).toBe("2026-11-21");
    expect(plan.days[6].dayName).toBe("جمعه");
    expect(plan.days[6].date).toBe("2026-11-27");
    expect(plan.weekStartIso).toBe("2026-11-21");
    expect(plan.weekEndIso).toBe("2026-11-27");
  });

  it("enforces that only current week and next week can be planned or saved", () => {
    const today = DateOnly.fromIsoString("2026-11-21"); // current Saturday
    const currentWeekIso = "2026-11-21";
    const nextWeekIso = "2026-11-28";
    const pastWeekIso = "2026-11-14";
    const distantFutureWeekIso = "2026-12-05";

    expect(WeeklyChallengeService.isWeekPlannable(currentWeekIso, today)).toBe(true);
    expect(WeeklyChallengeService.isWeekPlannable(nextWeekIso, today)).toBe(true);
    expect(WeeklyChallengeService.isWeekPlannable(pastWeekIso, today)).toBe(false);
    expect(WeeklyChallengeService.isWeekPlannable(distantFutureWeekIso, today)).toBe(false);

    expect(WeeklyChallengeService.isPastWeek(pastWeekIso, today)).toBe(true);
    expect(WeeklyChallengeService.isPastWeek(currentWeekIso, today)).toBe(false);
    expect(WeeklyChallengeService.isPastWeek(nextWeekIso, today)).toBe(false);
  });

  it("preserves already completed or off days when re-generating a plan", () => {
    const sat = DateOnly.fromIsoString("2026-11-21");
    const initialPlan = WeeklyChallengeService.generateWeeklyPlan(sat, DEFAULT_CHALLENGES);

    // Mark Saturday as completed and Sunday as off
    initialPlan.days[0].status = "completed";
    initialPlan.days[0].completionNote = "خیلی خوش گذشت، با هم پاستا درست کردیم!";
    initialPlan.days[1].isOff = true;
    initialPlan.days[1].status = "off";
    initialPlan.days[1].offReason = "مهمانی خانوادگی";

    const updatedPlan = WeeklyChallengeService.generateWeeklyPlan(
      sat,
      DEFAULT_CHALLENGES,
      true,
      initialPlan,
    );

    expect(updatedPlan.days[0].status).toBe("completed");
    expect(updatedPlan.days[0].completionNote).toBe("خیلی خوش گذشت، با هم پاستا درست کردیم!");
    expect(updatedPlan.days[1].isOff).toBe(true);
    expect(updatedPlan.days[1].offReason).toBe("مهمانی خانوادگی");
  });

  it("selects a random challenge for a day while excluding already used ones if possible", () => {
    const picked = WeeklyChallengeService.getRandomChallenge(DEFAULT_CHALLENGES, [
      "def-cooking",
      "def-dance",
    ]);
    expect(picked).toBeDefined();
    expect(picked.id).not.toBe("def-cooking");
    expect(picked.id).not.toBe("def-dance");
  });

  it("checks day suitability: strictly weekend/holiday challenges are not placed on working weekdays", () => {
    const weekendOnlyChallenge = {
      id: "weekend-breakfast",
      title: "صبحانه مفصل روز تعطیل",
      timeTags: ["weekend", "holiday"] as const,
    };
    const nightChallenge = {
      id: "night-tea",
      title: "چای شبانه با شمع",
      timeTags: ["night"] as const,
    };

    // Day 0 to 4 are weekdays (شنبه تا چهارشنبه)
    expect(WeeklyChallengeService.isChallengeSuitableForDayIndex(weekendOnlyChallenge, 0)).toBe(false);
    expect(WeeklyChallengeService.isChallengeSuitableForDayIndex(weekendOnlyChallenge, 2)).toBe(false);
    expect(WeeklyChallengeService.isChallengeSuitableForDayIndex(nightChallenge, 0)).toBe(true);

    // Day 5 and 6 are weekend (پنج‌شنبه و جمعه)
    expect(WeeklyChallengeService.isChallengeSuitableForDayIndex(weekendOnlyChallenge, 5)).toBe(true);
    expect(WeeklyChallengeService.isChallengeSuitableForDayIndex(weekendOnlyChallenge, 6)).toBe(true);
  });
});
