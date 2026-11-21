import { CyclePhase } from "../valueObjects/CyclePhase";
import { FlowLevel } from "../valueObjects/FlowLevel";
import { Mood } from "../valueObjects/Mood";
import type { DateOnly } from "../valueObjects/DateOnly";
import { DailyRotation } from "./DailyRotation";

export type CareAudience = "self" | "partner";
export type CareCategory = "relief" | "nutrition" | "movement" | "rest" | "mind" | "support" | "safety";

export interface CareItem {
  readonly id: string;
  readonly category: CareCategory;
  readonly categoryLabel: string;
  readonly icon: string;
  readonly text: string;
}

export interface CareContext {
  readonly phase: CyclePhase;
  readonly audience: CareAudience;
  readonly today: DateOnly;
  /** Negative when the period is late; null when unknown. */
  readonly daysUntilPeriod: number | null;
  readonly painLevel: number | null;
  readonly mood: Mood | null;
  readonly flow: FlowLevel | null;
}

const CATEGORY_META: Readonly<Record<CareCategory, { label: string; icon: string }>> = {
  relief: { label: "تسکین", icon: "🔥" },
  nutrition: { label: "تغذیه", icon: "🥗" },
  movement: { label: "حرکت", icon: "🚶" },
  rest: { label: "استراحت", icon: "😴" },
  mind: { label: "آرامش ذهن", icon: "🧘" },
  support: { label: "حمایت", icon: "🤝" },
  safety: { label: "مراقب باش", icon: "⚠️" },
};

type RawItem = readonly [CareCategory, string];

/**
 * General wellness wording based on public guidance (NHS "Period pain" and "PMS" pages, Mayo Clinic PMS page).
 * It is not medical advice; the UI always shows the disclaimer next to it.
 */
