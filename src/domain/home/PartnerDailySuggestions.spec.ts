import { describe, expect, it } from "vitest";
import { HamdelEntry } from "../hamdel/HamdelEntry";
import { DateOnly } from "../valueObjects/DateOnly";
import { PartnerDailySuggestionBuilder } from "./PartnerDailySuggestions";

const TODAY = DateOnly.fromIsoString("2026-03-20");
const CALENDAR = { yearOf: (day: DateOnly) => Number(day.toIsoString().slice(0, 4)), addYears: (day: DateOnly, years: number) => day.addDays(365 * years) };

describe("PartnerDailySuggestionBuilder", () => {
  it("falls back to a hint to use the notebook when it is empty", () => {
    const suggestions = PartnerDailySuggestionBuilder.build([], TODAY, CALENDAR);
    expect(suggestions).toHaveLength(1);
    expect(suggestions[0].id).toBe("fallback");
  });

  it("is deterministic within a day and never exceeds the limit", () => {
    const entry = HamdelEntry.create({ id: "h1", profileId: "p", section: "hints", values: { heardAt: "2026-03-01", hint: "یک کتاب", status: "noted" }, nowIso: "2026-03-01T00:00:00.000Z" });
    const first = PartnerDailySuggestionBuilder.build([entry], TODAY, CALENDAR, null, 2);
    const second = PartnerDailySuggestionBuilder.build([entry], TODAY, CALENDAR, null, 2);
    expect(first).toEqual(second);
    expect(first.length).toBeLessThanOrEqual(2);
  });
});
