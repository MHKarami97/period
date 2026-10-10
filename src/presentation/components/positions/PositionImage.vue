<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { usePositionsStore } from "@application/stores/positionsStore";
import type { Position } from "@domain/positions/Position";

const ROOT_MARGIN = "300px";

const props = withDefaults(
  defineProps<{
    position: Position;
    /** Load immediately instead of waiting until the image is near the viewport (used in the detail dialog). */
    eager?: boolean;
  }>(),
  { eager: false },
);

const store = usePositionsStore();
const host = ref<HTMLElement | null>(null);
const imageUrl = ref<string | null>(null);
const hasFailed = ref(false);
let observer: IntersectionObserver | null = null;

async function loadImage(): Promise<void> {
  try {
    imageUrl.value = await store.resolveImage(props.position);
    hasFailed.value = imageUrl.value === null;
  } catch {
    hasFailed.value = true;
  }
}

/** In lists, the image is fetched and decrypted only when it is about to scroll into view. */
onMounted(() => {
  if (props.eager) {
    void loadImage();
    return;
  }
  if (!host.value) return;
  observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer?.disconnect();
      void loadImage();
    },
    { rootMargin: ROOT_MARGIN },
  );
  observer.observe(host.value);
});

onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
  <div ref="host" class="flex h-full w-full items-center justify-center overflow-hidden bg-slate-100 dark:bg-slate-800">
    <img
      v-if="imageUrl"
      :src="imageUrl"
      :alt="position.title"
      class="h-full w-full object-contain"
      decoding="async"
      draggable="false"
    />
    <span v-else-if="hasFailed" class="flex flex-col items-center gap-1 text-xs text-slate-400" role="img" aria-label="عکس در دسترس نیست">
      <span class="text-2xl opacity-60" aria-hidden="true">🖼</span>
      <span v-if="eager">عکس بارگذاری نشد</span>
    </span>
    <span v-else class="h-full w-full animate-pulse bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
  </div>
</template>
