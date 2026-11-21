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
 * HAMDEL_FEATURES - Extra non-generic sections in the Hamdel hub.
 * Brief and occasionNotes are now merged into one unified experience.
 */
export const HAMDEL_FEATURES: readonly HamdelFeature[] = [
  {
    id: "stats",
    title: "آمار و تحلیل‌های تفصیلی",
    icon: "📊",
    description: "نمودار روند خوشحالی و ناراحتی، آمار هدیه‌ها، قول‌ها و توزیع یادداشت‌ها.",
    group: "together",
    path: "/app/hamdel/stats",
  },
];
