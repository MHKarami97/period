<script setup lang="ts">
import GamePageHeader from "@presentation/components/games/GamePageHeader.vue";
import DailyChallengesSection from "@presentation/components/games/DailyChallengesSection.vue";
</script>

<template>
  <div class="mx-auto flex w-full max-w-4xl flex-col gap-4">
    <GamePageHeader title="🎯 پیشنهاد و چالش‌های روزانه و هفتگی" />
    <DailyChallengesSection />
  </div>
</template>
