<script setup lang="ts">
import { PlayerRole } from "@domain/games/snakeLadder/SnakeLadderGame";

defineProps<{ role: PlayerRole }>();

const SKIN = "#fcd9b6";
</script>

<template>
  <svg
    viewBox="0 0 24 40"
    class="h-full w-auto overflow-visible drop-shadow-[0_1px_1px_rgba(0,0,0,0.45)]"
    role="img"
    :aria-label="role === PlayerRole.Woman ? 'مهره‌ی زن' : 'مهره‌ی مرد'"
  >
    <template v-if="role === PlayerRole.Woman">
      <path d="M5.5 10a6.5 6.5 0 0 1 13 0v9.5c0 1.4-.9 2-2 2h-9c-1.1 0-2-.6-2-2z" fill="#5b2a1a" />
      <path d="M9 36v3.5M15 36v3.5" stroke="#fcd9b6" stroke-width="2" stroke-linecap="round" />
      <path d="M7.8 16.5 5 25M16.2 16.5 19 25" :stroke="SKIN" stroke-width="2" stroke-linecap="round" />
      <path d="M8.5 15.5q3.5-1.5 7 0L17 22l4 14.5H3L7 22z" fill="#d946ef" />
      <circle cx="12" cy="9" r="4.8" :fill="SKIN" />
      <path d="M7.2 9a4.8 4.8 0 0 1 9.6 0c-2.2-1.7-6-2.2-9.6 0z" fill="#5b2a1a" />
    </template>
    <template v-else>
      <rect x="7.5" y="26" width="4" height="13" rx="1.5" fill="#334155" />
      <rect x="12.5" y="26" width="4" height="13" rx="1.5" fill="#334155" />
      <path d="M5 16.5 3.5 27M19 16.5 20.5 27" stroke="#0ea5e9" stroke-width="3" stroke-linecap="round" />
      <rect x="6" y="14" width="12" height="14" rx="3" fill="#0ea5e9" />
      <circle cx="12" cy="8" r="5" :fill="SKIN" />
      <path d="M7 8a5 5 0 0 1 10 0c-3-1.6-7-1.6-10 0z" fill="#2b1b12" />
    </template>
  </svg>
</template>
