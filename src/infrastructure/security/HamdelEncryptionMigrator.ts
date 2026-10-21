import { appDatabase } from "../database/AppDatabase";
import { decryptBytes, decryptText, encryptBytes, encryptText, isEncryptedBytes, isEncryptedText } from "./VaultCrypto";
import { vaultSession, type VaultSession } from "./VaultSession";

export type MigrationDirection = "encrypt" | "decrypt";
export type MigrationProgress = (done: number, total: number) => void;

const CHUNK_SIZE = 50;

/**
 * Converts every stored Hamdel record between plain and encrypted form.
 * Idempotent: records already in the target form are skipped, so a failed run can simply be repeated.
 * All WebCrypto work happens BEFORE each short IndexedDB write, because awaiting non-Dexie promises
 * inside a Dexie transaction would let the transaction auto-commit early.
 */
export class HamdelEncryptionMigrator {
  public constructor(private readonly session: VaultSession = vaultSession) {}

  public async migrate(direction: MigrationDirection, onProgress?: MigrationProgress): Promise<void> {
    const key = this.session.requireKey();
    const toEncrypted = direction === "encrypt";
    const entryIds = (await appDatabase.hamdelEntries.toCollection().primaryKeys()) as string[];
    const photoIds = (await appDatabase.hamdelPhotos.toCollection().primaryKeys()) as string[];
    const total = entryIds.length + photoIds.length;
    let done = 0;

    for (let offset = 0; offset < entryIds.length; offset += CHUNK_SIZE) {
      const records = (await appDatabase.hamdelEntries.bulkGet(entryIds.slice(offset, offset + CHUNK_SIZE))).filter(
        (record): record is NonNullable<typeof record> => record !== undefined,
      );
      const converted = await Promise.all(
        records.map(async (record) => {
          if (isEncryptedText(record.payload) === toEncrypted) return null;
          const payload = toEncrypted ? await encryptText(key, record.payload) : await decryptText(key, record.payload);
          return { ...record, payload };
        }),
      );
      await appDatabase.hamdelEntries.bulkPut(converted.filter((record): record is NonNullable<typeof record> => record !== null));
      done += records.length;
      onProgress?.(done, total);
    }

    for (const id of photoIds) {
      const record = await appDatabase.hamdelPhotos.get(id);
      if (record && isEncryptedBytes(record.bytes) !== toEncrypted) {
        const bytes = toEncrypted ? await encryptBytes(key, record.bytes) : await decryptBytes(key, record.bytes);
        await appDatabase.hamdelPhotos.put({ ...record, bytes });
      }
      done += 1;
      onProgress?.(done, total);
    }
  }
}

export const hamdelEncryptionMigrator = new HamdelEncryptionMigrator();
