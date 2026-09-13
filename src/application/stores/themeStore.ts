import { defineStore } from "pinia";

export type ThemeMode = "light" | "dark";

const STORAGE_KEY = "period-tracker:theme";
const DEFAULT_THEME: ThemeMode = "light";

/**
 * themeStore - Application Service holding the light/dark theme
 * preference. Like appModeStore, it persists to localStorage directly
 * (a pragmatic, already-established pattern in this codebase for simple
 * UI preferences that are not part of the Cycle/Symptom domain). Applying
 * the theme to the DOM (toggling the `dark` class on <html>) is
 * deliberately NOT done here — that is a presentation-layer side effect,
 * handled by the `useThemeSync` composable, keeping this store a pure
 * state container.
 */
export const useThemeStore = defineStore("theme", {
  state: () => ({
    theme: ((localStorage.getItem(STORAGE_KEY) as ThemeMode | null) ?? DEFAULT_THEME) as ThemeMode,
  }),
  getters: {
    isDark: (state): boolean => state.theme === "dark",
  },
  actions: {
    setTheme(theme: ThemeMode): void {
      this.theme = theme;
      localStorage.setItem(STORAGE_KEY, theme);
    },
    toggleTheme(): void {
      this.setTheme(this.theme === "dark" ? "light" : "dark");
    },
  },
});
