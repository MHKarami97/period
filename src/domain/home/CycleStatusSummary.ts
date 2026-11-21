import type { Cycle } from "../entities/Cycle";
import { CyclePredictionService } from "../services/CyclePredictionService";
import { CYCLE_PHASE_LABELS_FA, CyclePhase } from "../valueObjects/CyclePhase";
import { DateOnly } from "../valueObjects/DateOnly";

export type CycleStatusKind = "no-data" | "bleeding" | "fertile" | "period-due" | "period-late" | "waiting";
export type CycleStatusTone = "neutral" | "rose" | "violet" | "teal" | "amber";

export interface CycleStatusSummary {
  readonly kind: CycleStatusKind;
  readonly tone: CycleStatusTone;
  readonly headline: string;
  readonly detail: string;
  readonly phaseLabel: string | null;
}

function toFa(value: number): string {
  return value.toLocaleString("fa-IR");
}

/** Domain Service: turns prediction numbers into the one-sentence status of the home page. */
export class CycleStatusSummarizer {
  public static summarize(cycles: readonly Cycle[], today: DateOnly = DateOnly.today()): CycleStatusSummary {
    if (cycles.length === 0) {
      return {
        kind: "no-data",
        tone: "neutral",
        headline: "هنوز پریودی ثبت نشده",
        detail: "با ثبت اولین پریود، وضعیت و پیش‌بینی‌ها اینجا نمایش داده می‌شود.",
        phaseLabel: null,
      };
    }

    const sorted = [...cycles].sort((left, right) => left.startDate.diffInDays(right.startDate));
    const phase = CyclePredictionService.resolveCurrentPhase(sorted, today);
    const prediction = CyclePredictionService.predictNextCycle(sorted);
    const phaseLabel = CYCLE_PHASE_LABELS_FA[phase];

    if (phase === CyclePhase.Menstrual) {
      const periodDay = CyclePredictionService.currentCycleDayNumber(sorted, today);
      const remaining = prediction.predictedPeriodLengthInDays - periodDay;
      let detail = "طبق میانگین، امروز آخرین روز پریود است.";
      if (remaining > 0) {
        detail = `طبق میانگین، حدود ${toFa(remaining)} روز دیگر ادامه دارد.`;
      } else if (remaining < 0) {
        detail = "از میانگین معمول طولانی‌تر شده؛ اگر تمام شده، پایان پریود را ثبت کنید.";
      }
      return { kind: "bleeding", tone: "rose", headline: `امروز روز ${toFa(periodDay)} پریود است`, detail, phaseLabel };
    }

    if (phase === CyclePhase.Ovulation) {
      const toOvulation = prediction.ovulationDate.diffInDays(today);
      let detail = `بازه باروری تا ${toFa(prediction.fertileWindowEnd.diffInDays(today))} روز دیگر ادامه دارد.`;
      if (toOvulation === 0) {
        detail = "امروز روز تخمک‌گذاری برآوردی است.";
      } else if (toOvulation > 0) {
        detail = `${toFa(toOvulation)} روز تا تخمک‌گذاری برآوردی مانده است.`;
      }
      return { kind: "fertile", tone: "violet", headline: "در بازه باروری است", detail, phaseLabel };
    }

    const daysUntilPeriod = prediction.nextPeriodStartDate.diffInDays(today);
    if (daysUntilPeriod === 0) {
      return {
        kind: "period-due",
        tone: "rose",
        headline: "پریود بعدی طبق پیش‌بینی امروز است",
        detail: "اگر شروع شده، با یک لمس در «همراه» ثبتش کنید.",
        phaseLabel,
      };
    }
    if (daysUntilPeriod < 0) {
      return {
        kind: "period-late",
        tone: "amber",
        headline: `${toFa(Math.abs(daysUntilPeriod))} روز از زمان پیش‌بینی‌شده گذشته`,
        detail: "اگر پریود شروع شده آن را ثبت کنید تا پیش‌بینی‌ها دقیق‌تر شود.",
        phaseLabel,
      };
    }

    const toFertileWindow = prediction.fertileWindowStart.diffInDays(today);
    return {
      kind: "waiting",
      tone: phase === CyclePhase.Follicular ? "teal" : "amber",
      headline: `${toFa(daysUntilPeriod)} روز تا پریود بعدی`,
      detail: toFertileWindow > 0 ? `بازه باروری ${toFa(toFertileWindow)} روز دیگر شروع می‌شود.` : `فاز فعلی: ${phaseLabel}`,
      phaseLabel,
    };
  }
}
