import { validateNewSecret } from "@domain/security/SecretPolicy";
import { fromBase64, toBase64 } from "./encoding";
import { InvalidSecretError, PasskeyUnsupportedError } from "./errors";
import { WebAuthnPasskeyProvider, type IPasskeyProvider } from "./PasskeyProvider";
import {
  DEFAULT_PBKDF2_ITERATIONS,
  deriveKeyFromPrf,
  deriveKeyFromSecret,
  generateBiometricDeviceKey,
  generateDataKeyBytes,
  importDataKey,
  randomBytes,
  unwrapBytes,
  wrapBytes,
} from "./VaultCrypto";
import { BiometricKeyStorage } from "./BiometricKeyStorage";
import { LocalStorageVaultStorage, type IVaultStorage, type VaultRecord } from "./VaultStorage";
import { vaultSession, type VaultSession } from "./VaultSession";

const SALT_BYTES = 16;
const PRF_SALT_BYTES = 32;

/**
 * VaultService - key management for the encrypted notebook.
 *
 *  - A random 256-bit data key (DEK) encrypts the data (AES-GCM).
 *  - The DEK is stored only in wrapped form: wrapped by a key derived from the PIN (PBKDF2),
 *    and optionally by a key derived from a passkey (WebAuthn PRF).
 *  - A wrong PIN fails the AES-GCM authentication tag, which doubles as PIN verification.
 *  - The unlocked DEK is a non-extractable CryptoKey that only lives in `VaultSession`.
 */
export class VaultService {
  public constructor(
    private readonly storage: IVaultStorage = new LocalStorageVaultStorage(),
    private readonly session: VaultSession = vaultSession,
    private readonly passkeys: IPasskeyProvider = new WebAuthnPasskeyProvider(),
    private readonly iterations: number = DEFAULT_PBKDF2_ITERATIONS,
  ) {}

  public hasVault(): boolean {
    return this.storage.load() !== null;
  }

  public hasPasskey(): boolean {
    return this.storage.load()?.passkey !== undefined;
  }

  public get isUnlocked(): boolean {
    return this.session.isUnlocked;
  }

  public isPasskeySupported(): Promise<boolean> {
    return this.passkeys.isSupported();
  }

  /** Creates a new vault protected by `secret` and leaves it unlocked. */
  public async create(secret: string): Promise<void> {
    const problem = validateNewSecret(secret);
    if (problem) throw new Error(problem);
    if (this.hasVault()) throw new Error("Vault already exists.");

    const dataKey = generateDataKeyBytes();
    const salt = randomBytes(SALT_BYTES);
    const kek = await deriveKeyFromSecret(secret, salt, this.iterations);
    this.storage.save({
      version: 1,
      salt: toBase64(salt),
      iterations: this.iterations,
      pinWrap: await wrapBytes(kek, dataKey),
    });
    this.session.set(await importDataKey(dataKey));
    dataKey.fill(0);
  }

  public async unlockWithSecret(secret: string): Promise<void> {
    const dataKey = await this.unwrapWithSecret(secret);
    this.session.set(await importDataKey(dataKey));
    dataKey.fill(0);
  }

  public async unlockWithPasskey(): Promise<void> {
    const passkey = this.requireRecord().passkey;
    if (!passkey) throw new PasskeyUnsupportedError("حسگر اثرانگشت برای این برنامه فعال نشده است.");
    const prfSalt = passkey.prfSalt ? fromBase64(passkey.prfSalt) : undefined;
    const output = await this.passkeys.authenticate(passkey.credentialId, prfSalt);
    let kek: CryptoKey;
    if (output) {
      kek = await deriveKeyFromPrf(output);
    } else {
      const bioKey = await BiometricKeyStorage.loadKey(passkey.credentialId);
      if (!bioKey) {
        throw new PasskeyUnsupportedError("اطلاعات حسگر اثرانگشت روی این دستگاه یافت نشد. لطفاً با رمز وارد شوید.");
      }
      kek = bioKey;
    }
    const dataKey = await this.unwrapOrThrow(kek, passkey.wrap);
    this.session.set(await importDataKey(dataKey));
    dataKey.fill(0);
  }

  /** Re-wraps the data key under a new secret. Existing encrypted data is not touched. */
  public async changeSecret(currentSecret: string, newSecret: string): Promise<void> {
    const problem = validateNewSecret(newSecret);
    if (problem) throw new Error(problem);
    const record = this.requireRecord();
    const dataKey = await this.unwrapWithSecret(currentSecret);
    const salt = randomBytes(SALT_BYTES);
    const kek = await deriveKeyFromSecret(newSecret, salt, this.iterations);
    this.storage.save({ ...record, salt: toBase64(salt), iterations: this.iterations, pinWrap: await wrapBytes(kek, dataKey) });
    dataKey.fill(0);
  }

  /** Checks a secret without changing the lock state. */
  public async verifySecret(secret: string): Promise<void> {
    (await this.unwrapWithSecret(secret)).fill(0);
  }

  public async enrollPasskey(secret: string): Promise<void> {
    const record = this.requireRecord();
    const dataKey = await this.unwrapWithSecret(secret);
    const prfSalt = randomBytes(PRF_SALT_BYTES);
    const enrollment = await this.passkeys.enroll(prfSalt);
    if (enrollment.prfOutput) {
      const kek = await deriveKeyFromPrf(enrollment.prfOutput);
      this.storage.save({
        ...record,
        passkey: { credentialId: enrollment.credentialId, prfSalt: toBase64(prfSalt), wrap: await wrapBytes(kek, dataKey) },
      });
    } else {
      const bioKey = await generateBiometricDeviceKey();
      await BiometricKeyStorage.saveKey(enrollment.credentialId, bioKey);
      this.storage.save({
        ...record,
        passkey: { credentialId: enrollment.credentialId, wrap: await wrapBytes(bioKey, dataKey) },
      });
    }
    dataKey.fill(0);
  }

  public removePasskey(): void {
    const record = this.requireRecord();
    if (record.passkey) {
      void BiometricKeyStorage.deleteKey(record.passkey.credentialId);
    }
    const { passkey: _removed, ...rest } = record;
    this.storage.save(rest);
  }

  public lock(): void {
    this.session.clear();
  }

  /** Forgets the vault entirely. Only call after the data has been decrypted back to plain text. */
  public destroy(): void {
    const record = this.storage.load();
    if (record?.passkey) {
      void BiometricKeyStorage.deleteKey(record.passkey.credentialId);
    }
    this.session.clear();
    this.storage.clear();
  }

  private requireRecord(): VaultRecord {
    const record = this.storage.load();
    if (!record) throw new Error("Vault does not exist.");
    return record;
  }

  private async unwrapWithSecret(secret: string): Promise<Uint8Array> {
    const record = this.requireRecord();
    const kek = await deriveKeyFromSecret(secret, fromBase64(record.salt), record.iterations);
    return this.unwrapOrThrow(kek, record.pinWrap);
  }

  private async unwrapOrThrow(kek: CryptoKey, wrapped: VaultRecord["pinWrap"]): Promise<Uint8Array> {
    try {
      return await unwrapBytes(kek, wrapped);
    } catch {
      throw new InvalidSecretError();
    }
  }
}

export const vaultService = new VaultService();
