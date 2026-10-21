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
 * HAMDEL_FEATURES - Hamdel screens that are not a plain list of notes. Each batch of the
 * feature appends here; the hub renders them next to the generic sections of the same group.
 */
export const HAMDEL_FEATURES: readonly HamdelFeature[] = [
  {
    id: "brief",
    title: "نکته قبل از ملاقات",
    icon: "🧭",
    description: "قبل از مهمانی، سفر یا قرار خاص، خلاصه‌ی آنچه باید درباره‌اش به یاد داشته باشی.",
    group: "together",
    path: "/app/hamdel/brief",
  },
  {
    id: "stats",
    title: "آمار و گزارش PDF",
    icon: "📊",
    description: "نمودار روند خوشحالی و ناراحتی، آمار هدیه‌ها و قول‌ها، و خروجی PDF از همه‌ی همدل.",
    group: "together",
    path: "/app/hamdel/stats",
  },
];
