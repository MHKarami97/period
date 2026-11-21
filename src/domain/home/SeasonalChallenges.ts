export interface SeasonalChallenge {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly occasion: string;
}

interface DatedChallenge extends SeasonalChallenge {
  readonly month: number;
  readonly fromDay: number;
  readonly toDay: number;
}

/** Month numbers are Jalali (1 = Farvardin ... 12 = Esfand). */
const OCCASIONS: readonly DatedChallenge[] = [
  { id: "nowruz", occasion: "نوروز", month: 1, fromDay: 1, toDay: 13, title: "سفره‌ی هفت‌سین دونفره", description: "امروز با هم یک گوشه از خانه را برای نوروز بچینید و هرکدام برای سال جدید یک آرزو بگویید." },
  { id: "love-day", occasion: "سپندارمذگان (روز عشق)", month: 12, fromDay: 3, toDay: 7, title: "روز عشق", description: "یک نامه‌ی کوتاه دست‌نویس به هم بدهید و دلیل دوست داشتن‌تان را بگویید." },
  { id: "yalda", occasion: "یلدا", month: 9, fromDay: 28, toDay: 30, title: "شب یلدای دونفره", description: "یلدا را با انار، فال یا شعر برای هم برگزار کنید و یک خاطره‌ی مشترک بگویید." },
  { id: "autumn", occasion: "آغاز پاییز", month: 7, fromDay: 1, toDay: 3, title: "پیاده‌روی پاییزی", description: "یک پیاده‌روی کوتاه زیر برگ‌های پاییزی با یک نوشیدنی گرم." },
];

const SEASONAL: readonly SeasonalChallenge[] = [
  { id: "spring", occasion: "بهار", title: "یک گل یا گیاه برای خانه", description: "امروز با هم یک گلدان یا شاخه‌گل انتخاب کنید." },
  { id: "summer", occasion: "تابستان", title: "بستنی یا نوشیدنی خنک", description: "عصر برای یک نوشیدنی خنک یا بستنی بیرون بروید." },
  { id: "autumn-season", occasion: "پاییز", title: "شب فیلم و چای", description: "یک فیلم قدیمی انتخاب کنید و با چای تماشایش کنید." },
  { id: "winter", occasion: "زمستان", title: "سوپ یا آش دونفره", description: "امشب با هم یک غذای گرم درست کنید." },
];

const MONTHS_PER_SEASON = 3;

/** Picks the occasion challenge for a Jalali date, falling back to the challenge of the current season. */
export class SeasonalChallengeProvider {
  public static forJalaliDate(month: number, day: number): SeasonalChallenge {
    const dated = OCCASIONS.find((item) => item.month === month && day >= item.fromDay && day <= item.toDay);
    return dated ?? SEASONAL[Math.floor((month - 1) / MONTHS_PER_SEASON) % SEASONAL.length];
  }
}