const CATALOG: Readonly<Record<CyclePhase, Readonly<Record<CareAudience, readonly RawItem[]>>>> = {
  [CyclePhase.Menstrual]: {
    self: [
      ["relief", "گرما روی شکم یا کمر (کیسه آب گرم یا پد گرمایی که لای حوله پیچیده شده) و دوش یا حمام گرم، از روش‌های پیشنهادی NHS برای درد پریود است."],
      ["relief", "ماساژ ملایم شکم و کمر می‌تواند کرامپ را کمی تسکین بدهد."],
      ["relief", "اگر مسکن مصرف می‌کنی، طبق برچسب یا توصیه‌ی پزشک و ترجیحاً با اولین علائم مصرف کن."],
      ["movement", "حرکت سبک مثل پیاده‌روی، یوگا یا شنا معمولاً بهتر از بی‌حرکتی کامل است."],
      ["nutrition", "مایعات گرم بنوش و وعده‌های سبک بخور؛ عدس، اسفناج و گوشت کم‌چرب آهن بدنت را تأمین می‌کنند."],
      ["rest", "امروز انتظارت از خودت را کمی پایین بیاور و امشب زودتر بخواب."],
      ["safety", "اگر درد مانع کارهای روزمره می‌شود، بدتر شده یا خونریزی خیلی زیاد است، با پزشک مشورت کن."],
    ],
    partner: [
      ["support", "کیسه آب گرم، آب و مسکنی که خودش استفاده می‌کند را در دسترس بگذار."],
      ["support", "کارهای سنگین خانه را بیشتر بر عهده بگیر و بدون قضاوت گوش بده."],
      ["nutrition", "غذای مورد علاقه‌اش را درست کن یا سفارش بده."],
      ["rest", "فضای آرام بساز: پتو، فیلم دلخواه او و فرصت استراحت."],
      ["mind", "به‌جای راه‌حل دادن بپرس: «امروز چه کمکی از دستم برمی‌آید؟»"],
      ["movement", "اگر حالش خوب بود، پیاده‌روی کوتاه یا یوگای ملایم را پیشنهاد بده؛ اصرار نکن."],
      ["safety", "اگر درد شدید است یا هر ماه بدتر می‌شود، آرام تشویقش کن به پزشک مراجعه کند."],
    ],
  },
  [CyclePhase.Follicular]: {
    self: [
      ["movement", "انرژی معمولاً رو به افزایش است؛ زمان خوبی برای ورزش سنگین‌تر یا شروع یک عادت جدید."],
      ["mind", "این دوره برای برنامه‌ریزی و تصمیم‌های مهم مناسب‌تر است."],
      ["nutrition", "تغذیه متعادل با پروتئین کافی از بازسازی بدن حمایت می‌کند."],
      ["rest", "ساعت خواب و بیداری‌ات را ثابت نگه دار تا برای فاز بعد آماده باشی."],
    ],
    partner: [
      ["support", "از انرژی و انگیزه‌ی او حمایت کن؛ یک فعالیت مشترک پیشنهاد بده."],
      ["mind", "زمان خوبی برای برنامه‌ریزی سفر یا برنامه‌های جدید با هم است."],
      ["support", "به هدف‌هایش علاقه نشان بده و تشویقش کن."],
      ["nutrition", "یک صبحانه یا پیک‌نیک بیرون از خانه ترتیب بده."],
    ],
  },
  [CyclePhase.Ovulation]: {
    self: [
      ["mind", "درد خفیف یک‌طرفه‌ی شکمی ممکن است رخ بدهد؛ اگر شدید بود به پزشک مراجعه کن."],
      ["rest", "هیدراته بمان و خواب کافی داشته باش."],
      ["movement", "معمولاً اوج انرژی همین دوره است؛ ورزش یا برنامه‌ی اجتماعی خوب جواب می‌دهد."],
      ["safety", "پیش‌بینی بازه باروری تخمینی است و روش پیشگیری یا بارداری قطعی نیست؛ برای تصمیم‌های مهم با پزشک مشورت کن."],
    ],
    partner: [
      ["support", "برنامه‌های اجتماعی یا فعالیت مشترک بیرون از خانه پیشنهاد خوبی است."],
      ["support", "اگر از درد شکمی شکایت کرد، جدی بگیر و کمک کن."],
      ["mind", "درباره‌ی برنامه‌تان برای بارداری یا پیشگیری، آرام و بدون فشار صحبت کنید."],
    ],
  },
  [CyclePhase.Luteal]: {
    self: [
      ["nutrition", "وعده‌های کوچک‌تر و پرتکرارتر بخور و نمک، کافئین و الکل را کم کن (توصیه‌ی NHS و Mayo برای PMS)."],
      ["movement", "حدود ۳۰ دقیقه فعالیت هوازی ملایم اغلب روزها، مثل پیاده‌روی یا یوگا، علائم PMS را کم می‌کند."],
      ["rest", "هدف‌گذاری ۷ تا ۹ ساعت خواب با ساعت ثابت، به تعادل خلق کمک می‌کند."],
      ["mind", "چند دقیقه تنفس عمیق یا شل‌سازی عضلانی؛ استرس را در این دوره جدی بگیر."],
      ["relief", "علائمت را دست‌کم دو چرخه ثبت کن تا اگر لازم شد به پزشک نشان بدهی."],
      ["safety", "اگر تغییرات خلقی زندگی‌ات را مختل می‌کند، با پزشک صحبت کن."],
    ],
    partner: [
      ["support", "نسبت به تغییرات خلقی احتمالی صبورتر باش و درباره‌اش کنایه یا شوخی نکن."],
      ["rest", "فضای آرام و کم‌استرس در خانه فراهم کن."],
      ["nutrition", "غذای سبک و کم‌نمک پیشنهاد بده یا آماده کن."],
      ["movement", "یک پیاده‌روی دونفره‌ی کوتاه می‌تواند حال هر دو را بهتر کند."],
      ["mind", "قدردانی کن و بپرس چه چیزی امروز بیشتر کمکش می‌کند."],
      ["support", "پریود نزدیک است؛ لوازم بهداشتی و کیسه آب گرم را در خانه آماده نگه دار."],
    ],
  },
};

const MAX_ITEMS = 5;
const NEGATIVE_MOODS: ReadonlySet<Mood> = new Set([Mood.Sad, Mood.Irritated, Mood.Anxious, Mood.Sensitive]);

function toItem(id: string, category: CareCategory, text: string): CareItem {
  const meta = CATEGORY_META[category];
  return { id, category, categoryLabel: meta.label, icon: meta.icon, text };
}

