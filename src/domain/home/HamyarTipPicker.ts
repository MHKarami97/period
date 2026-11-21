import type { HamyarGuideData, HamyarStage } from "../hamyar/HamyarGuide";
import type { DateOnly } from "../valueObjects/DateOnly";
import { DailyRotation } from "./DailyRotation";

export type HamyarTipKind = "checklist" | "myth" | "question" | "knowledge";

export interface HamyarTip {
  readonly kind: HamyarTipKind;
  readonly label: string;
  readonly icon: string;
  readonly text: string;
  readonly guideId: string;
  readonly guideTitle: string;
  readonly stageId: number;
  readonly stageTitle: string;
}

export interface TipSource {
  readonly id: string;
  readonly title: string;
  readonly data: HamyarGuideData;
}

const KIND_META: Readonly<Record<HamyarTipKind, { label: string; icon: string }>> = {
  checklist: { label: "یک کار کوچک برای امروز", icon: "✅" },
  myth: { label: "باور غلط و واقعیت", icon: "💡" },
  question: { label: "یک سؤال برای گفت‌وگو", icon: "💬" },
  knowledge: { label: "بدانید", icon: "📖" },
};

const MAX_TEXT_LENGTH = 240;

function clamp(text: string): string {
  const clean = text.trim();
  return clean.length > MAX_TEXT_LENGTH ? `${clean.slice(0, MAX_TEXT_LENGTH - 1).trimEnd()}…` : clean;
}

/** Same key format the Hamyar store uses for checklist progress. */
export function checklistKey(guideId: string, stageId: number, index: number): string {
  return `${guideId}:${stageId}:${index}`;
}

/** Picks one daily-rotating item (checklist, myth, question or fact) from loaded Hamyar guides. */
export class HamyarTipPicker {
  public static pick(sources: readonly TipSource[], today: DateOnly, isChecked: (key: string) => boolean): HamyarTip | null {
    const rotation = DailyRotation.forDay(today, "hamyar-tip");
    const source = rotation.pick(sources.filter((item) => (item.data.stages ?? []).length > 0));
    if (!source) {
      return null;
    }

    const byKind = new Map<HamyarTipKind, HamyarTip[]>();
    const add = (kind: HamyarTipKind, stage: HamyarStage, text: string): void => {
      const list = byKind.get(kind) ?? [];
      list.push({ kind, ...KIND_META[kind], text: clamp(text), guideId: source.id, guideTitle: source.title, stageId: stage.id, stageTitle: stage.title });
      byKind.set(kind, list);
    };

    for (const stage of source.data.stages) {
      (stage.practical_checklist ?? []).forEach((item, index) => {
        if (!isChecked(checklistKey(source.id, stage.id, index))) add("checklist", stage, item);
      });
      (stage.common_mistakes_and_myths ?? []).forEach((item) => add("myth", stage, `باور: ${item.myth}\nواقعیت: ${item.fact}`));
      [...(stage.questions_for_professional ?? []), ...(stage.questions_for_doctor ?? [])].forEach((item) => add("question", stage, item));
      (stage.knowledge ?? []).forEach((topic) => topic.claims.forEach((claim) => add("knowledge", stage, `${topic.topic}: ${claim.text}`)));
    }

    const kinds = rotation.rotate([...byKind.keys()], 1);
    const kind = kinds[0];
    return kind ? rotation.pick(byKind.get(kind) ?? [], 7) : null;
  }
}
