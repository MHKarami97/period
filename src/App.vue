<script setup lang="ts">
/**
 * Root shell of the application.
 * Layout composition (dashboard grid vs. mobile stack) is delegated to
 * presentation-layer views; this component only bootstraps the page frame.
 */
</script>

<template>
  <main class="min-h-screen w-full bg-slate-950">
    <div class="mx-auto grid h-screen w-full grid-cols-1 gap-4 p-4 lg:grid-cols-12">
      <section class="lg:col-span-12 flex items-center justify-center text-slate-400">
        Dashboard, Calendar and Symptom Logger views will be composed here (step 2).
      </section>
    </div>
  </main>
</template>
