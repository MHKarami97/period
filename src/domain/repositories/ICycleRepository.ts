import { Cycle } from "../entities/Cycle";

/**
 * ICycleRepository - Port (in the Hexagonal/Ports & Adapters sense).
 * The domain and application layers depend on this abstraction only;
 * the concrete Dexie-backed adapter lives in /src/infrastructure and is
 * wired up at the application (Pinia store) boundary, keeping the
 * dependency arrow pointing inward (Dependency Inversion Principle).
 */
export interface ICycleRepository {
  getAll(): Promise<Cycle[]>;
  getById(id: string): Promise<Cycle | null>;
  save(cycle: Cycle): Promise<void>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
}
