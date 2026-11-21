import type { HamdelGroupId } from "@domain/hamdel/HamdelSectionDefinition";

export interface HamdelFeature {
  readonly id: string;
  readonly title: string;
  readonly icon: string;
  readonly description: string;
  readonly group: HamdelGroupId;
  readonly path: string;
}

/**
 * HAMDEL_FEATURES - Extra non-generic features.
 * Stats and PDF export are housed together in the dedicated bottom section of the hub.
 */
export const HAMDEL_FEATURES: readonly HamdelFeature[] = [];
