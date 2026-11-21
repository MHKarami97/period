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
export const HAMDEL_FEATURES: readonly HamdelFeature[] = [
  {
    id: "weekly-plan",
    title: "برنامه‌ی هفتگی محبت",
    icon: "🗓",
    description: "برای هر روز هفته‌ی پیش‌رو یک کار کوچک و مشخص، ساخته‌شده از یادداشت‌های خودت.",
    group: "together",
    path: "/app/hamdel/weekly-plan",
  },
  {
    id: "gift-finder",
    title: "یابنده‌ی ایده‌ی هدیه",
    icon: "🎁",
    description: "با بودجه‌ات از اشاره‌ها، لیست آرزوها و علایق او ایده‌ی هدیه پیدا کن.",
    group: "together",
    path: "/app/hamdel/gift-finder",
  },
];
