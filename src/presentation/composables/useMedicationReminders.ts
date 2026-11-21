import { computed, onBeforeUnmount, onMounted, shallowRef, watch } from "vue";
import { useHamdelStore } from "@application/stores/hamdelStore";
import { useMedicationLogStore } from "@application/stores/medicationLogStore";
import { MedicationSchedule, type DoseSlot } from "@domain/health/MedicationSchedule";

const TICK_MS = 30_000;
const LATE_NOTIFY_LIMIT_MINUTES = 60;
const MINUTES_PER_HOUR = 60;

function currentMinutes(): number {
  const now = new Date();
  return now.getHours() * MINUTES_PER_HOUR + now.getMinutes();
}

/** Reactive view of today's doses; updates every 30 seconds while the page is open. */
export function useMedicationReminders() {
  const hamdelStore = useHamdelStore();
  const logStore = useMedicationLogStore();
  const nowMinutes = shallowRef(currentMinutes());
  let timer: number | null = null;

  onMounted(() => {
    timer = window.setInterval(() => {
      nowMinutes.value = currentMinutes();
      logStore.syncDay();
    }, TICK_MS);
  });
  onBeforeUnmount(() => {
    if (timer !== null) window.clearInterval(timer);
  });

  const slots = computed(() => MedicationSchedule.slotsForToday(hamdelStore.entries));
  const dueNow = computed(() => MedicationSchedule.due(slots.value, nowMinutes.value, logStore.isTaken));

  return { slots, dueNow, nowMinutes, isTaken: logStore.isTaken, toggle: logStore.toggle };
}

async function showNotification(slot: DoseSlot): Promise<void> {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  const title = "یادآور دارو";
  const body = `${slot.name}${slot.dose ? ` — ${slot.dose}` : ""} (ساعت ${slot.time.replace(/\d/g, (digit) => Number(digit).toLocaleString("fa-IR"))})`;
  const registration = await navigator.serviceWorker?.getRegistration();
  if (registration) {
    await registration.showNotification(title, { body, tag: slot.key, icon: "/icons/icon-192.png" });
  } else {
    new Notification(title, { body, tag: slot.key });
  }
}

/**
 * Local notifications for due doses. This works only while the app is open or still alive in the background
 * (there is no push server), so the home page also lists missed doses.
 */
export function useMedicationNotifications(): void {
  const { dueNow, nowMinutes } = useMedicationReminders();
  const notified = new Set<string>();

  watch(
    dueNow,
    (doses) => {
      for (const slot of doses) {
        if (notified.has(slot.key) || nowMinutes.value - slot.minutes > LATE_NOTIFY_LIMIT_MINUTES) continue;
        notified.add(slot.key);
        void showNotification(slot);
      }
    },
    { immediate: true },
  );
}

export async function requestNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (typeof Notification === "undefined") return "unsupported";
  return Notification.requestPermission();
}
