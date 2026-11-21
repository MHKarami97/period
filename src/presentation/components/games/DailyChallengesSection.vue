<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useDailyChallengesStore } from "@application/stores/dailyChallengesStore";
import type { DailyChallengePlan } from "@domain/games/dailyChallenges/DailyChallengeTypes";
import AppIcon from "@presentation/components/common/AppIcon.vue";
import ChallengePoolModal from "./ChallengePoolModal.vue";
import DayResultModal from "./DayResultModal.vue";
import DayEditModal from "./DayEditModal.vue";

const store = useDailyChallengesStore();

const showPoolModal = ref(false);
const activeResultDay = ref<DailyChallengePlan | null>(null);
const activeEditDay = ref<DailyChallengePlan | null>(null);

onMounted(() => {
  store.ensureCurrentWeekPlan();
});

const todayPlan = computed(() => store.todayPlan);
const activePlan = computed(() => store.selectedWeekPlan);
const stats = computed(() => store.selectedWeekStats);

const progressPercentage = computed(() => {
  if (!stats.value.total) return 0;
  return Math.round(((stats.value.completed + stats.value.off) / stats.value.total) * 100);
});

function openResultModal(day: DailyChallengePlan): void {
  activeResultDay.value = day;
}

function openEditModal(day: DailyChallengePlan): void {
  activeEditDay.value = day;
}

function generateNewPlanForSelectedWeek(): void {
  store.generatePlanForWeek(store.selectedWeekIso, true);
}

function toggleDayOffQuick(day: DailyChallengePlan): void {
  store.toggleDayOff(store.selectedWeekIso, day.date, !day.isOff);
}

function selectCurrentWeek(): void {
  store.selectWeek(store.currentWeekIso);
}

function selectNextWeek(): void {
  if (!store.schedules[store.nextWeekIso]) {
    store.generatePlanForWeek(store.nextWeekIso, false);
  }
  store.selectWeek(store.nextWeekIso);
}

function getStatusBadge(day: DailyChallengePlan): { label: string; class: string; iconName: string } {
  if (day.isOff || day.status === "off") {
    return {
      label: "روز آف / استراحت",
      class: "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800",
      iconName: "beach",
    };
  }
  if (day.status === "completed") {
    return {
      label: "انجام شد",
      class: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
      iconName: "check-circle",
    };
  }
  if (day.status === "skipped") {
    return {
      label: "انجام نشد",
      class: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800",
      iconName: "x-circle",
    };
  }
  return {
    label: "در انتظار",
    class: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700",
    iconName: "clock",
  };
}
</script>

