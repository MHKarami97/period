<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { useHamdelStore } from "@application/stores/hamdelStore";
import { HamdelWeeklyPlan } from "@domain/home/HamdelWeeklyPlan";
import { DateOnly } from "@domain/valueObjects/DateOnly";
import { jalaliYearlyCalendar } from "@infrastructure/calendar/JalaliYearlyCalendar";
import { useJalali } from "@presentation/composables/useJalali";

const STORAGE_KEY = "mahak:weekly-plan-done:v1";

const hamdelStore = useHamdelStore();
const { toJalaliLabel } = useJalali();

function loadDone(): Set<string> {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return new Set(Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : []);
  } catch {
    return new Set<string>();
  }
}

const done = ref<Set<string>>(loadDone());
const today = DateOnly.today();

onMounted(() => void hamdelStore.ensureLoaded());

const plan = computed(() => HamdelWeeklyPlan.build(hamdelStore.entries, today, jalaliYearlyCalendar));
const keyOf = (date: DateOnly, id: string): string => `${date.toIsoString()}:${id}`;
const doneCount = computed(() => plan.value.filter((item) => done.value.has(keyOf(item.date, item.suggestion.id))).length);

function toggle(date: DateOnly, id: string): void {
  const next = new Set(done.value);
  const key = keyOf(date, id);
  if (!next.delete(key)) next.add(key);
  done.value = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...next].slice(-60)));
  } catch {
    // session-only when storage is unavailable
  }
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-3xl flex-col gap-4">
    <div class="flex items-center justify-between gap-2">
      <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100">🗓 برنامه‌ی هفتگی محبت</h1>
      <RouterLink :to="{ name: 'hamdel' }" class="text-xs font-semibold text-teal-600 hover:underline dark:text-teal-300">همدل ←</RouterLink>
    </div>
    <p class="text-sm leading-6 text-slate-500 dark:text-slate-400">برای هر روز یک کار کوچک از یادداشت‌های خودت. {{ doneCount.toLocaleString("fa-IR") }} از ۷ کار انجام شده است.</p>

    <ol class="flex flex-col gap-2">
      <li v-for="item in plan" :key="item.date.toIsoString()">
        <div class="flex items-start gap-3 rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800" :class="item.date.isSameDay(today) ? 'ring-2 ring-rose-400 dark:ring-rose-500' : ''">
          <input type="checkbox" class="mt-1.5 h-4 w-4 accent-emerald-500" :checked="done.has(keyOf(item.date, item.suggestion.id))" :aria-label="`انجام شد: ${item.suggestion.text}`" @change="toggle(item.date, item.suggestion.id)" />
          <RouterLink :to="item.suggestion.to" class="flex min-w-0 flex-1 flex-col gap-0.5">
            <span class="text-[11px] font-bold text-slate-500 dark:text-slate-400">{{ toJalaliLabel(item.date, "EEEE d MMMM") }}{{ item.date.isSameDay(today) ? " · امروز" : "" }}</span>
            <span class="text-sm leading-6 text-slate-800 dark:text-slate-100" :class="done.has(keyOf(item.date, item.suggestion.id)) ? 'line-through opacity-60' : ''">
              <span aria-hidden="true">{{ item.suggestion.icon }}</span> {{ item.suggestion.text }}
            </span>
          </RouterLink>
        </div>
      </li>
    </ol>
  </div>
</template>
