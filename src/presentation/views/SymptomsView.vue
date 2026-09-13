<script setup lang="ts">
import { shallowRef } from "vue";
import { DateOnly } from "@domain/valueObjects/DateOnly";
import SymptomLoggerForm from "@presentation/components/symptoms/SymptomLoggerForm.vue";
import SymptomHistoryList from "@presentation/components/symptoms/SymptomHistoryList.vue"; // NEW

const selectedDate = shallowRef(DateOnly.today());
</script>

<template>
  <div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
    <div class="flex flex-col gap-4 lg:col-span-6 lg:col-start-4">
      <SymptomLoggerForm :date="selectedDate" />
      <SymptomHistoryList />
    </div>
  </div>
</template>