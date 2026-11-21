export interface GuideProgress {
  readonly id: string;
  readonly title: string;
  readonly icon: string;
  readonly completed: number;
  readonly total: number;
}

export type RecommendationKind = "continue" | "start";

export interface HamyarProgressSummary {
  readonly guideCount: number;
  readonly finishedGuides: number;
  readonly startedGuides: number;
  readonly completedItems: number;
  readonly totalItems: number;
  readonly remainingItems: number;
  readonly percent: number;
  readonly recommended: GuideProgress | null;
  readonly recommendation: RecommendationKind | null;
}

function isFinished(guide: GuideProgress): boolean {
  return guide.total > 0 && guide.completed >= guide.total;
}

function isStarted(guide: GuideProgress): boolean {
  return guide.completed > 0 && !isFinished(guide);
}

/** Aggregates checklist progress of Hamyar guides and recommends what to read next. */
export class HamyarProgressSummarizer {
  public static summarize(guides: readonly GuideProgress[]): HamyarProgressSummary {
    const completedItems = guides.reduce((sum, guide) => sum + guide.completed, 0);
    const totalItems = guides.reduce((sum, guide) => sum + guide.total, 0);
    const inProgress = guides.filter(isStarted).sort((left, right) => right.completed / right.total - left.completed / left.total)[0];
    const untouched = guides.find((guide) => guide.completed === 0);

    return {
      guideCount: guides.length,
      finishedGuides: guides.filter(isFinished).length,
      startedGuides: guides.filter(isStarted).length,
      completedItems,
      totalItems,
      remainingItems: totalItems - completedItems,
      percent: totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100),
      recommended: inProgress ?? untouched ?? null,
      recommendation: inProgress ? "continue" : untouched ? "start" : null,
    };
  }
}
