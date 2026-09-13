<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useCycleStore } from "@application/stores/cycleStore";
import { useAppModeStore } from "@application/stores/appModeStore";
import { useUserProfileStore } from "@application/stores/userProfileStore";
import JalaliCalendarGrid from "@presentation/components/calendar/JalaliCalendarGrid.vue";

const cycleStore = useCycleStore();
const appModeStore = useAppModeStore();
const userProfileStore = useUserProfileStore();

const title = computed<string>(() => {
  const name = userProfileStore.displayName;
  if (appModeStore.isPartnerMode) {
    return name ? `تقویم ${name}` : "تقویم";
  }
  return "تقویم";
});

onMounted(() => {
  cycleStore.initialize();
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <h1 class="text-xl font-semibold text-slate-900 dark:text-slate-100">{{ title }}</h1>
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <div class="lg:col-span-8">
        <JalaliCalendarGrid />
      </div>
    </div>
  </div>
</template>
