<script setup lang="ts">
import { ref, computed } from "vue";
import {
  type DailyChallengePlan,
  type ChallengeTimeTag,
  CHALLENGE_TIME_TAGS,
  getChallengeTimeTags,
  getTimeTagOption,
} from "@domain/games/dailyChallenges/DailyChallengeTypes";
import { useDailyChallengesStore } from "@application/stores/dailyChallengesStore";
import AppIcon from "@presentation/components/common/AppIcon.vue";

const props = defineProps<{
  weekStartIso: string;
  day: DailyChallengePlan;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "saved"): void;
}>();

const store = useDailyChallengesStore();

const activeTab = ref<"edit" | "pick" | "off">("edit");
const editedTitle = ref(props.day.challengeTitle);
const editedDescription = ref(props.day.challengeDescription || "");

const bankFilterTag = ref<ChallengeTimeTag | "all">("all");
const bankSearchQuery = ref("");

const isOff = ref(props.day.isOff);
const offReason = ref(props.day.offReason || "مهمانی بودیم و نشد انجام بدیم");

const filteredBankChallenges = computed(() => {
  const q = bankSearchQuery.value.trim().toLowerCase();
  return store.allChallenges.filter((item) => {
    if (q) {
      const match =
        item.title.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (bankFilterTag.value !== "all") {
      const tags = getChallengeTimeTags(item);
      if (!tags.includes(bankFilterTag.value) && !tags.includes("any")) {
        return false;
      }
    }
    return true;
  });
});

function handleSaveEdit(): void {
  if (!editedTitle.value.trim()) return;
  store.updateDayChallenge(
    props.weekStartIso,
    props.day.date,
    editedTitle.value,
    editedDescription.value,
  );
  emit("saved");
  emit("close");
}

function handlePickChallenge(challengeId: string): void {
  const item = store.allChallenges.find((c) => c.id === challengeId);
  if (!item) return;
  store.updateDayChallenge(
    props.weekStartIso,
    props.day.date,
    item.title,
    item.description,
    item.id,
  );
  emit("saved");
  emit("close");
}

function handleSaveOff(): void {
  store.toggleDayOff(
    props.weekStartIso,
    props.day.date,
    isOff.value,
    offReason.value,
  );
  emit("saved");
  emit("close");
}

function handleReRoll(): void {
  store.reRollDay(props.weekStartIso, props.day.date);
  emit("saved");
  emit("close");
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-3 sm:p-4 backdrop-blur-md">
    <div class="flex max-h-[92vh] w-full max-w-lg flex-col rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-slate-100 p-4 sm:p-5 dark:border-slate-800">
        <div class="flex items-center gap-3 min-w-0">
          <span class="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
            <AppIcon name="pencil" size="lg" />
          </span>
          <div class="min-w-0">
            <h3 class="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
              تنظیم چالش: {{ day.dayName }} ({{ day.jalaliDateLabel }})
            </h3>
            <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
              تغییر، انتخاب از بانک یا ثبت روز آف و استراحت
            </p>
          </div>
        </div>

        <button
          type="button"
          class="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-800 transition"
          @click="emit('close')"
        >
          <AppIcon name="x" size="sm" />
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex items-center border-b border-slate-100 px-4 sm:px-5 dark:border-slate-800 text-xs font-bold gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          class="shrink-0 py-3 px-3 sm:px-3.5 border-b-2 transition inline-flex items-center gap-1.5"
          :class="activeTab === 'edit'
            ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
            : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'"
          @click="activeTab = 'edit'"
        >
          <AppIcon name="pencil" size="xs" />
          <span>ویرایش متن</span>
        </button>
        <button
          type="button"
          class="shrink-0 py-3 px-3 sm:px-3.5 border-b-2 transition inline-flex items-center gap-1.5"
          :class="activeTab === 'pick'
            ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
            : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'"
          @click="activeTab = 'pick'"
        >
          <AppIcon name="target" size="xs" />
          <span>انتخاب از بانک ({{ store.allChallenges.length }})</span>
        </button>
        <button
          type="button"
          class="shrink-0 py-3 px-3 sm:px-3.5 border-b-2 transition inline-flex items-center gap-1.5"
          :class="activeTab === 'off'
            ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
            : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'"
          @click="activeTab = 'off'"
        >
          <AppIcon name="beach" size="xs" />
          <span>روز آف (استراحت)</span>
        </button>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-y-auto p-4 sm:p-5 text-xs sm:text-sm">
        <!-- Tab 1: Edit custom title -->
        <div v-if="activeTab === 'edit'" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              عنوان چالش این روز
            </label>
            <input
              v-model="editedTitle"
              type="text"
              class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-100 dark:focus:bg-slate-850 dark:focus:border-indigo-400"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              توضیح یا ایده جزئی (اختیاری)
            </label>
            <textarea
              v-model="editedDescription"
              rows="3"
              class="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs sm:text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-100 dark:focus:bg-slate-850 dark:focus:border-indigo-400"
            ></textarea>
          </div>

          <div class="pt-2 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2.5">
            <button
              type="button"
              class="inline-flex items-center justify-center gap-1.5 text-xs text-indigo-600 hover:underline dark:text-indigo-400 font-bold active:scale-95 transition py-2"
              @click="handleReRoll"
            >
              <AppIcon name="rotate" size="xs" />
              <span>پیشنهاد هوشمند دیگر برای این روز</span>
            </button>

            <button
              type="button"
              class="rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 active:scale-95 transition shadow-sm text-center"
              @click="handleSaveEdit"
            >
              ذخیره تغییرات
            </button>
          </div>
        </div>

        <!-- Tab 2: Pick from pool -->
        <div v-else-if="activeTab === 'pick'" class="space-y-3">
          <!-- Search within bank -->
          <div class="relative">
            <input
              v-model="bankSearchQuery"
              type="search"
              placeholder="جستجو در چالش‌ها..."
              class="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2 pe-3 ps-9 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-850 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:border-indigo-400"
            />
            <span class="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
              <AppIcon name="search" size="xs" />
            </span>
          </div>

          <!-- Time Tag Filters inside Pick Modal -->
          <div class="flex items-center gap-1 overflow-x-auto pb-1 text-xs [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              class="shrink-0 rounded-lg px-2 py-1 text-[11px] font-bold transition border"
              :class="bankFilterTag === 'all'
                ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100'
                : 'bg-slate-100 text-slate-600 border-transparent dark:bg-slate-800 dark:text-slate-300'"
              @click="bankFilterTag = 'all'"
            >
              همه ({{ store.allChallenges.length }})
            </button>
            <button
              v-for="tg in CHALLENGE_TIME_TAGS"
              :key="tg.key"
              type="button"
              class="shrink-0 rounded-lg px-2 py-1 text-[11px] font-medium transition inline-flex items-center gap-1 border"
              :class="bankFilterTag === tg.key
                ? 'bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500'
                : 'bg-slate-100 text-slate-600 border-transparent dark:bg-slate-800 dark:text-slate-300'"
              @click="bankFilterTag = tg.key"
            >
              <AppIcon :name="tg.iconName" size="xs" />
              <span>{{ tg.label }}</span>
            </button>
          </div>

          <div class="max-h-60 sm:max-h-72 overflow-y-auto space-y-2 pe-1">
            <button
              v-for="item in filteredBankChallenges"
              :key="item.id"
              type="button"
              class="w-full text-right rounded-2xl p-3 transition flex items-center justify-between border active:scale-[0.99]"
              :class="day.challengeTitle === item.title
                ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/60 dark:border-indigo-500 shadow-2xs'
                : 'border-slate-200/80 bg-slate-50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-850 dark:hover:bg-slate-800'"
              @click="handlePickChallenge(item.id)"
            >
              <div class="flex flex-col gap-1 min-w-0">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="text-xs font-bold text-slate-800 dark:text-slate-100">
                    {{ item.title }}
                  </span>
                  <!-- Tag pills -->
                  <span
                    v-for="tg in getChallengeTimeTags(item)"
                    :key="tg"
                    class="inline-flex items-center gap-0.5 rounded px-1.5 py-0.2 text-[9px] font-medium border"
                    :class="getTimeTagOption(tg).badgeClass"
                  >
                    <AppIcon :name="getTimeTagOption(tg).iconName" size="xs" />
                    <span>{{ getTimeTagOption(tg).label }}</span>
                  </span>
                </div>
                <span v-if="item.description" class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                  {{ item.description }}
                </span>
              </div>
              <span v-if="item.category" class="text-[10px] text-slate-500 dark:text-slate-400 shrink-0 ms-2 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700">
                {{ item.category }}
              </span>
            </button>
          </div>
        </div>

        <!-- Tab 3: Off Day -->
        <div v-else class="space-y-4">
          <div class="rounded-2xl bg-sky-50/80 p-3.5 sm:p-4 border border-sky-200 dark:bg-sky-950/40 dark:border-sky-800">
            <div class="flex items-center gap-1.5 text-xs font-bold text-sky-800 dark:text-sky-300 mb-1">
              <AppIcon name="beach" size="xs" />
              <span>ثبت روز استراحت / آف</span>
            </div>
            <p class="text-xs text-slate-600 dark:text-slate-300 leading-5">
              اگر در این روز مهمانی بودید، خستگی داشتید یا فرصت نشد، این روز را به عنوان «روز آف» ثبت کنید تا برنامه شما ناقص نشود.
            </p>
          </div>

          <label class="flex items-center gap-2.5 cursor-pointer">
            <input
              v-model="isOff"
              type="checkbox"
              class="h-4.5 w-4.5 rounded-lg text-sky-600 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-800"
            />
            <span class="text-xs font-bold text-slate-800 dark:text-slate-200">
              این روز به عنوان روز آف (استراحت) علامت بخورد
            </span>
          </label>

          <div v-if="isOff">
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              علت یا یادداشت (اختیاری)
            </label>
            <input
              v-model="offReason"
              type="text"
              placeholder="مثلاً: مهمانی خانه فامیل، شیفت کاری، مسافرت..."
              class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-850 dark:text-slate-100 dark:focus:bg-slate-850 dark:focus:border-sky-400"
            />
          </div>

          <div class="pt-2 flex justify-end">
            <button
              type="button"
              class="w-full sm:w-auto rounded-2xl bg-sky-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 active:scale-95 transition shadow-sm text-center"
              @click="handleSaveOff"
            >
              ثبت وضعیت آف
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
