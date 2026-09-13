<script setup lang="ts">
import { useToast } from "@presentation/composables/useToast";

const { message } = useToast();
</script>

<template>
  <Transition name="toast-fade">
    <div
      v-if="message"
      class="fixed bottom-20 right-4 z-40 rounded-xl bg-slate-900 px-4 py-2.5 text-sm text-white shadow-lg dark:bg-slate-100 dark:text-slate-900 lg:bottom-4"
    >
      {{ message }}
    </div>
  </Transition>
</template>

<style scoped>
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>