<script setup lang="ts">
import { useThemeSync } from "@presentation/composables/useThemeSync";

/**
 * Root shell: the router owns layout composition (onboarding vs. the full
 * AppShell), so App.vue's only extra responsibility is bootstrapping the
 * light/dark theme side effect once for the whole app lifetime.
 */
useThemeSync();
</script>

<template>
  <RouterView />
</template>
