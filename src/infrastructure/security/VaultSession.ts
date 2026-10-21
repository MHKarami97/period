import { VaultLockedError } from "./errors";

/** Holds the unlocked data key in memory only. Locking drops the reference. */
export class VaultSession {
  private key: CryptoKey | null = null;

  public get isUnlocked(): boolean {
    return this.key !== null;
  }

  public set(key: CryptoKey): void {
    this.key = key;
  }

  public clear(): void {
    this.key = null;
  }

  public requireKey(): CryptoKey {
    if (!this.key) {
      throw new VaultLockedError();
    }
    return this.key;
  }
}

export const vaultSession = new VaultSession();
