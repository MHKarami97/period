<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import { useHamdelStore } from "@application/stores/hamdelStore";
import { useProfileStore } from "@application/stores/profileStore";
import { briefToPlainText, buildMeetingBrief, MEETING_CONTEXTS, type MeetingContextId } from "@domain/hamdel/meetingBrief";
import { DateOnly } from "@domain/valueObjects/DateOnly";
import type { HamdelEntry } from "@domain/hamdel/HamdelEntry";
import ConfirmDialog from "@presentation/components/shared/ConfirmDialog.vue";
import { useToast } from "@presentation/composables/useToast";

const store = useHamdelStore();
const profileStore = useProfileStore();
const { showToast } = useToast();

const selectedContext = ref<MeetingContextId>("party");

const context = computed(() => MEETING_CONTEXTS.find((candidate) => candidate.id === selectedContext.value) ?? MEETING_CONTEXTS[0]);
const groups = computed(() => buildMeetingBrief(selectedContext.value, store.entries, DateOnly.today()));

const ownNotes = computed(() =>
  store.entriesOf("occasionNotes").filter((entry) => entry.valueOf("context") === selectedContext.value),
);

// Note creation and edit state
const isFormOpen = ref(false);
const editingEntry = ref<HamdelEntry | null>(null);
const formTitle = ref("");
const formNote = ref("");
const formError = ref<string | null>(null);

// Removal confirmation
const noteToRemove = ref<HamdelEntry | null>(null);
const isRemoveConfirmOpen = ref(false);

function openAddForm(): void {
  editingEntry.value = null;
  formTitle.value = "";
  formNote.value = "";
  formError.value = null;
  isFormOpen.value = true;
}

function openEditForm(entry: HamdelEntry): void {
  editingEntry.value = entry;
  formTitle.value = entry.valueOf("title");
  formNote.value = entry.valueOf("note");
  formError.value = null;
  isFormOpen.value = true;
}

function closeForm(): void {
  isFormOpen.value = false;
  editingEntry.value = null;
  formTitle.value = "";
  formNote.value = "";
  formError.value = null;
}

async function saveNote(): Promise<void> {
  const title = formTitle.value.trim();
  const note = formNote.value.trim();
  if (!title) {
    formError.value = "عنوان یادداشت را وارد کنید.";
    return;
  }
  if (!note) {
    formError.value = "متن یادداشت را وارد کنید.";
    return;
  }

  try {
    if (editingEntry.value) {
      await store.update(editingEntry.value.id, {
        context: selectedContext.value,
        title,
        note,
      });
      showToast("یادداشت به‌روز شد");
    } else {
      await store.add("occasionNotes", {
        context: selectedContext.value,
        title,
        note,
      });
      showToast("یادداشت اضافه شد");
    }
    closeForm();
  } catch {
    formError.value = "ذخیره نشد.";
  }
}

function askRemoveNote(entry: HamdelEntry): void {
  noteToRemove.value = entry;
  isRemoveConfirmOpen.value = true;
}

async function confirmRemove(): Promise<void> {
  if (noteToRemove.value) {
    await store.remove(noteToRemove.value.id);
    noteToRemove.value = null;
    showToast("حذف شد");
  }
}

async function copyBrief(): Promise<void> {
  try {
    await navigator.clipboard.writeText(briefToPlainText(context.value.label, groups.value));
    showToast("کپی شد");
  } catch {
    showToast("کپی انجام نشد", 1800);
  }
}

onMounted(() => void store.ensureLoaded());
watch(() => profileStore.activeProfileId, () => void store.ensureLoaded());
watch(selectedContext, () => closeForm());
</script>

