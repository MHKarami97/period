import { HamdelEntry } from "@domain/hamdel/HamdelEntry";
import type { IHamdelRepository } from "@domain/hamdel/IHamdelRepository";
import { findHamdelSection } from "@domain/hamdel/hamdelSections";
import { appDatabase, type HamdelEntryRecord } from "../database/AppDatabase";
import { hamdelPayloadCodec } from "../hamdel/HamdelPayloadCodec";

/** DexieHamdelRepository - Adapter for IHamdelRepository. Entries of unknown (removed) sections are skipped. */
export class DexieHamdelRepository implements IHamdelRepository {
  public async listByProfile(profileId: string): Promise<HamdelEntry[]> {
    const records = await appDatabase.hamdelEntries.where("profileId").equals(profileId).toArray();
    const entries = await Promise.all(records.map((record) => this.toEntry(record)));
    return entries.filter((entry): entry is HamdelEntry => entry !== null);
  }

  public async save(entry: HamdelEntry): Promise<void> {
    await appDatabase.hamdelEntries.put({
      id: entry.id,
      profileId: entry.profileId,
      section: entry.section,
      dateIso: entry.dateIso,
      payload: await hamdelPayloadCodec.encode(entry.values),
      createdAtIso: entry.createdAtIso,
      updatedAtIso: entry.updatedAtIso,
    });
  }

  public async delete(id: string): Promise<void> {
    await appDatabase.hamdelEntries.delete(id);
  }

  public async clearForProfile(profileId: string): Promise<void> {
    await appDatabase.hamdelEntries.where("profileId").equals(profileId).delete();
  }

  private async toEntry(record: HamdelEntryRecord): Promise<HamdelEntry | null> {
    if (!findHamdelSection(record.section)) {
      return null;
    }
    try {
      return HamdelEntry.reconstitute({
        id: record.id,
        profileId: record.profileId,
        section: record.section,
        values: await hamdelPayloadCodec.decode(record.payload),
        createdAtIso: record.createdAtIso,
        updatedAtIso: record.updatedAtIso,
      });
    } catch {
      return null;
    }
  }
}
