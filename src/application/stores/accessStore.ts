import { defineStore } from "pinia";
import { GameAccessPolicy } from "@domain/games/GameAccessPolicy";

const STORAGE_KEY = "period-tracker:access-password";

/**
 * accessStore - Application Service for the shared "games & positions" password.
 *
 * The password the user typed once is remembered in localStorage. Unlock is
 * NOT a stored flag: `isUnlocked` re-validates the remembered password against
 * the CURRENT app policy on every read, so if the password is changed in a
 * new release the saved one stops working and the user is asked again.
 */
export const useAccessStore = defineStore("access", {
  state: () => ({
    savedPassword: localStorage.getItem(STORAGE_KEY) ?? "",
  }),
  getters: {
    isUnlocked: (state): boolean => GameAccessPolicy.isValid(state.savedPassword),
  },
  actions: {
    tryUnlock(password: string): boolean {
      if (!GameAccessPolicy.isValid(password)) {
        return false;
      }
      this.savedPassword = password.trim();
      localStorage.setItem(STORAGE_KEY, this.savedPassword);
      return true;
    },
    lock(): void {
      this.savedPassword = "";
      localStorage.removeItem(STORAGE_KEY);
    },
  },
});
