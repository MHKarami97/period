<script setup lang="ts">
defineProps<{
  name: string;
  active?: boolean;
}>();
</script>

<template>
  <!-- Dashboard Icon -->
  <svg
    v-if="name === 'dashboard'"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="active ? 2.2 : 1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="h-5 w-5 shrink-0 transition-transform duration-200"
    aria-hidden="true"
  >
    <path d="M3 10.25L12 3l9 7.25V20a2 2 0 01-2 2H5a2 2 0 01-2-2V10.25z" />
    <path d="M9 22V12h6v10" />
  </svg>

  <!-- Calendar Icon -->
  <svg
    v-else-if="name === 'calendar'"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="active ? 2.2 : 1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="h-5 w-5 shrink-0 transition-transform duration-200"
    aria-hidden="true"
  >
    <rect x="3" y="4" width="18" height="18" rx="3" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <circle cx="8" cy="14" r="1" fill="currentColor" />
    <circle cx="12" cy="14" r="1" fill="currentColor" />
    <circle cx="16" cy="14" r="1" fill="currentColor" />
    <circle cx="8" cy="18" r="1" fill="currentColor" />
    <circle cx="12" cy="18" r="1" fill="currentColor" />
  </svg>

  <!-- Symptoms Icon -->
  <svg
    v-else-if="name === 'symptoms'"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="active ? 2.2 : 1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="h-5 w-5 shrink-0 transition-transform duration-200"
    aria-hidden="true"
  >
    <path d="M10.5 20.5l10-10a4.95 4.95 0 10-7-7l-10 10a4.95 4.95 0 107 7z" />
    <path d="M8.5 8.5l7 7" />
  </svg>

  <!-- Hamyar (Life Stages Companion) Icon -->
  <svg
    v-else-if="name === 'hamyar'"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="active ? 2.2 : 1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="h-5 w-5 shrink-0 transition-transform duration-200"
    aria-hidden="true"
  >
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    <path d="M12 7l1.2 2.5L16 10l-2 2 .5 2.8-2.5-1.3-2.5 1.3.5-2.8-2-2 2.8-.5L12 7z" :fill="active ? 'currentColor' : 'none'" />
  </svg>

  <!-- Guide (Educational Reference & Help) Icon -->
  <svg
    v-else-if="name === 'guide'"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="active ? 2.2 : 1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="h-5 w-5 shrink-0 transition-transform duration-200"
    aria-hidden="true"
  >
    <path d="M12 6.5c-2.4-1.4-5.2-1.4-8 0v13c2.8-1.4 5.6-1.4 8 0 2.4-1.4 5.2-1.4 8 0v-13c-2.8-1.4-5.6-1.4-8 0z" />
    <path d="M12 6.5v13" />
    <circle cx="12" cy="3.5" r="1.1" fill="currentColor" />
  </svg>

  <!-- Hamdel (Couple & Intimacy) Icon -->
  <svg
    v-else-if="name === 'hamdel'"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="active ? 2.2 : 1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="h-5 w-5 shrink-0 transition-transform duration-200"
    aria-hidden="true"
  >
    <path
      d="M16.5 3.5a4.5 4.5 0 00-3.5 1.7 4.5 4.5 0 00-8 2.3c0 4.8 6.5 9.5 8 10.5 1.5-1 8-5.7 8-10.5a4.5 4.5 0 00-4.5-4.5z"
      :fill="active ? 'currentColor' : 'none'"
      :fill-opacity="active ? 0.2 : 0"
    />
  </svg>

  <!-- Games Icon -->
  <svg
    v-else-if="name === 'games'"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="active ? 2.2 : 1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="h-5 w-5 shrink-0 transition-transform duration-200"
    aria-hidden="true"
  >
    <rect x="3" y="3" width="18" height="18" rx="4" />
    <circle cx="8" cy="8" r="1.5" fill="currentColor" />
    <circle cx="16" cy="8" r="1.5" fill="currentColor" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    <circle cx="8" cy="16" r="1.5" fill="currentColor" />
    <circle cx="16" cy="16" r="1.5" fill="currentColor" />
  </svg>

  <!-- Settings Icon (High Precision Modern Mechanical Gear with Comfortable Margin) -->
  <svg
    v-else-if="name === 'settings'"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="active ? 2.2 : 1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:rotate-45"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="3" :fill="active ? 'currentColor' : 'none'" :fill-opacity="active ? 0.2 : 0" />
    <path
      d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 00-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58z"
    />
  </svg>
</template>
