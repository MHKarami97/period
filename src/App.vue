<script setup lang="ts">
import { onMounted } from "vue";
import { useLockStore } from "@application/stores/lockStore";
import { requestPersistentStorage } from "@infrastructure/security/StoragePersistence";
import { useAutoLock } from "@presentation/composables/useAutoLock";
import { useThemeSync } from "@presentation/composables/useThemeSync";
import AppLockScreen from "@presentation/components/lock/AppLockScreen.vue";
import UpdatePrompt from "@presentation/components/shared/UpdatePrompt.vue";
import ToastHost from "@presentation/components/shared/ToastHost.vue";

/**
 * Root shell: the router owns layout composition (onboarding vs. the full
 * AppShell), so App.vue's extra responsibilities are bootstrapping the
 * light/dark theme side effect, the app lock (the router view is not even
 * mounted while locked, so no screen can load or show decrypted data) and
 * mounting the PWA update prompt - all of which live for the whole app lifetime.
 */
useThemeSync();
useAutoLock();
const lockStore = useLockStore();

// Ask the browser not to evict our IndexedDB data under storage pressure (navigator.storage.persist).
onMounted(() => void requestPersistentStorage());
</script>

<template>
  <AppLockScreen v-if="lockStore.isLocked" />
  <RouterView v-else />
  <UpdatePrompt />
  <ToastHost />
</template>
