<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import { useHamdelStore } from "@application/stores/hamdelStore";
import { useProfileStore } from "@application/stores/profileStore";
import { HAMDEL_GROUP_IDS, HAMDEL_GROUP_LABELS_FA } from "@domain/hamdel/HamdelSectionDefinition";
import { HAMDEL_SECTIONS } from "@domain/hamdel/hamdelSections";
import { HAMDEL_FEATURES } from "@presentation/hamdel/hamdelFeatures";
import { HamdelReportService } from "@infrastructure/pdf/HamdelReportService";
import AppIcon from "@presentation/components/common/AppIcon.vue";
import { useToast } from "@presentation/composables/useToast";

interface HubCard {
  readonly id: string;
  readonly title: string;
  readonly icon: string;
  readonly description: string;
  readonly path: string;
  readonly count: number;
}

const store = useHamdelStore();
const profileStore = useProfileStore();
const { showToast } = useToast();

const includePhotos = ref(false);
const isExporting = ref(false);

const groups = computed(() =>
  HAMDEL_GROUP_IDS.map((groupId) => {
    const sections: HubCard[] = HAMDEL_SECTIONS.filter((section) => section.group === groupId).map((section) => ({
      id: section.id,
      title: section.title,
      icon: section.icon,
      description: section.description,
      path: section.customView ? `/app/hamdel/${section.customView}` : `/app/hamdel/${section.id}`,
      count: store.countOf(section.id),
    }));
    const features: HubCard[] = HAMDEL_FEATURES.filter((feature) => feature.group === groupId).map((feature) => ({
      id: feature.id,
      title: feature.title,
      icon: feature.icon,
      description: feature.description,
      path: feature.path,
      count: 0,
    }));
    return { id: groupId, label: HAMDEL_GROUP_LABELS_FA[groupId], cards: [...sections, ...features] };
  }).filter((group) => group.cards.length > 0),
);

const totalCount = computed(() => store.entries.length);
const formatNumber = (value: number): string => value.toLocaleString("fa-IR");

async function exportPdf(): Promise<void> {
  if (isExporting.value) return;
  isExporting.value = true;
  try {
    await HamdelReportService.openFullReport(store.entries, {
      profileName: profileStore.activeProfile?.name ?? "همسر",
      includePhotos: includePhotos.value,
    });
  } catch (error) {
    showToast(error instanceof Error ? error.message : "خطا در ساخت گزارش PDF", 2500);
  } finally {
    isExporting.value = false;
  }
}

onMounted(() => void store.ensureLoaded());
watch(() => profileStore.activeProfileId, () => void store.ensureLoaded());
</script>

<template>
  <div class="mx-auto flex w-full max-w-3xl flex-col gap-6">
    <header class="flex flex-col gap-1">
      <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100">💞 همدل</h1>
      <p class="text-sm leading-6 text-slate-500 dark:text-slate-400">
        دفترچه‌ی شناخت همسر<template v-if="profileStore.activeProfile"> - {{ profileStore.activeProfile.name }}</template>.
        {{ formatNumber(totalCount) }} یادداشت ثبت شده؛ همه‌چیز کاملاً محلی و امن روی همین دستگاه است.
      </p>
    </header>

    <!-- DEDICATED PDF EXPORT PART -->
    <section class="rounded-3xl bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-teal-500/10 p-4 sm:p-6 ring-1 ring-rose-500/25 dark:bg-slate-900 dark:ring-rose-500/35 shadow-xs flex flex-col gap-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div class="flex items-center gap-3">
          <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/15 text-2xl text-rose-600 dark:bg-rose-500/25 dark:text-rose-300">
            📄
          </span>
          <div class="min-w-0">
            <h2 class="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
              خروجی PDF و سند رسمی همدل
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-5">
              خلاصه‌ی کامل علایق، اندازه‌ها، قول‌ها، هدیه‌ها، خاطرات و آمار در یک سند شکیل چاپی
            </p>
          </div>
        </div>

        <RouterLink
          to="/app/hamdel/stats"
          class="shrink-0 self-start sm:self-center rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 transition active:scale-95"
        >
          📊 آمار و نمودارها
        </RouterLink>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-rose-500/10 dark:border-slate-800">
        <label class="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
          <input v-model="includePhotos" type="checkbox" />
          <span>عکس‌های دفترچه‌ی خاطرات هم در فایل گزارش باشد</span>
        </label>

        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-500 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-rose-600 transition active:scale-95 disabled:opacity-50"
          :disabled="isExporting || totalCount === 0"
          @click="exportPdf"
        >
          <AppIcon name="print" size="xs" />
          <span>{{ isExporting ? "در حال آماده‌سازی..." : "دریافت فایل PDF همدل" }}</span>
        </button>
      </div>
    </section>

    <!-- HAMDEL SECTIONS GROUPS -->
    <section v-for="group in groups" :key="group.id" class="flex flex-col gap-3">
      <h2 class="text-xs font-bold tracking-wide text-slate-500 uppercase dark:text-slate-400">{{ group.label }}</h2>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <RouterLink
          v-for="card in group.cards"
          :key="card.id"
          :to="card.path"
          class="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:ring-rose-300 active:scale-[0.99] dark:bg-slate-900 dark:ring-slate-800 dark:hover:ring-rose-400/60"
        >
          <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-xl dark:bg-rose-500/20">{{ card.icon }}</span>
          <span class="flex min-w-0 flex-col gap-0.5">
            <span class="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              {{ card.title }}
              <span v-if="card.count > 0" class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-normal text-slate-500 dark:bg-slate-800 dark:text-slate-400">{{ formatNumber(card.count) }}</span>
            </span>
            <span class="text-xs leading-5 text-slate-500 dark:text-slate-400">{{ card.description }}</span>
          </span>
        </RouterLink>
      </div>
    </section>
  </div>
</template>
