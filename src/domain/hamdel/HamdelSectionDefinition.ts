export const HAMDEL_GROUP_IDS = ["profile", "feelings", "story", "interactions", "together"] as const;
export type HamdelGroupId = (typeof HAMDEL_GROUP_IDS)[number];

export const HAMDEL_GROUP_LABELS_FA: Readonly<Record<HamdelGroupId, string>> = {
  profile: "شناخت او",
  feelings: "احساسات و روحیه",
  story: "گذشته و آینده",
  interactions: "تعامل‌ها و تعهدها",
  together: "با هم",
};

export type HamdelFieldKind = "text" | "textarea" | "select" | "date";

export interface HamdelFieldOption {
  readonly value: string;
  readonly label: string;
}

export interface HamdelFieldDefinition {
  readonly key: string;
  readonly label: string;
  readonly kind: HamdelFieldKind;
  readonly required?: boolean;
  readonly maxLength?: number;
  readonly placeholder?: string;
  readonly options?: readonly HamdelFieldOption[];
  /** For "date" fields: pre-fill with today when adding a new entry. */
  readonly defaultToday?: boolean;
  /** For "text" fields: autocomplete hints (rendered as a datalist). */
  readonly suggestions?: readonly string[];
  /** Stored and validated like any field, but never rendered by the generic form/card (managed by a custom view). */
  readonly hidden?: boolean;
}

/** One-tap status switch shown on the card (e.g. promise: open <-> done). */
export interface HamdelToggleDefinition {
  readonly field: string;
  readonly openValue: string;
  readonly doneValue: string;
  readonly openLabel: string;
  readonly doneLabel: string;
}

/** Ordered status pipeline advanced one step at a time (e.g. gift: idea -> bought -> given). */
export interface HamdelFlowDefinition {
  readonly field: string;
  readonly steps: readonly string[];
}

/** Sections that have a dedicated screen instead of the generic list page. */
export type HamdelCustomView = "challenges" | "diary" | "dates";

export interface HamdelSectionDefinition {
  readonly id: string;
  readonly title: string;
  readonly icon: string;
  readonly description: string;
  readonly group: HamdelGroupId;
  readonly fields: readonly HamdelFieldDefinition[];
  /** Field shown as the card headline. */
  readonly titleField: string;
  /** Date field used for sorting (newest first) and the timeline label. */
  readonly dateField?: string;
  /** Select field offered as filter chips above the list. */
  readonly filterField?: string;
  /** Select fields shown as small badges on the card. */
  readonly badgeFields?: readonly string[];
  readonly toggle?: HamdelToggleDefinition;
  readonly flow?: HamdelFlowDefinition;
  /** Ready-made entries the user can add with one tap (values of visible fields). */
  readonly presets?: readonly Readonly<Record<string, string>>[];
  readonly customView?: HamdelCustomView;
}
