import { describe, expect, it } from "vitest";
import { RELEASES, ReleaseNotesPolicy, type ReleaseNote } from "./ReleaseNotes";

const note = (id: string): ReleaseNote => ({ id, title: id, highlights: [] });
const LIST = [note("c"), note("b"), note("a")];

describe("ReleaseNotesPolicy", () => {
  it("shows nothing when the user is up to date", () => {
    expect(ReleaseNotesPolicy.unseen(LIST, "c")).toEqual([]);
  });

  it("shows only the releases newer than the last seen one", () => {
    expect(ReleaseNotesPolicy.unseen(LIST, "a").map((item) => item.id)).toEqual(["c", "b"]);
    expect(ReleaseNotesPolicy.unseen(LIST, "b").map((item) => item.id)).toEqual(["c"]);
  });

  it("shows recent releases to an existing user who never saw notes", () => {
    expect(ReleaseNotesPolicy.unseen(LIST, null)).toHaveLength(3);
  });

  it("falls back to the latest release for an unknown id", () => {
    expect(ReleaseNotesPolicy.unseen(LIST, "zzz").map((item) => item.id)).toEqual(["c"]);
  });

  it("ships unique release ids", () => {
    expect(new Set(RELEASES.map((release) => release.id)).size).toBe(RELEASES.length);
  });
});
