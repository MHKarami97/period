<script setup lang="ts">
import { ref, watch } from "vue";
import { useUserProfileStore } from "@application/stores/userProfileStore";

const userProfileStore = useUserProfileStore();
const nameInput = ref(userProfileStore.displayName);
const savedFeedback = ref(false);

watch(
  () => userProfileStore.displayName,
  (value) => {
    nameInput.value = value;
  },
);

function save(): void {
  userProfileStore.setDisplayName(nameInput.value);
  savedFeedback.value = true;
  setTimeout(() => (savedFeedback.value = false), 1500);
}
</script>

<template>
  <div class="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
    <h2 class="text-base font-medium text-slate-900 dark:text-slate-100">نام نمایشی</h2>
    <p class="text-xs text-slate-500 dark:text-slate-400">
      از این اسم فقط برای بهبود پیام‌های داخلی اپلیکیشن استفاده می‌شود و به جایی ارسال نمی‌شود
    </p>
    <div class="flex items-center gap-2">
      <input
        v-model="nameInput"
        type="text"
        placeholder="مثلاً سارا"
        class="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-900 dark:bg-slate-800 dark:text-slate-100"
        @keyup.enter="save"
      />
      <button type="button" class="rounded-lg bg-teal-500/90 px-3 py-2 text-sm font-medium text-white hover:bg-teal-500" @click="save">
        ذخیره
      </button>
    </div>
    <p v-if="savedFeedback" class="text-xs text-teal-600 dark:text-teal-400">ذخیره شد.</p>
  </div>
</template>
