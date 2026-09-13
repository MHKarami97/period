import type { ISymptomRepository } from "@domain/repositories/ISymptomRepository";
import { Symptom } from "@domain/entities/Symptom";
import { DateOnly } from "@domain/valueObjects/DateOnly";
import { Mood } from "@domain/valueObjects/Mood";
import { FlowLevel } from "@domain/valueObjects/FlowLevel";
import { appDatabase, type SymptomRecord } from "../database/AppDatabase";

export class DexieSymptomRepository implements ISymptomRepository {
  public async getAllForProfile(profileId: string): Promise<Symptom[]> {
    const records = await appDatabase.symptoms.where("profileId").equals(profileId).sortBy("dateIso");
    return records.map(DexieSymptomRepository.toDomain);
  }

  public async getByDateForProfile(profileId: string, date: DateOnly): Promise<Symptom | null> {
    const record = await appDatabase.symptoms
      .where("[profileId+dateIso]")
      .equals([profileId, date.toIsoString()])
      .first();
    return record ? DexieSymptomRepository.toDomain(record) : null;
  }

  public async getInRangeForProfile(profileId: string, start: DateOnly, end: DateOnly): Promise<Symptom[]> {
    const records = await appDatabase.symptoms
      .where("profileId")
      .equals(profileId)
      .and((record) => record.dateIso >= start.toIsoString() && record.dateIso <= end.toIsoString())
      .toArray();
    return records.map(DexieSymptomRepository.toDomain);
  }

  public async save(symptom: Symptom, profileId: string): Promise<void> {
    await appDatabase.symptoms.put(DexieSymptomRepository.toRecord(symptom, profileId));
  }

  public async delete(id: string): Promise<void> {
    await appDatabase.symptoms.delete(id);
  }

  public async clearForProfile(profileId: string): Promise<void> {
    await appDatabase.symptoms.where("profileId").equals(profileId).delete();
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

  private static toRecord(symptom: Symptom, profileId: string): SymptomRecord {
    const plain = symptom.toPlainObject();
    return {
      id: plain.id,
      profileId,
      dateIso: plain.date.toIsoString(),
      mood: plain.mood,
      painLevel: plain.painLevel,
      flowLevel: plain.flowLevel,
      note: plain.note,
    };
  }
}
