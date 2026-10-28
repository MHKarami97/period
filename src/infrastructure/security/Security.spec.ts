import { describe, expect, it } from "vitest";
import { AUTO_LOCK_OPTIONS, shouldLockAfterAbsence } from "@domain/security/AutoLockPolicy";
import { cooldownSecondsAfter, validateNewSecret } from "@domain/security/SecretPolicy";
import { decryptBackup, encryptBackup, isEncryptedBackup } from "../backup/EncryptedBackup";
import { PlainJsonPayloadCodec } from "../hamdel/HamdelPayloadCodec";
import { EncryptedBytesCodec, EncryptedPayloadCodec } from "./EncryptedCodecs";
import { BackupPasswordRequiredError, InvalidSecretError, VaultLockedError } from "./errors";
import type { IPasskeyProvider } from "./PasskeyProvider";
import { decryptText, encryptText, importDataKey, isEncryptedBytes, isEncryptedText } from "./VaultCrypto";
import { VaultService } from "./VaultService";
import { VaultSession } from "./VaultSession";
import type { IVaultStorage, VaultRecord } from "./VaultStorage";

const TEST_ITERATIONS = 1_000;
const PIN = "correct horse";

class MemoryVaultStorage implements IVaultStorage {
  private record: VaultRecord | null = null;
  public load(): VaultRecord | null {
    return this.record;
  }
  public save(record: VaultRecord): void {
    this.record = record;
  }
  public clear(): void {
    this.record = null;
  }
}

/** Stands in for an authenticator: the same credential + salt always yields the same 32 bytes. */
class FakePasskeys implements IPasskeyProvider {
  private readonly output = crypto.getRandomValues(new Uint8Array(32));
  public async isSupported(): Promise<boolean> {
    return true;
  }
  public async enroll(): Promise<{ credentialId: string; prfOutput: ArrayBuffer }> {
    return { credentialId: "Y3JlZA==", prfOutput: this.output.slice().buffer as ArrayBuffer };
  }
  public async authenticate(): Promise<ArrayBuffer> {
    return this.output.slice().buffer as ArrayBuffer;
  }
}

function createVault(): { vault: VaultService; session: VaultSession; storage: MemoryVaultStorage } {
  const session = new VaultSession();
  const storage = new MemoryVaultStorage();
  return { vault: new VaultService(storage, session, new FakePasskeys(), TEST_ITERATIONS), session, storage };
}

describe("VaultCrypto", () => {
  it("round-trips text, uses a fresh IV every time and rejects tampering", async () => {
    const key = await importDataKey(crypto.getRandomValues(new Uint8Array(32)));
    const first = await encryptText(key, "سلام");
    const second = await encryptText(key, "سلام");
    expect(isEncryptedText(first)).toBe(true);
    expect(first).not.toBe(second);
    expect(await decryptText(key, first)).toBe("سلام");
    const tampered = first.slice(0, -4) + (first.endsWith("AAAA") ? "BBBB" : "AAAA");
    await expect(decryptText(key, tampered)).rejects.toThrow();
  });
});

describe("VaultService", () => {
  it("unlocks only with the right secret", async () => {
    const { vault } = createVault();
    await vault.create(PIN);
    expect(vault.isUnlocked).toBe(true);
    vault.lock();
    expect(vault.isUnlocked).toBe(false);
    await expect(vault.unlockWithSecret("wrong secret")).rejects.toBeInstanceOf(InvalidSecretError);
    await vault.unlockWithSecret(PIN);
    expect(vault.isUnlocked).toBe(true);
  });

  it("refuses weak secrets and a second vault", async () => {
    const { vault } = createVault();
    await expect(vault.create("123456")).rejects.toThrow();
    await vault.create(PIN);
    await expect(vault.create("another secret")).rejects.toThrow();
  });

  it("keeps old data readable after changing the secret", async () => {
    const { vault, session } = createVault();
    await vault.create(PIN);
    const codec = new EncryptedPayloadCodec(session);
    const payload = await codec.encode({ title: "راز" });

    await vault.changeSecret(PIN, "a brand new secret");
    vault.lock();
    await expect(vault.unlockWithSecret(PIN)).rejects.toBeInstanceOf(InvalidSecretError);
    await vault.unlockWithSecret("a brand new secret");
    expect(await codec.decode(payload)).toEqual({ title: "راز" });
  });

  it("unlocks with a passkey after enrolling it, and forgets it when removed", async () => {
    const { vault, session } = createVault();
    await vault.create(PIN);
    const codec = new EncryptedPayloadCodec(session);
    const payload = await codec.encode({ title: "راز" });

    await vault.enrollPasskey(PIN);
    expect(vault.hasPasskey()).toBe(true);
    vault.lock();
    await vault.unlockWithPasskey();
    expect(await codec.decode(payload)).toEqual({ title: "راز" });

    vault.removePasskey();
    expect(vault.hasPasskey()).toBe(false);
    await expect(vault.unlockWithPasskey()).rejects.toThrow();
  });

  it("unlocks with standard device fingerprint without PRF extension", async () => {
    class FakeDeviceFingerprint implements IPasskeyProvider {
      public async isSupported(): Promise<boolean> {
        return true;
      }
      public async enroll(): Promise<{ credentialId: string; prfOutput?: ArrayBuffer }> {
        return { credentialId: "ZmluZ2VycHJpbnQ=" };
      }
      public async authenticate(): Promise<ArrayBuffer | null> {
        return null;
      }
    }
    const session = new VaultSession();
    const storage = new MemoryVaultStorage();
    const vault = new VaultService(storage, session, new FakeDeviceFingerprint(), TEST_ITERATIONS);

    await vault.create(PIN);
    const codec = new EncryptedPayloadCodec(session);
    const payload = await codec.encode({ title: "یادداشت امن" });

    await vault.enrollPasskey(PIN);
    expect(vault.hasPasskey()).toBe(true);
    vault.lock();
    expect(vault.isUnlocked).toBe(false);

    await vault.unlockWithPasskey();
    expect(vault.isUnlocked).toBe(true);
    expect(await codec.decode(payload)).toEqual({ title: "یادداشت امن" });

    vault.removePasskey();
    expect(vault.hasPasskey()).toBe(false);
  });

  it("destroy forgets the vault", async () => {
    const { vault } = createVault();
    await vault.create(PIN);
    vault.destroy();
    expect(vault.hasVault()).toBe(false);
    expect(vault.isUnlocked).toBe(false);
  });
});

