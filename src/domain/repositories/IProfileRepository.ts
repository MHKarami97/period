import { Profile } from "../entities/Profile";

export interface IProfileRepository {
  getAll(): Promise<Profile[]>;
  save(profile: Profile): Promise<void>;
  delete(id: string): Promise<void>;
}
