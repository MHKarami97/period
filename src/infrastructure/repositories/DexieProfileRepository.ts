import type { IProfileRepository } from "@domain/repositories/IProfileRepository";
import { Profile } from "@domain/entities/Profile";
import { DateOnly } from "@domain/valueObjects/DateOnly";
import { appDatabase, type ProfileRecord } from "../database/AppDatabase";

export class DexieProfileRepository implements IProfileRepository {
  public async getAll(): Promise<Profile[]> {
    const records = await appDatabase.profiles.orderBy("createdAtIso").toArray();
    return records.map(DexieProfileRepository.toDomain);
  }

  public async save(profile: Profile): Promise<void> {
    await appDatabase.profiles.put(DexieProfileRepository.toRecord(profile));
  }

  public async delete(id: string): Promise<void> {
    await appDatabase.profiles.delete(id);
  }

  private static toDomain(record: ProfileRecord): Profile {
    return Profile.reconstitute({
      id: record.id,
      name: record.name,
      createdAt: DateOnly.fromIsoString(record.createdAtIso),
    });
  }

  private static toRecord(profile: Profile): ProfileRecord {
    const plain = profile.toPlainObject();
    return {
      id: plain.id,
      name: plain.name,
      createdAtIso: plain.createdAt.toIsoString(),
    };
  }
}
