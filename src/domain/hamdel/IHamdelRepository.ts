import type { HamdelEntry } from "./HamdelEntry";

/** Port: persistence of Hamdel entries, always scoped to one tracked profile. */
export interface IHamdelRepository {
  listByProfile(profileId: string): Promise<HamdelEntry[]>;
  save(entry: HamdelEntry): Promise<void>;
  delete(id: string): Promise<void>;
  clearForProfile(profileId: string): Promise<void>;
}
