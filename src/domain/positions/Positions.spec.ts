import { describe, expect, it } from "vitest";
import { FacetKey } from "./facets";
import { normalizeSearchText } from "./normalizeSearchText";
import { Position } from "./Position";
import { PositionCatalog } from "./PositionCatalog";
import { PositionFilter } from "./PositionFilter";

const RAW = [
  {
    title: "Clapper",
    image: "images/a.enc",
    imageType: "image/png",
    position_type: "آنال, داگ_استایل",
    stimulation: "نقطه_P",
    penetrations: "وسط",
    petting: "گرفتن_باسن",
    activity: "مرد_فعال",
    complexity: "متوسط",
    categories: ["آنال", "داگ_استایل", "ویژه"],
    tags: ["آنال", "ویژه"],
    content: "توضیح کامل درباره‌ی این پوزیشن",
  },
  {
    title: "Spoon",
    image: "",
    position_type: "کنار_هم",
    stimulation: "",
    penetrations: "کم",
    petting: "",
    activity: "زن_فعال",
    complexity: "ساده",
    categories: [],
    tags: [],
    content: "آرام و صمیمی",
  },
];

const catalog = PositionCatalog.create(RAW.map((item, index) => Position.fromRaw(item, index)));

describe("normalizeSearchText", () => {
  it("unifies Arabic letters, digits and underscores", () => {
    expect(normalizeSearchText("داگ_استایل ك ي ۱۲٣")).toBe("داگ استایل ک ی 123");
  });
});

describe("Position.fromRaw", () => {
  it("splits comma separated fields and collects extra tags", () => {
    const position = Position.fromRaw(RAW[0], 0);
    expect(position.facetValues(FacetKey.PositionType)).toEqual(["آنال", "داگ_استایل"]);
    expect(position.facetValues(FacetKey.Other)).toEqual(["ویژه"]);
  });

  it("rejects an item without a title", () => {
    expect(() => Position.fromRaw({ content: "x" }, 3)).toThrow();
  });
});

describe("PositionCatalog.query", () => {
  it("searches every field, including the content text", () => {
    expect(catalog.query({ text: "صمیمی", filter: PositionFilter.empty() }).map((p) => p.title)).toEqual(["Spoon"]);
    expect(catalog.query({ text: "داگ استایل", filter: PositionFilter.empty() }).map((p) => p.title)).toEqual(["Clapper"]);
  });

  it("requires every word to match", () => {
    expect(catalog.query({ text: "clapper spoon", filter: PositionFilter.empty() })).toHaveLength(0);
  });

  it("ORs values inside a facet and ANDs facets", () => {
    const both = PositionFilter.empty().toggle(FacetKey.Complexity, "متوسط").toggle(FacetKey.Complexity, "ساده");
    expect(catalog.query({ text: "", filter: both })).toHaveLength(2);
    const narrowed = both.toggle(FacetKey.Activity, "زن_فعال");
    expect(catalog.query({ text: "", filter: narrowed }).map((p) => p.title)).toEqual(["Spoon"]);
  });

  it("toggling a value twice removes the selection", () => {
    const filter = PositionFilter.empty().toggle(FacetKey.Complexity, "ساده").toggle(FacetKey.Complexity, "ساده");
    expect(filter.activeCount).toBe(0);
  });
});
