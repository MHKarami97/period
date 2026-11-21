<script setup lang="ts">
import { ref } from "vue";
import { useDailyChallengesStore } from "@application/stores/dailyChallengesStore";

const emit = defineEmits<{
  (e: "close"): void;
}>();

const store = useDailyChallengesStore();

const newTitle = ref("");
const newDescription = ref("");
const newCategory = ref("سرگرمی و دونفره");
const addError = ref<string | null>(null);

function handleAdd(): void {
  addError.value = null;
  if (!newTitle.value.trim()) {
    addError.value = "لطفاً عنوان چالش را وارد کنید.";
    return;
  }
  try {
    store.addCustomChallenge(newTitle.value, newDescription.value, newCategory.value);
    newTitle.value = "";
    newDescription.value = "";
  } catch (err) {
    addError.value = err instanceof Error ? err.message : "خطا در افزودن چالش";
  }
}

function handleRemove(id: string): void {
  store.removeChallenge(id);
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
    <div class="flex max-h-[90vh] w-full max-w-xl flex-col rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
        <div class="flex items-center gap-2.5">
          <span class="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-xl text-amber-600 dark:bg-amber-500/20 dark:text-amber-300">
            🎯
          </span>
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">
              بانک ایده‌ها و چالش‌های دونفره
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              افزودن چالش‌های دلخواه یا مدیریت موارد پیش‌فرض (مجموع: {{ store.allChallenges.length }} چالش)
            </p>
          </div>
        </div>

        <button
          type="button"
          class="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-800"
          @click="emit('close')"
        >
          <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>

      <!-- Content Area (Scrollable) -->
      <div class="flex-1 overflow-y-auto p-5 space-y-6 text-sm">
        <!-- Add New Challenge Box -->
        <div class="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/80 dark:bg-slate-800/50 dark:ring-slate-700/60">
          <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-1.5">
            <span>✨</span>
            <span>افزودن چالش یا ایده دونفره جدید</span>
          </h4>

          <div class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">عنوان چالش</label>
              <input
                v-model="newTitle"
                type="text"
                placeholder="مثال: درست کردن ژله یا سالاد با هم، حل جدول کلمات..."
                class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">توضیح کوتاه یا راهنما (اختیاری)</label>
              <input
                v-model="newDescription"
                type="text"
                placeholder="توضیح جزئیات ایده..."
                class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <div class="flex items-center gap-2">
              <input
                v-model="newCategory"
                type="text"
                placeholder="دسته‌بندی (مثلاً: آشپزی، بازی، خاطره...)"
                class="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
              <button
                type="button"
                class="shrink-0 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-700 transition dark:bg-amber-500 dark:hover:bg-amber-600"
                @click="handleAdd"
              >
                + افزودن به لیست
              </button>
            </div>

            <p v-if="addError" class="text-xs text-rose-600 dark:text-rose-400 font-medium">
              {{ addError }}
            </p>
          </div>
        </div>

        <!-- Challenges List -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-xs font-bold text-slate-700 dark:text-slate-300">
              لیست همه چالش‌ها ({{ store.allChallenges.length }})
            </h4>
            <span class="text-[11px] text-slate-400">
              چالش‌های اختصاصی شما قابل حذف هستند
            </span>
          </div>

          <div class="space-y-2">
            <div
              v-for="item in store.allChallenges"
              :key="item.id"
              class="flex items-start justify-between gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-100 shadow-sm transition hover:bg-slate-50 dark:bg-slate-800/40 dark:ring-slate-800 dark:hover:bg-slate-800/70"
            >
              <div class="flex flex-col gap-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                    {{ item.title }}
                  </span>
                  <span v-if="item.category" class="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    {{ item.category }}
                  </span>
                  <span v-if="!item.isDefault" class="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    سفارشی شما
                  </span>
                </div>
                <p v-if="item.description" class="text-xs text-slate-500 dark:text-slate-400 leading-5">
                  {{ item.description }}
                </p>
              </div>

              <!-- Delete button if custom -->
              <button
                v-if="!item.isDefault"
                type="button"
                class="shrink-0 rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                title="حذف این چالش"
                @click="handleRemove(item.id)"
              >
                <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 001.5.06l.3-7.5z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between border-t border-slate-100 p-4 dark:border-slate-800">
        <span class="text-xs text-slate-400">
          تغییرات به صورت خودکار ذخیره می‌شوند.
        </span>
        <button
          type="button"
          class="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          @click="emit('close')"
        >
          بستن
        </button>
      </div>
    </div>
  </div>
</template>
