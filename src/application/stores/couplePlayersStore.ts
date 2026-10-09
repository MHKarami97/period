import { defineStore } from "pinia";

const WOMAN_KEY = "period-tracker:games:woman-name";
const MAN_KEY = "period-tracker:games:man-name";

/**
 * couplePlayersStore - the two player names shared by every two-player game
 * (except Snake & Ladder, which keeps its names inside its own saved settings).
 */
export const useCouplePlayersStore = defineStore("couplePlayers", {
  state: () => ({
    womanName: localStorage.getItem(WOMAN_KEY) ?? "",
    manName: localStorage.getItem(MAN_KEY) ?? "",
  }),
  getters: {
    areNamesComplete: (state): boolean => state.womanName.trim().length > 0 && state.manName.trim().length > 0,
  },
  actions: {
    setWomanName(name: string): void {
      this.womanName = name;
      localStorage.setItem(WOMAN_KEY, name);
    },
    setManName(name: string): void {
      this.manName = name;
      localStorage.setItem(MAN_KEY, name);
    },
  },
});
