import { describe, expect, it } from "vitest";
import type { HamyarGuideData } from "../hamyar/HamyarGuide";
import { DateOnly } from "../valueObjects/DateOnly";
import { HamyarTipPicker, checklistKey } from "./HamyarTipPicker";

const DATA = {
  stages: [
    {
      id: 1,
      title: "مرحله‌ی یک",
      goal: "",
      knowledge: [],
      practical_checklist: ["کار الف", "کار ب"],
      common_mistakes_and_myths: [],
      red_flags: [],
    },
  ],
} as unknown as HamyarGuideData;

const TODAY = DateOnly.fromIsoString("2026-03-20");

describe("HamyarTipPicker", () => {
  it("returns null when no guide is loaded", () => {
    expect(HamyarTipPicker.pick([], TODAY, () => false)).toBeNull();
  });

  it("only suggests checklist items that are not done yet", () => {
    const done = new Set([checklistKey("g", 1, 0)]);
    const tip = HamyarTipPicker.pick([{ id: "g", title: "g", data: DATA }], TODAY, (key) => done.has(key));
    expect(tip?.text).toBe("کار ب");
    expect(tip?.kind).toBe("checklist");
  });

  it("returns null when everything is already done", () => {
    expect(HamyarTipPicker.pick([{ id: "g", title: "g", data: DATA }], TODAY, () => true)).toBeNull();
  });
});
