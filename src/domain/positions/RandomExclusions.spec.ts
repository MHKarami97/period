import { describe, expect, it } from "vitest";
import { FacetKey } from "./facets";
import { Position } from "./Position";
import { RandomExclusions } from "./RandomExclusions";

const anal = Position.fromRaw({ title: "A", position_type: "آنال, داگ_استایل", complexity: "متوسط" }, 0);
const spoon = Position.fromRaw({ title: "B", position_type: "کنار_هم", complexity: "ساده" }, 1);

describe("RandomExclusions", () => {
  it("allows everything when nothing is excluded", () => {
    const none = RandomExclusions.none();
    expect([anal, spoon].every((position) => none.allows(position))).toBe(true);
  });

  it("blocks a position that has any excluded value", () => {
    const excluded = RandomExclusions.none().toggle(FacetKey.PositionType, "آنال");
    expect(excluded.allows(anal)).toBe(false);
    expect(excluded.allows(spoon)).toBe(true);
  });

  it("toggling twice restores the previous state", () => {
    const back = RandomExclusions.none().toggle(FacetKey.Complexity, "ساده").toggle(FacetKey.Complexity, "ساده");
    expect(back.count).toBe(0);
  });

  it("round-trips through a snapshot and ignores corrupted data", () => {
    const original = RandomExclusions.none().toggle(FacetKey.PositionType, "آنال");
    expect(RandomExclusions.fromSnapshot(original.toSnapshot()).isExcluded(FacetKey.PositionType, "آنال")).toBe(true);
    expect(RandomExclusions.fromSnapshot({ positionType: [1, null], bogus: ["x"] }).count).toBe(0);
    expect(RandomExclusions.fromSnapshot(null).count).toBe(0);
  });
});
