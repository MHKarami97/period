import { CLOUD_CONFIG } from "./cloudConfig";
import { DEFAULT_CLOUD_STATE, type CloudSyncPersistedState } from "@domain/entities/CloudSync";

// Device-local on purpose: this state must never travel inside a backup.
export class CloudSyncStateStorage {
  public load(): CloudSyncPersistedState {
    try {
      const raw = localStorage.getItem(CLOUD_CONFIG.stateStorageKey);
      return raw ? { ...DEFAULT_CLOUD_STATE, ...JSON.parse(raw) } : { ...DEFAULT_CLOUD_STATE };
    } catch {
      return { ...DEFAULT_CLOUD_STATE };
    }
  }

  public save(state: CloudSyncPersistedState): void {
    try {
      localStorage.setItem(CLOUD_CONFIG.stateStorageKey, JSON.stringify(state));
    } catch {
      // Storage may be unavailable (private mode); sync still works for this session.
    }
  }
}
