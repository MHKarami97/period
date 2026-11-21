import { describe, expect, it } from "vitest";
import { HamyarProgressSummarizer, type GuideProgress } from "./HamyarProgressSummary";

function guide(id: string, completed: number, total: number): GuideProgress {
  return { id, title: id, icon: "📘", completed, total };
}

describe("HamyarProgressSummarizer", () => {
  it("recommends continuing the guide that is furthest along", () => {
    const summary = HamyarProgressSummarizer.summarize([guide("a", 1, 10), guide("b", 6, 10), guide("c", 0, 10)]);
    expect(summary.recommended?.id).toBe("b");
    expect(summary.recommendation).toBe("continue");
    expect(summary.percent).toBe(23);
  });

  it("recommends starting an untouched guide when nothing is in progress", () => {
    const summary = HamyarProgressSummarizer.summarize([guide("a", 10, 10), guide("b", 0, 8)]);
    expect(summary.finishedGuides).toBe(1);
    expect(summary.recommendation).toBe("start");
  });

  it("has no recommendation when every guide is finished", () => {
    expect(HamyarProgressSummarizer.summarize([guide("a", 3, 3)]).recommendation).toBeNull();
  });
});
