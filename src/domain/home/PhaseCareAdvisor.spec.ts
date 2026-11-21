import { describe, expect, it } from "vitest";
import { CyclePhase } from "../valueObjects/CyclePhase";
import { DateOnly } from "../valueObjects/DateOnly";
import { FlowLevel } from "../valueObjects/FlowLevel";
import { PhaseCareAdvisor, type CareContext } from "./PhaseCareAdvisor";

const BASE: CareContext = {
  phase: CyclePhase.Menstrual,
  audience: "self",
  today: DateOnly.fromIsoString("2026-03-20"),
  daysUntilPeriod: null,
  painLevel: null,
  mood: null,
  flow: null,
};

describe("PhaseCareAdvisor", () => {
  it("never returns more than five items and has no duplicates", () => {
    const items = PhaseCareAdvisor.advise(BASE);
    expect(items.length).toBeLessThanOrEqual(5);
    expect(new Set(items.map((item) => item.id)).size).toBe(items.length);
  });

  it("puts a pain-aware item first when pain is high", () => {
    expect(PhaseCareAdvisor.advise({ ...BASE, painLevel: 4 })[0].id).toBe("ctx-pain");
  });

  it("adds a safety warning for heavy flow", () => {
    expect(PhaseCareAdvisor.advise({ ...BASE, flow: FlowLevel.Heavy }).some((item) => item.id === "ctx-flow")).toBe(true);
  });

  it("uses partner wording for the partner audience", () => {
    const self = PhaseCareAdvisor.advise(BASE).map((item) => item.text);
    const partner = PhaseCareAdvisor.advise({ ...BASE, audience: "partner" }).map((item) => item.text);
    expect(partner).not.toEqual(self);
  });

  it("warns about a late period", () => {
    expect(PhaseCareAdvisor.advise({ ...BASE, phase: CyclePhase.Luteal, daysUntilPeriod: -4 })[0].id).toBe("ctx-late");
  });
});
