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
    <!-- Open guidance book with compass / star of life -->
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    <path d="M12 7l1.2 2.5L16 10l-2 2 .5 2.8-2.5-1.3-2.5 1.3.5-2.8-2-2 2.8-.5L12 7z" :fill="active ? 'currentColor' : 'none'" />
  </svg>

  <!-- Guide (Menstrual Health Guide) Icon -->
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
    <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
    <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
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
    <!-- Twin connected hearts -->
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

  <!-- Settings Icon -->
  <svg
    v-else-if="name === 'settings'"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="active ? 2.2 : 1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="h-5 w-5 shrink-0 transition-transform duration-200"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
</template>
