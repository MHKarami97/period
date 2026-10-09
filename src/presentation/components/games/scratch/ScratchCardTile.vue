<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { SlotStatus } from "@domain/games/scratchCards/ScratchSheet";

const BRUSH_RADIUS_CSS_PX = 16;
const REVEAL_THRESHOLD = 0.5;
const CHECK_INTERVAL_MS = 120;
const SAMPLE_GRID_SIZE = 10;

defineProps<{ text: string; categoryLabel: string; status: SlotStatus }>();

const emit = defineEmits<{
  (event: "reveal"): void;
  (event: "complete"): void;
}>();

const canvasElement = ref<HTMLCanvasElement | null>(null);
let context: CanvasRenderingContext2D | null = null;
let isScratching = false;
let lastX = 0;
let lastY = 0;
let lastCheckAt = 0;
let pixelRatio = 1;

/** Paints the opaque "silver" cover; scratching then erases it with destination-out. */
function prepareCanvas(): void {
  const canvas = canvasElement.value;
  if (!canvas) return;

  pixelRatio = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.round(canvas.clientWidth * pixelRatio));
  canvas.height = Math.max(1, Math.round(canvas.clientHeight * pixelRatio));
  context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return;

  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#94a3b8");
  gradient.addColorStop(1, "#64748b");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "#e2e8f0";
  context.font = `${16 * pixelRatio}px Vazirmatn, sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("اینجا را بکش ✨", canvas.width / 2, canvas.height / 2);

  context.globalCompositeOperation = "destination-out";
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = BRUSH_RADIUS_CSS_PX * 2 * pixelRatio;
}

function positionOf(event: PointerEvent): { x: number; y: number } {
  const canvas = canvasElement.value as HTMLCanvasElement;
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (canvas.width / rect.width),
    y: (event.clientY - rect.top) * (canvas.height / rect.height),
  };
}

/** Samples a coarse grid of pixels (cheap) instead of reading the whole canvas. */
function clearedFraction(): number {
  const canvas = canvasElement.value;
  if (!canvas || !context) return 0;

  let cleared = 0;
  for (let row = 0; row < SAMPLE_GRID_SIZE; row += 1) {
    for (let column = 0; column < SAMPLE_GRID_SIZE; column += 1) {
      const x = Math.floor(((column + 0.5) / SAMPLE_GRID_SIZE) * canvas.width);
      const y = Math.floor(((row + 0.5) / SAMPLE_GRID_SIZE) * canvas.height);
      if (context.getImageData(x, y, 1, 1).data[3] === 0) cleared += 1;
    }
  }
  return cleared / (SAMPLE_GRID_SIZE * SAMPLE_GRID_SIZE);
}

function checkProgress(force: boolean): void {
  const now = performance.now();
  if (!force && now - lastCheckAt < CHECK_INTERVAL_MS) return;
  lastCheckAt = now;
  if (clearedFraction() >= REVEAL_THRESHOLD) {
    isScratching = false;
    emit("reveal");
  }
}

function onPointerDown(event: PointerEvent): void {
  if (!context) return;
  isScratching = true;
  canvasElement.value?.setPointerCapture(event.pointerId);
  const { x, y } = positionOf(event);
  context.beginPath();
  context.arc(x, y, BRUSH_RADIUS_CSS_PX * pixelRatio, 0, Math.PI * 2);
  context.fill();
  lastX = x;
  lastY = y;
}

function onPointerMove(event: PointerEvent): void {
  if (!isScratching || !context) return;
  const { x, y } = positionOf(event);
  context.beginPath();
  context.moveTo(lastX, lastY);
  context.lineTo(x, y);
  context.stroke();
  lastX = x;
  lastY = y;
  checkProgress(false);
}

function onPointerEnd(): void {
  if (!isScratching) return;
  isScratching = false;
  checkProgress(true);
}

onMounted(prepareCanvas);
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
        class="absolute inset-0 h-full w-full cursor-pointer touch-none"
        aria-hidden="true"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerEnd"
        @pointercancel="onPointerEnd"
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
