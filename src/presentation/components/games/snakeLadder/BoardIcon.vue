<script setup lang="ts">
import type { Component } from "vue";
import ChallengeIcon from "./ChallengeIcon.vue";
import FinishIcon from "./FinishIcon.vue";
import LadderIcon from "./LadderIcon.vue";
import SnakeIcon from "./SnakeIcon.vue";
import type { BoardIconKind } from "./boardIcons";

const ICONS: Readonly<Record<BoardIconKind, Component>> = {
  snake: SnakeIcon,
  ladder: LadderIcon,
  challenge: ChallengeIcon,
  finish: FinishIcon,
};

defineProps<{ kind: BoardIconKind }>();
</script>

<template>
  <component :is="ICONS[kind]" />
</template>
