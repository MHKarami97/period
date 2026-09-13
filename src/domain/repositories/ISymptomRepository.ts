import { Symptom } from "../entities/Symptom";
import { DateOnly } from "../valueObjects/DateOnly";

export interface ISymptomRepository {
  getAll(): Promise<Symptom[]>;
  getByDate(date: DateOnly): Promise<Symptom | null>;
  getInRange(start: DateOnly, end: DateOnly): Promise<Symptom[]>;
  save(symptom: Symptom): Promise<void>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
}
