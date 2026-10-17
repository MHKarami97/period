import { defineStore } from "pinia";
import { computed, ref, shallowRef } from "vue";
import {
  FetchHttpClient,
  TelegramLinkService,
  type TelegramLinkState,
} from "@infrastructure/telegram/TelegramLinkService";
import { MahakReminderApiClient } from "@infrastructure/telegram/MahakReminderApiClient";
import { MahakReminderPlanner } from "@domain/services/MahakReminderPlanner";
import type { Cycle } from "@domain/entities/Cycle";

const telegramLinkService = new TelegramLinkService();
const reminderGateway = new MahakReminderApiClient(
  new FetchHttpClient(),
  () => telegramLinkService.getStoredCode(),
);

export const useTelegramReminderStore = defineStore("telegramReminder", () => {
  const state = shallowRef<TelegramLinkState>(telegramLinkService.isEnabled() ? "pending" : "disabled");
  const username = ref<string | null>(null);
  const isWorking = shallowRef(false);
  const error = ref<string | null>(null);

  const isEnabled = computed(() => state.value !== "disabled" && state.value !== "unconfigured");
  const isLinked = computed(() => state.value === "linked");
  const botUrl = computed(() => {
    const code = telegramLinkService.getStoredCode();
    return code ? telegramLinkService.getBotUrl(code) : "";
  });

  async function initialize(): Promise<void> {
    if (!telegramLinkService.isConfigured()) { state.value = "unconfigured"; return; }
    if (!telegramLinkService.isEnabled()) { state.value = "disabled"; return; }
    await refreshStatus();
  }

  async function refreshStatus(): Promise<void> {
    try {
      const status = await telegramLinkService.getLinkStatus();
      username.value = status.username;
      state.value = status.linked ? "linked" : "pending";
    } catch {
      state.value = telegramLinkService.isEnabled() ? "pending" : "disabled";
    }
  }

  async function enable(): Promise<void> {
    error.value = null;
    if (!telegramLinkService.isConfigured()) { state.value = "unconfigured"; return; }
    telegramLinkService.enable();
    state.value = "pending";
    await refreshStatus();
  }

  async function waitForLink(): Promise<void> {
    error.value = null;
    isWorking.value = true;
    try {
      const status = await telegramLinkService.waitForLink((next) => { state.value = next; });
      username.value = status.username;
      state.value = status.linked ? "linked" : "pending";
      if (!status.linked) error.value = "اتصال تأیید نشد؛ مطمئن شوید در بات Start را زده‌اید.";
    } catch {
      error.value = "بررسی وضعیت اتصال ناموفق بود. دوباره تلاش کنید.";
    } finally { isWorking.value = false; }
  }

  async function syncReminders(cycles: readonly Cycle[]): Promise<void> {
    if (!isLinked.value) return;
    await reminderGateway.sync(MahakReminderPlanner.plan(cycles));
  }

  async function disable(): Promise<void> {
    error.value = null;
    isWorking.value = true;
    try { await reminderGateway.unlink(); }
    catch {
      error.value = "قطع اتصال در سرور ناموفق بود؛ دوباره تلاش کنید.";
      return;
    } finally { isWorking.value = false; }
    telegramLinkService.disable();
    username.value = null;
    state.value = "disabled";
  }

  return {
    state, username, isWorking, error, isEnabled, isLinked, botUrl,
    initialize, refreshStatus, enable, waitForLink, syncReminders, disable,
  };
});
