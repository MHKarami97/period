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
const isPresetsOpen = ref(false);
const presetSearchText = ref("");

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

const filteredPresets = computed(() => {
  const current = definition.value;
  if (!current) return [];
  const needle = presetSearchText.value.trim().toLowerCase();
  if (!needle) return availablePresets.value;
  return availablePresets.value.filter((preset) => {
    return Object.values(preset).some((val) =>
      typeof val === "string" && val.toLowerCase().includes(needle)
    );
  });
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
    presetSearchText.value = "";
    isPresetsOpen.value = false;
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

    <!-- PRESETS ACCORDION WITH LIVE TYPE-TO-SEARCH -->
    <div
      v-if="availablePresets.length > 0"
      class="overflow-hidden rounded-2xl border border-teal-500/25 bg-gradient-to-br from-teal-50/50 via-white to-teal-50/20 p-4 shadow-2xs transition-all dark:border-teal-500/30 dark:from-teal-950/25 dark:via-slate-900 dark:to-teal-950/20"
    >
      <button
        type="button"
        class="flex w-full items-center justify-between text-start text-sm font-bold text-slate-800 dark:text-slate-200"
        @click="isPresetsOpen = !isPresetsOpen"
      >
        <div class="flex items-center gap-2">
          <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/15 text-sm text-teal-700 dark:bg-teal-500/25 dark:text-teal-300">💡</span>
          <span>ایده‌ها و پیشنهادات آماده</span>
          <span class="rounded-full bg-teal-500/15 px-2 py-0.5 text-xs font-semibold text-teal-700 dark:bg-teal-500/25 dark:text-teal-300">
            {{ availablePresets.length.toLocaleString("fa-IR") }} مورد
          </span>
        </div>
        <svg
          class="h-4 w-4 text-slate-400 transition-transform duration-200"
          :class="{ 'rotate-180': isPresetsOpen }"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div v-if="isPresetsOpen" class="mt-3 flex flex-col gap-3 border-t border-teal-500/15 pt-3 dark:border-slate-800">
        <!-- Live search input inside presets -->
        <div class="relative flex items-center">
          <input
            v-model="presetSearchText"
            type="text"
            placeholder="جست‌وجو در ایده‌های آماده با تایپ کردن..."
            class="w-full rounded-xl border border-slate-200 bg-white py-2 pe-8 ps-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-850 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          <button
            v-if="presetSearchText"
            type="button"
            class="absolute left-2.5 flex h-4 w-4 items-center justify-center rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            @click="presetSearchText = ''"
          >
            ✕
          </button>
        </div>

        <!-- Presets list -->
        <ul class="flex max-h-72 flex-col gap-2 overflow-y-auto pe-1">
          <li
            v-for="preset in filteredPresets"
            :key="preset[definition.titleField]"
            class="flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-white/90 p-2.5 text-xs leading-6 text-slate-700 shadow-2xs hover:border-teal-300 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-200"
          >
            <div class="flex flex-col min-w-0">
              <span class="font-medium text-slate-800 dark:text-slate-200">{{ preset[definition.titleField] }}</span>
              <span v-if="preset.category" class="text-[11px] text-teal-600 dark:text-teal-400">دسته‌بندی: {{ preset.category }}</span>
              <span v-if="preset.notes" class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{{ preset.notes }}</span>
            </div>
            <button
              type="button"
              class="shrink-0 rounded-lg bg-teal-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-teal-700 active:scale-95 transition"
              @click="addPreset(preset)"
            >
              + افزودن
            </button>
          </li>
          <li v-if="filteredPresets.length === 0" class="py-4 text-center text-xs text-slate-400 dark:text-slate-500">
            ایده‌ای منطبق با عبارت «{{ presetSearchText }}» پیدا نشد.
          </li>
        </ul>
      </div>
    </div>

    <div v-if="store.entriesOf(definition.id).length > 0" class="flex flex-col gap-3">
      <div class="relative flex items-center">
        <input
          v-model="searchText"
          type="search"
          placeholder="جست‌وجو در موارد ثبت‌شده..."
          class="w-full rounded-xl bg-white py-2.5 pe-8 ps-3 text-xs sm:text-sm text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800"
        />
        <button
          v-if="searchText"
          type="button"
          class="absolute left-2.5 flex h-4 w-4 items-center justify-center rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          @click="searchText = ''"
        >
          ✕
        </button>
      </div>
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
