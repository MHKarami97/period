import { FACET_KEYS, FACET_LABELS_FA, FacetKey, toDisplayLabel } from "./facets";
import { normalizeSearchText } from "./normalizeSearchText";
import type { Position } from "./Position";
import type { PositionFilter } from "./PositionFilter";

export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

export interface FacetGroup {
  key: FacetKey;
  label: string;
  options: FacetOption[];
}

/**
 * PositionCatalog - immutable aggregate over all positions. Owns the search
 * (every whitespace-separated word must appear somewhere in the item) and the
 * facet groups used to build the filter UI.
 */
export class PositionCatalog {
  public readonly facetGroups: readonly FacetGroup[];

  private constructor(private readonly positions: readonly Position[]) {
    this.facetGroups = PositionCatalog.buildFacetGroups(positions);
  }

  public static create(positions: readonly Position[]): PositionCatalog {
    return new PositionCatalog(positions);
  }

  public get size(): number {
    return this.positions.length;
  }

  public query(input: { text: string; filter: PositionFilter }): readonly Position[] {
    const words = normalizeSearchText(input.text).split(" ").filter((word) => word.length > 0);
    return this.positions.filter(
      (position) => input.filter.matches(position) && words.every((word) => position.searchText.includes(word)),
    );
  }

  private static buildFacetGroups(positions: readonly Position[]): FacetGroup[] {
    return FACET_KEYS.map((key) => {
      const counts = new Map<string, number>();
      for (const position of positions) {
        for (const value of position.facetValues(key)) {
          counts.set(value, (counts.get(value) ?? 0) + 1);
        }
      }
      const options = [...counts]
        .map(([value, count]) => ({ value, label: toDisplayLabel(value), count }))
        .sort((a, b) => a.label.localeCompare(b.label, "fa"));
      return { key, label: FACET_LABELS_FA[key], options };
    }).filter((group) => group.options.length > 0);
  }
}
