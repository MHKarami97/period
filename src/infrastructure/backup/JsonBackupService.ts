import { appDatabase, type CycleRecord, type SymptomRecord } from "../database/AppDatabase";

export interface BackupPayload {
  schemaVersion: 1;
  exportedAtIso: string;
  cycles: CycleRecord[];
  symptoms: SymptomRecord[];
}

/**
 * JsonBackupService - Infrastructure adapter for whole-database export and
 * import. Operates on raw Dexie records (not domain entities) since a
 * backup is a storage-level concern; the repositories remain the only
 * place that maps records to/from the Cycle/Symptom aggregates.
 */
export class JsonBackupService {
  public static async exportAll(): Promise<BackupPayload> {
    const [cycles, symptoms] = await Promise.all([
      appDatabase.cycles.toArray(),
      appDatabase.symptoms.toArray(),
    ]);

    return {
      schemaVersion: 1,
      exportedAtIso: new Date().toISOString(),
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
    const payload = JSON.parse(jsonText) as BackupPayload;

    if (payload.schemaVersion !== 1 || !Array.isArray(payload.cycles) || !Array.isArray(payload.symptoms)) {
      throw new Error("Invalid or unsupported backup file format.");
    }

    await appDatabase.transaction("rw", appDatabase.cycles, appDatabase.symptoms, async () => {
      await appDatabase.cycles.clear();
      await appDatabase.symptoms.clear();
      await appDatabase.cycles.bulkPut(payload.cycles);
      await appDatabase.symptoms.bulkPut(payload.symptoms);
    });
  }

  public static async importFromFile(file: File): Promise<void> {
    const text = await file.text();
    await JsonBackupService.importFromJson(text);
  }
}