<template>
  <section class="flex flex-col gap-6 rounded-3xl bg-gradient-to-b from-amber-500/5 via-white to-white p-4 sm:p-7 shadow-xs ring-1 ring-amber-500/20 dark:from-amber-500/10 dark:via-slate-900 dark:to-slate-900 dark:ring-amber-500/25">
    <!-- Header: Section title and Bank button -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-3">
        <span class="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:bg-amber-500/25 dark:text-amber-300 shadow-2xs">
          <AppIcon name="target" size="lg" filled />
        </span>
        <div class="min-w-0">
          <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            برنامه و چالش‌های روزانه زوجین
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-5">
            پیشنهاد چالش هر روز، برنامه‌ریزی هفتگی از شنبه و ثبت نتیجه دونفره
          </p>
        </div>
      </div>

      <button
        type="button"
        class="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 text-xs font-bold text-amber-700 shadow-xs ring-1 ring-amber-200 hover:bg-amber-50 dark:bg-slate-800 dark:text-amber-300 dark:ring-amber-900/50 dark:hover:bg-slate-750 transition active:scale-95 w-full sm:w-auto"
        @click="showPoolModal = true"
      >
        <AppIcon name="sparkles" size="xs" filled />
        <span>بانک چالش‌ها ({{ store.allChallenges.length }})</span>
      </button>
    </div>

    <!-- 1. TODAY'S HIGHLIGHT CARD -->
    <div
      v-if="todayPlan"
      class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-orange-500/15 p-4 sm:p-6 ring-1 ring-amber-500/30 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-slate-900 dark:ring-amber-500/30 shadow-xs"
    >
      <div class="flex flex-col gap-4">
        <!-- Header row of today's card -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <div class="flex flex-wrap items-center gap-2 min-w-0">
            <span class="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs dark:bg-amber-500">
              <AppIcon name="calendar" size="xs" />
              <span>پیشنهاد امروز: {{ todayPlan.dayName }} ({{ todayPlan.jalaliDateLabel }})</span>
            </span>
            <span
              class="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-semibold border"
              :class="getStatusBadge(todayPlan).class"
            >
              <AppIcon :name="getStatusBadge(todayPlan).iconName" size="xs" />
              <span>{{ getStatusBadge(todayPlan).label }}</span>
            </span>
          </div>

          <div class="flex items-center gap-1.5 text-xs ms-auto sm:ms-0">
            <button
              type="button"
              class="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 font-semibold text-slate-700 hover:bg-white/80 dark:text-slate-300 dark:hover:bg-slate-800 transition active:scale-95"
              @click="store.reRollDay(store.currentWeekIso, todayPlan.date)"
            >
              <AppIcon name="rotate" size="xs" />
              <span>پیشنهاد دیگر</span>
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 font-semibold text-slate-700 hover:bg-white/80 dark:text-slate-300 dark:hover:bg-slate-800 transition active:scale-95"
              @click="openEditModal(todayPlan)"
            >
              <AppIcon name="pencil" size="xs" />
              <span>ویرایش</span>
            </button>
          </div>
        </div>

        <div>
          <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            {{ todayPlan.challengeTitle }}
          </h3>
          <p v-if="todayPlan.challengeDescription" class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-6">
            {{ todayPlan.challengeDescription }}
          </p>
          <div v-if="todayPlan.isOff && todayPlan.offReason" class="mt-2 inline-flex items-center gap-1.5 text-xs text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/50 px-2.5 py-1 rounded-lg">
            <AppIcon name="beach" size="xs" />
            <span>علت آف: {{ todayPlan.offReason }}</span>
          </div>
        </div>

        <!-- Result / Note if filled -->
        <div
          v-if="todayPlan.completionNote"
          class="rounded-2xl bg-white/90 p-3.5 sm:p-4 ring-1 ring-slate-200/80 dark:bg-slate-850/90 dark:ring-slate-750/80 shadow-2xs"
        >
          <div class="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
            <AppIcon name="note" size="xs" />
            <span>خلاصه احساس و خاطره ثبت‌شده شما:</span>
          </div>
          <p class="text-xs text-slate-700 dark:text-slate-200 leading-6">
            {{ todayPlan.completionNote }}
          </p>
        </div>

        <!-- Quick Action buttons on today's card -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1 w-full">
          <button
            type="button"
            class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 transition active:scale-95"
            @click="openResultModal(todayPlan)"
          >
            <AppIcon name="note" size="xs" />
            <span>{{ todayPlan.status === 'completed' ? 'ویرایش نتیجه و یادداشت' : 'ثبت نتیجه چالش امروز' }}</span>
          </button>

          <button
            type="button"
            class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-bold text-slate-700 ring-1 ring-slate-200/90 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-750 transition active:scale-95 shadow-2xs"
            @click="toggleDayOffQuick(todayPlan)"
          >
            <AppIcon name="beach" size="xs" />
            <span>{{ todayPlan.isOff ? 'لغو روز آف' : 'روز آف (استراحت / مهمانی)' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 2. WEEK SELECTOR & PROGRESS -->
    <div class="flex flex-col gap-3.5">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200/80 pb-3 dark:border-slate-800">
        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-bold transition active:scale-95"
            :class="store.isCurrentWeekSelected
              ? 'bg-amber-600 text-white shadow-sm dark:bg-amber-500'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750'"
            @click="selectCurrentWeek"
          >
            <AppIcon name="calendar" size="xs" />
            <span>هفته جاری</span>
          </button>

          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-bold transition active:scale-95"
            :class="store.isNextWeekSelected
              ? 'bg-amber-600 text-white shadow-sm dark:bg-amber-500'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750'"
            @click="selectNextWeek"
          >
            <AppIcon name="calendar-next" size="xs" />
            <span>هفته آینده</span>
          </button>

          <!-- History tab selector -->
          <div v-if="store.previousWeeksHistory.length > 0" class="relative inline-block max-w-full">
            <select
              :value="store.isPastWeekSelected ? store.selectedWeekIso : ''"
              class="max-w-full rounded-2xl border border-slate-200 bg-slate-100 py-2 pe-3 ps-3 text-xs font-bold text-slate-700 hover:bg-slate-200 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 transition text-ellipsis"
              @change="(e) => store.selectWeek((e.target as HTMLSelectElement).value)"
            >
              <option value="" disabled :selected="!store.isPastWeekSelected">
                تاریخچه هفته‌های قبلی ({{ store.previousWeeksHistory.length }})
              </option>
              <option
                v-for="hw in store.previousWeeksHistory"
                :key="hw.weekStartIso"
                :value="hw.weekStartIso"
              >
                {{ hw.weekTitle }}
              </option>
            </select>
          </div>
        </div>

        <!-- Weekly Plan Action / Generate -->
        <button
          v-if="store.canEditSelectedWeek"
          type="button"
          class="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:underline dark:text-amber-400 self-start sm:self-center transition active:scale-95"
          @click="generateNewPlanForSelectedWeek"
        >
          <AppIcon name="rotate" size="xs" />
          <span>تولید برنامه تصادفی برای کل این هفته</span>
        </button>
      </div>

      <!-- Week Header Info & Stats Bar -->
      <div v-if="activePlan" class="flex flex-col gap-2 rounded-2xl bg-slate-50/80 p-3.5 dark:bg-slate-850/60 ring-1 ring-slate-200/60 dark:ring-slate-800">
        <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 flex-wrap gap-2">
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
              {{ activePlan.weekTitle }}
            </span>
            <span v-if="store.isPastWeekSelected" class="rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              تاریخچه
            </span>
          </div>

          <div class="flex items-center gap-2.5 text-xs font-medium">
            <span class="text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
              <AppIcon name="check-circle" size="xs" />
              <span>{{ stats.completed }} انجام‌شده</span>
            </span>
            <span class="text-sky-600 dark:text-sky-400 inline-flex items-center gap-1">
              <AppIcon name="beach" size="xs" />
              <span>{{ stats.off }} روز آف</span>
            </span>
            <span v-if="stats.skipped > 0" class="text-rose-600 dark:text-rose-400 inline-flex items-center gap-1">
              <AppIcon name="x-circle" size="xs" />
              <span>{{ stats.skipped }} انجام‌نشده</span>
            </span>
          </div>
        </div>

        <!-- Visual Progress Bar -->
        <div class="flex items-center gap-2 pt-1">
          <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
            <div
              class="h-full rounded-full bg-gradient-to-r from-amber-500 to-teal-500 transition-all duration-300"
              :style="{ width: `${progressPercentage}%` }"
            ></div>
          </div>
          <span class="text-[11px] font-bold text-slate-400 shrink-0">
            {{ progressPercentage }}٪ تکمیل
          </span>
        </div>
      </div>
    </div>

    <!-- 3. DAYS LIST (7 Days, Saturday to Friday) -->
    <div v-if="activePlan" class="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="day in activePlan.days"
        :key="day.date"
        class="flex flex-col justify-between rounded-3xl bg-white p-4 sm:p-4.5 shadow-xs ring-1 transition-all duration-200 hover:shadow-md dark:bg-slate-900"
        :class="[
          day.date === store.today.toIsoString()
            ? 'ring-2 ring-amber-500 dark:ring-amber-400 bg-amber-500/[0.04] dark:bg-amber-500/[0.06]'
            : 'ring-slate-200/90 dark:ring-slate-800',
          day.isOff ? 'ring-sky-200 dark:ring-sky-900/60 bg-sky-50/40 dark:bg-sky-950/25' : ''
        ]"
      >
        <div class="flex flex-col gap-2.5">
          <!-- Day Name & Date -->
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-1.5 flex-wrap min-w-0">
              <span class="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                {{ day.dayName }}
              </span>
              <span class="text-[11px] text-slate-400 dark:text-slate-500">
                ({{ day.jalaliDateLabel }})
              </span>
              <span
                v-if="day.date === store.today.toIsoString()"
                class="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300"
              >
                امروز
              </span>
            </div>

            <span
              class="shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border"
              :class="getStatusBadge(day).class"
            >
              <AppIcon :name="getStatusBadge(day).iconName" size="xs" />
              <span>{{ getStatusBadge(day).label }}</span>
            </span>
          </div>

          <!-- Challenge Title & Description -->
          <div class="pt-0.5">
            <h4 class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-1">
              {{ day.challengeTitle }}
            </h4>
            <p v-if="day.challengeDescription" class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-5">
              {{ day.challengeDescription }}
            </p>
            <div v-if="day.isOff && day.offReason" class="mt-1.5 inline-flex items-center gap-1 text-[11px] text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/50 px-2 py-0.5 rounded-md">
              <AppIcon name="beach" size="xs" />
              <span>{{ day.offReason }}</span>
            </div>
          </div>

          <!-- Completion Note Preview -->
          <div
            v-if="day.completionNote"
            class="rounded-2xl bg-slate-50 p-2.5 text-[11px] text-slate-700 ring-1 ring-slate-200/60 dark:bg-slate-850/80 dark:text-slate-200 dark:ring-slate-750/70 shadow-2xs"
          >
            <div class="flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400 mb-0.5">
              <AppIcon name="note" size="xs" />
              <span>خلاصه دونفره:</span>
            </div>
            <p class="leading-5 line-clamp-3">
              {{ day.completionNote }}
            </p>
          </div>
        </div>

        <!-- Card Action Buttons -->
        <div class="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-2.5 dark:border-slate-800 text-xs">
          <button
            type="button"
            class="inline-flex items-center gap-1 text-teal-600 hover:underline dark:text-teal-400 font-bold active:scale-95"
            @click="openResultModal(day)"
          >
            <AppIcon name="note" size="xs" />
            <span>{{ day.status === 'completed' ? 'ویرایش نتیجه' : 'ثبت نتیجه' }}</span>
          </button>

          <div v-if="store.canEditSelectedWeek" class="flex items-center gap-2">
            <button
              type="button"
              class="rounded-lg p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 active:scale-95 transition"
              title="پیشنهاد تصادفی دیگر"
              @click="store.reRollDay(store.selectedWeekIso, day.date)"
            >
              <AppIcon name="rotate" size="xs" />
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-slate-800 font-medium active:scale-95 transition"
              title="ویرایش یا ثبت آف"
              @click="openEditModal(day)"
            >
              <AppIcon name="pencil" size="xs" />
              <span>تنظیم / آف</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <ChallengePoolModal v-if="showPoolModal" @close="showPoolModal = false" />
    <DayResultModal
      v-if="activeResultDay"
      :week-start-iso="store.selectedWeekIso"
      :day="activeResultDay"
      @close="activeResultDay = null"
    />
    <DayEditModal
      v-if="activeEditDay"
      :week-start-iso="store.selectedWeekIso"
      :day="activeEditDay"
      @close="activeEditDay = null"
    />
  </section>
</template>
