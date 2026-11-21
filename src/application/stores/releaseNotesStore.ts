import { defineStore } from "pinia";
import { LATEST_RELEASE_ID, RELEASES, ReleaseNotesPolicy } from "@domain/releases/ReleaseNotes";

const LAST_SEEN_KEY = "mahak:last-seen-release";
/** Same key the role store uses; absent means this is a brand-new installation. */
const ROLE_KEY = "period-tracker:role";
const REVIEW_COUNT = 5;

function initialLastSeen(): string | null {
  const stored = localStorage.getItem(LAST_SEEN_KEY);
  if (stored) return stored;
  if (localStorage.getItem(ROLE_KEY) === null) {
    // Fresh install: nothing is "new" yet, so do not greet the user with a changelog.
    localStorage.setItem(LAST_SEEN_KEY, LATEST_RELEASE_ID);
    return LATEST_RELEASE_ID;
  }
  return null;
}

/** releaseNotesStore - remembers which release notes were shown, and opens the "What's new" dialog after an update. */
export const useReleaseNotesStore = defineStore("releaseNotes", {
  state: () => ({
    lastSeenId: initialLastSeen() as string | null,
    isReviewing: false,
  }),
  getters: {
    visibleReleases: (state) => (state.isReviewing ? RELEASES.slice(0, REVIEW_COUNT) : ReleaseNotesPolicy.unseen(RELEASES, state.lastSeenId)),
  },
  actions: {
    markSeen(): void {
      this.lastSeenId = LATEST_RELEASE_ID;
      this.isReviewing = false;
      localStorage.setItem(LAST_SEEN_KEY, LATEST_RELEASE_ID);
    },
    startReview(): void {
      this.isReviewing = true;
    },
  },
});
