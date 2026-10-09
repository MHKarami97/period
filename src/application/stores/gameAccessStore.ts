import { defineStore } from "pinia";
import { GameAccessPolicy } from "@domain/games/GameAccessPolicy";

const STORAGE_KEY = "period-tracker:games:unlocked";

/**
 * gameAccessStore - Application Service remembering whether the games
 * password was entered correctly. The flag lives in sessionStorage, so it
 * survives page refreshes but is forgotten when the tab/app is closed.
 */
export const useGameAccessStore = defineStore("gameAccess", {
  state: () => ({
    unlocked: sessionStorage.getItem(STORAGE_KEY) === "1",
  }),
  getters: {
    isUnlocked: (state): boolean => state.unlocked,
  },
  actions: {
    tryUnlock(password: string): boolean {
      if (!GameAccessPolicy.isValid(password)) {
        return false;
      }
      this.unlocked = true;
      sessionStorage.setItem(STORAGE_KEY, "1");
      return true;
    },
    lock(): void {
      this.unlocked = false;
      sessionStorage.removeItem(STORAGE_KEY);
    },
  },
});
