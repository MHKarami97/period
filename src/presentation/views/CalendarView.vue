<script setup lang="ts">
import { onMounted } from "vue";
import { useCycleStore } from "@application/stores/cycleStore";
import JalaliCalendarGrid from "@presentation/components/calendar/JalaliCalendarGrid.vue";

const cycleStore = useCycleStore();

onMounted(() => {
  cycleStore.initialize();
});
</script>

<template>
  <div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
    <div class="lg:col-span-8">
      <JalaliCalendarGrid />
    </div>
  </div>
</template>
