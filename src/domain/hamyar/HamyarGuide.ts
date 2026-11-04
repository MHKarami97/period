export interface HamyarClaim {
  readonly text: string;
  readonly evidence_level: string;
  readonly sources?: readonly string[];
  readonly caveat?: string;
}

export interface HamyarKnowledgeTopic {
  readonly topic: string;
  readonly claims: readonly HamyarClaim[];
}

export interface HamyarMythFact {
  readonly myth: string;
  readonly fact: string;
  readonly sources?: readonly string[];
}

export interface HamyarQuizQuestion {
  readonly n: number;
  readonly q: string;
}

export interface HamyarQuizAnswer {
  readonly n: number;
  readonly a: string;
}

export interface HamyarQuiz {
  readonly questions: readonly HamyarQuizQuestion[];
  readonly answers: readonly HamyarQuizAnswer[];
}

export interface HamyarStage {
  readonly id: number;
  readonly title: string;
  readonly timeframe?: string;
  readonly age_range?: string;
  readonly goal: string;
  readonly knowledge: readonly HamyarKnowledgeTopic[];
  readonly practical_checklist: readonly string[];
  readonly common_mistakes_and_myths: readonly HamyarMythFact[];
  readonly red_flags: readonly string[];
  readonly questions_for_professional?: readonly string[];
  readonly questions_for_doctor?: readonly string[];
  readonly quiz?: HamyarQuiz;
  readonly evidence_not_found?: readonly string[];
  readonly limitations?: readonly string[];
  readonly iran_specific?: readonly string[];
}

export interface HamyarCrossCuttingTopic {
  readonly summary: string;
  readonly evidence_level?: string;
  readonly sources?: readonly string[];
}

export interface HamyarSource {
  readonly title?: string;
  readonly authors?: string | readonly string[];
  readonly year?: number | string;
  readonly journal?: string;
  readonly url?: string;
  readonly tier?: string;
  readonly note?: string;
  [key: string]: unknown;
}

export interface HamyarGuideData {
  readonly schema_version: string;
  readonly app: string;
  readonly guide_id?: string;
  readonly title: string;
  readonly language: string;
  readonly generated_on: string;
  readonly disclaimer: string;
  readonly editorial_policy: readonly string[];
  readonly evidence_levels: readonly string[];
  readonly stages: readonly HamyarStage[];
  readonly cross_cutting_topics?: Record<string, HamyarCrossCuttingTopic>;
  readonly sources?: Record<string, HamyarSource>;
}

export type HamyarCategory = "marriage" | "pregnancy" | "parenting" | "emptynest";

export interface HamyarGuideMeta {
  readonly id: string;
  readonly title: string;
  readonly shortTitle: string;
  readonly tag: string;
  readonly category: HamyarCategory;
  readonly categoryLabel: string;
  readonly icon: string;
  readonly jsonFile: string;
  readonly summary: string;
  readonly colorClass: {
    bg: string;
    text: string;
    border: string;
    badge: string;
    glow: string;
  };
}

export type HamyarContentType =
  | "all"
  | "knowledge"
  | "checklist"
  | "myths"
  | "red_flags"
  | "questions"
  | "quiz"
  | "cross_cutting";

export interface HamyarSearchResult {
  readonly guideId: string;
  readonly guideTitle: string;
  readonly stageId?: number;
  readonly stageTitle?: string;
  readonly contentType: "title" | "stage" | "knowledge" | "checklist" | "myth" | "red_flag" | "question" | "quiz";
  readonly contentTypeLabel: string;
  readonly title: string;
  readonly snippet: string;
  readonly matchField: string;
}
