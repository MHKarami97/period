<script setup lang="ts">
import { computed, ref } from "vue";
import { useLockStore } from "@application/stores/lockStore";
import { useCloudSyncStore } from "@application/stores/cloudSyncStore";

const store = useCloudSyncStore();
const lockStore = useLockStore();

const dismissedKey = ref("");
const isRetrying = ref(false);

const currentKey = computed(() => `${store.snapshot.status}|${store.snapshot.lastError ?? ""}`);
const isVisible = computed(
  () => store.showFailureBar && !lockStore.isLocked && dismissedKey.value !== currentKey.value,
);

function dismiss(): void {
  dismissedKey.value = currentKey.value;
}

async function retry(): Promise<void> {
  isRetrying.value = true;
  try {
    await store.connect();
  } catch {
    // failure bar stays visible
  } finally {
    isRetrying.value = false;
  }
}
</script>

<template>
  <Transition name="fade-bar">
    <div
      v-if="isVisible"
      role="status"
      class="fixed inset-x-0 z-40 bottom-[calc(3.75rem+env(safe-area-inset-bottom))] lg:bottom-0 bg-amber-500 text-white shadow-[0_-4px_16px_rgba(0,0,0,0.15)]"
    >
      <div class="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3 text-xs font-semibold">
        <div class="flex items-center gap-2 min-w-0">
          <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="2" y1="2" x2="22" y2="22" />
            <path d="M5.78 5.78A7 7 0 0 0 9 19h8.5a4.5 4.5 0 0 0 1.31-.19" />
            <path d="M21.53 16.5A4.5 4.5 0 0 0 17.5 10h-1.79A7.01 7.01 0 0 0 10 5.07" />
          </svg>
          <span class="leading-relaxed truncate">{{ store.failureBarMessage }}</span>
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            :disabled="isRetrying"
            class="px-3 py-1 rounded-lg bg-white text-amber-700 font-bold hover:bg-amber-50 transition-colors disabled:opacity-60"
            @click="retry"
          >
            {{ isRetrying ? "در حال تلاش..." : "تلاش دوباره" }}
          </button>
          <button
            type="button"
            class="p-1 opacity-80 hover:opacity-100"
            title="بستن"
            aria-label="بستن"
            @click="dismiss"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-bar-enter-active,
.fade-bar-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-bar-enter-from,
.fade-bar-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
</style>
