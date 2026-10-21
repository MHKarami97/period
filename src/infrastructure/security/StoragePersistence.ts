export interface StorageStatus {
  readonly isSupported: boolean;
  readonly isPersisted: boolean;
  readonly usageBytes: number | null;
  readonly quotaBytes: number | null;
}

/**
 * Wraps navigator.storage (MDN: StorageManager). A persistent origin is not cleared by the
 * browser under storage pressure; the browser may refuse, and some only grant it after engagement.
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (!navigator.storage?.persist) return false;
  try {
    return (await navigator.storage.persisted()) || (await navigator.storage.persist());
  } catch {
    return false;
  }
}

export async function readStorageStatus(): Promise<StorageStatus> {
  if (!navigator.storage) {
    return { isSupported: false, isPersisted: false, usageBytes: null, quotaBytes: null };
  }
  const [isPersisted, estimate] = await Promise.all([
    navigator.storage.persisted?.().catch(() => false) ?? Promise.resolve(false),
    navigator.storage.estimate?.().catch(() => undefined) ?? Promise.resolve(undefined),
  ]);
  return { isSupported: true, isPersisted, usageBytes: estimate?.usage ?? null, quotaBytes: estimate?.quota ?? null };
}
