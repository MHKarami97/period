<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import { useHamdelStore } from "@application/stores/hamdelStore";
import { useProfileStore } from "@application/stores/profileStore";
import { useTelegramReminderStore } from "@application/stores/telegramReminderStore";
import type { HamdelEntry } from "@domain/hamdel/HamdelEntry";
import { getHamdelSection } from "@domain/hamdel/hamdelSections";
import { HamdelValidationError } from "@domain/hamdel/HamdelValidationError";
import { buildCountdowns, describeDaysLeft, occurrenceInYearOf, type RepeatMode } from "@domain/hamdel/importantDates";
import { DateOnly } from "@domain/valueObjects/DateOnly";
import { jalaliYearlyCalendar } from "@infrastructure/calendar/JalaliYearlyCalendar";
import ConfirmDialog from "@presentation/components/shared/ConfirmDialog.vue";
import HamdelEntryForm from "@presentation/components/hamdel/HamdelEntryForm.vue";
import { useJalali } from "@presentation/composables/useJalali";
import { useToast } from "@presentation/composables/useToast";

const SECTION_ID = "dates";
const WEEKDAY_LABELS = ["ش", "ی", "د", "س", "چ", "پ", "ج"];
const definition = getHamdelSection(SECTION_ID);
const typeOptions = definition.fields.find((field) => field.key === "type")?.options ?? [];
const remindOptions = definition.fields.find((field) => field.key === "remind")?.options ?? [];

const store = useHamdelStore();
const profileStore = useProfileStore();
const telegramStore = useTelegramReminderStore();
const { toJalaliLabel, monthTitle, nextMonth, previousMonth, buildMonthGrid, isSameJalaliMonth } = useJalali();
const { showToast } = useToast();

const isFormOpen = ref(false);
const editingEntry = ref<HamdelEntry | null>(null);
const formError = ref<string | null>(null);
const entryToRemove = ref<HamdelEntry | null>(null);
const isRemoveConfirmOpen = ref(false);
const monthAnchor = ref<Date>(DateOnly.today().toDate());

const today = computed(() => DateOnly.today());
const countdowns = computed(() => buildCountdowns(store.entriesOf(SECTION_ID), today.value, jalaliYearlyCalendar));
const gridDays = computed(() => buildMonthGrid(monthAnchor.value));

/** ISO day -> entries that fall on it, for the years around the visible month (covers the grid's edge days). */
const entriesByDay = computed(() => {
  const anchorDay = DateOnly.fromDate(monthAnchor.value);
  const map = new Map<string, HamdelEntry[]>();
  for (const entry of store.entriesOf(SECTION_ID)) {
    const repeat: RepeatMode = entry.valueOf("repeat") === "once" ? "once" : "yearly";
    const original = DateOnly.fromIsoString(entry.valueOf("date"));
    for (const shift of [-1, 0, 1]) {
      const anchor = jalaliYearlyCalendar.addYears(anchorDay, shift);
      const iso = occurrenceInYearOf(original, anchor, repeat, jalaliYearlyCalendar).toIsoString();
      map.set(iso, [...(map.get(iso) ?? []), entry]);
    }
  }
  return map;
});

const monthEntries = computed(() =>
  gridDays.value
    .filter((day) => isSameJalaliMonth(day, monthAnchor.value) && entriesByDay.value.has(day.toIsoString()))
    .flatMap((day) => (entriesByDay.value.get(day.toIsoString()) ?? []).map((entry) => ({ day, entry }))),
);

const formatNumber = (value: number): string => value.toLocaleString("fa-IR");

