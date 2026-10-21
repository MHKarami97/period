<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { HamdelPhotoService } from "@application/hamdel/HamdelPhotoService";

interface PhotoView {
  readonly id: string;
  readonly url: string;
}

const props = withDefaults(defineProps<{ entryId: string; editable?: boolean; refreshKey?: number }>(), { editable: false, refreshKey: 0 });
const emit = defineEmits<{ (event: "changed"): void }>();

const photos = ref<PhotoView[]>([]);
const openedIndex = ref<number | null>(null);
let isUnmounted = false;

function releaseUrls(): void {
  for (const photo of photos.value) {
    URL.revokeObjectURL(photo.url);
  }
}

async function load(): Promise<void> {
  const stored = await HamdelPhotoService.list(props.entryId);
  if (isUnmounted) return;
  releaseUrls();
  photos.value = stored.map((photo) => ({ id: photo.id, url: URL.createObjectURL(new Blob([photo.bytes], { type: photo.mime })) }));
}

async function remove(photoId: string): Promise<void> {
  await HamdelPhotoService.remove(photoId);
  await load();
  emit("changed");
}

onMounted(load);
watch(() => [props.entryId, props.refreshKey], load);
onBeforeUnmount(() => {
  isUnmounted = true;
  releaseUrls();
});
</script>

<template>
  <div v-if="photos.length > 0" class="flex flex-wrap gap-2">
    <div v-for="(photo, index) in photos" :key="photo.id" class="relative">
      <button type="button" class="block overflow-hidden rounded-xl ring-1 ring-slate-200 dark:ring-slate-700" @click="openedIndex = index">
        <img :src="photo.url" alt="عکس خاطره" class="h-20 w-20 object-cover sm:h-24 sm:w-24" loading="lazy" />
      </button>
      <button
        v-if="editable"
        type="button"
        class="absolute -end-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-xs text-white"
        aria-label="حذف عکس"
        @click="remove(photo.id)"
      >
        ✕
      </button>
    </div>
  </div>

  <Teleport to="body">
    <div v-if="openedIndex !== null && photos[openedIndex]" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" @click="openedIndex = null">
      <img :src="photos[openedIndex].url" alt="عکس خاطره" class="max-h-full max-w-full rounded-xl object-contain" />
      <button type="button" class="absolute end-4 top-4 rounded-full bg-white/20 px-3 py-1 text-sm text-white" aria-label="بستن" @click.stop="openedIndex = null">✕</button>
    </div>
  </Teleport>
</template>
