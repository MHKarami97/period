import { defineStore } from "pinia";

export type AppRole = "self" | "partner";

const STORAGE_KEY = "period-tracker:role";

/**
 * appModeStore - Application Service holding the Dual-Mode UI preference.
 * This is NOT a domain concept: Cycle/Symptom aggregates behave identically
 * regardless of viewer. It only gates which presentation components/routes
 * (full editing vs. read-only projection) are rendered.
 */
export const useAppModeStore = defineStore("appMode", {
  state: () => ({
    role: (localStorage.getItem(STORAGE_KEY) as AppRole | null) ?? null,
  }),
  getters: {
    isPartnerMode: (state): boolean => state.role === "partner",
    isSelfMode: (state): boolean => state.role === "self",
    hasSelectedRole: (state): boolean => state.role !== null,
  },
  actions: {
    setRole(role: AppRole): void {
      this.role = role;
      localStorage.setItem(STORAGE_KEY, role);
    },
    resetRole(): void {
      this.role = null;
      localStorage.removeItem(STORAGE_KEY);
    },
  },
});
