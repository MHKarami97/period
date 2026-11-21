import type { SuggestionTarget } from "../home/DailySuggestion";

export interface ReleaseHighlight {
  readonly icon: string;
  readonly title: string;
  readonly text: string;
  /** Where the user can try the feature; optional. */
  readonly to?: SuggestionTarget;
}

export interface ReleaseNote {
  /** Unique, never reused. Newer releases are listed first in RELEASES. */
  readonly id: string;
  readonly title: string;
  readonly highlights: readonly ReleaseHighlight[];
}

/** Newest first. To announce a new version, add ONE entry at the top; the "What's new" dialog does the rest. */
export const RELEASES: readonly ReleaseNote[] = [
  {
    id: "2026.11.2",
    title: "آمار، سلامت و تحلیل",
    highlights: [
      { icon: "📈", title: "آمار و الگوهای چرخه", text: "نمودار طول چرخه، درجه‌ی نظم، هشدارهای ساده و الگوی علائم (مثلاً سردرد قبل از پریود).", to: { name: "companion", query: { tab: "stats" } } },
      { icon: "✍️", title: "ثبت علائم کامل‌تر", text: "برچسب‌های علائم جسمی، ساعت خواب، دمای پایه و رابطه؛ گزارش PDF پزشک هم به‌روز شد.", to: { name: "companion", query: { tab: "symptoms" } } },
      { icon: "💊", title: "دفترچه‌ی سلامت و یادآور دارو", text: "وقت پزشک، آزمایش‌ها و داروها با دوزهای امروز و اعلان (وقتی برنامه باز است).", to: { name: "companion", query: { tab: "health" } } },
      { icon: "🤰", title: "بارداری", text: "هفته‌شماری، سه‌ماهه، تاریخ تقریبی زایمان و شمارش حرکات جنین.", to: { name: "companion", query: { tab: "pregnancy" } } },
      { icon: "🔖", title: "همیار: نشانک و مسیر من", text: "هر مرحله را «خوانده‌شده» یا نشانک‌دار کنید و راهنماهای مسیرتان را انتخاب کنید.", to: { name: "hamyar" } },
      { icon: "🎁", title: "همدل: برنامه‌ی هفتگی و ایده‌ی هدیه", text: "برای هر روز یک کار کوچک، یابنده‌ی هدیه با بودجه و مهلت برای قول‌ها.", to: { name: "hamdel-weekly-plan" } },
      { icon: "🔥", title: "امتیاز و چالش مناسبتی", text: "روزهای پیاپی، امتیاز و پیشنهاد چالش نوروز، یلدا، روز عشق و فصل‌ها.", to: { name: "game-daily-challenges" } },
      { icon: "🧩", title: "نمایش بخش‌ها", text: "در تنظیمات می‌توانید منو و ویجت‌های صفحه‌ی خانه را مخفی یا روشن کنید.", to: { name: "settings" } },
    ],
  },
  {
    id: "2026.11.1",
    title: "خانه، همراه و منوی جدید",
    highlights: [
      { icon: "🏠", title: "صفحه‌ی خانه", text: "خلاصه‌ی وضعیت چرخه، یادآورهای امروز و پیشنهاد روز از همه‌ی بخش‌ها.", to: { name: "home" } },
      { icon: "🩸", title: "همراه", text: "داشبورد، تقویم و ثبت علائم در یک صفحه‌ی تب‌دار، با راهنمای امروز بر پایه‌ی فاز و علائم.", to: { name: "companion" } },
      { icon: "🧭", title: "منوی جدید", text: "خانه دکمه‌ی گرد وسط است؛ همراه و هم‌راز سمت راست، همدل و همیار سمت چپ." },
      { icon: "🎲", title: "بازی‌های بیشتر بدون رمز", text: "تاس دوتایی، جرئت یا حقیقت، بازی دو سؤالی و کارت‌های خراشیدنی بدون رمز باز شدند.", to: { name: "games" } },
      { icon: "⚙️", title: "تنظیمات تب‌دار", text: "تنظیمات در پنج تب مرتب شد: عمومی، یادآور، امنیت، داده و حساب.", to: { name: "settings" } },
      { icon: "📖", title: "راهنمای کامل‌تر", text: "راهنمای برنامه با همه‌ی بخش‌های جدید به‌روز شد.", to: { name: "guide" } },
    ],
  },
];

export const LATEST_RELEASE_ID: string = RELEASES[0].id;

const MAX_UNSEEN_SHOWN = 3;

/** Decides which release notes a user still has to see. */
export class ReleaseNotesPolicy {
  /**
   * @param lastSeenId id of the newest release the user already saw; null for an existing user who never saw any notes.
   * An unknown id (e.g. an entry was removed) shows only the latest release instead of everything.
   */
  public static unseen(releases: readonly ReleaseNote[], lastSeenId: string | null): ReleaseNote[] {
    if (lastSeenId === null) {
      return releases.slice(0, MAX_UNSEEN_SHOWN);
    }
    const index = releases.findIndex((release) => release.id === lastSeenId);
    return index === -1 ? releases.slice(0, 1) : releases.slice(0, Math.min(index, MAX_UNSEEN_SHOWN));
  }
}
