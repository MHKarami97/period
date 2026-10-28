const DB_NAME = "MahakBiometricsDB";
const STORE_NAME = "biometric_keys";

// In-memory fallback for environments without IndexedDB (e.g. Node / Vitest)
const memoryStore = new Map<string, CryptoKey>();

function hasIndexedDb(): boolean {
  return typeof indexedDB !== "undefined";
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Storage for platform biometric keys (fingerprint sensor / TouchID)
 * when hardware PRF extension is unavailable.
 * Keys are non-extractable CryptoKeys stored securely in IndexedDB.
 */
export class BiometricKeyStorage {
  public static async saveKey(credentialId: string, key: CryptoKey): Promise<void> {
    if (!hasIndexedDb()) {
      memoryStore.set(credentialId, key);
      return;
    }
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(key, credentialId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  public static async loadKey(credentialId: string): Promise<CryptoKey | null> {
    if (!hasIndexedDb()) {
      return memoryStore.get(credentialId) ?? null;
    }
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(credentialId);
      req.onsuccess = () => resolve((req.result as CryptoKey) ?? null);
      req.onerror = () => reject(req.error);
    });
  }

  public static async deleteKey(credentialId: string): Promise<void> {
    if (!hasIndexedDb()) {
      memoryStore.delete(credentialId);
      return;
    }
    try {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(credentialId);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Ignore if database cannot be opened
    }
  }

  public static async clear(): Promise<void> {
    memoryStore.clear();
    if (!hasIndexedDb()) return;
    try {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Ignore
    }
  }
}
