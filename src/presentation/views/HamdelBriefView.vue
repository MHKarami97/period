<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import { useHamdelStore } from "@application/stores/hamdelStore";
import { useProfileStore } from "@application/stores/profileStore";
import { briefToPlainText, buildMeetingBrief, MEETING_CONTEXTS, type MeetingContextId } from "@domain/hamdel/meetingBrief";
import { DateOnly } from "@domain/valueObjects/DateOnly";
import { useToast } from "@presentation/composables/useToast";

const store = useHamdelStore();
const profileStore = useProfileStore();
const { showToast } = useToast();

const selectedContext = ref<MeetingContextId>("party");

const context = computed(() => MEETING_CONTEXTS.find((candidate) => candidate.id === selectedContext.value) ?? MEETING_CONTEXTS[0]);
const groups = computed(() => buildMeetingBrief(selectedContext.value, store.entries, DateOnly.today()));

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
</script>

<template>
  <div class="mx-auto flex w-full max-w-3xl flex-col gap-4">
    <div class="flex items-center justify-between gap-3">
      <h1 class="text-xl font-semibold text-slate-900 dark:text-slate-100">🧭 نکته قبل از ملاقات</h1>
      <RouterLink :to="{ name: 'hamdel' }" class="rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800">همدل ←</RouterLink>
    </div>
    <p class="-mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">موقعیت را انتخاب کن؛ خلاصه از یادداشت‌های ثبت‌شده ساخته می‌شود.</p>

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
        {{ item.label }}
      </button>
    </div>

    <section v-for="group in groups" :key="group.key" class="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <h2 class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ group.icon }} {{ group.title }}</h2>
      <ul class="flex list-disc flex-col gap-1 ps-5 text-sm leading-7 text-slate-700 dark:text-slate-200">
        <li v-for="line in group.lines" :key="line">{{ line }}</li>
      </ul>
    </section>

    <p v-if="groups.length === 0" class="rounded-2xl bg-white p-6 text-center text-sm leading-7 text-slate-500 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:ring-slate-800">
      هنوز برای این موقعیت اطلاعاتی ثبت نشده. در بخش‌های «چیزهایی که دوست ندارد»، «محرک‌های استرس» و «راه‌های آرام‌کردن» یادداشت اضافه کن یا از «یادداشت قبل از ملاقات» استفاده کن.
    </p>

    <div class="flex flex-wrap gap-2">
      <button v-if="groups.length > 0" type="button" class="rounded-xl bg-rose-500/90 px-4 py-2 text-sm font-medium text-white hover:bg-rose-500" @click="copyBrief">کپی متن</button>
      <RouterLink to="/app/hamdel/occasionNotes" class="rounded-xl bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200">+ یادداشت برای این موقعیت</RouterLink>
    </div>
  </div>
</template>
