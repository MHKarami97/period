import { defineStore } from "pinia";
import { computed, ref } from "vue";
import {
  AUTO_LOCK_OPTIONS,
  DEFAULT_AUTO_LOCK_MINUTES,
  isValidAutoLockMinutes,
} from "@domain/security/AutoLockPolicy";
import { cooldownSecondsAfter } from "@domain/security/SecretPolicy";
import { InvalidSecretError } from "@infrastructure/security/errors";
import { hamdelEncryptionMigrator } from "@infrastructure/security/HamdelEncryptionMigrator";
import { usePlainCodecs, useEncryptedCodecs } from "@infrastructure/security/installSecurity";
import { requestPersistentStorage } from "@infrastructure/security/StoragePersistence";
import { vaultService } from "@infrastructure/security/VaultService";
import { useHamdelStore } from "./hamdelStore";

const AUTO_LOCK_KEY = "mahak:autolock-minutes";
const MS_PER_SECOND = 1000;

function loadAutoLockMinutes(): number {
  const stored = Number(localStorage.getItem(AUTO_LOCK_KEY));
  return localStorage.getItem(AUTO_LOCK_KEY) !== null && isValidAutoLockMinutes(stored) ? stored : DEFAULT_AUTO_LOCK_MINUTES;
}

function messageOf(error: unknown, fallback: string): string {
  if (error instanceof DOMException && error.name === "NotAllowedError") return "عملیات لغو شد یا زمان آن تمام شد.";
  return error instanceof Error && error.message ? error.message : fallback;
}

/**
 * lockStore - Application Service for the app lock.
 * "Enabled" means a vault exists and the Hamdel notebook is encrypted at rest; "locked" means the
 * data key is not in memory, so the UI shows the lock screen and decrypted data is dropped.
 */
export const useLockStore = defineStore("lock", () => {
  const isEnabled = ref(vaultService.hasVault());
  const isLocked = ref(isEnabled.value);
  const hasPasskey = ref(vaultService.hasPasskey());
  const autoLockMinutes = ref(loadAutoLockMinutes());
  const failedAttempts = ref(0);
  const cooldownUntil = ref(0);
  const isBusy = ref(false);
  const progress = ref<{ done: number; total: number } | null>(null);
  const error = ref<string | null>(null);

  const isCoolingDown = computed(() => Date.now() < cooldownUntil.value);

  function reportProgress(done: number, total: number): void {
    progress.value = { done, total };
  }

  async function run<T>(task: () => Promise<T>, fallbackMessage: string): Promise<T | null> {
    error.value = null;
    isBusy.value = true;
    try {
      return await task();
    } catch (cause) {
      error.value = cause instanceof InvalidSecretError ? cause.message : messageOf(cause, fallbackMessage);
      return null;
    } finally {
      isBusy.value = false;
      progress.value = null;
    }
  }

  function registerFailure(): void {
    failedAttempts.value += 1;
    const seconds = cooldownSecondsAfter(failedAttempts.value);
    cooldownUntil.value = seconds > 0 ? Date.now() + seconds * MS_PER_SECOND : 0;
  }

  function markUnlocked(): void {
    isLocked.value = false;
    failedAttempts.value = 0;
    cooldownUntil.value = 0;
  }

  async function unlockWithSecret(secret: string): Promise<boolean> {
    if (isCoolingDown.value) {
      error.value = "چند ثانیه صبر کنید و دوباره تلاش کنید.";
      return false;
    }
    error.value = null;
    isBusy.value = true;
    try {
      await vaultService.unlockWithSecret(secret);
      markUnlocked();
      return true;
    } catch (cause) {
      if (cause instanceof InvalidSecretError) registerFailure();
      error.value = messageOf(cause, "باز کردن قفل ناموفق بود.");
      return false;
    } finally {
      isBusy.value = false;
    }
  }

  async function unlockWithPasskey(): Promise<boolean> {
    const done = await run(async () => {
      await vaultService.unlockWithPasskey();
      return true;
    }, "باز کردن قفل با بایومتریک ناموفق بود.");
    if (done) markUnlocked();
    return done === true;
  }

  function lock(): void {
    if (!isEnabled.value) return;
    vaultService.lock();
    useHamdelStore().clear();
    isLocked.value = true;
  }

  /** Creates the vault and encrypts everything already stored. */
  async function enable(secret: string): Promise<boolean> {
    const done = await run(async () => {
      await vaultService.create(secret);
      useEncryptedCodecs();
      isEnabled.value = true;
      hasPasskey.value = false;
      await hamdelEncryptionMigrator.migrate("encrypt", reportProgress);
      void requestPersistentStorage();
      return true;
    }, "فعال‌سازی قفل ناموفق بود.");
    return done === true;
  }

  /** Re-runs the (idempotent) conversion, e.g. after an interrupted enable. */
  async function encryptAgain(): Promise<boolean> {
    const done = await run(async () => {
      await hamdelEncryptionMigrator.migrate("encrypt", reportProgress);
      return true;
    }, "رمزنگاری مجدد ناموفق بود.");
    return done === true;
  }

  /** Decrypts everything back to plain form and removes the vault. Needs the current secret. */
  async function disable(secret: string): Promise<boolean> {
    const done = await run(async () => {
      await vaultService.verifySecret(secret);
      await hamdelEncryptionMigrator.migrate("decrypt", reportProgress);
      usePlainCodecs();
      vaultService.destroy();
      isEnabled.value = false;
      hasPasskey.value = false;
      return true;
    }, "غیرفعال‌سازی قفل ناموفق بود.");
    return done === true;
  }

  async function changeSecret(currentSecret: string, newSecret: string): Promise<boolean> {
    const done = await run(async () => {
      await vaultService.changeSecret(currentSecret, newSecret);
      return true;
    }, "تغییر رمز ناموفق بود.");
    return done === true;
  }

  async function enablePasskey(secret: string): Promise<boolean> {
    const done = await run(async () => {
      await vaultService.enrollPasskey(secret);
      hasPasskey.value = true;
      return true;
    }, "فعال‌سازی بایومتریک ناموفق بود.");
    return done === true;
  }

  function disablePasskey(): void {
    vaultService.removePasskey();
    hasPasskey.value = false;
  }

  function setAutoLockMinutes(minutes: number): void {
    if (!isValidAutoLockMinutes(minutes)) return;
    autoLockMinutes.value = minutes;
    localStorage.setItem(AUTO_LOCK_KEY, String(minutes));
  }

  return {
    isEnabled,
    isLocked,
    hasPasskey,
    autoLockMinutes,
    failedAttempts,
    cooldownUntil,
    isCoolingDown,
    isBusy,
    progress,
    error,
    autoLockOptions: AUTO_LOCK_OPTIONS,
    unlockWithSecret,
    unlockWithPasskey,
    lock,
    enable,
    encryptAgain,
    disable,
    changeSecret,
    enablePasskey,
    disablePasskey,
    setAutoLockMinutes,
  };
});
