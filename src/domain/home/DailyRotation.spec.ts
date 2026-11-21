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

  it("moves through the list when the offset grows", () => {
    const rotation = DailyRotation.forDay(DateOnly.fromIsoString("2026-03-20"));
    expect(new Set(ITEMS.map((_, offset) => rotation.pick(ITEMS, offset))).size).toBe(ITEMS.length);
  });
});
