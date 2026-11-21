import type { HamdelEntry } from "../hamdel/HamdelEntry";
import { buildCountdowns, describeDaysLeft, type YearlyCalendar } from "../hamdel/importantDates";
import { CyclePhase } from "../valueObjects/CyclePhase";
import { DateOnly } from "../valueObjects/DateOnly";
import { DailyRotation } from "./DailyRotation";
import type { DailySuggestion } from "./DailySuggestion";

const OCCASION_LOOKAHEAD_DAYS = 30;
const DEFAULT_LIMIT = 4;
const OCCASION_ICONS: Readonly<Record<string, string>> = { birthday: "🎂", anniversary: "💍", meeting: "💫" };

class SuggestionContext {
  private readonly bySection = new Map<string, HamdelEntry[]>();

  public constructor(
    entries: readonly HamdelEntry[],
    public readonly today: DateOnly,
    public readonly calendar: YearlyCalendar,
    public readonly rotation: DailyRotation,
    public readonly phase: CyclePhase | null,
  ) {
    for (const entry of entries) {
      const list = this.bySection.get(entry.section);
      if (list) {
        list.push(entry);
      } else {
        this.bySection.set(entry.section, [entry]);
      }
    }
  }

  public of(section: string, accept: (entry: HamdelEntry) => boolean = () => true): readonly HamdelEntry[] {
    return (this.bySection.get(section) ?? []).filter(accept);
  }

  /** Menstrual and luteal days are when extra gentleness matters most. */
  public get needsExtraCare(): boolean {
    return this.phase === CyclePhase.Menstrual || this.phase === CyclePhase.Luteal;
  }
}

interface SuggestionRule {
  suggest(context: SuggestionContext): DailySuggestion | null;
}

interface SectionRuleOptions {
  readonly section: string;
  readonly icon: string;
  readonly salt: number;
  readonly accept?: (entry: HamdelEntry) => boolean;
  readonly sentence: (entry: HamdelEntry) => string;
  /** When set, the rule only fires if this returns true (e.g. only on tough cycle days). */
  readonly when?: (context: SuggestionContext) => boolean;
}

/** Picks one notebook entry of a section (rotating daily) and phrases it as a suggestion. */
class SectionPickRule implements SuggestionRule {
  public constructor(private readonly options: SectionRuleOptions) {}

  public suggest(context: SuggestionContext): DailySuggestion | null {
    const { section, icon, salt, accept, sentence, when } = this.options;
    if (when && !when(context)) {
      return null;
    }
    const entry = context.rotation.pick(context.of(section, accept), salt);
    if (!entry) {
      return null;
    }
    return { id: `${section}:${entry.id}`, icon, text: sentence(entry), to: { name: "hamdel-section", params: { section } } };
  }
}

class UpcomingOccasionRule implements SuggestionRule {
  public suggest(context: SuggestionContext): DailySuggestion | null {
    const next = buildCountdowns(context.of("dates"), context.today, context.calendar).find(
      (item) => item.daysLeft !== null && item.daysLeft <= OCCASION_LOOKAHEAD_DAYS,
    );
    if (!next || next.daysLeft === null) {
      return null;
    }

    const title = next.entry.valueOf("title");
    const type = next.entry.valueOf("type");
    const giftIdea = context.of("gifts", (gift) => gift.valueOf("status") !== "given" && gift.valueOf("occasion") === type)[0];
    const lead =
      next.daysLeft === 0
        ? `امروز «${title}» است؛ یک پیام یا هدیه‌ی کوچک آماده کن.`
        : `${describeDaysLeft(next.daysLeft)} تا «${title}» مانده؛ از همین حالا برنامه یا هدیه‌اش را آماده کن.`;
    const idea = giftIdea ? ` ایده‌ی هدیه‌ات: «${giftIdea.valueOf("title")}».` : "";
    return { id: `dates:${next.entry.id}`, icon: OCCASION_ICONS[type] ?? "📅", text: `${lead}${idea}`, to: { name: "hamdel-dates" } };
  }
}

class PendingCallRule implements SuggestionRule {
  public suggest(context: SuggestionContext): DailySuggestion | null {
    const due = context
      .of("calls", (entry) => entry.valueOf("status") === "pending" && entry.valueOf("date") !== "")
      .map((entry) => ({ entry, daysLeft: DateOnly.fromIsoString(entry.valueOf("date")).diffInDays(context.today) }))
      .filter((item) => item.daysLeft >= 0 && item.daysLeft <= 1)
      .sort((left, right) => left.daysLeft - right.daysLeft)[0];
    if (!due) {
      return null;
    }
    const when = due.daysLeft === 0 ? "امروز" : "فردا";
    return {
      id: `calls:${due.entry.id}`,
      icon: "📞",
      text: `${when} «${due.entry.valueOf("title")}» است؛ فراموش نکن به او زنگ بزنی یا پیام بدهی.`,
      to: { name: "hamdel-section", params: { section: "calls" } },
    };
  }
}

