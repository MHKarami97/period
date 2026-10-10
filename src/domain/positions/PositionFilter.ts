import { FACET_KEYS, FacetKey } from "./facets";
import type { Position } from "./Position";

/**
 * PositionFilter - immutable value object holding the selected facet values.
 * Semantics: values inside one facet are OR-ed, different facets are AND-ed
 * (the usual faceted-search behaviour).
 */
export class PositionFilter {
  private constructor(private readonly selections: ReadonlyMap<FacetKey, ReadonlySet<string>>) {}

  public static empty(): PositionFilter {
    return new PositionFilter(new Map());
  }

  public get activeCount(): number {
    let count = 0;
    for (const values of this.selections.values()) {
      count += values.size;
    }
    return count;
  }

  public isSelected(key: FacetKey, value: string): boolean {
    return this.selections.get(key)?.has(value) ?? false;
  }

  public toggle(key: FacetKey, value: string): PositionFilter {
    const next = new Map(this.selections);
    const values = new Set(next.get(key) ?? []);
    if (values.has(value)) {
      values.delete(value);
    } else {
      values.add(value);
    }
    if (values.size === 0) {
      next.delete(key);
    } else {
      next.set(key, values);
    }
    return new PositionFilter(next);
  }

  public matches(position: Position): boolean {
    return FACET_KEYS.every((key) => {
      const selected = this.selections.get(key);
      return !selected || selected.size === 0 || position.facetValues(key).some((value) => selected.has(value));
    });
  }
}
