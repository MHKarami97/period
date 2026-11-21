<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { useHamdelStore } from "@application/stores/hamdelStore";
import { DateOnly } from "@domain/valueObjects/DateOnly";
import { requestNotificationPermission, useMedicationReminders } from "@presentation/composables/useMedicationReminders";
import { useJalali } from "@presentation/composables/useJalali";

const hamdelStore = useHamdelStore();
const { toJalaliLabel } = useJalali();
const { slots, dueNow, isTaken, toggle } = useMedicationReminders();

const permission = ref<NotificationPermission | "unsupported">(typeof Notification === "undefined" ? "unsupported" : Notification.permission);

onMounted(() => void hamdelStore.ensureLoaded());

const SECTIONS = [
  { id: "appointments", label: "وقت پزشک", icon: "🩺" },
  { id: "labs", label: "آزمایش‌ها", icon: "🧪" },
  { id: "medications", label: "داروها", icon: "💊" },
  { id: "pregnancy", label: "بارداری", icon: "🤰" },
] as const;

const upcomingAppointments = computed(() => {
  const today = DateOnly.today().toIsoString();
  return hamdelStore
    .entriesOf("appointments")
    .filter((entry) => entry.valueOf("status") === "upcoming" && entry.valueOf("date") >= today)
    .sort((left, right) => (left.valueOf("date") < right.valueOf("date") ? -1 : 1))
    .slice(0, 3);
});

const faTime = (time: string): string => time.replace(/\d/g, (digit) => Number(digit).toLocaleString("fa-IR"));

async function askPermission(): Promise<void> {
  permission.value = await requestNotificationPermission();
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <section class="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <div class="flex items-center justify-between gap-2">
        <h2 class="text-base font-medium text-slate-900 dark:text-slate-100">دوزهای امروز</h2>
        <span v-if="dueNow.length > 0" class="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">{{ dueNow.length.toLocaleString("fa-IR") }} دوز عقب‌افتاده</span>
      </div>

      <p v-if="slots.length === 0" class="text-sm leading-6 text-slate-500 dark:text-slate-400">
        هنوز دارویی با ساعت مصرف ثبت نشده است. در «داروها» نام و ساعت‌ها (مثل 08:00, 20:00) را بنویس.
      </p>
      <ul v-else class="flex flex-col gap-2">
        <li v-for="slot in slots" :key="slot.key">
          <label class="flex cursor-pointer items-center gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200/70 dark:bg-slate-800/60 dark:ring-slate-700/60">
            <input type="checkbox" class="h-4 w-4 accent-emerald-500" :checked="isTaken(slot.key)" @change="toggle(slot.key)" />
            <span class="flex min-w-0 flex-1 flex-col">
              <span class="text-sm font-bold" :class="isTaken(slot.key) ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-slate-100'">{{ slot.name }}</span>
              <span v-if="slot.dose" class="text-xs text-slate-500 dark:text-slate-400">{{ slot.dose }}</span>
            </span>
            <span class="text-xs font-semibold text-slate-600 dark:text-slate-300" dir="ltr">{{ faTime(slot.time) }}</span>
          </label>
        </li>
      </ul>

      <div v-if="permission !== 'unsupported'" class="flex flex-col gap-1.5 rounded-2xl bg-sky-50 p-3 text-xs leading-5 text-sky-900 ring-1 ring-sky-200/80 dark:bg-sky-500/10 dark:text-sky-100 dark:ring-sky-500/25">
        <template v-if="permission === 'granted'">🔔 اعلان دارو فعال است. فقط وقتی برنامه باز یا در پس‌زمینه‌ی دستگاه زنده باشد کار می‌کند (سرور اعلان ندارد).</template>
        <template v-else-if="permission === 'denied'">اعلان برای این برنامه در مرورگر بسته شده؛ از تنظیمات مرورگر یا دستگاه باید باز شود.</template>
        <template v-else>
          <span>برای یادآوری ساعت مصرف، اجازه‌ی اعلان بده. اعلان فقط وقتی برنامه باز یا در پس‌زمینه زنده است نمایش داده می‌شود.</span>
          <button type="button" class="self-start rounded-xl bg-sky-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-sky-700 active:scale-95" @click="askPermission">فعال‌سازی اعلان</button>
        </template>
      </div>
    </section>

    <section class="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <h2 class="text-base font-medium text-slate-900 dark:text-slate-100">ویزیت‌های پیش‌رو</h2>
      <p v-if="upcomingAppointments.length === 0" class="text-sm text-slate-500 dark:text-slate-400">ویزیتی ثبت نشده است.</p>
      <ul v-else class="flex flex-col gap-2">
        <li v-for="entry in upcomingAppointments" :key="entry.id" class="flex items-center justify-between gap-2 rounded-2xl bg-slate-50 p-3 text-sm ring-1 ring-slate-200/70 dark:bg-slate-800/60 dark:ring-slate-700/60">
          <span class="truncate font-bold text-slate-900 dark:text-slate-100">🩺 {{ entry.valueOf("title") }}</span>
          <span class="shrink-0 text-xs text-slate-500 dark:text-slate-400">{{ toJalaliLabel(DateOnly.fromIsoString(entry.valueOf("date"))) }}</span>
        </li>
      </ul>
    </section>

    <section class="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <h2 class="text-base font-medium text-slate-900 dark:text-slate-100">دفترچه‌ی سلامت</h2>
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <RouterLink
          v-for="section in SECTIONS"
          :key="section.id"
          :to="{ name: 'hamdel-section', params: { section: section.id } }"
          class="flex flex-col items-center gap-1 rounded-2xl bg-slate-50 p-3 text-center ring-1 ring-slate-200/70 transition hover:ring-teal-400 active:scale-95 dark:bg-slate-800/60 dark:ring-slate-700/60"
        >
          <span class="text-2xl" aria-hidden="true">{{ section.icon }}</span>
          <span class="text-xs font-bold text-slate-700 dark:text-slate-200">{{ section.label }}</span>
          <span class="text-[11px] text-slate-400">{{ hamdelStore.countOf(section.id).toLocaleString("fa-IR") }} مورد</span>
        </RouterLink>
      </div>
      <p class="text-[11px] leading-5 text-slate-400 dark:text-slate-500">این یادداشت‌ها همراه بقیه‌ی داده‌ها پشتیبان‌گیری می‌شوند و با فعال بودن قفل رمزنگاری‌اند. نتیجه‌ی آزمایش را فقط برای یادآوری ثبت کنید؛ تفسیرش با پزشک است.</p>
    </section>
  </div>
</template>