/**
 * Domain Service: turns the Hamdel notebook into "what can I do for her today" ideas.
 * Time-critical rules win, then cycle-aware calming ideas, then rules that rotate daily.
 */
export class PartnerDailySuggestionBuilder {
  private static readonly PRIORITY_RULES: readonly SuggestionRule[] = [
    new UpcomingOccasionRule(),
    new PendingCallRule(),
    new SectionPickRule({
      section: "calming",
      icon: "🕊",
      salt: 0,
      when: (context) => context.needsExtraCare,
      sentence: (entry) => `این روزها بیشتر مراقبش باش؛ طبق یادداشتت این به آرام شدنش کمک می‌کند: «${entry.valueOf("way")}».`,
    }),
  ];

  private static readonly ROTATING_RULES: readonly SuggestionRule[] = [
    new SectionPickRule({
      section: "hints",
      icon: "💡",
      salt: 1,
      accept: (entry) => entry.valueOf("status") === "noted",
      sentence: (entry) => `او اشاره کرده: «${entry.valueOf("hint")}» - می‌توانی برایش تهیه‌اش کنی.`,
    }),
    new SectionPickRule({
      section: "gifts",
      icon: "🎁",
      salt: 2,
      accept: (entry) => entry.valueOf("status") === "idea",
      sentence: (entry) => `ایده‌ای که برای هدیه ثبت کرده‌ای: «${entry.valueOf("title")}».`,
    }),
    new SectionPickRule({
      section: "foods",
      icon: "🍽",
      salt: 3,
      sentence: (entry) => `او «${entry.valueOf("name")}» را دوست دارد - امروز همین را برایش درست کن یا سفارش بده.`,
    }),
    new SectionPickRule({
      section: "messages",
      icon: "💌",
      salt: 4,
      accept: (entry) => entry.valueOf("status") === "idea",
      sentence: (entry) => `این پیام را برایش بفرست: «${entry.valueOf("text")}»`,
    }),
    new SectionPickRule({
      section: "promises",
      icon: "🤝",
      salt: 5,
      accept: (entry) => entry.valueOf("status") === "open",
      sentence: (entry) => `قولی که داده‌ای هنوز باز است: «${entry.valueOf("promise")}».`,
    }),
    new SectionPickRule({
      section: "happiness",
      icon: "😊",
      salt: 6,
      sentence: (entry) => `یادت هست «${entry.valueOf("title")}» او را خوشحال کرد؟ امروز یک نمونه‌ی مشابه بساز.`,
    }),
    new SectionPickRule({
      section: "dislikes",
      icon: "🚫",
      salt: 7,
      sentence: (entry) => `امروز از این دوری کن: «${entry.valueOf("value")}».`,
    }),
    new SectionPickRule({
      section: "stress",
      icon: "⚡",
      salt: 8,
      sentence: (entry) => `از چیزی که استرسش می‌دهد مراقب باش: «${entry.valueOf("trigger")}».`,
    }),
    new SectionPickRule({
      section: "dreams",
      icon: "🌠",
      salt: 9,
      sentence: (entry) => `درباره‌ی رویا یا هدفش بپرس: «${entry.valueOf("title")}» - الان به کجا رسیده؟`,
    }),
    new SectionPickRule({
      section: "wishlist",
      icon: "🪄",
      salt: 10,
      sentence: (entry) => `از لیست آرزوهای مشترک: «${entry.valueOf("title")}» - امروز یک قدم کوچک برایش بردار.`,
    }),
    new SectionPickRule({
      section: "memories",
      icon: "📸",
      salt: 11,
      sentence: (entry) => `خاطره‌ی «${entry.valueOf("title")}» را امشب با هم مرور کنید.`,
    }),
  ];

  public static build(
    entries: readonly HamdelEntry[],
    today: DateOnly,
    calendar: YearlyCalendar,
    phase: CyclePhase | null = null,
    limit = DEFAULT_LIMIT,
  ): DailySuggestion[] {
    const rotation = DailyRotation.forDay(today, "partner");
    const context = new SuggestionContext(entries, today, calendar, rotation, phase);

    const ordered = [...PartnerDailySuggestionBuilder.PRIORITY_RULES, ...rotation.rotate(PartnerDailySuggestionBuilder.ROTATING_RULES)];
    const suggestions = ordered
      .map((rule) => rule.suggest(context))
      .filter((suggestion): suggestion is DailySuggestion => suggestion !== null)
      .slice(0, limit);

    return suggestions.length > 0 ? suggestions : [PartnerDailySuggestionBuilder.fallback()];
  }

  private static fallback(): DailySuggestion {
    return {
      id: "fallback",
      icon: "📝",
      text: "علایق، اشاره‌ها و تاریخ‌های مهم او را در «همدل» ثبت کن تا هر روز پیشنهاد شخصی بگیری.",
      to: { name: "hamdel" },
    };
  }
}
