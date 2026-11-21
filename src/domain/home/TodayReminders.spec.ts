import { describe, expect, it } from "vitest";
import { TodayReminderBuilder, type TodayReminderInput } from "./TodayReminders";

const EMPTY: TodayReminderInput = { periodDueOrLate: false, isPartnerMode: false, symptomMissing: false, challengePending: false, callsToday: [], occasionsSoon: [], openPromises: 0 };

describe("TodayReminderBuilder", () => {
  it("is empty when there is nothing to remember", () => {
    expect(TodayReminderBuilder.build(EMPTY)).toEqual([]);
  });

  it("does not ask a partner-mode user to log symptoms", () => {
    expect(TodayReminderBuilder.build({ ...EMPTY, symptomMissing: true, isPartnerMode: true })).toEqual([]);
  });

  it("lists the pending challenge", () => {
    expect(TodayReminderBuilder.build({ ...EMPTY, challengePending: true })[0].id).toBe("challenge");
  });
});
