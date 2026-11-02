import type { BackupFingerprint } from "@domain/entities/CloudSync";
import { JsonBackupService, type BackupPayload } from "../backup/JsonBackupService";
import { hashSha256, stableStringify, deriveKey, encryptWithKey, decryptWithKey } from "./cloudCrypto";
import { CLOUD_CONFIG } from "./cloudConfig";
import { CloudSyncError } from "./CloudSyncError";
import type { CloudKeyVault } from "./CloudKeyVault";

export interface LocalSnapshot {
  payload: BackupPayload;
  fingerprint: BackupFingerprint;
}

export interface EncryptedCloudBackupContainer {
  format: "mahak-period-encrypted-backup";
  version: "1.0";
  algorithm: "AES-GCM";
  kdf: "PBKDF2";
  iterations: number;
  salt: string;
  iv: string;
  ciphertext: string;
  checksum: string;
  meta: {
    createdAt: string;
    itemsCount: number;
    contentHash?: string;
    source?: "manual" | "cloud";
  };
}

export class CloudBackupCodec {
  public constructor(private readonly vault: CloudKeyVault) {}

  public async snapshotLocal(): Promise<LocalSnapshot> {
    const payload = await JsonBackupService.exportAll();
    return { payload, fingerprint: await this.fingerprintOf(payload) };
  }

  public async fingerprintOf(payload: BackupPayload): Promise<BackupFingerprint> {
    const profiles = [...(payload.profiles || [])].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    const cycles = [...(payload.cycles || [])].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    const symptoms = [...(payload.symptoms || [])].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    const hamdelEntries = [...(payload.hamdelEntries || [])].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

    const contentHash = await hashSha256(
      stableStringify({ profiles, cycles, symptoms, hamdelEntries }),
    );
    const itemsCount = cycles.length + symptoms.length + (payload.hamdelEntries?.length || 0);
    return { contentHash, itemsCount };
  }

  public async serialize(snapshot: LocalSnapshot, encrypt: boolean): Promise<string> {
    const json = JSON.stringify(snapshot.payload);
    if (!encrypt) return json;

    const record = await this.vault.getKey();
    if (!record) {
      throw new CloudSyncError(
        "KEY_MISSING",
        "کلید رمزنگاری روی این دستگاه موجود نیست؛ رمزنگاری را دوباره فعال کنید.",
      );
    }

    const encrypted = await encryptWithKey(json, record.key);
    const container: EncryptedCloudBackupContainer = {
      format: "mahak-period-encrypted-backup",
      version: "1.0",
      algorithm: "AES-GCM",
      kdf: "PBKDF2",
      iterations: record.iterations,
      salt: record.saltHex,
      iv: encrypted.iv,
      ciphertext: encrypted.ciphertext,
      checksum: await hashSha256(json),
      meta: {
        createdAt: snapshot.payload.exportedAtIso,
        itemsCount: snapshot.fingerprint.itemsCount,
        contentHash: snapshot.fingerprint.contentHash,
        source: "cloud",
      },
    };
    return JSON.stringify(container);
  }

  public async open(content: string, passphrase?: string): Promise<BackupPayload> {
    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new CloudSyncError("INVALID_BACKUP", "فایل پشتیبان ابری آسیب دیده است.");
    }

    if (parsed.format !== "mahak-period-encrypted-backup") {
      if (Array.isArray(parsed.cycles) && Array.isArray(parsed.symptoms)) {
        return parsed as BackupPayload;
      }
      throw new CloudSyncError("INVALID_BACKUP", "فرمت فایل پشتیبان ابری معتبر نیست.");
    }

    const container = parsed as EncryptedCloudBackupContainer;
    const json = await this.decrypt(container, passphrase);
    if ((await hashSha256(json)) !== container.checksum) {
      throw new CloudSyncError("INVALID_BACKUP", "یکپارچگی فایل پشتیبان ابری تأیید نشد.");
    }
    return JSON.parse(json) as BackupPayload;
  }

  private async decrypt(
    container: EncryptedCloudBackupContainer,
    passphrase?: string,
  ): Promise<string> {
    if (!passphrase) {
      const record = await this.vault.getKey();
      const matches =
        !!record && record.saltHex === container.salt && record.iterations === container.iterations;
      if (!record || !matches) {
        throw new CloudSyncError("PASSPHRASE_REQUIRED", "برای باز کردن این پشتیبان، رمز عبور آن را وارد کنید.");
      }
      try {
        return await decryptWithKey(container.ciphertext, container.iv, record.key);
      } catch {
        throw new CloudSyncError("PASSPHRASE_REQUIRED", "برای باز کردن این پشتیبان، رمز عبور آن را وارد کنید.");
      }
    }

    if (passphrase.length < CLOUD_CONFIG.minPassphraseLength) {
      throw new CloudSyncError("PASSPHRASE_INVALID", "رمز عبور وارد شده کوتاه‌تر از حد مجاز است.");
    }

    const key = await deriveKey(passphrase, container.salt, container.iterations);
    try {
      const json = await decryptWithKey(container.ciphertext, container.iv, key);
      await this.vault.saveKey(key, container.salt, container.iterations);
      return json;
    } catch {
      throw new CloudSyncError("PASSPHRASE_INVALID", "رمز عبور اشتباه است یا فایل پشتیبان دستکاری شده است.");
    }
  }
}
