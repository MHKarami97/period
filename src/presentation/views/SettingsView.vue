<script setup lang="ts">
import DataManagementPanel from "@presentation/components/settings/DataManagementPanel.vue";
import ThemeSwitcher from "@presentation/components/settings/ThemeSwitcher.vue";
import DisplayNameForm from "@presentation/components/settings/DisplayNameForm.vue";
</script>

<template>
  <div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
    <div class="flex flex-col gap-4 lg:col-span-6">
      <DisplayNameForm />
      <ThemeSwitcher />
    </div>
    <div class="lg:col-span-6">
      <DataManagementPanel />
    </div>
  </div>
</template>
