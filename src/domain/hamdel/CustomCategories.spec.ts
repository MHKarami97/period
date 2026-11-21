import { describe, expect, it } from "vitest";
import { addCustomCategory, initCustomCategories } from "./customCategories";
import { HAMDEL_SECTIONS } from "./hamdelSections";

describe("CustomCategories", () => {
  it("adds custom categories to section definition options and persists them", () => {
    initCustomCategories();

    const option = addCustomCategory("interests", "category", "عطر و ادکلن");
    expect(option.label).toBe("عطر و ادکلن");
    expect(option.value).toBe("عطر و ادکلن");

    const interests = HAMDEL_SECTIONS.find((s) => s.id === "interests");
    const categoryField = interests?.fields.find((f) => f.key === "category");
    expect(categoryField?.options?.some((o) => o.value === "عطر و ادکلن")).toBe(true);
  });

  it("throws when category label is empty", () => {
    expect(() => addCustomCategory("interests", "category", "   ")).toThrow();
  });
});
