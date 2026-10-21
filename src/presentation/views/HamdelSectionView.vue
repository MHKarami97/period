<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { useHamdelStore } from "@application/stores/hamdelStore";
import { useProfileStore } from "@application/stores/profileStore";
import type { HamdelEntry } from "@domain/hamdel/HamdelEntry";
import { findHamdelSection } from "@domain/hamdel/hamdelSections";
import { HamdelValidationError } from "@domain/hamdel/HamdelValidationError";
import ConfirmDialog from "@presentation/components/shared/ConfirmDialog.vue";
import HamdelEntryCard from "@presentation/components/hamdel/HamdelEntryCard.vue";
import HamdelEntryForm from "@presentation/components/hamdel/HamdelEntryForm.vue";
import { useToast } from "@presentation/composables/useToast";

const route = useRoute();
const router = useRouter();
const store = useHamdelStore();
const profileStore = useProfileStore();
const { showToast } = useToast();

const definition = computed(() => findHamdelSection(String(route.params.section)));

const isFormOpen = ref(false);
const editingEntry = ref<HamdelEntry | null>(null);
const entryToRemove = ref<HamdelEntry | null>(null);
const isRemoveConfirmOpen = ref(false);
const formError = ref<string | null>(null);
const searchText = ref("");
const activeFilter = ref<string>("");

const filterField = computed(() => definition.value?.fields.find((field) => field.key === definition.value?.filterField) ?? null);

const visibleEntries = computed(() => {
  const current = definition.value;
  if (!current) return [];
  const needle = searchText.value.trim().toLowerCase();
  return store.entriesOf(current.id).filter((entry) => {
    if (activeFilter.value && entry.valueOf(current.filterField ?? "") !== activeFilter.value) return false;
    return needle.length === 0 || Object.values(entry.values).some((value) => value.toLowerCase().includes(needle));
  });
});

/** Presets whose headline text is not already in the list. */
const availablePresets = computed(() => {
  const current = definition.value;
  if (!current?.presets) return [];
  const existing = new Set(store.entriesOf(current.id).map((entry) => entry.valueOf(current.titleField)));
  return current.presets.filter((preset) => !existing.has(preset[current.titleField] ?? ""));
});

function openAddForm(): void {
  editingEntry.value = null;
  formError.value = null;
  isFormOpen.value = true;
}

function openEditForm(entry: HamdelEntry): void {
  editingEntry.value = entry;
  formError.value = null;
  isFormOpen.value = true;
}

function closeForm(): void {
  isFormOpen.value = false;
  editingEntry.value = null;
  formError.value = null;
}

async function save(values: Record<string, string>): Promise<void> {
  const current = definition.value;
  if (!current) return;
  try {
    if (editingEntry.value) {
      await store.update(editingEntry.value.id, values);
    } else {
      await store.add(current.id, values);
    }
    showToast("ذخیره شد");
    closeForm();
  } catch (error) {
    formError.value = error instanceof HamdelValidationError ? error.message : "ذخیره نشد.";
  }
}

async function addPreset(preset: Readonly<Record<string, string>>): Promise<void> {
  if (!definition.value) return;
  await store.addPreset(definition.value.id, preset);
  showToast("اضافه شد");
}

function askRemove(entry: HamdelEntry): void {
  entryToRemove.value = entry;
  isRemoveConfirmOpen.value = true;
}

async function confirmRemove(): Promise<void> {
  if (entryToRemove.value) {
    await store.remove(entryToRemove.value.id);
    entryToRemove.value = null;
    showToast("حذف شد");
  }
}

watch(
  () => route.params.section,
  () => {
    closeForm();
    searchText.value = "";
    activeFilter.value = "";
  },
);

onMounted(async () => {
  if (!definition.value) {
    await router.replace({ name: "hamdel" });
    return;
  }
  await store.ensureLoaded();
});
watch(() => profileStore.activeProfileId, () => void store.ensureLoaded());
</script>

<template>
  <div v-if="definition" class="mx-auto flex w-full max-w-3xl flex-col gap-4">
    <div class="flex items-center justify-between gap-3">
      <h1 class="text-xl font-semibold text-slate-900 dark:text-slate-100">{{ definition.icon }} {{ definition.title }}</h1>
      <RouterLink :to="{ name: 'hamdel' }" class="rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800">همدل ←</RouterLink>
    </div>
    <p class="-mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">{{ definition.description }}</p>

    <HamdelEntryForm
      v-if="isFormOpen"
      :key="editingEntry?.id ?? 'new'"
      :definition="definition"
      :initial-values="editingEntry?.values"
      :submit-label="editingEntry ? 'به‌روزرسانی' : 'افزودن'"
      :error="formError"
      @submit="save"
      @cancel="closeForm"
    />
    <button
      v-else
      type="button"
      class="rounded-xl bg-rose-500/90 px-4 py-3 text-sm font-medium text-white transition hover:bg-rose-500 active:scale-[0.99]"
      @click="openAddForm"
    >
      + افزودن
    </button>

    <details v-if="availablePresets.length > 0" class="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <summary class="cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-200">ایده‌های آماده ({{ availablePresets.length.toLocaleString("fa-IR") }})</summary>
      <ul class="mt-3 flex max-h-72 flex-col gap-2 overflow-y-auto">
        <li v-for="preset in availablePresets" :key="preset[definition.titleField]" class="flex items-start justify-between gap-3 rounded-lg bg-slate-50 p-2 text-xs leading-6 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <span class="min-w-0">{{ preset[definition.titleField] }}</span>
          <button type="button" class="shrink-0 rounded-lg bg-teal-500/90 px-2 py-1 text-white hover:bg-teal-500" @click="addPreset(preset)">+ افزودن</button>
        </li>
      </ul>
    </details>

    <div v-if="store.entriesOf(definition.id).length > 0" class="flex flex-col gap-3">
      <input
        v-model="searchText"
        type="search"
        placeholder="جست‌وجو..."
        class="w-full rounded-lg bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800"
      />
      <div v-if="filterField" class="flex flex-wrap gap-2">
        <button
          type="button"
          class="rounded-full px-3 py-1 text-xs"
          :class="activeFilter === '' ? 'bg-teal-500/15 text-teal-700 ring-1 ring-teal-500 dark:text-teal-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'"
          @click="activeFilter = ''"
        >
          همه
        </button>
        <button
          v-for="option in filterField.options"
          :key="option.value"
          type="button"
          class="rounded-full px-3 py-1 text-xs"
          :class="activeFilter === option.value ? 'bg-teal-500/15 text-teal-700 ring-1 ring-teal-500 dark:text-teal-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'"
          @click="activeFilter = option.value"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <div v-if="visibleEntries.length > 0" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <HamdelEntryCard
        v-for="entry in visibleEntries"
        :key="entry.id"
        :entry="entry"
        :definition="definition"
        @edit="openEditForm"
        @remove="askRemove"
        @toggle="store.toggleStatus($event.id)"
        @advance="store.advanceStatus($event.id)"
      />
    </div>
    <p v-else class="py-8 text-center text-sm text-slate-400 dark:text-slate-500">
      {{ store.entriesOf(definition.id).length === 0 ? "هنوز چیزی ثبت نشده؛ اولین مورد را اضافه کن." : "موردی پیدا نشد." }}
    </p>

    <ConfirmDialog
      v-model="isRemoveConfirmOpen"
      title="حذف این مورد؟"
      message="این یادداشت برای همیشه پاک می‌شود."
      confirm-label="حذف"
      danger
      @confirm="confirmRemove"
    />
  </div>
</template>
