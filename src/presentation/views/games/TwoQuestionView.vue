<script setup lang="ts">
import { useTwoQuestionStore } from "@application/stores/twoQuestionStore";
import GamePageHeader from "@presentation/components/games/GamePageHeader.vue";
import TwoQuestionPlayPanel from "@presentation/components/games/twoQuestions/TwoQuestionPlayPanel.vue";
import TwoQuestionSetupPanel from "@presentation/components/games/twoQuestions/TwoQuestionSetupPanel.vue";

const store = useTwoQuestionStore();
</script>

<template>
  <div class="mx-auto flex w-full max-w-3xl flex-col gap-4">
    <GamePageHeader title="💬 بازی دو سؤالی" />
    <TwoQuestionPlayPanel v-if="store.isPlaying" />
    <TwoQuestionSetupPanel v-else />
  </div>
</template>
