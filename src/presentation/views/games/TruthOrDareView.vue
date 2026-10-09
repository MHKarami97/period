<script setup lang="ts">
import { useTruthOrDareStore } from "@application/stores/truthOrDareStore";
import GamePageHeader from "@presentation/components/games/GamePageHeader.vue";
import TruthOrDarePlayPanel from "@presentation/components/games/truthOrDare/TruthOrDarePlayPanel.vue";
import TruthOrDareSetupPanel from "@presentation/components/games/truthOrDare/TruthOrDareSetupPanel.vue";

const store = useTruthOrDareStore();
</script>

<template>
  <div class="mx-auto flex w-full max-w-3xl flex-col gap-4">
    <GamePageHeader title="🔥 جرئت یا حقیقت" />
    <TruthOrDarePlayPanel v-if="store.isPlaying" />
    <TruthOrDareSetupPanel v-else />
  </div>
</template>
