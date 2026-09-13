import type { ISymptomRepository } from "@domain/repositories/ISymptomRepository";
import { Symptom } from "@domain/entities/Symptom";
import { DateOnly } from "@domain/valueObjects/DateOnly";
import { Mood } from "@domain/valueObjects/Mood";
import { FlowLevel } from "@domain/valueObjects/FlowLevel";
import { appDatabase, type SymptomRecord } from "../database/AppDatabase";

export class DexieSymptomRepository implements ISymptomRepository {
  public async getAll(): Promise<Symptom[]> {
    const records = await appDatabase.symptoms.orderBy("dateIso").toArray();
    return records.map(DexieSymptomRepository.toDomain);
  }

  public async getByDate(date: DateOnly): Promise<Symptom | null> {
    const record = await appDatabase.symptoms.where("dateIso").equals(date.toIsoString()).first();
    return record ? DexieSymptomRepository.toDomain(record) : null;
  }

  public async getInRange(start: DateOnly, end: DateOnly): Promise<Symptom[]> {
    const records = await appDatabase.symptoms
      .where("dateIso")
      .between(start.toIsoString(), end.toIsoString(), true, true)
      .toArray();
    return records.map(DexieSymptomRepository.toDomain);
  }

  public async save(symptom: Symptom): Promise<void> {
    await appDatabase.symptoms.put(DexieSymptomRepository.toRecord(symptom));
  }

  public async delete(id: string): Promise<void> {
    await appDatabase.symptoms.delete(id);
  }

  public async clear(): Promise<void> {
    await appDatabase.symptoms.clear();
  }

  private static toDomain(record: SymptomRecord): Symptom {
    return Symptom.create({
      id: record.id,
      date: DateOnly.fromIsoString(record.dateIso),
      mood: (record.mood as Mood | null) ?? null,
      painLevel: record.painLevel,
      flowLevel: record.flowLevel as FlowLevel,
      note: record.note,
    });
  }

  private static toRecord(symptom: Symptom): SymptomRecord {
    const plain = symptom.toPlainObject();
    return {
      id: plain.id,
      dateIso: plain.date.toIsoString(),
      mood: plain.mood,
      painLevel: plain.painLevel,
      flowLevel: plain.flowLevel,
      note: plain.note,
    };
  }
}
