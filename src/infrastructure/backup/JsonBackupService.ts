import {
  appDatabase,
  type CycleRecord,
  type HamdelEntryRecord,
  type HamdelPhotoRecord,
  type ProfileRecord,
  type SymptomRecord,
} from "../database/AppDatabase";
import { hamdelBytesCodec } from "../hamdel/HamdelBytesCodec";
import { hamdelPayloadCodec } from "../hamdel/HamdelPayloadCodec";
import { fromBase64, toBase64 } from "../security/encoding";
import { decryptBackup, encryptBackup, isEncryptedBackup } from "./EncryptedBackup";

/** Photos travel inside the JSON backup as base64 text. */
export interface HamdelPhotoBackupRecord extends Omit<HamdelPhotoRecord, "bytes"> {
  bytesBase64: string;
}

export interface BackupPayload {
  schemaVersion: 2 | 3 | 4;
  exportedAtIso: string;
  profiles: ProfileRecord[];
  cycles: CycleRecord[];
  symptoms: SymptomRecord[];
  /** Absent in backups made before Hamdel existed. Payloads are ALWAYS plain JSON inside a backup. */
  hamdelEntries?: HamdelEntryRecord[];
  /** Absent in backups made before Hamdel photos existed. */
  hamdelPhotos?: HamdelPhotoBackupRecord[];
}

const ENCRYPTED_FILE_NAME = "period-tracker-backup.enc.json";

/**
 * JsonBackupService - Infrastructure adapter for whole-database export and
 * import, covering ALL profiles (not just the currently active one) so a
 * single backup file always represents the complete local database.
 *
 * Hamdel records are stored encrypted with the device's own vault key when app lock is on, so a
 * backup normalises them to plain form on export (the file can then be protected with its own
 * password) and re-encodes them with the CURRENT codec on import. That keeps backups portable
 * between devices and independent of the PIN.
 */
export class JsonBackupService {
  public static async exportAll(): Promise<BackupPayload> {
    const [profiles, cycles, symptoms, entryRecords, photoRecords] = await Promise.all([
      appDatabase.profiles.toArray(),
      appDatabase.cycles.toArray(),
      appDatabase.symptoms.toArray(),
      appDatabase.hamdelEntries.toArray(),
      appDatabase.hamdelPhotos.toArray(),
    ]);

    const hamdelEntries = await Promise.all(
      entryRecords.map(async (record) => ({ ...record, payload: JSON.stringify(await hamdelPayloadCodec.decode(record.payload)) })),
    );
    const hamdelPhotos = await Promise.all(
      photoRecords.map(async ({ bytes, ...rest }) => ({ ...rest, bytesBase64: toBase64(new Uint8Array(await hamdelBytesCodec.decode(bytes))) })),
    );

    return { schemaVersion: 4, exportedAtIso: new Date().toISOString(), profiles, cycles, symptoms, hamdelEntries, hamdelPhotos };
  }

  public static async downloadAsFile(fileName = "period-tracker-backup.json"): Promise<void> {
    const payload = await JsonBackupService.exportAll();
    JsonBackupService.download(JSON.stringify(payload, null, 2), fileName);
  }

  /** Password-protected backup (PBKDF2 + AES-256-GCM). The password cannot be recovered. */
  public static async downloadEncrypted(password: string, fileName = ENCRYPTED_FILE_NAME): Promise<void> {
    const payload = await JsonBackupService.exportAll();
    JsonBackupService.download(await encryptBackup(JSON.stringify(payload), password), fileName);
  }

  public static isEncrypted(text: string): boolean {
    return isEncryptedBackup(text);
  }

  /** Accepts both plain and password-protected backups. */
  public static async importFromJson(text: string, password?: string): Promise<void> {
    const jsonText = isEncryptedBackup(text) ? await decryptBackup(text, password) : text;
    const payload = JSON.parse(jsonText) as Partial<BackupPayload>;

    if (!Array.isArray(payload.cycles) || !Array.isArray(payload.symptoms)) {
      throw new Error("Invalid or unsupported backup file format.");
    }
    // schemaVersion 1 backups have no `profiles` array; fall back to an
    // empty list so import still succeeds (AppDatabase's own v1->v2
    // migration already assigned a default profile to any local v1 data).
    const profiles = Array.isArray(payload.profiles) ? payload.profiles : [];

    // All WebCrypto work is finished before the transaction opens (see HamdelEncryptionMigrator).
    const hamdelEntries = Array.isArray(payload.hamdelEntries)
      ? await Promise.all(
          payload.hamdelEntries.map(async (record) => ({
            ...record,
            payload: await hamdelPayloadCodec.encode(await hamdelPayloadCodec.decode(record.payload)),
          })),
        )
      : null;
    const hamdelPhotos = Array.isArray(payload.hamdelPhotos)
      ? await Promise.all(
          payload.hamdelPhotos.map(async ({ bytesBase64, ...rest }): Promise<HamdelPhotoRecord> => ({
            ...rest,
            bytes: await hamdelBytesCodec.encode(fromBase64(bytesBase64).buffer as ArrayBuffer),
          })),
        )
      : null;

    await appDatabase.transaction(
      "rw",
      [appDatabase.profiles, appDatabase.cycles, appDatabase.symptoms, appDatabase.hamdelEntries, appDatabase.hamdelPhotos],
      async () => {
        await appDatabase.profiles.clear();
        await appDatabase.cycles.clear();
        await appDatabase.symptoms.clear();
        await appDatabase.profiles.bulkPut(profiles);
        await appDatabase.cycles.bulkPut(payload.cycles as CycleRecord[]);
        await appDatabase.symptoms.bulkPut(payload.symptoms as SymptomRecord[]);
        // Backups older than schemaVersion 3/4 carry no Hamdel data: keep the local notebook untouched.
        if (hamdelEntries) {
          await appDatabase.hamdelEntries.clear();
          await appDatabase.hamdelEntries.bulkPut(hamdelEntries);
        }
        if (hamdelPhotos) {
          await appDatabase.hamdelPhotos.clear();
          await appDatabase.hamdelPhotos.bulkPut(hamdelPhotos);
        }
      },
    );
  }

  public static async importFromFile(file: File, password?: string): Promise<void> {
    await JsonBackupService.importFromJson(await file.text(), password);
  }

  private static download(content: string, fileName: string): void {
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
