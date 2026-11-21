<script setup lang="ts">
import { useSnakeLadderStore } from "@application/stores/snakeLadderStore";
import GamePageHeader from "@presentation/components/games/GamePageHeader.vue";
import SnakeLadderPlayPanel from "@presentation/components/games/snakeLadder/SnakeLadderPlayPanel.vue";
import SnakeLadderSetupPanel from "@presentation/components/games/snakeLadder/SnakeLadderSetupPanel.vue";

const store = useSnakeLadderStore();
store.initialize();
</script>

<template>
  <div class="mx-auto flex w-full max-w-3xl flex-col gap-4">
    <GamePageHeader title="مار و پله زناشویی" icon="snake-ladder" />

    <SnakeLadderPlayPanel v-if="store.isPlaying" />
    <SnakeLadderSetupPanel v-else />
  </div>
</template>
