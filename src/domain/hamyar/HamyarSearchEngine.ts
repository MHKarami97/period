import type {
  HamyarGuideData,
  HamyarSearchResult,
  HamyarStage,
} from "./HamyarGuide";

/**
 * Normalizes Persian and Arabic text for robust search matching:
 * - Unifies arabic/persian yeh and kaf
 * - Replaces half-space (ZWNJ) with space or standardizes it
 * - Removes diacritics (harakat)
 * - Converts to lowercase and trims
 */
export function normalizePersianText(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, "") // Diacritics
    .replace(/[يى]/g, "ی")
    .replace(/[ك]/g, "ک")
    .replace(/[ة]/g, "ه")
    .replace(/[\u200C\u200B]/g, " ") // ZWNJ to space
    .replace(/\s+/g, " ")
    .trim();
}

/** Extracts a readable snippet around the search query match */
function extractSnippet(fullText: string, query: string, maxLen = 140): string {
  const normFull = normalizePersianText(fullText);
  const normQuery = normalizePersianText(query);
  const idx = normFull.indexOf(normQuery);
  if (idx === -1) {
    return fullText.length > maxLen ? `${fullText.slice(0, maxLen)}…` : fullText;
  }
  const start = Math.max(0, idx - 40);
  const end = Math.min(fullText.length, idx + query.length + 80);
  const prefix = start > 0 ? "… " : "";
  const suffix = end < fullText.length ? " …" : "";
  return `${prefix}${fullText.slice(start, end)}${suffix}`;
}

export class HamyarSearchEngine {
  /**
   * Search across all provided guides and return prioritized results.
   */
  public static searchAll(
    guides: ReadonlyArray<{ readonly metaId: string; readonly metaTitle: string; readonly data: HamyarGuideData }>,
    rawQuery: string,
    limit = 60,
  ): readonly HamyarSearchResult[] {
    const query = normalizePersianText(rawQuery);
    if (!query || query.length < 2) return [];

    const results: HamyarSearchResult[] = [];

    for (const { metaId, metaTitle, data } of guides) {
      this.searchSingleGuide(metaId, metaTitle, data, query, results, limit);
      if (results.length >= limit) break;
    }

    return results;
  }

  /**
   * Search within a single guide's data.
   */
  public static searchGuide(
    guideId: string,
    guideTitle: string,
    data: HamyarGuideData,
    rawQuery: string,
  ): readonly HamyarSearchResult[] {
    const query = normalizePersianText(rawQuery);
    if (!query || query.length < 2) return [];

    const results: HamyarSearchResult[] = [];
    this.searchSingleGuide(guideId, guideTitle, data, query, results, 100);
    return results;
  }

  private static searchSingleGuide(
    guideId: string,
    guideTitle: string,
    data: HamyarGuideData,
    query: string,
    accumulator: HamyarSearchResult[],
    limit: number,
  ): void {
    // 1. Search in stages
    for (const stage of data.stages || []) {
      if (accumulator.length >= limit) return;

      const normStageTitle = normalizePersianText(stage.title);
      const normGoal = normalizePersianText(stage.goal);

      if (normStageTitle.includes(query) || normGoal.includes(query)) {
        accumulator.push({
          guideId,
          guideTitle,
          stageId: stage.id,
          stageTitle: stage.title,
          contentType: "stage",
          contentTypeLabel: "مرحله راهنما",
          title: stage.title,
          snippet: extractSnippet(stage.goal || stage.title, query),
          matchField: normStageTitle.includes(query) ? "عنوان مرحله" : "هدف مرحله",
        });
      }

      // 2. Checklist
      for (const checkItem of stage.practical_checklist || []) {
        if (accumulator.length >= limit) return;
        if (normalizePersianText(checkItem).includes(query)) {
          accumulator.push({
            guideId,
            guideTitle,
            stageId: stage.id,
            stageTitle: stage.title,
            contentType: "checklist",
            contentTypeLabel: "چک‌لیست عملی",
            title: `مرحله ${stage.id}: ${stage.title}`,
            snippet: extractSnippet(checkItem, query),
            matchField: "چک‌لیست",
          });
        }
      }

      // 3. Knowledge / Claims
      for (const topic of stage.knowledge || []) {
        if (accumulator.length >= limit) return;
        const normTopic = normalizePersianText(topic.topic);
        if (normTopic.includes(query)) {
          accumulator.push({
            guideId,
            guideTitle,
            stageId: stage.id,
            stageTitle: stage.title,
            contentType: "knowledge",
            contentTypeLabel: "دانستنی‌های علمی",
            title: topic.topic,
            snippet: topic.claims?.[0]?.text ? extractSnippet(topic.claims[0].text, query) : topic.topic,
            matchField: "مبحث علمی",
          });
        }

        for (const claim of topic.claims || []) {
          if (accumulator.length >= limit) return;
          if (normalizePersianText(claim.text).includes(query)) {
            accumulator.push({
              guideId,
              guideTitle,
              stageId: stage.id,
              stageTitle: stage.title,
              contentType: "knowledge",
              contentTypeLabel: "شواهد علمی",
              title: `${topic.topic} (${claim.evidence_level})`,
              snippet: extractSnippet(claim.text, query),
              matchField: "متن شواهد",
            });
          }
        }
      }

      // 4. Common Myths & Facts
      for (const mythFact of stage.common_mistakes_and_myths || []) {
        if (accumulator.length >= limit) return;
        const normMyth = normalizePersianText(mythFact.myth);
        const normFact = normalizePersianText(mythFact.fact);
        if (normMyth.includes(query) || normFact.includes(query)) {
          accumulator.push({
            guideId,
            guideTitle,
            stageId: stage.id,
            stageTitle: stage.title,
            contentType: "myth",
            contentTypeLabel: "باور غلط و واقعیت",
            title: mythFact.myth,
            snippet: extractSnippet(mythFact.fact, query),
            matchField: normMyth.includes(query) ? "باور نادرست" : "واقعیت علمی",
          });
        }
      }

      // 5. Red flags
      for (const flag of stage.red_flags || []) {
        if (accumulator.length >= limit) return;
        if (normalizePersianText(flag).includes(query)) {
          accumulator.push({
            guideId,
            guideTitle,
            stageId: stage.id,
            stageTitle: stage.title,
            contentType: "red_flag",
            contentTypeLabel: "علامت هشدار",
            title: `هشدار در ${stage.title}`,
            snippet: extractSnippet(flag, query),
            matchField: "پرچم قرمز",
          });
        }
      }

      // 6. Professional / Doctor Questions
      const questions = [...(stage.questions_for_professional || []), ...(stage.questions_for_doctor || [])];
      for (const q of questions) {
        if (accumulator.length >= limit) return;
        if (normalizePersianText(q).includes(query)) {
          accumulator.push({
            guideId,
            guideTitle,
            stageId: stage.id,
            stageTitle: stage.title,
            contentType: "question",
            contentTypeLabel: "پرسش از متخصص",
            title: `پرسش پیشنهادی (${stage.title})`,
            snippet: extractSnippet(q, query),
            matchField: "پرسش",
          });
        }
      }

      // 7. Quiz questions & answers
      if (stage.quiz) {
        for (const item of stage.quiz.questions || []) {
          if (accumulator.length >= limit) return;
          if (normalizePersianText(item.q).includes(query)) {
            accumulator.push({
              guideId,
              guideTitle,
              stageId: stage.id,
              stageTitle: stage.title,
              contentType: "quiz",
              contentTypeLabel: "خودآزمایی و کوییز",
              title: `سؤال کوییز: ${stage.title}`,
              snippet: extractSnippet(item.q, query),
              matchField: "کوییز",
            });
          }
        }
      }
    }
  }

