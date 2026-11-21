import { defineStore } from "pinia";

const STORAGE_KEY = "mahak:display-preferences:v1";

export interface TogglePreference {
  readonly id: string;
  readonly label: string;
}

/** Sections the user may hide from the menu. "Home" and "Hamrah" are always visible. */
export const NAV_TOGGLES: readonly TogglePreference[] = [
  { id: "hamdel", label: "همدل" },
  { id: "hamyar", label: "همیار" },
  { id: "games", label: "هم‌راز" },
];

/** Widgets of the home page the user may hide. */
export const HOME_WIDGETS: readonly TogglePreference[] = [
  { id: "reminders", label: "امروز یادتان نرود" },
  { id: "quickLinks", label: "دسترسی سریع" },
  { id: "companion", label: "کارت همراه (پیش‌بینی‌ها و تحلیل)" },
  { id: "challenge", label: "چالش امروز" },
  { id: "hamdel", label: "کارت همدل" },
  { id: "play", label: "کارت هم‌راز" },
  { id: "hamyarLife", label: "همیار · مراحل زندگی" },
  { id: "hamyarCouple", label: "همیار · ارتباط زوجین" },
];

interface StoredPreferences {
  hiddenNav: string[];
  hiddenWidgets: string[];
}

function load(): StoredPreferences {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Partial<StoredPreferences>;
    return {
      hiddenNav: Array.isArray(parsed.hiddenNav) ? parsed.hiddenNav.filter((item) => typeof item === "string") : [],
      hiddenWidgets: Array.isArray(parsed.hiddenWidgets) ? parsed.hiddenWidgets.filter((item) => typeof item === "string") : [],
    };
  } catch {
    return { hiddenNav: [], hiddenWidgets: [] };
  }
}

/** displayPreferencesStore - UI-only choices about what is shown (menu items and home widgets). */
export const useDisplayPreferencesStore = defineStore("displayPreferences", {
  state: (): StoredPreferences => load(),
  getters: {
    isNavVisible: (state) => (id: string): boolean => !state.hiddenNav.includes(id),
    isWidgetVisible: (state) => (id: string): boolean => !state.hiddenWidgets.includes(id),
  },
  actions: {
    persist(): void {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ hiddenNav: this.hiddenNav, hiddenWidgets: this.hiddenWidgets }));
    },
    toggleNav(id: string): void {
      this.hiddenNav = this.hiddenNav.includes(id) ? this.hiddenNav.filter((item) => item !== id) : [...this.hiddenNav, id];
      this.persist();
    },
    toggleWidget(id: string): void {
      this.hiddenWidgets = this.hiddenWidgets.includes(id) ? this.hiddenWidgets.filter((item) => item !== id) : [...this.hiddenWidgets, id];
      this.persist();
    },
    reset(): void {
      this.hiddenNav = [];
      this.hiddenWidgets = [];
      this.persist();
    },
  },
});
