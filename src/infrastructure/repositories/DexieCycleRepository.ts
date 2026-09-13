import type { ICycleRepository } from "@domain/repositories/ICycleRepository";
import { Cycle } from "@domain/entities/Cycle";
import { DateOnly } from "@domain/valueObjects/DateOnly";
import { appDatabase, type CycleRecord } from "../database/AppDatabase";

/**
 * DexieCycleRepository - Adapter implementing the ICycleRepository port
 * declared in the domain layer, using IndexedDB (via Dexie) as the storage
 * mechanism. Follows the Data Mapper pattern: persistence records
 * (CycleRecord) are translated to/from rich domain entities (Cycle) here,
 * so the domain stays free of any persistence concern.
 */
export class DexieCycleRepository implements ICycleRepository {
  public async getAll(): Promise<Cycle[]> {
    const records = await appDatabase.cycles.orderBy("startDateIso").toArray();
    return records.map(DexieCycleRepository.toDomain);
  }

  public async getById(id: string): Promise<Cycle | null> {
    const record = await appDatabase.cycles.get(id);
    return record ? DexieCycleRepository.toDomain(record) : null;
  }

  public async save(cycle: Cycle): Promise<void> {
    await appDatabase.cycles.put(DexieCycleRepository.toRecord(cycle));
  }

  public async delete(id: string): Promise<void> {
    await appDatabase.cycles.delete(id);
  }

  public async clear(): Promise<void> {
    await appDatabase.cycles.clear();
  }

  private static toDomain(record: CycleRecord): Cycle {
    return Cycle.reconstitute({
      id: record.id,
      startDate: DateOnly.fromIsoString(record.startDateIso),
      endDate: record.endDateIso ? DateOnly.fromIsoString(record.endDateIso) : null,
      isEarlyOrLateAdjusted: record.isEarlyOrLateAdjusted === 1,
    });
  }

  private static toRecord(cycle: Cycle): CycleRecord {
    const plain = cycle.toPlainObject();
    return {
      id: plain.id,
      startDateIso: plain.startDate.toIsoString(),
      endDateIso: plain.endDate ? plain.endDate.toIsoString() : null,
      isEarlyOrLateAdjusted: plain.isEarlyOrLateAdjusted ? 1 : 0,
    };
  }
}
