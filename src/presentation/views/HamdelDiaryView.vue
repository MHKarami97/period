<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import { HamdelPhotoService } from "@application/hamdel/HamdelPhotoService";
import { useHamdelStore } from "@application/stores/hamdelStore";
import { useProfileStore } from "@application/stores/profileStore";
import type { HamdelEntry } from "@domain/hamdel/HamdelEntry";
import { MAX_PHOTOS_PER_ENTRY } from "@domain/hamdel/HamdelPhoto";
import { getHamdelSection } from "@domain/hamdel/hamdelSections";
import { HamdelValidationError } from "@domain/hamdel/HamdelValidationError";
import { buildTimeline, TIMELINE_SOURCES } from "@domain/hamdel/timeline";
import { DateOnly } from "@domain/valueObjects/DateOnly";
import ConfirmDialog from "@presentation/components/shared/ConfirmDialog.vue";
import HamdelEntryForm from "@presentation/components/hamdel/HamdelEntryForm.vue";
import HamdelPhotoStrip from "@presentation/components/hamdel/HamdelPhotoStrip.vue";
import { useJalali } from "@presentation/composables/useJalali";
import { useToast } from "@presentation/composables/useToast";

interface PendingPhoto {
  readonly file: File;
  readonly url: string;
}

const SECTION_ID = "diary";
const definition = getHamdelSection(SECTION_ID);
const moodOptions = definition.fields.find((field) => field.key === "mood")?.options ?? [];

const store = useHamdelStore();
const profileStore = useProfileStore();
const { toJalaliLabel } = useJalali();
const { showToast } = useToast();

const enabledSections = ref<Set<string>>(new Set(TIMELINE_SOURCES.filter((source) => source.enabledByDefault).map((source) => source.section)));
const isFormOpen = ref(false);
const editingEntry = ref<HamdelEntry | null>(null);
const formError = ref<string | null>(null);
const pendingPhotos = ref<PendingPhoto[]>([]);
const photoRefreshKey = ref(0);
const entryToRemove = ref<HamdelEntry | null>(null);
const isRemoveConfirmOpen = ref(false);
const isSaving = ref(false);

const timelineGroups = computed(() => {
  const groups: { key: string; label: string; items: ReturnType<typeof buildTimeline> }[] = [];
  for (const item of buildTimeline(store.entries, enabledSections.value)) {
    const day = DateOnly.fromIsoString(item.dateIso);
    const key = toJalaliLabel(day, "yyyy-MM");
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.items.push(item);
    } else {
      groups.push({ key, label: toJalaliLabel(day, "MMMM yyyy"), items: [item] });
    }
  }
  return groups;
});

function toggleSource(section: string): void {
  const next = new Set(enabledSections.value);
  if (next.has(section)) {
    if (next.size > 1) next.delete(section);
  } else {
    next.add(section);
  }
  enabledSections.value = next;
}

function moodLabel(entry: HamdelEntry): string {
  return moodOptions.find((option) => option.value === entry.valueOf("mood"))?.label ?? "";
}

function clearPending(): void {
  for (const photo of pendingPhotos.value) URL.revokeObjectURL(photo.url);
  pendingPhotos.value = [];
}

function onFilesPicked(event: Event): void {
  const input = event.target as HTMLInputElement;
  const room = MAX_PHOTOS_PER_ENTRY - pendingPhotos.value.length;
  const picked = [...(input.files ?? [])].filter((file) => file.type.startsWith("image/")).slice(0, Math.max(0, room));
  pendingPhotos.value = [...pendingPhotos.value, ...picked.map((file) => ({ file, url: URL.createObjectURL(file) }))];
  input.value = "";
}

function removePending(index: number): void {
  URL.revokeObjectURL(pendingPhotos.value[index].url);
  pendingPhotos.value = pendingPhotos.value.filter((_, position) => position !== index);
}

function openAddForm(): void {
  editingEntry.value = null;
  formError.value = null;
  clearPending();
  isFormOpen.value = true;
}

function openEditForm(entry: HamdelEntry): void {
  editingEntry.value = entry;
  formError.value = null;
  clearPending();
  isFormOpen.value = true;
}

function closeForm(): void {
  isFormOpen.value = false;
  editingEntry.value = null;
  formError.value = null;
  clearPending();
}

