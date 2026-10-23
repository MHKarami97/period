<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from "vue";
import type { SlotStatus } from "@domain/games/scratchCards/ScratchSheet";
import { ScratchSurface } from "./ScratchSurface";

const BRUSH_RADIUS_CSS_PX = 20;
const REVEAL_THRESHOLD = 0.5;
const CHECK_INTERVAL_MS = 120;

defineProps<{ text: string; categoryLabel: string; status: SlotStatus }>();

const emit = defineEmits<{
  (event: "reveal"): void;
  (event: "complete"): void;
}>();

const canvasElement = ref<HTMLCanvasElement | null>(null);
let surface: ScratchSurface | null = null;
let resizeObserver: ResizeObserver | null = null;
let isScratching = false;
let hasScratched = false;
let hasRevealed = false;
let lastCheckAt = 0;

function detach(): void {
  resizeObserver?.disconnect();
  resizeObserver = null;
  surface = null;
}

/**
 * Runs every time a <canvas> is created (the element lives behind v-if, so it
 * can be re-created while this component instance stays mounted). The
 * observer repaints the cover whenever the element gets its real size.
 */
function attach(canvas: HTMLCanvasElement | null): void {
  detach();
  isScratching = false;
  hasScratched = false;
  hasRevealed = false;
  if (!canvas) return;

  surface = ScratchSurface.create(canvas, BRUSH_RADIUS_CSS_PX);
  if (!surface) return;

  resizeObserver = new ResizeObserver(() => {
    if (!hasScratched) surface?.paint();
  });
  resizeObserver.observe(canvas);
  surface.paint();
}

function checkProgress(force: boolean): void {
  if (!surface || hasRevealed) return;
  const now = performance.now();
  if (!force && now - lastCheckAt < CHECK_INTERVAL_MS) return;
  lastCheckAt = now;
  if (surface.clearedFraction() >= REVEAL_THRESHOLD) {
    hasRevealed = true;
    isScratching = false;
    emit("reveal");
  }
}

function onPointerDown(event: PointerEvent): void {
  if (!surface || (event.pointerType === "mouse" && event.button !== 0)) return;
  event.preventDefault();
  isScratching = true;
  hasScratched = true;
  try {
    canvasElement.value?.setPointerCapture(event.pointerId);
  } catch {
    // Capture is an optimisation; scratching still works without it.
  }
  surface.beginStroke(event);
}

function onPointerMove(event: PointerEvent): void {
  if (!isScratching || !surface) return;
  event.preventDefault();
  surface.continueStroke(event);
  checkProgress(false);
}

function onPointerEnd(): void {
  if (!isScratching) return;
  isScratching = false;
  surface?.endStroke();
  checkProgress(true);
}

watch(canvasElement, attach, { flush: "post" });
onBeforeUnmount(detach);
</script>

<template>
  <div class="flex flex-col gap-2">
    <div
      class="relative flex min-h-40 items-center justify-center overflow-hidden rounded-2xl p-4 text-center ring-1 ring-slate-200 dark:ring-slate-800"
      :class="status === 'done' ? 'bg-emerald-100/70 dark:bg-emerald-500/15' : 'bg-amber-100/70 dark:bg-amber-500/15'"
    >
      <div class="flex flex-col gap-2">
        <span class="text-[11px] text-slate-500 dark:text-slate-400">{{ categoryLabel }}</span>
        <p class="text-sm leading-7 text-slate-900 dark:text-slate-100">{{ text }}</p>
      </div>

      <canvas
        v-if="status === 'hidden'"
        ref="canvasElement"
        class="absolute inset-0 h-full w-full cursor-pointer"
        style="touch-action: none; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none"
        aria-hidden="true"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerEnd"
        @pointercancel="onPointerEnd"
        @lostpointercapture="onPointerEnd"
        @contextmenu.prevent
      />
    </div>

    <button v-if="status === 'hidden'" type="button" class="rounded-lg px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800" @click="emit('reveal')">
      رو کردن بدون خراشیدن
    </button>
    <button
      v-else-if="status === 'revealed'"
      type="button"
      class="rounded-xl bg-teal-500/90 px-3 py-2 text-sm font-medium text-white hover:bg-teal-500"
      @click="emit('complete')"
    >
      انجام شد ✅
    </button>
    <p v-else class="text-center text-xs font-medium text-emerald-600 dark:text-emerald-300">✓ انجام شد</p>
  </div>
</template>
