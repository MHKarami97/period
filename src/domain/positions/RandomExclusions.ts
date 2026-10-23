import { FACET_KEYS, FacetKey } from "./facets";
import type { Position } from "./Position";

export type RandomExclusionsSnapshot = Partial<Record<FacetKey, string[]>>;

/**
 * RandomExclusions - immutable value object holding the facet values the user
 * does NOT want the "random position" button to pick (e.g. a position type).
 * A position is allowed only when none of its values is excluded.
 */
export class RandomExclusions {
  private constructor(private readonly excluded: ReadonlyMap<FacetKey, ReadonlySet<string>>) {}

  public static none(): RandomExclusions {
    return new RandomExclusions(new Map());
  }

  /** Tolerant to corrupted storage: unknown keys and non-string values are dropped. */
  public static fromSnapshot(raw: unknown): RandomExclusions {
    const excluded = new Map<FacetKey, ReadonlySet<string>>();
    if (typeof raw === "object" && raw !== null) {
      for (const key of FACET_KEYS) {
        const values = (raw as Record<string, unknown>)[key];
        const strings = Array.isArray(values) ? values.filter((value): value is string => typeof value === "string") : [];
        if (strings.length > 0) {
          excluded.set(key, new Set(strings));
        }
      }
    }
    return new RandomExclusions(excluded);
  }

  public get count(): number {
    let total = 0;
    for (const values of this.excluded.values()) {
      total += values.size;
    }
    return total;
  }

  public isExcluded(key: FacetKey, value: string): boolean {
    return this.excluded.get(key)?.has(value) ?? false;
  }

  public toggle(key: FacetKey, value: string): RandomExclusions {
    const next = new Map(this.excluded);
    const values = new Set(next.get(key) ?? []);
    if (!values.delete(value)) {
      values.add(value);
    }
    if (values.size === 0) {
      next.delete(key);
    } else {
      next.set(key, values);
    }
    return new RandomExclusions(next);
  }

  public allows(position: Position): boolean {
    for (const [key, values] of this.excluded) {
      if (position.facetValues(key).some((value) => values.has(value))) {
        return false;
      }
    }
    return true;
  }

  public toSnapshot(): RandomExclusionsSnapshot {
    const snapshot: RandomExclusionsSnapshot = {};
    for (const [key, values] of this.excluded) {
      snapshot[key] = [...values];
    }
    return snapshot;
  }
}
