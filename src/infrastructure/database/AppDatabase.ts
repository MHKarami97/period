import Dexie, { type Table } from "dexie";

/** Well-known id for the profile that owns any data logged before multi-profile support existed. */
export const DEFAULT_PROFILE_ID = "default-profile";

export interface ProfileRecord {
  id: string;
  name: string;
  createdAtIso: string;
}

export interface CycleRecord {
  id: string;
  profileId: string;
  startDateIso: string;
  endDateIso: string | null;
  isEarlyOrLateAdjusted: number; // Dexie/IndexedDB has no boolean index; store 0/1.
}

export interface SymptomRecord {
  id: string;
  profileId: string;
  dateIso: string;
  mood: string | null;
  painLevel: number;
  flowLevel: string;
  note: string | null;
}

/**
 * AppDatabase - Infrastructure adapter around IndexedDB via Dexie.js.
 *
 * Version 2 introduces multi-profile support (`profiles` table +
 * `profileId` on cycles/symptoms) so a partner can track several people
 * (wife, sister, daughter, ...) from one device without their data mixing.
 * The `upgrade()` hook migrates any pre-existing v1 data into a single
 * default profile so nothing already logged by early adopters is lost.
 */
export class AppDatabase extends Dexie {
  public readonly cycles!: Table<CycleRecord, string>;
  public readonly symptoms!: Table<SymptomRecord, string>;
  public readonly profiles!: Table<ProfileRecord, string>;

  public constructor() {
    super("PeriodTrackerDatabase");

    this.version(1).stores({
      cycles: "id, startDateIso, endDateIso",
      symptoms: "id, &dateIso",
    });

    this.version(2)
      .stores({
        cycles: "id, profileId, startDateIso, endDateIso",
        symptoms: "id, profileId, dateIso, &[profileId+dateIso]",
        profiles: "id, createdAtIso",
      })
      .upgrade(async (transaction) => {
        await transaction.table<ProfileRecord, string>("profiles").put({
          id: DEFAULT_PROFILE_ID,
          name: "من",
          createdAtIso: new Date().toISOString(),
        });
        await transaction
          .table<CycleRecord, string>("cycles")
          .toCollection()
          .modify((record) => {
            record.profileId = DEFAULT_PROFILE_ID;
          });
        await transaction
          .table<SymptomRecord, string>("symptoms")
          .toCollection()
          .modify((record) => {
            record.profileId = DEFAULT_PROFILE_ID;
          });
      });
  }
}

/** Singleton instance shared across the whole app (one IndexedDB connection). */
export const appDatabase = new AppDatabase();
