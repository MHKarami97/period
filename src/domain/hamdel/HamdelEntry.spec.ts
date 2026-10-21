import { describe, expect, it } from "vitest";
import { HamdelEntry } from "./HamdelEntry";
import { buildPresetValues } from "./hamdelDefaults";
import { HAMDEL_SECTIONS, getHamdelSection } from "./hamdelSections";
import { HamdelValidationError } from "./HamdelValidationError";

const NOW = "2026-10-21T10:00:00.000Z";
const TODAY = "2026-10-21";

function create(section: string, values: Record<string, string>): HamdelEntry {
  return HamdelEntry.create({ id: "1", profileId: "p", section, values, nowIso: NOW });
}

describe("hamdel section catalog", () => {
  it("has unique section ids and unique field keys per section", () => {
    expect(new Set(HAMDEL_SECTIONS.map((section) => section.id)).size).toBe(HAMDEL_SECTIONS.length);
    for (const section of HAMDEL_SECTIONS) {
      const keys = section.fields.map((field) => field.key);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  it("references only existing fields of the right kind", () => {
    for (const section of HAMDEL_SECTIONS) {
      const byKey = new Map(section.fields.map((field) => [field.key, field]));
      expect(byKey.has(section.titleField)).toBe(true);
      if (section.dateField) expect(byKey.get(section.dateField)?.kind).toBe("date");
      if (section.filterField) expect(byKey.get(section.filterField)?.kind).toBe("select");
      for (const key of section.badgeFields ?? []) expect(byKey.get(key)?.kind).toBe("select");
      for (const rule of [section.toggle, section.flow]) {
        if (!rule) continue;
        const optionValues = byKey.get(rule.field)?.options?.map((option) => option.value) ?? [];
        const used = "steps" in rule ? rule.steps : [rule.openValue, rule.doneValue];
        for (const value of used) expect(optionValues).toContain(value);
      }
      for (const field of section.fields) {
        if (field.kind === "select") expect(field.options?.length ?? 0).toBeGreaterThan(0);
      }
    }
  });

  it("ships presets that are valid, unique and complete once defaults are applied", () => {
    for (const section of HAMDEL_SECTIONS.filter((candidate) => candidate.presets)) {
      const titles = (section.presets ?? []).map((preset) => preset[section.titleField]);
      expect(new Set(titles).size).toBe(titles.length);
      for (const preset of section.presets ?? []) {
        expect(() => create(section.id, buildPresetValues(section, preset, TODAY))).not.toThrow();
      }
    }
  });
});

describe("HamdelEntry", () => {
  it("trims values and drops unknown keys", () => {
    const entry = create("interests", { category: "flower", value: "  رز سفید ", note: "", ignored: "x" });
    expect(entry.valueOf("value")).toBe("رز سفید");
    expect(entry.values).not.toHaveProperty("ignored");
  });

  it("requires mandatory fields", () => {
    expect(() => create("interests", { category: "flower", value: "   " })).toThrow(HamdelValidationError);
  });

  it("rejects unknown select options and invalid dates", () => {
    expect(() => create("interests", { category: "nope", value: "x" })).toThrow(HamdelValidationError);
    expect(() => create("memories", { date: "2026-02-30", title: "x" })).toThrow(HamdelValidationError);
  });

  it("exposes the section date and builds updated copies", () => {
    const entry = create("promises", { promise: "سفر شمال", givenAt: "2026-10-01", status: "open" });
    expect(entry.dateIso).toBe("2026-10-01");
    const toggle = getHamdelSection("promises").toggle;
    const done = entry.withFieldValue(toggle?.field ?? "status", toggle?.doneValue ?? "done", "2026-10-22T00:00:00.000Z");
    expect(done.valueOf("status")).toBe("done");
    expect(entry.valueOf("status")).toBe("open");
    expect(done.updatedAtIso).not.toBe(entry.updatedAtIso);
  });

  it("has no date for sections without a date field", () => {
    expect(create("dislikes", { category: "food", value: "قارچ" }).dateIso).toBeNull();
  });
});
