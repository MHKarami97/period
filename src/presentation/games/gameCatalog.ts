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
];
