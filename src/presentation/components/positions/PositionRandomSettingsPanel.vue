<script setup lang="ts">
import { usePositionsStore } from "@application/stores/positionsStore";
import { AUTO_ADVANCE_MAX_SECONDS, AUTO_ADVANCE_MIN_SECONDS } from "@domain/positions/AutoAdvanceSettings";
import NumberStepper from "@presentation/components/games/NumberStepper.vue";

const INTERVAL_PRESETS: ReadonlyArray<{ seconds: number; label: string }> = [
  { seconds: 15, label: "۱۵ ثانیه" },
  { seconds: 30, label: "۳۰ ثانیه" },
  { seconds: 60, label: "۱ دقیقه" },
  { seconds: 120, label: "۲ دقیقه" },
  { seconds: 300, label: "۵ دقیقه" },
];

const store = usePositionsStore();
</script>

<template>
  <section class="flex max-h-96 flex-col gap-4 overflow-y-auto p-4 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
    <div class="flex flex-col gap-3">
      <label class="flex cursor-pointer items-center justify-between gap-3 text-sm text-slate-900 dark:text-slate-100">
        <span>⏱ رفتن خودکار به پوزیشن تصادفی بعدی</span>
        <input
          type="checkbox"
          role="switch"
          class="h-5 w-5 accent-rose-500"
          :checked="store.autoAdvance.enabled"
          @change="store.setAutoAdvanceEnabled(($event.target as HTMLInputElement).checked)"
        />
      </label>

      <template v-if="store.autoAdvance.enabled">
        <NumberStepper
          label="فاصله‌ی زمانی (ثانیه)"
          :model-value="store.autoAdvance.seconds"
          :min="AUTO_ADVANCE_MIN_SECONDS"
          :max="AUTO_ADVANCE_MAX_SECONDS"
          @update:model-value="store.setAutoAdvanceSeconds($event)"
        />
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="preset in INTERVAL_PRESETS"
            :key="preset.seconds"
            type="button"
            class="rounded-full px-3 py-1 text-xs transition"
            :class="
              store.autoAdvance.seconds === preset.seconds
                ? 'bg-teal-500/10 text-teal-600 ring-1 ring-teal-500 dark:bg-teal-500/20 dark:text-teal-300 dark:ring-teal-400'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            "
            @click="store.setAutoAdvanceSeconds(preset.seconds)"
          >
            {{ preset.label }}
          </button>
        </div>
        <p class="text-xs leading-6 text-slate-500 dark:text-slate-400">
          بعد از زدن «پوزیشن تصادفی»، پنجره‌ی پوزیشن پس از این مدت خودکار به پوزیشن بعدی می‌رود. داخل پنجره می‌توانی تایمر را متوقف کنی.
        </p>
      </template>
    </div>

    <hr class="border-slate-200 dark:border-slate-800" />

    <div class="flex items-start justify-between gap-3">
      <p class="text-xs leading-6 text-slate-500 dark:text-slate-400">
        دکمه «پوزیشن تصادفی» فقط از نتایج فعلی (با جستجو و فیلترها) انتخاب می‌کند. مواردی که اینجا غیرفعال شوند هیچ‌وقت در انتخاب تصادفی نمی‌آیند.
      </p>
      <button
        v-if="store.randomExclusions.count > 0"
        type="button"
        class="shrink-0 text-xs text-rose-500 hover:underline"
        @click="store.clearRandomExclusions()"
      >
        فعال کردن همه
      </button>
    </div>

    <div v-for="group in store.facetGroups" :key="group.key" class="flex flex-col gap-2">
      <h3 class="text-xs font-semibold text-slate-500 dark:text-slate-400">{{ group.label }}</h3>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="option in group.options"
          :key="option.value"
          type="button"
          role="switch"
          class="rounded-full px-3 py-1 text-xs transition"
          :class="
            store.randomExclusions.isExcluded(group.key, option.value)
              ? 'bg-rose-500/10 text-rose-600 line-through ring-1 ring-rose-400 dark:bg-rose-500/20 dark:text-rose-300'
              : 'bg-teal-500/10 text-teal-600 ring-1 ring-teal-500 dark:bg-teal-500/20 dark:text-teal-300 dark:ring-teal-400'
          "
          :aria-checked="!store.randomExclusions.isExcluded(group.key, option.value)"
          @click="store.toggleRandomExclusion(group.key, option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>
  </section>
</template>
