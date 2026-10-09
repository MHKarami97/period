import type { Component } from "vue";

export interface GameDefinition {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly routeName: string;
  readonly loadView: () => Promise<{ default: Component }>;
}

/**
 * GAME_CATALOG - single registration point for every game (Open/Closed).
 * The router builds its routes and GamesView builds its cards from this list,
 * so adding a new game means: create its view + append ONE entry here.
 */
export const GAME_CATALOG: readonly GameDefinition[] = [
  {
    id: "snake-ladder",
    title: "مار و پله زناشویی",
    description: "تخته‌ی مار و پله با چالش‌های عاشقانه؛ نام‌ها و محتوای خانه‌ها را خودتان تنظیم می‌کنید.",
    icon: "🐍",
    routeName: "game-snake-ladder",
    loadView: () => import("@presentation/views/games/SnakeLadderView.vue"),
  },
  {
    id: "dual-dice",
    title: "تاس دوتایی",
    description: "یک تاس عمل و یک تاس محل؛ بنداز و ترکیبی را که آمد انجام بده. وجه‌ها قابل ویرایش‌اند.",
    icon: "🎲",
    routeName: "game-dual-dice",
    loadView: () => import("@presentation/views/games/DualDiceView.vue"),
  },
  {
    id: "truth-or-dare",
    title: "جرئت یا حقیقت",
    description: "نوبتی حقیقت یا جرئت انتخاب کنید؛ سه سطح شدت و امکان افزودن کارت‌های خودتان.",
    icon: "🔥",
    routeName: "game-truth-or-dare",
    loadView: () => import("@presentation/views/games/TruthOrDareView.vue"),
  },
  {
    id: "two-questions",
    title: "بازی دو سؤالی",
    description: "بپرس چطور و چند دقیقه دوست دارد لمسش کنی، بعد تایمر و عوض کردن نقش‌ها.",
    icon: "💬",
    routeName: "game-two-questions",
    loadView: () => import("@presentation/views/games/TwoQuestionView.vue"),
  },
  {
    id: "conversation-cards",
    title: "کارت‌های گفت‌وگوی عمیق",
    description: "سؤال‌هایی در پنج دسته (فردی، زوج، خانواده، صمیمیت، گذشته و آینده) برای گفت‌وگوی بهتر.",
    icon: "🗨",
    routeName: "game-conversation-cards",
    loadView: () => import("@presentation/views/games/ConversationView.vue"),
  },
  {
    id: "scratch-cards",
    title: "کارت‌های خراشیدنی",
    description: "ورقی از ایده‌های قرار و ماجراجویی؛ با انگشت بخراش، انجام بده و علامت بزن.",
    icon: "🪙",
    routeName: "game-scratch-cards",
    loadView: () => import("@presentation/views/games/ScratchCardsView.vue"),
  },
];
