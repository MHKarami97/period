import { onBeforeUnmount, onMounted, watch } from "vue";
import { useLockStore } from "@application/stores/lockStore";
import { shouldLockAfterAbsence } from "@domain/security/AutoLockPolicy";

const MS_PER_MINUTE = 60_000;
const ACTIVITY_EVENTS: readonly string[] = ["pointerdown", "keydown", "touchstart", "scroll"];

/**
 * Locks the app after inactivity, and when it comes back from the background after the chosen time.
 * Timers are throttled in background tabs, so the "away too long" check on visibility change is the
 * reliable part; the idle timer covers the case where the app stays open and untouched.
 */
export function useAutoLock(): void {
  const lock = useLockStore();
  let timerId: number | null = null;
  let hiddenAt: number | null = null;

  function disarm(): void {
    if (timerId !== null) {
      window.clearTimeout(timerId);
      timerId = null;
    }
  }

  function arm(): void {
    disarm();
    if (!lock.isEnabled || lock.isLocked || lock.autoLockMinutes <= 0) return;
    timerId = window.setTimeout(() => lock.lock(), lock.autoLockMinutes * MS_PER_MINUTE);
  }

  function onVisibilityChange(): void {
    if (!lock.isEnabled || lock.isLocked) return;
    if (document.hidden) {
      hiddenAt = Date.now();
      if (lock.autoLockMinutes <= 0) lock.lock();
      return;
    }
    if (hiddenAt !== null && shouldLockAfterAbsence(Date.now() - hiddenAt, lock.autoLockMinutes)) {
      lock.lock();
    }
    hiddenAt = null;
    arm();
  }

  onMounted(() => {
    ACTIVITY_EVENTS.forEach((name) => window.addEventListener(name, arm, { passive: true }));
    document.addEventListener("visibilitychange", onVisibilityChange);
  });

  onBeforeUnmount(() => {
    ACTIVITY_EVENTS.forEach((name) => window.removeEventListener(name, arm));
    document.removeEventListener("visibilitychange", onVisibilityChange);
    disarm();
  });

  watch(() => [lock.isEnabled, lock.isLocked, lock.autoLockMinutes], arm, { immediate: true });
}