async function save(values: Record<string, string>): Promise<void> {
  if (isSaving.value) return;
  isSaving.value = true;
  try {
    let entryId: string;
    if (editingEntry.value) {
      await store.update(editingEntry.value.id, values);
      entryId = editingEntry.value.id;
    } else {
      entryId = (await store.add(SECTION_ID, values)).id;
    }
    if (pendingPhotos.value.length > 0) {
      await HamdelPhotoService.addFiles(entryId, pendingPhotos.value.map((photo) => photo.file));
      photoRefreshKey.value += 1;
    }
    showToast("ذخیره شد");
    closeForm();
  } catch (error) {
    formError.value = error instanceof HamdelValidationError ? error.message : "ذخیره نشد.";
  } finally {
    isSaving.value = false;
  }
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

onMounted(() => void store.ensureLoaded());
watch(() => profileStore.activeProfileId, () => void store.ensureLoaded());
onBeforeUnmount(clearPending);
</script>

<template>
  <div class="mx-auto flex w-full max-w-3xl flex-col gap-4">
    <div class="flex items-center justify-between gap-3">
      <h1 class="text-xl font-semibold text-slate-900 dark:text-slate-100">{{ definition.icon }} {{ definition.title }}</h1>
      <RouterLink :to="{ name: 'hamdel' }" class="rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800">همدل ←</RouterLink>
    </div>
    <p class="-mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">{{ definition.description }}</p>

    <template v-if="isFormOpen">
      <section class="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <h2 class="text-sm font-medium text-slate-700 dark:text-slate-200">عکس‌ها (حداکثر {{ MAX_PHOTOS_PER_ENTRY.toLocaleString("fa-IR") }})</h2>
        <HamdelPhotoStrip v-if="editingEntry" :entry-id="editingEntry.id" :refresh-key="photoRefreshKey" editable />
        <div v-if="pendingPhotos.length > 0" class="flex flex-wrap gap-2">
          <div v-for="(photo, index) in pendingPhotos" :key="photo.url" class="relative">
            <img :src="photo.url" alt="پیش‌نمایش عکس" class="h-20 w-20 rounded-xl object-cover" />
            <button type="button" class="absolute -end-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-xs text-white" aria-label="حذف عکس" @click="removePending(index)">✕</button>
          </div>
        </div>
        <label class="inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200">
          📷 افزودن عکس
          <input type="file" accept="image/*" multiple class="sr-only" @change="onFilesPicked" />
        </label>
      </section>
      <HamdelEntryForm
        :key="editingEntry?.id ?? 'new'"
        :definition="definition"
        :initial-values="editingEntry?.values"
        :submit-label="editingEntry ? 'به‌روزرسانی' : 'ذخیره خاطره'"
        :error="formError"
        @submit="save"
        @cancel="closeForm"
      />
    </template>
    <button v-else type="button" class="rounded-xl bg-rose-500/90 px-4 py-3 text-sm font-medium text-white transition hover:bg-rose-500 active:scale-[0.99]" @click="openAddForm">+ نوشتن خاطره</button>

    <div class="flex flex-wrap gap-2" role="group" aria-label="منابع تایم‌لاین">
      <button
        v-for="source in TIMELINE_SOURCES"
        :key="source.section"
        type="button"
        :aria-pressed="enabledSections.has(source.section)"
        class="rounded-full px-3 py-1 text-xs"
        :class="enabledSections.has(source.section) ? 'bg-teal-500/15 text-teal-700 ring-1 ring-teal-500 dark:text-teal-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'"
        @click="toggleSource(source.section)"
      >
        {{ source.icon }} {{ source.label }}
      </button>
    </div>

    <section v-for="group in timelineGroups" :key="group.key" class="flex flex-col gap-3">
      <h2 class="sticky top-0 z-10 bg-slate-100/90 py-1 text-sm font-medium text-slate-500 backdrop-blur dark:bg-slate-950/90 dark:text-slate-400">{{ group.label }}</h2>
      <ol class="flex flex-col gap-3 border-s-2 border-rose-200 ps-4 dark:border-rose-500/30">
        <li v-for="item in group.items" :key="item.entry.id" class="relative flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <span class="absolute -start-[1.4rem] top-5 h-3 w-3 rounded-full bg-rose-400" aria-hidden="true" />
          <header class="flex items-start justify-between gap-2">
            <div class="flex flex-col gap-0.5">
              <span class="text-[11px] text-slate-400 dark:text-slate-500">{{ toJalaliLabel(DateOnly.fromIsoString(item.dateIso), "d MMMM yyyy") }} · {{ item.source.icon }} {{ item.source.label }}<template v-if="item.source.section === 'diary' && moodLabel(item.entry)"> · {{ moodLabel(item.entry) }}</template></span>
              <h3 class="text-sm font-semibold leading-6 text-slate-900 dark:text-slate-100">{{ item.title }}</h3>
            </div>
            <div v-if="item.source.section === 'diary'" class="flex shrink-0 gap-1">
              <button type="button" class="rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800" @click="openEditForm(item.entry)">ویرایش</button>
              <button type="button" class="rounded-lg px-2 py-1 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10" @click="askRemove(item.entry)">حذف</button>
            </div>
            <RouterLink v-else :to="`/app/hamdel/${item.source.section}`" class="shrink-0 rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">باز کردن</RouterLink>
          </header>
          <p v-if="item.text" class="whitespace-pre-line text-sm leading-7 text-slate-700 dark:text-slate-200">{{ item.text }}</p>
          <HamdelPhotoStrip v-if="item.source.section === 'diary'" :entry-id="item.entry.id" :refresh-key="photoRefreshKey" />
        </li>
      </ol>
    </section>

    <p v-if="timelineGroups.length === 0" class="py-8 text-center text-sm text-slate-400 dark:text-slate-500">هنوز چیزی در تایم‌لاین نیست؛ اولین خاطره را بنویس.</p>

    <ConfirmDialog v-model="isRemoveConfirmOpen" title="حذف این خاطره؟" message="متن و عکس‌های آن برای همیشه پاک می‌شود." confirm-label="حذف" danger @confirm="confirmRemove" />
  </div>
</template>
