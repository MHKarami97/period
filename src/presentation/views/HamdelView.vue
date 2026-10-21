<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import { RouterLink } from "vue-router";
import { useHamdelStore } from "@application/stores/hamdelStore";
import { useProfileStore } from "@application/stores/profileStore";
import { HAMDEL_GROUP_IDS, HAMDEL_GROUP_LABELS_FA } from "@domain/hamdel/HamdelSectionDefinition";
import { HAMDEL_SECTIONS } from "@domain/hamdel/hamdelSections";
import { HAMDEL_FEATURES } from "@presentation/hamdel/hamdelFeatures";

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

const groups = computed(() =>
  HAMDEL_GROUP_IDS.map((groupId) => {
    const sections: HubCard[] = HAMDEL_SECTIONS.filter((section) => section.group === groupId).map((section) => ({
      id: section.id,
      title: section.title,
      icon: section.icon,
      description: section.description,
      path: `/app/hamdel/${section.id}`,
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

onMounted(() => void store.ensureLoaded());
watch(() => profileStore.activeProfileId, () => void store.ensureLoaded());
</script>

<template>
  <div class="mx-auto flex w-full max-w-3xl flex-col gap-5">
    <header class="flex flex-col gap-1">
      <h1 class="text-xl font-semibold text-slate-900 dark:text-slate-100">💞 همدل</h1>
      <p class="text-sm leading-6 text-slate-500 dark:text-slate-400">
        دفترچه‌ی شناخت همسر<template v-if="profileStore.activeProfile"> - {{ profileStore.activeProfile.name }}</template>.
        {{ formatNumber(totalCount) }} یادداشت ثبت شده؛ همه‌چیز فقط روی همین دستگاه ذخیره می‌شود.
      </p>
    </header>

    <section v-for="group in groups" :key="group.id" class="flex flex-col gap-3">
      <h2 class="text-sm font-medium text-slate-500 dark:text-slate-400">{{ group.label }}</h2>
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
