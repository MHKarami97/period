import type { WeeklyChallengeSchedule } from "@domain/games/dailyChallenges/DailyChallengeTypes";
import { format } from "date-fns-jalali";
import { buildWeeklyChallengesReportHtml } from "./WeeklyChallengesReportBuilder";

function toJalali(iso: string, pattern: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return format(new Date(year, month - 1, day), pattern);
}

export interface WeeklyChallengesReportOptions {
  readonly schedule: WeeklyChallengeSchedule;
  readonly profileName?: string;
}

export class WeeklyChallengesReportService {
  public static openWeeklyReport(options: WeeklyChallengesReportOptions): void {
    const reportWindow = window.open("", "_blank");
    if (!reportWindow) {
      throw new Error("پنجره چاپ مسدود شد. لطفاً پاپ‌آپ مرورگر را فعال کنید.");
    }
    reportWindow.document.write('<p style="font-family:sans-serif;direction:rtl;text-align:center;padding:20px;">در حال آماده‌سازی گزارش هفتگی...</p>');

    try {
      const days = options.schedule.days;
      const firstDay = days[0]?.date ?? options.schedule.weekStartIso;
      const lastDay = days[days.length - 1]?.date ?? options.schedule.weekStartIso;

      const weekStartJalali = toJalali(firstDay, "yyyy/MM/dd");
      const weekEndJalali = toJalali(lastDay, "yyyy/MM/dd");

      const html = buildWeeklyChallengesReportHtml({
        schedule: options.schedule,
        weekStartJalali,
        weekEndJalali,
        profileName: options.profileName,
        fontBaseUrl: `${window.location.origin}/fonts`,
      });

      reportWindow.document.open();
      reportWindow.document.write(html);
      reportWindow.document.close();
    } catch (error) {
      reportWindow.document.body.innerHTML = '<p style="color:red;direction:rtl;padding:20px;">خطا در ساخت گزارش هفتگی.</p>';
      throw error;
    }
  }
}
