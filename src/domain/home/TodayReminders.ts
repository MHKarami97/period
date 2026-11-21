import type { SuggestionTarget } from "./DailySuggestion";

export type ReminderTone = "rose" | "amber" | "sky" | "emerald";

export interface TodayReminder {
  readonly id: string;
  readonly icon: string;
  readonly text: string;
  readonly tone: ReminderTone;
  readonly to: SuggestionTarget;
}

export interface TodayReminderInput {
  readonly periodDueOrLate: boolean;
  readonly isPartnerMode: boolean;
  readonly symptomMissing: boolean;
  readonly challengePending: boolean;
  readonly callsToday: readonly string[];
  readonly occasionsSoon: readonly { readonly title: string; readonly label: string }[];
  readonly openPromises: number;
}

/** Collects the "do not forget today" items from every part of the app into one short list. */
export class TodayReminderBuilder {
  public static build(input: TodayReminderInput): TodayReminder[] {
    const reminders: TodayReminder[] = [];

    if (input.periodDueOrLate) {
      reminders.push({ id: "period", icon: "🩸", tone: "rose", text: "زمان پریود بعدی رسیده؛ اگر شروع شده ثبتش کن.", to: { name: "companion" } });
    }
    for (const title of input.callsToday) {
      reminders.push({ id: `call:${title}`, icon: "📞", tone: "sky", text: `امروز: «${title}» - زنگ بزن یا پیام بده.`, to: { name: "hamdel-section", params: { section: "calls" } } });
    }
    for (const occasion of input.occasionsSoon) {
      reminders.push({ id: `occasion:${occasion.title}`, icon: "🎁", tone: "rose", text: `«${occasion.title}» ${occasion.label}`, to: { name: "hamdel-dates" } });
    }
    if (input.challengePending) {
      reminders.push({ id: "challenge", icon: "🎯", tone: "amber", text: "چالش امروز هنوز انجام نشده است.", to: { name: "game-daily-challenges" } });
    }
    if (input.symptomMissing && !input.isPartnerMode) {
      reminders.push({ id: "symptom", icon: "✍️", tone: "emerald", text: "علائم امروز را ثبت نکرده‌ای.", to: { name: "companion", query: { tab: "symptoms" } } });
    }
    if (input.openPromises > 0) {
      reminders.push({ id: "promises", icon: "🤝", tone: "amber", text: `${input.openPromises.toLocaleString("fa-IR")} قول باز داری.`, to: { name: "hamdel-section", params: { section: "promises" } } });
    }
    return reminders;
  }
}