<template>
  <div class="mx-auto flex w-full max-w-3xl flex-col gap-5">
    <div class="flex items-center justify-between gap-3">
      <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100">🧭 نکات و آمادگی قبل از ملاقات</h1>
      <RouterLink :to="{ name: 'hamdel' }" class="rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800">همدل ←</RouterLink>
    </div>
    <p class="-mt-3 text-xs leading-6 text-slate-500 dark:text-slate-400">
      موقعیت را انتخاب کن؛ خلاصه‌ی هوشمند از خطوط قرمز و آرام‌کننده‌ها به همراه یادداشت‌های شخصی شما در یکجا نمایش داده می‌شود.
    </p>

    <!-- Context Switcher -->
    <div class="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="موقعیت">
      <button
        v-for="item in MEETING_CONTEXTS"
        :key="item.id"
        type="button"
        role="radio"
        :aria-checked="item.id === selectedContext"
        class="flex flex-col items-center gap-1 rounded-2xl p-3 text-xs transition"
        :class="item.id === selectedContext ? 'bg-teal-500/15 text-teal-700 ring-2 ring-teal-500 dark:text-teal-300' : 'bg-white text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800'"
        @click="selectedContext = item.id"
      >
        <span class="text-2xl">{{ item.icon }}</span>
        <span class="font-bold">{{ item.label }}</span>
      </button>
    </div>

    <!-- 1. PERSONAL OCCASION NOTES SECTION -->
    <section class="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <div class="flex items-center justify-between gap-2">
        <h2 class="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
          <span>📝 یادداشت‌های اختصاصی شما برای {{ context.label }}</span>
          <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-normal text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            {{ ownNotes.length.toLocaleString("fa-IR") }}
          </span>
        </h2>
        <button
          v-if="!isFormOpen"
          type="button"
          class="rounded-xl bg-teal-500/90 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-500 transition active:scale-95"
          @click="openAddForm"
        >
          + یادداشت جدید
        </button>
      </div>

      <!-- Add/Edit Note Form -->
      <form v-if="isFormOpen" class="flex flex-col gap-2.5 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200 dark:bg-slate-850 dark:ring-slate-800" @submit.prevent="saveNote">
        <input
          v-model="formTitle"
          type="text"
          placeholder="عنوان یادداشت (مثلاً: ساعت برگشت، وسایل مهم، هماهنگی شام...)"
          class="w-full rounded-lg bg-white px-3 py-2 text-xs text-slate-900 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700"
        />
        <textarea
          v-model="formNote"
          rows="3"
          placeholder="شرح نکته یا توصیه‌ای که باید به یاد داشته باشی..."
          class="w-full resize-none rounded-lg bg-white px-3 py-2 text-xs text-slate-900 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700"
        />
        <p v-if="formError" class="text-xs font-semibold text-rose-500">{{ formError }}</p>
        <div class="flex justify-end gap-2 pt-1">
          <button type="button" class="rounded-lg px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700" @click="closeForm">انصراف</button>
          <button type="submit" class="rounded-xl bg-teal-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-teal-700">{{ editingEntry ? "به‌روزرسانی" : "ذخیره یادداشت" }}</button>
        </div>
      </form>

      <!-- Own Notes List -->
      <div v-if="ownNotes.length > 0" class="flex flex-col gap-2">
        <div
          v-for="item in ownNotes"
          :key="item.id"
          class="flex items-start justify-between gap-3 rounded-xl bg-slate-50/80 p-3 ring-1 ring-slate-100 dark:bg-slate-800/60 dark:ring-slate-800"
        >
          <div class="flex flex-col gap-1 min-w-0">
            <span class="text-xs font-bold text-slate-900 dark:text-slate-100">{{ item.valueOf("title") }}</span>
            <p class="text-xs text-slate-600 dark:text-slate-300 leading-5 whitespace-pre-wrap">{{ item.valueOf("note") }}</p>
          </div>
          <div class="flex shrink-0 items-center gap-1">
            <button
              type="button"
              class="rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700"
              @click="openEditForm(item)"
            >
              ویرایش
            </button>
            <button
              type="button"
              class="rounded-lg px-2 py-1 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              @click="askRemoveNote(item)"
            >
              حذف
            </button>
          </div>
        </div>
      </div>
      <p v-else-if="!isFormOpen" class="text-xs text-slate-400 dark:text-slate-500 text-center py-2">
        هنوز یادداشت اختصاصی برای {{ context.label }} ثبت نکرده‌اید. با دکمه بالا اولین نکته را اضافه کنید.
      </p>
    </section>

    <!-- 2. SMART GUIDANCE / BRIEF GROUPS -->
    <div class="flex items-center justify-between gap-2 pt-1">
      <h2 class="text-sm font-bold text-slate-800 dark:text-slate-200">
        💡 راهنمای هوشمند سیستم برای {{ context.label }}
      </h2>
      <button
        v-if="groups.length > 0"
        type="button"
        class="rounded-xl bg-rose-500/90 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-500 active:scale-95 transition"
        @click="copyBrief"
      >
        کپی کل خلاصه
      </button>
    </div>

    <section v-for="group in groups" :key="group.key" class="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ group.icon }} {{ group.title }}</h3>
      <ul class="flex list-disc flex-col gap-1 ps-5 text-sm leading-7 text-slate-700 dark:text-slate-200">
        <li v-for="line in group.lines" :key="line">{{ line }}</li>
      </ul>
    </section>

    <p v-if="groups.length === 0" class="rounded-2xl bg-white p-6 text-center text-sm leading-7 text-slate-500 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:ring-slate-800">
      هنوز برای این موقعیت اطلاعاتی ثبت نشده. در بخش‌های «چیزهایی که دوست ندارد»، «محرک‌های استرس»، «راه‌های آرام‌کردن» و «علایق» اطلاعات ثبت کن تا این راهنما به طور خودکار تکمیل شود.
    </p>

    <ConfirmDialog
      v-model="isRemoveConfirmOpen"
      title="حذف این یادداشت؟"
      message="این یادداشت پاک می‌شود و دیگر در خلاصه ملاقات دیده نخواهد شد."
      confirm-label="حذف"
      danger
      @confirm="confirmRemove"
    />
  </div>
</template>