/** Domain Service producing the "what to do today" list from the phase and today's logged symptoms. */
export class PhaseCareAdvisor {
  public static advise(context: CareContext): CareItem[] {
    const contextual = PhaseCareAdvisor.contextual(context).slice(0, 2);
    const rotation = DailyRotation.forDay(context.today, `care-${context.audience}`);

    const catalog = CATALOG[context.phase][context.audience].map(([category, text], index) =>
      toItem(`${context.phase}-${context.audience}-${index}`, category, text),
    );
    const regular = rotation.rotate(catalog.filter((item) => item.category !== "safety"));
    const safety = catalog.find((item) => item.category === "safety");

    const seen = new Set<CareCategory>(contextual.map((item) => item.category));
    const diverse = regular.filter((item) => !seen.has(item.category) && (seen.add(item.category), true));
    const extra = regular.filter((item) => !diverse.includes(item));

    const room = MAX_ITEMS - contextual.length - (safety ? 1 : 0);
    const body = [...diverse, ...extra].slice(0, Math.max(room, 0));
    return [...contextual, ...body, ...(safety && !contextual.some((item) => item.category === "safety") ? [safety] : [])].slice(0, MAX_ITEMS);
  }

  private static contextual(context: CareContext): CareItem[] {
    const self = context.audience === "self";
    const items: CareItem[] = [];

    if (context.painLevel !== null && context.painLevel >= 3) {
      items.push(
        self
          ? toItem("ctx-pain", "relief", "امروز درد زیاد ثبت کرده‌ای: گرما، حمام گرم و حرکت خیلی سبک را امتحان کن؛ اگر درد از حد معمول بیشتر است یا مسکن اثر نمی‌کند، سریع‌تر به پزشک مراجعه کن.")
          : toItem("ctx-pain", "support", "درد امروز زیاد ثبت شده؛ کیسه آب گرم، آب و استراحت برایش فراهم کن و کارها را از دوشش بردار."),
      );
    }
    if (context.flow === FlowLevel.Heavy) {
      items.push(
        self
          ? toItem("ctx-flow", "safety", "خونریزی زیاد ثبت شده؛ اگر نوار یا تامپون را خیلی سریع خیس می‌کند یا ضعف داری، با پزشک تماس بگیر.")
          : toItem("ctx-flow", "safety", "خونریزی زیاد ثبت شده؛ حواست به حالش باشد و اگر ضعف یا سرگیجه داشت، به پزشک مراجعه کند."),
      );
    }
    if (context.mood !== null && NEGATIVE_MOODS.has(context.mood)) {
      items.push(
        self
          ? toItem("ctx-mood", "mind", "امروز حالت را حساس یا ناآرام ثبت کرده‌ای؛ پنج دقیقه تنفس آرام یا یک پیاده‌روی کوتاه را امتحان کن.")
          : toItem("ctx-mood", "support", "حال امروزش حساس ثبت شده؛ بیشتر گوش بده، کمتر نصیحت کن و فضای آرام بساز."),
      );
    }
    if (context.daysUntilPeriod !== null && context.daysUntilPeriod < 0 && context.phase !== CyclePhase.Menstrual) {
      items.push(
        self
          ? toItem("ctx-late", "mind", "پریودت از زمان پیش‌بینی‌شده دیرتر شده؛ اگر شروع شده ثبتش کن و اگر تأخیرها تکرار می‌شود یا نگرانی داری، با پزشک مشورت کن.")
          : toItem("ctx-late", "mind", "پریود کمی دیرتر از پیش‌بینی است؛ با آرامش و بدون فشار بپرس حالش چطور است."),
      );
    } else if (context.daysUntilPeriod !== null && context.daysUntilPeriod >= 1 && context.daysUntilPeriod <= 3) {
      items.push(
        self
          ? toItem("ctx-soon", "relief", "پریود تا چند روز دیگر شروع می‌شود؛ لوازم بهداشتی و کیسه آب گرم را آماده کن.")
          : toItem("ctx-soon", "support", "پریود تا چند روز دیگر شروع می‌شود؛ لوازم بهداشتی، مسکن مورد تأیید خودش و کیسه آب گرم را در خانه آماده کن."),
      );
    }
    return items;
  }
}
