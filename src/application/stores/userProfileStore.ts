import { defineStore } from "pinia";

const STORAGE_KEY = "period-tracker:displayName";

/**
 * userProfileStore - Application Service holding the display name entered
 * in Settings. This is UI/personalization state, not a domain concept: the
 * Cycle/Symptom aggregates never reference it. It is read from both the
 * self-tracking dashboard ("سلام {name}") and the partner-tracking
 * read-only projection ("وضعیت {name}"), so it lives in application/, one
 * level above the mode-specific views that consume it.
 */
export const useUserProfileStore = defineStore("userProfile", {
  state: () => ({
    displayName: localStorage.getItem(STORAGE_KEY) ?? "",
  }),
  getters: {
    hasDisplayName: (state): boolean => state.displayName.trim().length > 0,
  },
  actions: {
    setDisplayName(name: string): void {
      const trimmed = name.trim();
      this.displayName = trimmed;
      localStorage.setItem(STORAGE_KEY, trimmed);
    },
  },
});
