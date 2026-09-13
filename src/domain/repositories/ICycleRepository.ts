import { Cycle } from "../entities/Cycle";

/**
 * ICycleRepository - Port (in the Hexagonal/Ports & Adapters sense).
 * Every operation is scoped to a `profileId` (see the `Profile` aggregate)
 * so multiple tracked people can share the same local database without
 * their cycles ever mixing together.
 */
export interface ICycleRepository {
  getAllForProfile(profileId: string): Promise<Cycle[]>;
  getById(id: string): Promise<Cycle | null>;
  save(cycle: Cycle, profileId: string): Promise<void>;
  delete(id: string): Promise<void>;
  clearForProfile(profileId: string): Promise<void>;
}
