<script setup lang="ts">
import { ref, computed } from "vue";
import { useDailyChallengesStore } from "@application/stores/dailyChallengesStore";
import AppIcon from "@presentation/components/common/AppIcon.vue";

const emit = defineEmits<{
  (e: "close"): void;
}>();

const store = useDailyChallengesStore();

const searchQuery = ref("");
const newTitle = ref("");
const newDescription = ref("");
const newCategory = ref("سرگرمی و دونفره");
const addError = ref<string | null>(null);

const filteredChallenges = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return store.allChallenges;
  return store.allChallenges.filter(
    (c) =>
      c.title.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q)) ||
      (c.category && c.category.toLowerCase().includes(q)),
  );
});

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
        <div class="flex items-center gap-3">
          <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300">
            <AppIcon name="target" size="lg" filled />
          </span>
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">
              بانک ایده‌ها و چالش‌های دونفره
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              مدیریت چالش‌های پیش‌فرض و افزودن ایده‌های دلخواه (مجموع: {{ store.allChallenges.length }})
            </p>
          </div>
        </div>

        <button
          type="button"
          class="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-800"
          @click="emit('close')"
        >
          <AppIcon name="x" size="sm" />
        </button>
      </div>

      <!-- Content Area (Scrollable) -->
      <div class="flex-1 overflow-y-auto p-5 space-y-5 text-sm">
        <!-- Add New Challenge Box -->
        <div class="rounded-3xl bg-slate-50 p-4.5 ring-1 ring-slate-200/80 dark:bg-slate-800/50 dark:ring-slate-700/60 shadow-2xs">
          <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
            <AppIcon name="sparkles" size="xs" filled />
            <span>افزودن چالش یا ایده دونفره جدید</span>
          </h4>

          <div class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">عنوان چالش</label>
              <input
                v-model="newTitle"
                type="text"
                placeholder="مثال: حل پازل دونفره، درست کردن سالاد میوه..."
                class="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">توضیح کوتاه یا ایده (اختیاری)</label>
              <input
                v-model="newDescription"
                type="text"
                placeholder="توضیح جزئیات ایده..."
                class="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <div class="flex items-center gap-2">
              <input
                v-model="newCategory"
                type="text"
                placeholder="دسته‌بندی (مثلاً: آشپزی، بازی، خاطره...)"
                class="flex-1 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
              <button
                type="button"
                class="shrink-0 rounded-2xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-amber-700 transition dark:bg-amber-500 dark:hover:bg-amber-600 active:scale-95"
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

        <!-- Search bar within challenges -->
        <div class="relative">
          <input
            v-model="searchQuery"
            type="search"
            placeholder="جستجو در چالش‌ها..."
            class="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pe-4 ps-10 text-xs text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          <span class="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400">
            <AppIcon name="search" size="xs" />
          </span>
        </div>

        <!-- Challenges List -->
        <div>
          <div class="flex items-center justify-between mb-3 text-xs text-slate-500">
            <span class="font-bold text-slate-700 dark:text-slate-300">
              لیست چالش‌ها ({{ filteredChallenges.length }})
            </span>
            <span class="text-[11px] text-slate-400">
              موارد سفارشی قابل حذف هستند
            </span>
          </div>

          <div class="space-y-2 max-h-72 overflow-y-auto pe-1">
            <div
              v-for="item in filteredChallenges"
              :key="item.id"
              class="flex items-start justify-between gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-100 shadow-2xs transition hover:bg-slate-50 dark:bg-slate-800/40 dark:ring-slate-800 dark:hover:bg-slate-800/70"
            >
              <div class="flex flex-col gap-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                    {{ item.title }}
                  </span>
                  <span v-if="item.category" class="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    {{ item.category }}
                  </span>
                  <span v-if="!item.isDefault" class="rounded-lg bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
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
                class="shrink-0 rounded-xl p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition active:scale-95"
                title="حذف این چالش"
                @click="handleRemove(item.id)"
              >
                <AppIcon name="x-circle" size="sm" />
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
          class="rounded-2xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white active:scale-95 transition"
          @click="emit('close')"
        >
          بستن
        </button>
      </div>
    </div>
  </div>
</template>
