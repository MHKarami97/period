import { appDatabase } from "../database/AppDatabase";

/**
 * DatabaseResetService - the only infrastructure adapter allowed to wipe
 * EVERY profile at once. Deliberately separate from JsonBackupService and
 * from the per-profile `clearForProfile` repository methods, so a
 * "reset this one profile" action can never be confused with "erase the
 * entire local database", which is what the Settings "factory reset"
 * button uses.
 */
export class DatabaseResetService {
  public static async resetAll(): Promise<void> {
    await appDatabase.transaction("rw", appDatabase.profiles, appDatabase.cycles, appDatabase.symptoms, async () => {
      await appDatabase.profiles.clear();
      await appDatabase.cycles.clear();
      await appDatabase.symptoms.clear();
    });
  }
}