describe("encrypted codecs", () => {
  it("cannot be used while locked, but still reads legacy plain data", async () => {
    const { vault, session } = createVault();
    await vault.create(PIN);
    const codec = new EncryptedPayloadCodec(session);
    const payload = await codec.encode({ title: "راز" });
    expect(payload.startsWith("enc1:")).toBe(true);
    expect(payload).not.toContain("راز");

    vault.lock();
    await expect(codec.decode(payload)).rejects.toBeInstanceOf(VaultLockedError);
    const legacy = await new PlainJsonPayloadCodec().encode({ title: "قدیمی" });
    expect(await codec.decode(legacy)).toEqual({ title: "قدیمی" });
  });

  it("encrypts photo bytes and passes plain bytes through", async () => {
    const { vault, session } = createVault();
    await vault.create(PIN);
    const codec = new EncryptedBytesCodec(session);
    const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 4]).buffer as ArrayBuffer;

    const encrypted = await codec.encode(jpeg);
    expect(isEncryptedBytes(encrypted)).toBe(true);
    expect(isEncryptedBytes(jpeg)).toBe(false);
    expect(new Uint8Array(await codec.decode(encrypted))).toEqual(new Uint8Array(jpeg));
    expect(await codec.decode(jpeg)).toBe(jpeg);
  });
});

describe("encrypted backup", () => {
  const json = JSON.stringify({ cycles: [], symptoms: [], note: "خصوصی" });

  it("round-trips with the right password", async () => {
    const encrypted = await encryptBackup(json, "backup password", TEST_ITERATIONS);
    expect(isEncryptedBackup(encrypted)).toBe(true);
    expect(encrypted).not.toContain("خصوصی");
    expect(await decryptBackup(encrypted, "backup password")).toBe(json);
  });

  it("rejects a wrong or missing password", async () => {
    const encrypted = await encryptBackup(json, "backup password", TEST_ITERATIONS);
    await expect(decryptBackup(encrypted, "nope nope")).rejects.toBeInstanceOf(InvalidSecretError);
    await expect(decryptBackup(encrypted, undefined)).rejects.toBeInstanceOf(BackupPasswordRequiredError);
  });

  it("does not mistake an ordinary backup for an encrypted one", () => {
    expect(isEncryptedBackup(json)).toBe(false);
    expect(isEncryptedBackup("not json")).toBe(false);
  });
});

describe("policies", () => {
  it("validates new secrets", () => {
    expect(validateNewSecret("12345")).not.toBeNull();
    expect(validateNewSecret("111111")).not.toBeNull();
    expect(validateNewSecret("123456")).not.toBeNull();
    expect(validateNewSecret("739204")).toBeNull();
    expect(validateNewSecret("a long passphrase")).toBeNull();
  });

  it("slows down repeated wrong attempts", () => {
    expect([1, 4, 5, 6, 7, 8, 9, 20].map(cooldownSecondsAfter)).toEqual([0, 0, 5, 10, 20, 40, 60, 60]);
  });

  it("decides auto-lock after absence", () => {
    expect(shouldLockAfterAbsence(0, 0)).toBe(true);
    expect(shouldLockAfterAbsence(59_000, 1)).toBe(false);
    expect(shouldLockAfterAbsence(60_000, 1)).toBe(true);
    expect(AUTO_LOCK_OPTIONS.map((option) => option.minutes)).toContain(5);
  });
});
