import Dexie, { type Table } from "dexie";

/**
 * Persistence-shaped DTOs. These are intentionally decoupled from the
 * domain entities (Cycle / Symptom): the domain never imports from
 * infrastructure, and Dexie never imports domain classes. Mapping between
 * the two happens exclusively inside the repository adapters.
 */
export interface CycleRecord {
  id: string;
  startDateIso: string;
  endDateIso: string | null;
  isEarlyOrLateAdjusted: number; // Dexie/IndexedDB has no boolean index; store 0/1.
}

export interface SymptomRecord {
  id: string;
  dateIso: string; // indexed, one record per calendar day
  mood: string | null;
  painLevel: number;
  flowLevel: string;
  note: string | null;
}

/**
 * AppDatabase - Infrastructure adapter around IndexedDB via Dexie.js.
 * This is the single source of truth for local-first persistence; all
 * reads/writes for the PWA go through this class (or the repositories
 * that wrap it), never directly from Vue components.
 */
export class AppDatabase extends Dexie {
  public readonly cycles!: Table<CycleRecord, string>;
  public readonly symptoms!: Table<SymptomRecord, string>;

  public constructor() {
    super("PeriodTrackerDatabase");

    this.version(1).stores({
      cycles: "id, startDateIso, endDateIso",
      symptoms: "id, &dateIso",
    });
  }
}

/** Singleton instance shared across the whole app (one IndexedDB connection). */
export const appDatabase = new AppDatabase();
