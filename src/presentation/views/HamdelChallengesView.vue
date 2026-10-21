<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import { useHamdelStore } from "@application/stores/hamdelStore";
import { useProfileStore } from "@application/stores/profileStore";
import { ChallengeProgress } from "@domain/hamdel/challenge";
import type { HamdelEntry } from "@domain/hamdel/HamdelEntry";
import { getHamdelSection } from "@domain/hamdel/hamdelSections";
import { HamdelValidationError } from "@domain/hamdel/HamdelValidationError";
import { DateOnly } from "@domain/valueObjects/DateOnly";
import ConfirmDialog from "@presentation/components/shared/ConfirmDialog.vue";
import HamdelEntryForm from "@presentation/components/hamdel/HamdelEntryForm.vue";
import { useJalali } from "@presentation/composables/useJalali";
import { useToast } from "@presentation/composables/useToast";

const SECTION_ID = "challenges";
const definition = getHamdelSection(SECTION_ID);

const store = useHamdelStore();
const profileStore = useProfileStore();
const { toJalaliLabel } = useJalali();
const { showToast } = useToast();

const isFormOpen = ref(false);
const formError = ref<string | null>(null);
const entryToRemove = ref<HamdelEntry | null>(null);
const isRemoveConfirmOpen = ref(false);

const today = computed(() => DateOnly.today());
const cards = computed(() =>
  store.entriesOf(SECTION_ID).map((entry) => ({ entry, progress: ChallengeProgress.from(entry, today.value) })),
);

const presets = computed(() => {
  const existing = new Set(store.entriesOf(SECTION_ID).map((entry) => entry.valueOf("title")));
  return (definition.presets ?? []).filter((preset) => !existing.has(preset.title ?? ""));
});

const formatNumber = (value: number): string => value.toLocaleString("fa-IR");

function statusText(progress: ChallengeProgress): string {
  if (progress.isCompleted) return "🏆 کامل شد";
  if (!progress.hasStarted) return "شروع نشده";
  if (progress.hasEnded) return "مدت چالش تمام شد";
  return `🔥 ${formatNumber(progress.currentStreak)} روز پیاپی`;
}

async function create(values: Record<string, string>): Promise<void> {
  try {
    await store.add(SECTION_ID, values);
    isFormOpen.value = false;
    formError.value = null;
    showToast("چالش شروع شد");
  } catch (error) {
    formError.value = error instanceof HamdelValidationError ? error.message : "ذخیره نشد.";
  }
}

async function check(entry: HamdelEntry, dayIso: string): Promise<void> {
  try {
    await store.toggleChallengeCheck(entry.id, dayIso);
  } catch (error) {
    showToast(error instanceof HamdelValidationError ? error.message : "ثبت نشد.", 1800);
  }
}

async function startPreset(preset: Readonly<Record<string, string>>): Promise<void> {
  await store.addPreset(SECTION_ID, preset);
  showToast("چالش شروع شد");
}

function askRemove(entry: HamdelEntry): void {
  entryToRemove.value = entry;
  isRemoveConfirmOpen.value = true;
}

async function confirmRemove(): Promise<void> {
  if (entryToRemove.value) {
    await store.remove(entryToRemove.value.id);
    entryToRemove.value = null;
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

    <HamdelEntryForm v-if="isFormOpen" :definition="definition" submit-label="شروع چالش" :error="formError" @submit="create" @cancel="isFormOpen = false" />
    <button v-else type="button" class="rounded-xl bg-rose-500/90 px-4 py-3 text-sm font-medium text-white transition hover:bg-rose-500 active:scale-[0.99]" @click="isFormOpen = true">+ چالش جدید</button>

    <details v-if="presets.length > 0" class="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <summary class="cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-200">چالش‌های آماده ({{ formatNumber(presets.length) }})</summary>
      <ul class="mt-3 flex flex-col gap-2">
        <li v-for="preset in presets" :key="preset.title" class="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-2 text-xs leading-6 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <span>{{ preset.title }} <span class="text-slate-400">({{ formatNumber(Number(preset.length)) }} روزه)</span></span>
          <button type="button" class="shrink-0 rounded-lg bg-teal-500/90 px-2 py-1 text-white hover:bg-teal-500" @click="startPreset(preset)">شروع از امروز</button>
        </li>
      </ul>
    </details>

    <article v-for="{ entry, progress } in cards" :key="entry.id" class="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <header class="flex items-start justify-between gap-2">
        <div class="flex flex-col gap-0.5">
          <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ entry.valueOf("title") }}</h3>
          <p class="text-[11px] text-slate-500 dark:text-slate-400">
            از {{ toJalaliLabel(DateOnly.fromIsoString(entry.valueOf("startAt"))) }} · {{ formatNumber(progress.doneCount) }} از {{ formatNumber(progress.length) }} · {{ statusText(progress) }}
          </p>
        </div>
        <button type="button" class="rounded-lg px-2 py-1 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10" @click="askRemove(entry)">حذف</button>
      </header>

      <div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800" dir="ltr">
        <div class="h-full rounded-full bg-teal-500 transition-[width]" :style="{ width: `${progress.length ? (progress.doneCount / progress.length) * 100 : 0}%` }" />
      </div>

      <div class="grid grid-cols-7 gap-1.5">
        <button
          v-for="day in progress.days"
          :key="day.iso"
          type="button"
          :disabled="day.isFuture"
          :aria-pressed="day.isDone"
          :aria-label="`روز ${day.dayNumber}`"
          class="flex aspect-square items-center justify-center rounded-lg text-xs transition disabled:cursor-not-allowed disabled:opacity-40"
          :class="[
            day.isDone ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300',
            day.isToday ? 'ring-2 ring-rose-400' : '',
          ]"
          @click="check(entry, day.iso)"
        >
          {{ day.isDone ? "✓" : formatNumber(day.dayNumber) }}
        </button>
      </div>
    </article>

    <p v-if="cards.length === 0" class="py-8 text-center text-sm text-slate-400 dark:text-slate-500">هنوز چالشی شروع نکرده‌ای.</p>

    <ConfirmDialog v-model="isRemoveConfirmOpen" title="حذف این چالش؟" message="پیشرفت آن هم پاک می‌شود." confirm-label="حذف" danger @confirm="confirmRemove" />
  </div>
</template>
