import { defineStore } from "pinia";
import { ref } from "vue";

const KEY_PREFIX = "mahak:med-taken:";

function todayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function load(dayIso: string): Set<string> {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(`${KEY_PREFIX}${dayIso}`) ?? "[]");
    return new Set(Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : []);
  } catch {
    return new Set<string>();
  }
}

/**
 * medicationLogStore - which of today's medication doses were taken. Only the current day is kept
 * on this device (older days are removed), so the log never grows.
 */
export const useMedicationLogStore = defineStore("medicationLog", () => {
  const dayIso = ref(todayIso());
  const taken = ref<Set<string>>(load(dayIso.value));

  function syncDay(): void {
    const current = todayIso();
    if (current === dayIso.value) return;
    localStorage.removeItem(`${KEY_PREFIX}${dayIso.value}`);
    dayIso.value = current;
    taken.value = load(current);
  }

  function isTaken(key: string): boolean {
    return taken.value.has(key);
  }

  function toggle(key: string): void {
    syncDay();
    const next = new Set(taken.value);
    if (!next.delete(key)) next.add(key);
    taken.value = next;
    try {
      localStorage.setItem(`${KEY_PREFIX}${dayIso.value}`, JSON.stringify([...next]));
    } catch {
      // storage unavailable: the tick stays for this session only
    }
  }

  return { taken, isTaken, toggle, syncDay };
});
