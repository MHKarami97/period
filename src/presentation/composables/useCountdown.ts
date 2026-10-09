import { computed, onScopeDispose, ref } from "vue";

const TICK_INTERVAL_MS = 250;

/**
 * useCountdown - drift-free countdown (based on Date.now, so it stays correct
 * even if the browser throttles timers in a background tab). The interval is
 * cleared automatically when the owning component is unmounted.
 */
export function useCountdown(onFinished: () => void) {
  const remainingMs = ref(0);
  const totalMs = ref(0);
  const isRunning = ref(false);
  let endTimestamp = 0;
  let intervalId: number | null = null;

  const label = computed(() => {
    const totalSeconds = Math.ceil(remainingMs.value / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  });

  const progressRatio = computed(() => (totalMs.value === 0 ? 0 : 1 - remainingMs.value / totalMs.value));

  function clear(): void {
    if (intervalId !== null) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
  }

  function stop(): void {
    clear();
    isRunning.value = false;
  }

  function tick(): void {
    const left = endTimestamp - Date.now();
    if (left <= 0) {
      remainingMs.value = 0;
      stop();
      onFinished();
      return;
    }
    remainingMs.value = left;
  }

  function start(durationSeconds: number): void {
    clear();
    totalMs.value = durationSeconds * 1000;
    remainingMs.value = totalMs.value;
    endTimestamp = Date.now() + totalMs.value;
    isRunning.value = true;
    intervalId = window.setInterval(tick, TICK_INTERVAL_MS);
  }

  onScopeDispose(clear);

  return { label, progressRatio, isRunning, start, stop };
}
