<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import { useAppModeStore } from "@application/stores/appModeStore";
import { useLockStore } from "@application/stores/lockStore";
import { useReleaseNotesStore } from "@application/stores/releaseNotesStore";

const releaseNotes = useReleaseNotesStore();
const appMode = useAppModeStore();
const lockStore = useLockStore();

const isOpen = computed(() => releaseNotes.visibleReleases.length > 0 && appMode.hasSelectedRole && !lockStore.isLocked);
const closeButton = ref<HTMLButtonElement | null>(null);

watch(isOpen, async (open) => {
  if (open) {
    await nextTick();
    closeButton.value?.focus();
  }
});
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-3 backdrop-blur-sm sm:items-center sm:p-4" @keydown.esc="releaseNotes.markSeen()">
      <div class="flex max-h-[88vh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800" role="dialog" aria-modal="true" aria-labelledby="whats-new-title">
        <header class="flex items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
          <span class="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-500/10 text-xl dark:bg-teal-500/20" aria-hidden="true">✨</span>
          <div class="min-w-0">
            <h2 id="whats-new-title" class="text-base font-bold text-slate-900 dark:text-slate-100">تازه‌های ماهک</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">برنامه به‌روز شد؛ این‌ها تغییرهای مهم‌اند.</p>
          </div>
        </header>

        <div class="flex flex-col gap-5 overflow-y-auto p-4">
          <section v-for="release in releaseNotes.visibleReleases" :key="release.id" class="flex flex-col gap-2.5">
            <h3 class="text-sm font-bold text-teal-700 dark:text-teal-300">{{ release.title }}</h3>
            <ul class="flex flex-col gap-2">
              <li v-for="item in release.highlights" :key="item.title" class="flex items-start gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200/70 dark:bg-slate-800/60 dark:ring-slate-700/60">
                <span class="text-xl leading-7" aria-hidden="true">{{ item.icon }}</span>
                <div class="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p class="text-sm font-bold text-slate-900 dark:text-slate-100">{{ item.title }}</p>
                  <p class="text-xs leading-5 text-slate-600 dark:text-slate-300">{{ item.text }}</p>
                  <RouterLink v-if="item.to" :to="item.to" class="mt-1 w-fit text-xs font-bold text-teal-600 hover:underline dark:text-teal-300" @click="releaseNotes.markSeen()">امتحانش کن ←</RouterLink>
                </div>
              </li>
            </ul>
          </section>
        </div>

        <footer class="flex items-center justify-between gap-2 border-t border-slate-100 p-4 dark:border-slate-800">
          <RouterLink :to="{ name: 'guide' }" class="text-xs font-semibold text-slate-500 hover:underline dark:text-slate-400" @click="releaseNotes.markSeen()">راهنمای کامل</RouterLink>
          <button ref="closeButton" type="button" class="rounded-2xl bg-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-teal-700 active:scale-95 dark:bg-teal-500 dark:hover:bg-teal-400" @click="releaseNotes.markSeen()">متوجه شدم</button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>
