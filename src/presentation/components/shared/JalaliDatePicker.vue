<script setup lang="ts">
import { computed, ref } from "vue";
import { DateOnly } from "@domain/valueObjects/DateOnly";
import { useJalali } from "@presentation/composables/useJalali";

/**
 * JalaliDatePicker - reusable, isolated date-selection popover rendered
 * entirely in the Jalali calendar (consistent with JalaliCalendarGrid),
 * replacing the native Gregorian <input type="date"> for any date the
 * user picks inside the app (e.g. period start/end corrections).
 */
const props = defineProps<{ modelValue: DateOnly }>();
const emit = defineEmits<{ (event: "update:modelValue", value: DateOnly): void }>();

const { toJalaliLabel, monthTitle, nextMonth, previousMonth, buildMonthGrid, isSameJalaliMonth } = useJalali();

const isOpen = ref(false);
const monthAnchor = ref(props.modelValue.toDate());
const gridDays = computed(() => buildMonthGrid(monthAnchor.value));

function toggle(): void {
  if (!isOpen.value) {
    monthAnchor.value = props.modelValue.toDate();
  }
  isOpen.value = !isOpen.value;
}

function selectDay(day: DateOnly): void {
  emit("update:modelValue", day);
  isOpen.value = false;
}

function dayClasses(day: DateOnly): string {
  const classes = ["flex h-9 items-center justify-center rounded-lg text-sm hover:bg-slate-700"];
  classes.push(isSameJalaliMonth(day, monthAnchor.value) ? "text-slate-200" : "text-slate-600");
  if (day.isSameDay(props.modelValue)) {
    classes.push("bg-teal-500 text-white hover:bg-teal-500");
  }
  return classes.join(" ");
}
</script>

<template>
  <div class="relative">
    <button
      type="button"
      class="w-full rounded-lg bg-slate-800 px-3 py-2 text-right text-sm text-slate-100 hover:bg-slate-700"
      @click="toggle"
    >
      {{ toJalaliLabel(modelValue) }}
    </button>

    <div v-if="isOpen" class="absolute z-20 mt-2 w-72 rounded-2xl bg-slate-900 p-3 shadow-lg ring-1 ring-slate-800">
      <div class="mb-2 flex items-center justify-between">
        <button type="button" class="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-800" @click="monthAnchor = previousMonth(monthAnchor)">‹</button>
        <span class="text-sm font-medium text-slate-100">{{ monthTitle(monthAnchor) }}</span>
        <button type="button" class="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-800" @click="monthAnchor = nextMonth(monthAnchor)">›</button>
      </div>
      <div class="grid grid-cols-7 gap-1">
        <button v-for="day in gridDays" :key="day.toIsoString()" type="button" :class="dayClasses(day)" @click="selectDay(day)">
          {{ toJalaliLabel(day, "d") }}
        </button>
      </div>
    </div>
  </div>
</template>
