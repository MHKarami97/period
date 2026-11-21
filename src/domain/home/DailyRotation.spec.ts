import { describe, expect, it } from "vitest";
import { DateOnly } from "../valueObjects/DateOnly";
import { DailyRotation } from "./DailyRotation";

const ITEMS = ["a", "b", "c", "d", "e"] as const;

describe("DailyRotation", () => {
  it("returns the same pick for the same day and salt", () => {
    const day = DateOnly.fromIsoString("2026-03-20");
    expect(DailyRotation.forDay(day, "x").pick(ITEMS)).toBe(DailyRotation.forDay(day, "x").pick(ITEMS));
  });

  it("returns null for an empty list", () => {
    expect(DailyRotation.forDay(DateOnly.today()).pick([])).toBeNull();
  });

  it("rotate keeps every item exactly once", () => {
    const rotated = DailyRotation.forDay(DateOnly.fromIsoString("2026-03-20")).rotate(ITEMS);
    expect([...rotated].sort()).toEqual([...ITEMS]);
  });
});
