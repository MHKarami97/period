import { appDatabase, type CycleRecord, type SymptomRecord, type ProfileRecord } from "../database/AppDatabase";

export interface BackupPayload {
  schemaVersion: 2;
  exportedAtIso: string;
  profiles: ProfileRecord[];
  cycles: CycleRecord[];
  symptoms: SymptomRecord[];
}

/**
 * JsonBackupService - Infrastructure adapter for whole-database export and
 * import, covering ALL profiles (not just the currently active one) so a
 * single backup file always represents the complete local database.
 * Operates on raw Dexie records, not domain entities, since a backup is a
 * storage-level concern; the repositories remain the only place that maps
 * records to/from the Cycle/Symptom/Profile aggregates.
 */
export class JsonBackupService {
  public static async exportAll(): Promise<BackupPayload> {
    const [profiles, cycles, symptoms] = await Promise.all([
      appDatabase.profiles.toArray(),
      appDatabase.cycles.toArray(),
      appDatabase.symptoms.toArray(),
    ]);

    return {
      schemaVersion: 2,
      exportedAtIso: new Date().toISOString(),
      profiles,
      cycles,
      symptoms,
    };
  }

  public static async downloadAsFile(fileName = "period-tracker-backup.json"): Promise<void> {
    const payload = await JsonBackupService.exportAll();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();

    URL.revokeObjectURL(url);
  }

  public static async importFromJson(jsonText: string): Promise<void> {
    const payload = JSON.parse(jsonText) as Partial<BackupPayload>;

    if (!Array.isArray(payload.cycles) || !Array.isArray(payload.symptoms)) {
      throw new Error("Invalid or unsupported backup file format.");
    }
    // schemaVersion 1 backups have no `profiles` array; fall back to an
    // empty list so import still succeeds (AppDatabase's own v1->v2
    // migration already assigned a default profile to any local v1 data).
    const profiles = Array.isArray(payload.profiles) ? payload.profiles : [];

    await appDatabase.transaction("rw", appDatabase.profiles, appDatabase.cycles, appDatabase.symptoms, async () => {
      await appDatabase.profiles.clear();
      await appDatabase.cycles.clear();
      await appDatabase.symptoms.clear();
      await appDatabase.profiles.bulkPut(profiles);
      await appDatabase.cycles.bulkPut(payload.cycles as CycleRecord[]);
      await appDatabase.symptoms.bulkPut(payload.symptoms as SymptomRecord[]);
    });
  }

  public static async importFromFile(file: File): Promise<void> {
    const text = await file.text();
    await JsonBackupService.importFromJson(text);
  }
}
