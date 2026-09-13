<script setup lang="ts">
import { ref } from "vue";
import { useProfileStore } from "@application/stores/profileStore";
import { useCycleStore } from "@application/stores/cycleStore";
import { useSymptomStore } from "@application/stores/symptomStore";
import ConfirmDialog from "@presentation/components/shared/ConfirmDialog.vue";

const profileStore = useProfileStore();
const cycleStore = useCycleStore();
const symptomStore = useSymptomStore();

const isAdding = ref(false);
const newProfileName = ref("");
const NAME_SUGGESTIONS = ["همسر", "شریک", "خواهر", "دختر", "مادر"];

const profilePendingDeletion = ref<{ id: string; name: string } | null>(null);

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

function requestDeleteProfile(profile: { id: string; name: string }): void {
  profilePendingDeletion.value = profile;
}

async function confirmDeleteProfile(): Promise<void> {
  if (!profilePendingDeletion.value) return;
  await profileStore.removeProfile(profilePendingDeletion.value.id);
  await reloadProfileScopedData();
  profilePendingDeletion.value = null;
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-wrap items-center gap-2 rounded-2xl bg-white p-3 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <div
        v-for="profile in profileStore.profiles"
        :key="profile.id"
        class="flex items-center overflow-hidden rounded-full"
        :class="
          profile.id === profileStore.activeProfileId
            ? 'bg-teal-500/90 text-white'
            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
        "
      >
        <button type="button" class="px-3 py-1.5 text-sm" @click="selectProfile(profile.id)">
          {{ profile.name }}
        </button>
        <button
          type="button"
          class="px-2 py-1.5 text-xs opacity-70 hover:bg-black/10 hover:opacity-100"
          :aria-label="`حذف ${profile.name}`"
          @click="requestDeleteProfile(profile)"
        >
          ×
        </button>
      </div>

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
        <button type="button" class="rounded-lg px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800" @click="cancelAdding">
          انصراف
        </button>
        <button type="button" class="rounded-lg bg-teal-500/90 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-500" @click="addProfile(newProfileName)">
          افزودن
        </button>
      </div>
    </div>

    <ConfirmDialog
      :model-value="profilePendingDeletion !== null"
      title="حذف این فرد؟"
      :message="`تمام پریودها و علائم ثبت‌شده برای «${profilePendingDeletion?.name}» حذف خواهد شد و دیگر در لیست قابل مشاهده نخواهد بود. این کار قابل بازگشت نیست.`"
      confirm-label="حذف کن"
      danger
      @update:model-value="profilePendingDeletion = null"
      @confirm="confirmDeleteProfile"
    />
  </div>
</template>