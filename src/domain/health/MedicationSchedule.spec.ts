import { describe, expect, it } from "vitest";
import { MedicationSchedule, type DoseSlot } from "./MedicationSchedule";

describe("MedicationSchedule", () => {
  it("parses Persian and Latin times", () => {
    expect(MedicationSchedule.parseTimes("۸:۰۰، 20:30 و 8:00")).toEqual(["08:00", "20:30"]);
  });

  it("ignores invalid times", () => {
    expect(MedicationSchedule.parseTimes("25:00 و 10:75 و صبح")).toEqual([]);
  });

  it("returns only doses that are due and not taken", () => {
    const slots: DoseSlot[] = [
      { key: "a@08:00", entryId: "a", name: "A", dose: "", time: "08:00", minutes: 480 },
      { key: "a@20:00", entryId: "a", name: "A", dose: "", time: "20:00", minutes: 1200 },
    ];
    expect(MedicationSchedule.due(slots, 600, () => false).map((slot) => slot.key)).toEqual(["a@08:00"]);
    expect(MedicationSchedule.due(slots, 600, (key) => key === "a@08:00")).toEqual([]);
  });
});
