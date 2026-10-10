import { FACET_KEYS, FacetKey } from "./facets";
import { PositionsDataError } from "./errors";
import { normalizeSearchText } from "./normalizeSearchText";

interface PositionProps {
  id: string;
  title: string;
  /** Path of the encrypted image relative to the data folder ("" when the item has no image). */
  image: string;
  imageType: string;
  facets: Readonly<Record<FacetKey, readonly string[]>>;
  categories: readonly string[];
  tags: readonly string[];
  content: string;
}

const CORE_FACETS: readonly FacetKey[] = FACET_KEYS.filter((key) => key !== FacetKey.Other);

function unique(values: readonly string[]): string[] {
  return [...new Set(values)];
}

/** "آنال, داگ_استایل" -> ["آنال", "داگ_استایل"] (comma may be Latin or Persian). */
function splitList(raw: unknown): string[] {
  return typeof raw === "string"
    ? unique(
        raw
          .split(/[,،]/)
          .map((part) => part.trim())
          .filter((part) => part.length > 0),
      )
    : [];
}

function stringArray(raw: unknown): string[] {
  return Array.isArray(raw) ? unique(raw.filter((item): item is string => typeof item === "string")) : [];
}

/**
 * Position - immutable Entity built from one item of the decrypted JSON.
 * Every searchable/filterable value is pre-split into lists, and a normalised
 * `searchText` blob is built once so searching stays fast for large catalogs.
 */
export class Position {
  public readonly searchText: string;

  private constructor(private readonly props: PositionProps) {
    this.searchText = normalizeSearchText(
      [
        props.title,
        props.content,
        ...FACET_KEYS.flatMap((key) => props.facets[key]),
        ...props.categories,
        ...props.tags,
      ].join(" "),
    );
  }

  public static fromRaw(raw: unknown, index: number): Position {
    if (typeof raw !== "object" || raw === null) {
      throw new PositionsDataError(`Item #${index} is not an object.`);
    }
    const item = raw as Record<string, unknown>;
    const title = typeof item.title === "string" ? item.title.trim() : "";
    if (title.length === 0) {
      throw new PositionsDataError(`Item #${index} has no title.`);
    }

    const categories = stringArray(item.categories);
    const tags = stringArray(item.tags);
    const core: Record<string, string[]> = {
      [FacetKey.PositionType]: splitList(item.position_type),
      [FacetKey.Stimulation]: splitList(item.stimulation),
      [FacetKey.Penetrations]: splitList(item.penetrations),
      [FacetKey.Petting]: splitList(item.petting),
      [FacetKey.Activity]: splitList(item.activity),
      [FacetKey.Complexity]: splitList(item.complexity),
    };
    const known = new Set(CORE_FACETS.flatMap((key) => core[key]));
    const other = unique([...categories, ...tags]).filter((value) => !known.has(value));

    return new Position({
      id: `position-${index}`,
      title,
      image: typeof item.image === "string" ? item.image : "",
      imageType: typeof item.imageType === "string" ? item.imageType : "",
      facets: { ...core, [FacetKey.Other]: other } as Record<FacetKey, string[]>,
      categories,
      tags,
      content: typeof item.content === "string" ? item.content : "",
    });
  }

  public get id(): string {
    return this.props.id;
  }

  public get title(): string {
    return this.props.title;
  }

  public get image(): string {
    return this.props.image;
  }

  public get imageType(): string {
    return this.props.imageType;
  }

  public get content(): string {
    return this.props.content;
  }

  public facetValues(key: FacetKey): readonly string[] {
    return this.props.facets[key];
  }
}
