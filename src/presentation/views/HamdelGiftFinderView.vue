<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { useHamdelStore } from "@application/stores/hamdelStore";
import { GiftIdeaFinder, parseAmount, type GiftSource } from "@domain/home/GiftIdeaFinder";

const hamdelStore = useHamdelStore();
const budgetInput = ref("");

onMounted(() => void hamdelStore.ensureLoaded());

const ideas = computed(() => GiftIdeaFinder.find(hamdelStore.entries, parseAmount(budgetInput.value)));

const SOURCE_LABELS: Readonly<Record<GiftSource, string>> = { hint: "اشاره‌ها", wishlist: "لیست آرزوها", gift: "ایده‌های ثبت‌شده", interest: "علایق" };
const SOURCE_PATHS: Readonly<Record<GiftSource, string>> = { hint: "hints", wishlist: "wishlist", gift: "gifts", interest: "interests" };
const formatCost = (cost: number): string => `${cost.toLocaleString("fa-IR")} تومان`;
</script>

<template>
  <div class="mx-auto flex w-full max-w-3xl flex-col gap-4">
    <div class="flex items-center justify-between gap-2">
      <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100">🎁 یابنده‌ی ایده‌ی هدیه</h1>
      <RouterLink :to="{ name: 'hamdel' }" class="text-xs font-semibold text-teal-600 hover:underline dark:text-teal-300">همدل ←</RouterLink>
    </div>

    <label class="flex flex-col gap-1.5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <span class="text-xs font-bold text-slate-500 dark:text-slate-400">بودجه (تومان، اختیاری)</span>
      <input v-model="budgetInput" type="text" inputmode="numeric" dir="ltr" placeholder="مثلاً 2000000" class="rounded-xl bg-slate-100 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:text-slate-100" />
      <span class="text-[11px] leading-5 text-slate-400 dark:text-slate-500">بودجه فقط روی موردهای لیست آرزوها که قیمت دارند اثر می‌گذارد؛ اشاره‌ها و علایق قیمت ندارند.</span>
    </label>

    <p v-if="ideas.length === 0" class="rounded-2xl bg-white p-6 text-center text-sm leading-6 text-slate-500 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:ring-slate-800">
      ایده‌ای پیدا نشد. اشاره‌ها، لیست آرزوها یا علایق او را در همدل ثبت کن تا پیشنهاد بگیری.
    </p>
    <ul v-else class="flex flex-col gap-2">
      <li v-for="idea in ideas" :key="idea.id">
        <RouterLink :to="{ name: 'hamdel-section', params: { section: SOURCE_PATHS[idea.source] } }" class="flex items-start gap-3 rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-slate-200 transition hover:ring-rose-300 active:scale-[0.99] dark:bg-slate-900 dark:ring-slate-800">
          <span class="text-xl leading-7" aria-hidden="true">{{ idea.icon }}</span>
          <span class="flex min-w-0 flex-1 flex-col gap-0.5">
            <span class="text-sm leading-6 text-slate-800 dark:text-slate-100">{{ idea.text }}</span>
            <span class="text-[11px] text-slate-500 dark:text-slate-400">{{ SOURCE_LABELS[idea.source] }}<template v-if="idea.cost !== null"> · {{ formatCost(idea.cost) }}</template></span>
          </span>
        </RouterLink>
      </li>
    </ul>
  </div>
</template>