  /**
   * Filter stages in a single guide by content type or search text.
   */
  public static filterStage(
    stage: HamyarStage,
    query: string,
    contentType: string,
  ): boolean {
    const normQ = normalizePersianText(query);
    const hasQuery = Boolean(normQ && normQ.length >= 2);

    // If a content type filter is active, check if this stage has that content
    if (contentType === "knowledge" && (!stage.knowledge || stage.knowledge.length === 0)) return false;
    if (contentType === "checklist" && (!stage.practical_checklist || stage.practical_checklist.length === 0)) return false;
    if (contentType === "myths" && (!stage.common_mistakes_and_myths || stage.common_mistakes_and_myths.length === 0)) return false;
    if (contentType === "red_flags" && (!stage.red_flags || stage.red_flags.length === 0)) return false;
    if (
      contentType === "questions" &&
      (!stage.questions_for_doctor || stage.questions_for_doctor.length === 0) &&
      (!stage.questions_for_professional || stage.questions_for_professional.length === 0)
    )
      return false;
    if (contentType === "quiz" && (!stage.quiz || stage.quiz.questions.length === 0)) return false;

    // If no text query, stage matches
    if (!hasQuery) return true;

    // Check if query matches anywhere in stage
    if (normalizePersianText(stage.title).includes(normQ)) return true;
    if (normalizePersianText(stage.goal).includes(normQ)) return true;
    if (stage.timeframe && normalizePersianText(stage.timeframe).includes(normQ)) return true;
    if (stage.age_range && normalizePersianText(stage.age_range).includes(normQ)) return true;

    if (stage.practical_checklist?.some((c) => normalizePersianText(c).includes(normQ))) return true;
    if (stage.red_flags?.some((r) => normalizePersianText(r).includes(normQ))) return true;
    if (
      stage.common_mistakes_and_myths?.some(
        (m) => normalizePersianText(m.myth).includes(normQ) || normalizePersianText(m.fact).includes(normQ),
      )
    )
      return true;
    if (
      stage.knowledge?.some(
        (k) =>
          normalizePersianText(k.topic).includes(normQ) ||
          k.claims.some((c) => normalizePersianText(c.text).includes(normQ)),
      )
    )
      return true;
    if (stage.questions_for_doctor?.some((q) => normalizePersianText(q).includes(normQ))) return true;
    if (stage.questions_for_professional?.some((q) => normalizePersianText(q).includes(normQ))) return true;
    if (
      stage.quiz?.questions.some((q) => normalizePersianText(q.q).includes(normQ)) ||
      stage.quiz?.answers.some((a) => normalizePersianText(a.a).includes(normQ))
    )
      return true;

    return false;
  }
}
