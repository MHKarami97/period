import { computed } from "vue";
import { CyclePhase } from "@domain/valueObjects/CyclePhase";
import { useCycleStore } from "@application/stores/cycleStore";

export interface PhaseGuidance {
  selfTips: string[];
  partnerTips: string[];
}

/**
 * usePhaseGuidance - presentation-layer content map from CyclePhase to
 * general wellness/self-care suggestions (for the person tracking) and
 * support suggestions (for a partner in read-only mode). This is
 * localized copy, not a business rule, so it intentionally lives in
 * presentation/ rather than domain/ — the domain only ever produces the
 * `CyclePhase` value, never opinions about what to do with it.
 *
 * These are general wellness tips, not medical advice; the UI always
 * pairs them with that disclaimer (see PhaseGuidanceCard.vue).
 */
const GUIDANCE_BY_PHASE: Record<CyclePhase, PhaseGuidance> = {
  [CyclePhase.Menstrual]: {
    selfTips: [
      "نوشیدن مایعات گرم و استراحت کافی می‌تواند کرامپ‌ها را کاهش دهد.",
      "استفاده از کیسه آب گرم روی شکم برای تسکین درد مفید است.",
      "غذاهای سرشار از آهن (عدس، اسفناج، گوشت قرمز کم‌چرب) جبران خون از‌دست‌رفته را کمک می‌کند.",
      "پیاده‌روی سبک یا حرکات کششی معمولاً بهتر از استراحت مطلق است.",
    ],
    partnerTips: [
      "صبورتر باشید و کارهای سنگین خانه را بیشتر بر عهده بگیرید.",
      "کیسه آب گرم یا مسکن معمول او را از قبل آماده نگه دارید.",
      "بدون قضاوت گوش کنید؛ گاهی فقط همراهی کافی است، نه راه‌حل.",
      "پرسیدن ساده «امروز چه کمکی از دستم برمی‌آید؟» خیلی موثر است.",
    ],
  },
  [CyclePhase.Follicular]: {
    selfTips: [
      "سطح انرژی معمولاً رو به افزایش است؛ زمان خوبی برای شروع پروژه‌های جدید یا ورزش سنگین‌تر.",
      "تغذیه متعادل با پروتئین کافی از بازسازی بدن حمایت می‌کند.",
      "این دوره برای برنامه‌ریزی و تصمیم‌گیری‌های مهم مناسب‌تر است.",
    ],
    partnerTips: [
      "از انرژی و انگیزه بالای این دوره حمایت کنید، مثلاً با پیشنهاد فعالیت مشترک.",
      "زمان خوبی برای برنامه‌ریزی سفر یا برنامه‌های جدید با هم است.",
    ],
  },
  [CyclePhase.Ovulation]: {
    selfTips: [
      "ممکن است درد خفیف یک‌طرفه شکمی (درد تخمک‌گذاری) تجربه شود؛ نگران‌کننده نیست ولی در صورت شدت زیاد به پزشک مراجعه کنید.",
      "هیدراته ماندن و خواب کافی در این دوره اهمیت دارد.",
      "معمولاً اوج انرژی اجتماعی و فیزیکی همین دوره است.",
    ],
    partnerTips: [
      "زمان مناسبی برای برنامه‌های اجتماعی یا فعالیت‌های مشترک بیرون از خانه است.",
      "اگر از درد خفیف شکمی شکایت کرد، جدی بگیرید و در صورت نیاز کمک کنید.",
    ],
  },
  [CyclePhase.Luteal]: {
    selfTips: [
      "تغییرات خلقی (PMS) در این دوره شایع است؛ مدیریت استرس و خواب کافی کمک‌کننده است.",
      "کاهش کافئین، نمک و شکر می‌تواند نفخ و تحریک‌پذیری را کم کند.",
      "ورزش سبک مانند یوگا به تعادل خلقی کمک می‌کند.",
    ],
    partnerTips: [
      "نسبت به تغییرات خلقی احتمالی صبورتر باشید و از کنایه یا شوخی درباره آن خودداری کنید.",
      "فضای آرام و کم‌استرس در خانه فراهم کنید.",
      "اگر غذای کم‌نمک/کم‌شکر آماده کنید یا پیشنهاد بدهید، معمولاً قدردانی می‌شود.",
    ],
  },
};

export function usePhaseGuidance() {
  const cycleStore = useCycleStore();

  const guidance = computed<PhaseGuidance>(() => GUIDANCE_BY_PHASE[cycleStore.currentPhase]);

  return { guidance };
}
