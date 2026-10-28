import type { WrappedKey } from "./VaultCrypto";

export interface PasskeyWrap {
  readonly credentialId: string;
  readonly prfSalt?: string;
  readonly wrap: WrappedKey;
}

/**
 * VaultRecord - what is persisted about the encryption key. The random data key (DEK) never
 * leaves memory in clear text: it is stored only wrapped (AES-GCM) by a key derived from the
 * PIN, and optionally by a second key derived from a passkey (WebAuthn PRF).
 * Changing the PIN re-wraps the DEK; the encrypted data itself is untouched.
 */
export interface VaultRecord {
  readonly version: 1;
  readonly salt: string;
  readonly iterations: number;
  readonly pinWrap: WrappedKey;
  readonly passkey?: PasskeyWrap;
}

export interface IVaultStorage {
  load(): VaultRecord | null;
  save(record: VaultRecord): void;
  clear(): void;
}

const STORAGE_KEY = "mahak:vault";

function isWrappedKey(value: unknown): value is WrappedKey {
  const candidate = value as Partial<WrappedKey> | null;
  return typeof candidate?.iv === "string" && typeof candidate.data === "string";
}

function isVaultRecord(value: unknown): value is VaultRecord {
  const candidate = value as Partial<VaultRecord> | null;
  return (
    candidate?.version === 1 &&
    typeof candidate.salt === "string" &&
    typeof candidate.iterations === "number" &&
    isWrappedKey(candidate.pinWrap)
  );
}

export class LocalStorageVaultStorage implements IVaultStorage {
  public load(): VaultRecord | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      const parsed: unknown = JSON.parse(raw);
      return isVaultRecord(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  public save(record: VaultRecord): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  }

  public clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
