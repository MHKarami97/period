<script setup lang="ts">
import { useThemeSync } from "@presentation/composables/useThemeSync";
import UpdatePrompt from "@presentation/components/shared/UpdatePrompt.vue";

/**
 * Root shell: the router owns layout composition (onboarding vs. the full
 * AppShell), so App.vue's only extra responsibilities are bootstrapping
 * the light/dark theme side effect and mounting the PWA update prompt,
 * both of which must live for the whole app lifetime, not per-view.
 */
useThemeSync();
</script>

<template>
  <RouterView />
  <UpdatePrompt />
</template>