function labelOf(options: readonly { value: string; label: string }[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? "";
}

function dayClasses(day: DateOnly): string {
  const classes = ["relative flex h-10 flex-col items-center justify-center rounded-lg text-sm"];
  classes.push(isSameJalaliMonth(day, monthAnchor.value) ? "text-slate-700 dark:text-slate-200" : "text-slate-300 dark:text-slate-600");
  if (day.isSameDay(today.value)) classes.push("bg-teal-500/15 ring-1 ring-teal-500");
  return classes.join(" ");
}

function openAddForm(): void {
  editingEntry.value = null;
  formError.value = null;
  isFormOpen.value = true;
}

function openEditForm(entry: HamdelEntry): void {
  editingEntry.value = entry;
  formError.value = null;
  isFormOpen.value = true;
}

function closeForm(): void {
  isFormOpen.value = false;
  editingEntry.value = null;
  formError.value = null;
}

async function save(values: Record<string, string>): Promise<void> {
  try {
    if (editingEntry.value) {
      await store.update(editingEntry.value.id, values);
    } else {
      await store.add(SECTION_ID, values);
    }
    showToast("ذخیره شد");
    closeForm();
  } catch (error) {
    formError.value = error instanceof HamdelValidationError ? error.message : "ذخیره نشد.";
  }
}

function askRemove(entry: HamdelEntry): void {
  entryToRemove.value = entry;
  isRemoveConfirmOpen.value = true;
}

async function confirmRemove(): Promise<void> {
  if (entryToRemove.value) {
    await store.remove(entryToRemove.value.id);
    entryToRemove.value = null;
    showToast("حذف شد");
  }
}

onMounted(() => void store.ensureLoaded());
watch(() => profileStore.activeProfileId, () => void store.ensureLoaded());
</script>

<template>
  <div class="mx-auto flex w-full max-w-3xl flex-col gap-4">
    <div class="flex items-center justify-between gap-3">
      <h1 class="text-xl font-semibold text-slate-900 dark:text-slate-100">{{ definition.icon }} {{ definition.title }}</h1>
      <RouterLink :to="{ name: 'hamdel' }" class="rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800">همدل ←</RouterLink>
    </div>
    <p class="-mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">{{ definition.description }}</p>

    <p v-if="!telegramStore.isLinked" class="rounded-xl bg-amber-500/10 p-3 text-xs leading-6 text-amber-700 dark:text-amber-300">
      برای دریافت یادآور، در
      <RouterLink :to="{ name: 'settings' }" class="underline">تنظیمات</RouterLink>
      «یادآور در تلگرام» را فعال کن. یادآورها ساعت ۶ صبح به وقت تهران ارسال می‌شوند.
    </p>

    <HamdelEntryForm
      v-if="isFormOpen"
      :key="editingEntry?.id ?? 'new'"
      :definition="definition"
      :initial-values="editingEntry?.values"
      :submit-label="editingEntry ? 'به‌روزرسانی' : 'افزودن'"
      :error="formError"
      @submit="save"
      @cancel="closeForm"
    />
    <button v-else type="button" class="rounded-xl bg-rose-500/90 px-4 py-3 text-sm font-medium text-white transition hover:bg-rose-500 active:scale-[0.99]" @click="openAddForm">+ تاریخ جدید</button>

    <section v-if="countdowns.length > 0" class="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="نزدیک‌ترین تاریخ‌ها">
      <article
        v-for="item in countdowns.filter((countdown) => countdown.daysLeft !== null).slice(0, 3)"
        :key="item.entry.id"
        class="flex flex-col items-center gap-1 rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
      >
        <span class="text-xs text-slate-500 dark:text-slate-400">{{ labelOf(typeOptions, item.entry.valueOf("type")) }}</span>
        <h2 class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ item.entry.valueOf("title") }}</h2>
        <span class="text-2xl font-bold text-rose-500">{{ item.daysLeft === 0 ? "🎉" : formatNumber(item.daysLeft ?? 0) }}</span>
        <span class="text-xs text-slate-500 dark:text-slate-400">{{ item.daysLeft === 0 ? "امروز است!" : "روز مانده" }}</span>
        <span class="text-[11px] text-slate-400 dark:text-slate-500">{{ item.target ? toJalaliLabel(item.target, "d MMMM yyyy") : "" }}</span>
      </article>
    </section>

    <section class="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800" aria-label="تقویم">
      <div class="mb-2 flex items-center justify-between">
        <button type="button" class="rounded-lg px-3 py-1 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800" aria-label="ماه قبل" @click="monthAnchor = previousMonth(monthAnchor)">›</button>
        <span class="text-sm font-medium text-slate-900 dark:text-slate-100">{{ monthTitle(monthAnchor) }}</span>
        <button type="button" class="rounded-lg px-3 py-1 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800" aria-label="ماه بعد" @click="monthAnchor = nextMonth(monthAnchor)">‹</button>
      </div>
      <div class="grid grid-cols-7 gap-1 text-center text-[11px] text-slate-400 dark:text-slate-500">
        <span v-for="label in WEEKDAY_LABELS" :key="label">{{ label }}</span>
      </div>
      <div class="mt-1 grid grid-cols-7 gap-1">
        <div v-for="day in gridDays" :key="day.toIsoString()" :class="dayClasses(day)">
          {{ toJalaliLabel(day, "d") }}
          <span v-if="entriesByDay.has(day.toIsoString())" class="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-rose-500" aria-hidden="true" />
        </div>
      </div>
      <ul v-if="monthEntries.length > 0" class="mt-3 flex flex-col gap-1 border-t border-slate-100 pt-3 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-300">
        <li v-for="item in monthEntries" :key="`${item.entry.id}-${item.day.toIsoString()}`">
          {{ toJalaliLabel(item.day, "d MMMM") }} - {{ item.entry.valueOf("title") }}
        </li>
      </ul>
    </section>

    <section v-if="countdowns.length > 0" class="flex flex-col gap-3">
      <h2 class="text-sm font-medium text-slate-500 dark:text-slate-400">همه‌ی تاریخ‌ها</h2>
      <article
        v-for="item in countdowns"
        :key="item.entry.id"
        class="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
        :class="{ 'opacity-60': item.daysLeft === null }"
      >
        <header class="flex items-start justify-between gap-2">
          <div class="flex flex-col gap-0.5">
            <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ item.entry.valueOf("title") }}</h3>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">
              {{ toJalaliLabel(DateOnly.fromIsoString(item.entry.valueOf("date")), "d MMMM yyyy") }} ·
              {{ item.daysLeft === null ? "گذشته" : describeDaysLeft(item.daysLeft) }}
            </p>
          </div>
          <div class="flex shrink-0 gap-1">
            <button type="button" class="rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800" @click="openEditForm(item.entry)">ویرایش</button>
            <button type="button" class="rounded-lg px-2 py-1 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10" @click="askRemove(item.entry)">حذف</button>
          </div>
        </header>
        <div class="flex flex-wrap gap-1">
          <span class="rounded-full bg-teal-500/10 px-2 py-0.5 text-[11px] text-teal-700 dark:bg-teal-500/20 dark:text-teal-300">{{ labelOf(typeOptions, item.entry.valueOf("type")) }}</span>
          <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">{{ item.entry.valueOf("repeat") === "once" ? "یک‌بار" : "هر سال" }}</span>
          <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">🔔 {{ labelOf(remindOptions, item.entry.valueOf("remind")) }}</span>
        </div>
        <p v-if="item.entry.valueOf('note')" class="whitespace-pre-line text-xs leading-6 text-slate-600 dark:text-slate-300">{{ item.entry.valueOf("note") }}</p>
      </article>
    </section>
    <p v-else class="py-6 text-center text-sm text-slate-400 dark:text-slate-500">هنوز تاریخی ثبت نشده؛ تولد یا سالگرد را اضافه کن.</p>

    <RouterLink to="/app/hamdel/calls" class="rounded-xl bg-slate-100 px-4 py-3 text-center text-sm text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200">📞 یادآور تماس یا پیام برای روزهای خاص</RouterLink>

    <ConfirmDialog v-model="isRemoveConfirmOpen" title="حذف این تاریخ؟" message="یادآورهای آن هم از تلگرام حذف می‌شوند." confirm-label="حذف" danger @confirm="confirmRemove" />
  </div>
</template>
