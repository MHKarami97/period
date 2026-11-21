import { describe, expect, it } from "vitest";
import { parseAmount } from "./GiftIdeaFinder";

describe("parseAmount", () => {
  it("reads Persian digits with separators", () => {
    expect(parseAmount("۲٬۵۰۰٬۰۰۰ تومان")).toBe(2500000);
  });

  it("returns null when there are no digits", () => {
    expect(parseAmount("گران")).toBeNull();
  });
});
