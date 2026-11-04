import { describe, it, expect } from "vitest";
import { normalizePersianText, HamyarSearchEngine } from "./HamyarSearchEngine";
import type { HamyarGuideData } from "./HamyarGuide";

describe("normalizePersianText", () => {
  it("normalizes arabic yeh to persian yeh", () => {
    expect(normalizePersianText("كتاب علي")).toBe("کتاب علی");
  });

  it("normalizes half-space (ZWNJ) and extra spaces", () => {
    expect(normalizePersianText("گفت\u200cوگو")).toBe("گفت وگو");
  });

  it("removes arabic diacritics", () => {
    expect(normalizePersianText("مَرْحَلَة")).toBe("مرحله");
  });
});

describe("HamyarSearchEngine", () => {
  const dummyGuide: HamyarGuideData = {
    schema_version: "1.0",
    app: "ماهک",
    title: "راهنمای آشنایی",
    language: "fa",
    generated_on: "2026-11-04",
    disclaimer: "سلب مسئولیت",
    editorial_policy: [],
    evidence_levels: [],
    stages: [
      {
        id: 1,
        title: "شناخت خود و آمادگی فردی",
        timeframe: "پیش از شروع ارتباط",
        goal: "بررسی بلوغ عاطفی و ارزش‌های فردی",
        knowledge: [
          {
            topic: "خودشناسی در ازدواج",
            claims: [
              {
                text: "شناخت سبک دلبستگی ایمن در انتخاب همسر مؤثر است.",
                evidence_level: "مطالعه تکی",
              },
            ],
          },
        ],
        practical_checklist: ["فهرست ارزش‌های غیرقابل‌مذاکره خود را بنویسید."],
        common_mistakes_and_myths: [
          {
            myth: "عشق آتشین اولیه برای موفقیت ازدواج کافی است.",
            fact: "سازگاری در ارزش‌ها و توانایی حل تعارض تعیین‌کننده دوام رابطه است.",
          },
        ],
        red_flags: ["هرگونه رفتار کنترل‌گر یا پنهان‌کاری مداوم."],
        questions_for_professional: ["آیا الگوهای ارتباطی ما سالم است؟"],
        quiz: {
          questions: [{ n: 1, q: "کدام عامل در دوام رابطه مهم‌تر است؟" }],
          answers: [{ n: 1, a: "سازگاری در ارزش‌ها و حل تعارض." }],
        },
      },
    ],
  };

  it("finds matches in checklist", () => {
    const results = HamyarSearchEngine.searchAll(
      [{ metaId: "guide1", metaTitle: "راهنمای تست", data: dummyGuide }],
      "ارزش های",
    );
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.contentType === "checklist")).toBe(true);
  });

  it("finds matches in myths and facts", () => {
    const results = HamyarSearchEngine.searchAll(
      [{ metaId: "guide1", metaTitle: "راهنمای تست", data: dummyGuide }],
      "عشق آتشین",
    );
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].contentType).toBe("myth");
  });

  it("finds matches in red flags", () => {
    const results = HamyarSearchEngine.searchAll(
      [{ metaId: "guide1", metaTitle: "راهنمای تست", data: dummyGuide }],
      "کنترل گر",
    );
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].contentType).toBe("red_flag");
  });

  it("filters stage by content type and query correctly", () => {
    const stage = dummyGuide.stages[0];
    expect(HamyarSearchEngine.filterStage(stage, "دلبستگی", "all")).toBe(true);
    expect(HamyarSearchEngine.filterStage(stage, "کلمه‌ای_که_نیست", "all")).toBe(false);
    expect(HamyarSearchEngine.filterStage(stage, "", "checklist")).toBe(true);
  });
});
