<script setup lang="ts">
import { ref } from "vue";
import { useProfileStore } from "@application/stores/profileStore";
import { useCycleStore } from "@application/stores/cycleStore";
import { useSymptomStore } from "@application/stores/symptomStore";

/**
 * ProfileSwitcher - lets a partner track several people (wife, sister,
 * daughter, ...) from one device and switch between them. Only rendered
 * in partner mode (see usages in DashboardView/CalendarView) — a
 * self-tracking user always has exactly one implicit profile and never
 * needs this UI.
 */
const profileStore = useProfileStore();
const cycleStore = useCycleStore();
const symptomStore = useSymptomStore();

const isAdding = ref(false);
const newProfileName = ref("");
const NAME_SUGGESTIONS = ["همسر", "شریک", "خواهر", "دختر", "مادر"];

/**
 * Switching the active profile changes what cycleStore/symptomStore should
 * contain, so both are reloaded immediately after the switch — otherwise
 * the dashboard would keep showing the previous profile's data.
 */
async function reloadProfileScopedData(): Promise<void> {
  await Promise.all([cycleStore.initialize(), symptomStore.initialize()]);
}

async function selectProfile(profileId: string): Promise<void> {
  if (profileId === profileStore.activeProfileId) {
    return;
  }
  profileStore.setActiveProfile(profileId);
  await reloadProfileScopedData();
}

async function addProfile(name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) {
    return;
  }
  await profileStore.addProfile(trimmed);
  await reloadProfileScopedData();
  newProfileName.value = "";
  isAdding.value = false;
}

function cancelAdding(): void {
  newProfileName.value = "";
  isAdding.value = false;
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-wrap items-center gap-2 rounded-2xl bg-white p-3 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <button
        v-for="profile in profileStore.profiles"
        :key="profile.id"
        type="button"
        class="rounded-full px-3 py-1.5 text-sm"
        :class="
          profile.id === profileStore.activeProfileId
            ? 'bg-teal-500/90 text-white'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
        "
        @click="selectProfile(profile.id)"
      >
        {{ profile.name }}
      </button>

      <button
        type="button"
        class="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        @click="isAdding = !isAdding"
      >
        + افزودن فرد
      </button>
    </div>

    <div
      v-if="isAdding"
      class="flex flex-col gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
    >
      <input
        v-model="newProfileName"
        type="text"
        placeholder="مثلاً همسر"
        class="w-full rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-900 dark:bg-slate-800 dark:text-slate-100"
        @keyup.enter="addProfile(newProfileName)"
      />

      <div class="flex flex-wrap gap-2">
        <button
          v-for="suggestion in NAME_SUGGESTIONS"
          :key="suggestion"
          type="button"
          class="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          @click="addProfile(suggestion)"
        >
          {{ suggestion }}
        </button>
      </div>

      <div class="flex justify-end gap-2">
        <button
          type="button"
          class="rounded-lg px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          @click="cancelAdding"
        >
          انصراف
        </button>
        <button
          type="button"
          class="rounded-lg bg-teal-500/90 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-500"
          @click="addProfile(newProfileName)"
        >
          افزودن
        </button>
      </div>
    </div>
  </div>
</template>