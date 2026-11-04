<script setup lang="ts">
import { ref, computed } from "vue";
import type { HamyarStage, HamyarContentType } from "@domain/hamyar/HamyarGuide";
import { useHamyarStore } from "@application/stores/hamyarStore";

const props = defineProps<{
  guideId: string;
  stage: HamyarStage;
  activeContentType: HamyarContentType;
  searchQuery: string;
  isOpenDefault?: boolean;
}>();

const hamyarStore = useHamyarStore();
const isExpanded = ref(props.isOpenDefault ?? true);
const revealedAnswers = ref<Record<number, boolean>>({});

function toggleAnswer(n: number): void {
  revealedAnswers.value = {
    ...revealedAnswers.value,
    [n]: !revealedAnswers.value[n],
  };
}

function getChecklistKey(idx: number): string {
  return `${props.guideId}:${props.stage.id}:${idx}`;
}

const showKnowledge = computed(() =>
  (props.activeContentType === "all" || props.activeContentType === "knowledge") &&
  Boolean(props.stage.knowledge?.length),
);

const showChecklist = computed(() =>
  (props.activeContentType === "all" || props.activeContentType === "checklist") &&
  Boolean(props.stage.practical_checklist?.length),
);

const showMyths = computed(() =>
  (props.activeContentType === "all" || props.activeContentType === "myths") &&
  Boolean(props.stage.common_mistakes_and_myths?.length),
);

const showRedFlags = computed(() =>
  (props.activeContentType === "all" || props.activeContentType === "red_flags") &&
  Boolean(props.stage.red_flags?.length),
);

const showQuestions = computed(() => {
  const hasDoc = Boolean(props.stage.questions_for_doctor?.length);
  const hasPro = Boolean(props.stage.questions_for_professional?.length);
  return (props.activeContentType === "all" || props.activeContentType === "questions") && (hasDoc || hasPro);
});

const showQuiz = computed(() =>
  (props.activeContentType === "all" || props.activeContentType === "quiz") &&
  Boolean(props.stage.quiz?.questions?.length),
);

function getEvidenceBadgeClass(level: string): string {
  if (level.includes("رسمی")) {
    return "bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800";
  }
  if (level.includes("مرور") || level.includes("متاآنالیز")) {
    return "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800";
  }
  if (level.includes("تکی")) {
    return "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800";
  }
  if (level.includes("اجماع")) {
    return "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800";
  }
  return "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800";
}
</script>

