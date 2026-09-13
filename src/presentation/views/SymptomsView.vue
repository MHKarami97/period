<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useSymptomStore } from "@application/stores/symptomStore";
import { DateOnly } from "@domain/valueObjects/DateOnly";
import SymptomLoggerForm from "@presentation/components/symptoms/SymptomLoggerForm.vue";

const symptomStore = useSymptomStore();
const selectedDate = ref(DateOnly.today());

onMounted(() => {
  symptomStore.initialize();
});
</script>

<template>
  <div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
    <div class="lg:col-span-6 lg:col-start-4">
      <SymptomLoggerForm :date="selectedDate" />
    </div>
  </div>
</template>
