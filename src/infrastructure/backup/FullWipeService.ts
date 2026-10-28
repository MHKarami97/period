import { BiometricKeyStorage } from "../security/BiometricKeyStorage";
import { vaultSession } from "../security/VaultSession";
import { DatabaseResetService } from "./DatabaseResetService";

/**
 * FullWipeService - removes EVERYTHING this app stored on the device, not just the database:
 * all tables (including Hamdel notes and photos), the encryption vault, every localStorage key
 * (link code, names, theme, ...), sessionStorage, the offline caches and the service worker.
 * Telegram reminders on the server must be unlinked by the caller BEFORE this runs, because the
 * link code is erased here.
 */
export class FullWipeService {
  public static async wipeEverything(): Promise<void> {
    await DatabaseResetService.resetAll();
    await BiometricKeyStorage.clear();
    vaultSession.clear();
    localStorage.clear();
    sessionStorage.clear();

    if ("caches" in window) {
      const names = await caches.keys();
      await Promise.all(names.map((name) => caches.delete(name)));
    }
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }
  }
}