<template>
  <div
    class="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition-all dark:bg-slate-900 dark:ring-slate-800"
    :id="`stage-${stage.id}`"
  >
    <!-- Header: Click to collapse / expand -->
    <button
      type="button"
      class="flex w-full items-center justify-between gap-3 p-5 text-right transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
      @click="isExpanded = !isExpanded"
    >
      <div class="flex items-center gap-3">
        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-sm font-bold text-teal-700 ring-1 ring-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:ring-teal-800">
          {{ stage.id }}
        </span>
        <div class="flex flex-col gap-0.5">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs font-semibold text-slate-400 dark:text-slate-500">
              مرحله {{ stage.id }}
            </span>
            <span v-if="stage.timeframe || stage.age_range" class="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {{ stage.timeframe || stage.age_range }}
            </span>
          </div>
          <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">
            {{ stage.title }}
          </h3>
        </div>
      </div>

      <div class="flex items-center gap-2 text-slate-400 dark:text-slate-500">
        <span class="text-xs hidden sm:inline">{{ isExpanded ? "بستن" : "مشاهده جزئیات" }}</span>
        <svg
          class="h-5 w-5 transform transition-transform duration-200"
          :class="{ 'rotate-180': isExpanded }"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
        </svg>
      </div>
    </button>

    <!-- Expanded Body -->
    <div v-show="isExpanded" class="border-t border-slate-100 p-5 pt-4 flex flex-col gap-5 dark:border-slate-800">
      <!-- Goal callout -->
      <div v-if="stage.goal" class="rounded-xl bg-teal-50/70 p-4 border-r-4 border-teal-500 dark:bg-teal-950/30 dark:border-teal-400">
        <span class="text-xs font-bold text-teal-800 dark:text-teal-300 block mb-1">🎯 هدف این مرحله:</span>
        <p class="text-sm leading-6 text-slate-700 dark:text-slate-200">
          {{ stage.goal }}
        </p>
      </div>

      <!-- 1. Knowledge & Evidence -->
      <div v-if="showKnowledge" class="flex flex-col gap-3">
        <div class="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
          <span>📚</span>
          <span>دانستنی‌ها و شواهد علمی</span>
        </div>

        <div class="flex flex-col gap-3">
          <div
            v-for="topic in stage.knowledge"
            :key="topic.topic"
            class="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50"
          >
            <h4 class="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
              {{ topic.topic }}
            </h4>
            <div class="flex flex-col gap-3">
              <div
                v-for="(claim, cIdx) in topic.claims"
                :key="cIdx"
                class="flex flex-col gap-1.5 text-xs sm:text-sm leading-6 text-slate-700 dark:text-slate-300 border-r-2 border-slate-300 pr-3 dark:border-slate-700"
              >
                <div class="flex items-center gap-2 flex-wrap">
                  <span
                    class="rounded-full px-2.5 py-0.5 text-[11px] font-medium border"
                    :class="getEvidenceBadgeClass(claim.evidence_level)"
                  >
                    {{ claim.evidence_level }}
                  </span>
                </div>
                <p>{{ claim.text }}</p>
                <p v-if="claim.caveat" class="text-xs text-amber-700 dark:text-amber-400/90 bg-amber-500/10 rounded-md p-1.5 mt-0.5">
                  ⚠️ ملاحظه: {{ claim.caveat }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Practical Checklist -->
      <div v-if="showChecklist" class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
            <span>✅</span>
            <span>چک‌لیست و اقدامات عملی</span>
          </div>
          <span class="text-xs text-slate-400">برای ذخیره روی گزینه‌ها بزنید</span>
        </div>

        <div class="space-y-2">
          <label
            v-for="(item, idx) in stage.practical_checklist"
            :key="idx"
            class="flex items-start gap-3 rounded-xl p-3 transition cursor-pointer"
            :class="hamyarStore.isChecklistCompleted(getChecklistKey(idx))
              ? 'bg-teal-50/60 dark:bg-teal-950/30'
              : 'bg-slate-50 hover:bg-slate-100/80 dark:bg-slate-800/40 dark:hover:bg-slate-800/70'"
          >
            <input
              type="checkbox"
              :checked="hamyarStore.isChecklistCompleted(getChecklistKey(idx))"
              class="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800"
              @change="hamyarStore.toggleChecklist(getChecklistKey(idx))"
            />
            <span
              class="text-xs sm:text-sm leading-6"
              :class="hamyarStore.isChecklistCompleted(getChecklistKey(idx))
                ? 'line-through text-slate-400 dark:text-slate-500'
                : 'text-slate-800 dark:text-slate-200'"
            >
              {{ item }}
            </span>
          </label>
        </div>
      </div>

      <!-- 3. Common Myths and Facts -->
      <div v-if="showMyths" class="flex flex-col gap-3">
        <div class="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
          <span>💡</span>
          <span>باورهای اشتباه رایج و حقایق علمی</span>
        </div>

        <div class="grid grid-cols-1 gap-3">
          <div
            v-for="(mythFact, mIdx) in stage.common_mistakes_and_myths"
            :key="mIdx"
            class="flex flex-col gap-2 rounded-xl bg-slate-50 p-4 border border-slate-200/80 dark:bg-slate-800/50 dark:border-slate-700/60"
          >
            <!-- Myth -->
            <div class="flex items-start gap-2">
              <span class="shrink-0 rounded-md bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                باور نادرست ❌
              </span>
              <p class="text-xs sm:text-sm font-semibold text-rose-900 dark:text-rose-200">
                «{{ mythFact.myth }}»
              </p>
            </div>

            <!-- Fact -->
            <div class="flex items-start gap-2 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
              <span class="shrink-0 rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                واقعیت علمی ✔️
              </span>
              <p class="text-xs sm:text-sm leading-6 text-slate-700 dark:text-slate-200">
                {{ mythFact.fact }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. Red Flags / Warnings -->
      <div v-if="showRedFlags" class="flex flex-col gap-3">
        <div class="flex items-center gap-2 text-sm font-bold text-rose-600 dark:text-rose-400">
          <span>🚩</span>
          <span>علائم هشدار و پرچم‌های قرمز</span>
        </div>

        <div class="rounded-xl bg-rose-50/70 p-4 border border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/50">
          <ul class="space-y-2">
            <li
              v-for="(flag, fIdx) in stage.red_flags"
              :key="fIdx"
              class="flex items-start gap-2 text-xs sm:text-sm leading-6 text-rose-900 dark:text-rose-200"
            >
              <span class="text-rose-500 font-bold shrink-0">•</span>
              <span>{{ flag }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- 5. Questions for Professional / Doctor -->
      <div v-if="showQuestions" class="flex flex-col gap-3">
        <div class="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
          <span>🩺</span>
          <span>پرسش‌هایی که خوب است از متخصص یا پزشک بپرسید</span>
        </div>

        <div class="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
          <ul class="space-y-2">
            <li
              v-for="(q, qIdx) in [...(stage.questions_for_professional || []), ...(stage.questions_for_doctor || [])]"
              :key="qIdx"
              class="flex items-start gap-2 text-xs sm:text-sm leading-6 text-slate-700 dark:text-slate-300"
            >
              <span class="text-teal-600 dark:text-teal-400 font-bold shrink-0">؟</span>
              <span>{{ q }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- 6. Quiz / Self-Assessment -->
      <div v-if="showQuiz && stage.quiz" class="flex flex-col gap-3">
        <div class="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
          <span>📝</span>
          <span>خودآزمایی و کوییز یادگیری</span>
        </div>

        <div class="space-y-3">
          <div
            v-for="q in stage.quiz.questions"
            :key="q.n"
            class="rounded-xl border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-start gap-2">
                <span class="rounded bg-teal-100 px-1.5 py-0.5 text-xs font-bold text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                  {{ q.n }}
                </span>
                <p class="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {{ q.q }}
                </p>
              </div>

              <button
                type="button"
                class="shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium text-teal-700 hover:bg-teal-100/70 dark:text-teal-300 dark:hover:bg-teal-950"
                @click="toggleAnswer(q.n)"
              >
                {{ revealedAnswers[q.n] ? "مخفی کردن پاسخ" : "مشاهده پاسخ" }}
              </button>
            </div>

            <!-- Answer revealed -->
            <div
              v-if="revealedAnswers[q.n]"
              class="mt-3 rounded-lg bg-teal-50/80 p-3 text-xs sm:text-sm leading-6 text-teal-900 border border-teal-200/70 dark:bg-teal-950/40 dark:border-teal-800/60 dark:text-teal-200"
            >
              <span class="font-bold block mb-0.5">پاسخ علمی:</span>
              {{ stage.quiz.answers.find((a) => a.n === q.n)?.a || "پاسخ در متن شواهد آمده است." }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
