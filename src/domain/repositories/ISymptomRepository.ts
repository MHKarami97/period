import { Symptom } from "../entities/Symptom";
import { DateOnly } from "../valueObjects/DateOnly";

export interface ISymptomRepository {
  getAllForProfile(profileId: string): Promise<Symptom[]>;
  getByDateForProfile(profileId: string, date: DateOnly): Promise<Symptom | null>;
  getInRangeForProfile(profileId: string, start: DateOnly, end: DateOnly): Promise<Symptom[]>;
  save(symptom: Symptom, profileId: string): Promise<void>;
  delete(id: string): Promise<void>;
  clearForProfile(profileId: string): Promise<void>;
}
