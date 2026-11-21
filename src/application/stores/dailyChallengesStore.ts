import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { DateOnly } from "@domain/valueObjects/DateOnly";
import {
  type ChallengeItem,
  type ChallengeDayStatus,
  type DailyChallengePlan,
  type DailyChallengesSettings,
  type WeeklyChallengeSchedule,
  type ChallengeTimeTag,
  getChallengeTimeTags,
} from "@domain/games/dailyChallenges/DailyChallengeTypes";
import { DEFAULT_CHALLENGES } from "@domain/games/dailyChallenges/defaultChallenges";
import { WeeklyChallengeService } from "@domain/games/dailyChallenges/WeeklyChallengeService";

const STORAGE_KEY = "period-tracker:daily-challenges-v1";

function loadSavedSettings(): DailyChallengesSettings | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DailyChallengesSettings;
  } catch {
    return null;
  }
}

function persistSettings(data: DailyChallengesSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage quota errors
  }
}

export const useDailyChallengesStore = defineStore("dailyChallenges", () => {
  const saved = loadSavedSettings();

  const customPool = ref<ChallengeItem[]>(saved?.customPool ?? []);
  const schedules = ref<Record<string, WeeklyChallengeSchedule>>(saved?.schedules ?? {});

  const today = computed(() => DateOnly.today());
  const currentWeekIso = computed(() =>
    WeeklyChallengeService.getCurrentWeekStart(today.value).toIsoString(),
  );
  const nextWeekIso = computed(() =>
    WeeklyChallengeService.getNextWeekStart(today.value).toIsoString(),
  );

  const selectedWeekIso = ref<string>(
    saved?.selectedWeekIso && WeeklyChallengeService.isWeekPlannable(saved.selectedWeekIso, today.value)
      ? saved.selectedWeekIso
      : currentWeekIso.value,
  );

  // Challenge pool: defaults + custom items
  const allChallenges = computed<ChallengeItem[]>(() => {
    return [...DEFAULT_CHALLENGES, ...customPool.value];
  });

  const isCurrentWeekSelected = computed(() => selectedWeekIso.value === currentWeekIso.value);
  const isNextWeekSelected = computed(() => selectedWeekIso.value === nextWeekIso.value);
  const isPastWeekSelected = computed(() =>
    WeeklyChallengeService.isPastWeek(selectedWeekIso.value, today.value),
  );
  const canEditSelectedWeek = computed(() =>
    WeeklyChallengeService.isWeekPlannable(selectedWeekIso.value, today.value),
  );

  const currentWeekPlan = computed<WeeklyChallengeSchedule | null>(
    () => schedules.value[currentWeekIso.value] ?? null,
  );

  const selectedWeekPlan = computed<WeeklyChallengeSchedule | null>(
    () => schedules.value[selectedWeekIso.value] ?? null,
  );

  const todayPlan = computed<DailyChallengePlan | null>(() => {
    const plan = currentWeekPlan.value;
    if (!plan) return null;
    const todayIso = today.value.toIsoString();
    return plan.days.find((d) => d.date === todayIso) ?? null;
  });

  const previousWeeksHistory = computed<WeeklyChallengeSchedule[]>(() => {
    return Object.values(schedules.value)
      .filter((sch) => sch.weekStartIso < currentWeekIso.value)
      .sort((a, b) => b.weekStartIso.localeCompare(a.weekStartIso));
  });

  const selectedWeekStats = computed(() => {
    const days = selectedWeekPlan.value?.days ?? [];
    const completed = days.filter((d) => d.status === "completed").length;
    const off = days.filter((d) => d.isOff || d.status === "off").length;
    const skipped = days.filter((d) => d.status === "skipped").length;
    const pending = days.filter((d) => d.status === "pending" && !d.isOff).length;
    return {
      total: days.length,
      completed,
      off,
      skipped,
      pending,
    };
  });

  function persist(): void {
    persistSettings({
      customPool: customPool.value,
      schedules: schedules.value,
      selectedWeekIso: selectedWeekIso.value,
    });
  }

  /**
   * Generates or regenerates weekly plan for the specified week (current or next).
   */
  function generatePlanForWeek(weekStartIso: string, preserveCompleted = true): WeeklyChallengeSchedule {
    if (!WeeklyChallengeService.isWeekPlannable(weekStartIso, today.value)) {
      throw new Error("تنها برای هفته جاری و هفته بعد می‌توان برنامه ذخیره و ایجاد کرد.");
    }

    const saturday = DateOnly.fromIsoString(weekStartIso);
    const existing = schedules.value[weekStartIso];
    const newSchedule = WeeklyChallengeService.generateWeeklyPlan(
      saturday,
      allChallenges.value,
      preserveCompleted,
      existing,
    );

    schedules.value[weekStartIso] = newSchedule;
    persist();
    return newSchedule;
  }

  /**
   * Ensures that the current week has a schedule. If none exists, creates it automatically.
   */
  function ensureCurrentWeekPlan(): WeeklyChallengeSchedule {
    const curIso = currentWeekIso.value;
    if (!schedules.value[curIso]) {
      return generatePlanForWeek(curIso, false);
    }
    return schedules.value[curIso];
  }

  /**
   * Switch the active week in view (e.g. current week, next week, or any historical week).
   */
  function selectWeek(weekIso: string): void {
    selectedWeekIso.value = weekIso;
    persist();
  }

  /**
   * Updates a single day's challenge title and description.
   */
  function updateDayChallenge(
    weekStartIso: string,
    dateIso: string,
    title: string,
    description?: string,
    challengeId?: string,
  ): void {
    const schedule = schedules.value[weekStartIso];
    if (!schedule) return;

    const day = schedule.days.find((d) => d.date === dateIso);
    if (!day) return;

    day.challengeTitle = title.trim();
    day.challengeDescription = description?.trim();
    if (challengeId) {
      day.challengeId = challengeId;
      const matched = allChallenges.value.find((c) => c.id === challengeId);
      if (matched) {
        day.challengeTimeTags = getChallengeTimeTags(matched);
      }
    }
    schedule.updatedAt = new Date().toISOString();
    persist();
  }

  /**
   * Re-rolls a single day's challenge from the pool.
   */
  function reRollDay(weekStartIso: string, dateIso: string): void {
    const schedule = schedules.value[weekStartIso];
    if (!schedule) return;

    const day = schedule.days.find((d) => d.date === dateIso);
    if (!day) return;

    const usedIds = schedule.days
      .map((d) => d.challengeId)
      .filter((id): id is string => Boolean(id));

    const picked = WeeklyChallengeService.getRandomChallenge(
      allChallenges.value,
      usedIds,
      day.dayOfWeekIndex,
    );
    day.challengeId = picked.id;
    day.challengeTitle = picked.title;
    day.challengeDescription = picked.description;
    day.challengeTimeTags = getChallengeTimeTags(picked);
    schedule.updatedAt = new Date().toISOString();
    persist();
  }

  /**
   * Toggles Off status for a day (e.g. party, holiday, busy).
   */
  function toggleDayOff(
    weekStartIso: string,
    dateIso: string,
    isOff: boolean,
    reason?: string,
  ): void {
    const schedule = schedules.value[weekStartIso];
    if (!schedule) return;

    const day = schedule.days.find((d) => d.date === dateIso);
    if (!day) return;

    day.isOff = isOff;
    day.offReason = isOff ? reason?.trim() || "روز آف و استراحت دونفره (مهمانی یا مشغله)" : undefined;
    day.status = isOff ? "off" : "pending";
    schedule.updatedAt = new Date().toISOString();
    persist();
  }

  /**
   * Records completion status and summary note written by the couple.
   */
  function setDayResult(
    weekStartIso: string,
    dateIso: string,
    status: ChallengeDayStatus,
    note?: string,
  ): void {
    const schedule = schedules.value[weekStartIso];
    if (!schedule) return;

    const day = schedule.days.find((d) => d.date === dateIso);
    if (!day) return;

    day.status = status;
    day.completionNote = note?.trim();
    day.completedAt = status === "completed" ? new Date().toISOString() : undefined;
    if (status === "off") {
      day.isOff = true;
    }
    schedule.updatedAt = new Date().toISOString();
    persist();
  }

  /**
   * Adds a new custom challenge item to the pool.
   */
  function addCustomChallenge(
    title: string,
    description?: string,
    category = "سفارشی",
    timeTags: ChallengeTimeTag[] = ["any"],
  ): ChallengeItem {
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      throw new Error("عنوان چالش نمی‌تواند خالی باشد.");
    }
    const item: ChallengeItem = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: cleanTitle,
      description: description?.trim(),
      category: category.trim() || "سفارشی",
      timeTags: timeTags.length > 0 ? timeTags : ["any"],
      isDefault: false,
    };
    customPool.value.push(item);
    persist();
    return item;
  }

  /**
   * Removes a challenge from the pool.
   */
  function removeChallenge(id: string): void {
    // If it's a custom challenge, delete it from customPool
    customPool.value = customPool.value.filter((item) => item.id !== id);
    persist();
  }

  /**
   * Resets custom pool.
   */
  function resetChallengePool(): void {
    customPool.value = [];
    persist();
  }

  return {
    today,
    currentWeekIso,
    nextWeekIso,
    selectedWeekIso,
    allChallenges,
    customPool,
    schedules,
    isCurrentWeekSelected,
    isNextWeekSelected,
    isPastWeekSelected,
    canEditSelectedWeek,
    currentWeekPlan,
    selectedWeekPlan,
    todayPlan,
    previousWeeksHistory,
    selectedWeekStats,
    ensureCurrentWeekPlan,
    generatePlanForWeek,
    selectWeek,
    updateDayChallenge,
    reRollDay,
    toggleDayOff,
    setDayResult,
    addCustomChallenge,
    removeChallenge,
    resetChallengePool,
  };
});
