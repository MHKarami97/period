<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useSnakeLadderStore } from "@application/stores/snakeLadderStore";
import { BOARD_SIZE, FIRST_CELL, MAX_CHALLENGE_LENGTH, type CellKind } from "@domain/games/snakeLadder/SnakeLadderBoard";
import { BoardValidationError } from "@domain/games/snakeLadder/BoardValidationError";
import { useToast } from "@presentation/composables/useToast";
import SnakeLadderBoardGrid from "./SnakeLadderBoardGrid.vue";

const MODE_OPTIONS: ReadonlyArray<{ value: CellKind; label: string }> = [
  { value: "empty", label: "خالی" },
  { value: "challenge", label: "🔥 چالش" },
  { value: "snake", label: "🐍 مار" },
  { value: "ladder", label: "🪜 نردبان" },
];

const store = useSnakeLadderStore();
const { showToast } = useToast();

const selectedCell = ref<number | null>(null);
const mode = ref<CellKind>("empty");
const targetInput = ref<number | string>("");
const textInput = ref("");
const errorMessage = ref<string | null>(null);

const isEditableCell = computed(
  () => selectedCell.value !== null && selectedCell.value > FIRST_CELL && selectedCell.value < BOARD_SIZE,
);

function loadDraft(): void {
  const cell = selectedCell.value;
  if (cell === null) return;
  mode.value = store.board.kindOf(cell);
  targetInput.value = store.board.jumpTarget(cell) ?? "";
  textInput.value = store.board.challengeAt(cell) ?? "";
  errorMessage.value = null;
}

watch([selectedCell, () => store.board], loadDraft);

function applyChange(): void {
  const cell = selectedCell.value;
  if (cell === null) return;

  try {
    switch (mode.value) {
      case "challenge":
        store.setChallenge(cell, textInput.value);
        break;
      case "snake":
        store.setSnake(cell, Number(targetInput.value));
        break;
      case "ladder":
        store.setLadder(cell, Number(targetInput.value));
        break;
      default:
        store.clearCell(cell);
    }
    errorMessage.value = null;
    showToast("تغییر اعمال شد");
  } catch (error) {
    errorMessage.value = error instanceof BoardValidationError ? error.message : "ثبت تغییر ممکن نشد.";
  }
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <SnakeLadderBoardGrid :board="store.board" :selected-cell="selectedCell" interactive @select-cell="selectedCell = $event" />

    <div class="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
      <span>🐍 مار (↓ پایین‌ می‌آید)</span>
      <span>🪜 نردبان (↑ بالا می‌رود)</span>
      <span>🔥 چالش</span>
    </div>

    <div class="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <p v-if="selectedCell === null" class="text-sm text-slate-500 dark:text-slate-400">
        برای ویرایش، روی یکی از خانه‌های تخته بزنید.
      </p>
      <p v-else-if="!isEditableCell" class="text-sm text-slate-500 dark:text-slate-400">
        خانه {{ selectedCell }} (شروع/پایان) قابل ویرایش نیست.
      </p>

      <template v-else>
        <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">ویرایش خانه {{ selectedCell }}</h3>

        <div class="flex flex-wrap gap-2">
          <button
            v-for="option in MODE_OPTIONS"
            :key="option.value"
            type="button"
            class="rounded-lg px-3 py-1.5 text-xs transition"
            :class="
              mode === option.value
                ? 'bg-teal-500/10 text-teal-600 ring-1 ring-teal-500 dark:bg-teal-500/20 dark:text-teal-300 dark:ring-teal-400'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            "
            @click="mode = option.value"
          >
            {{ option.label }}
          </button>
        </div>

        <label v-if="mode === 'snake' || mode === 'ladder'" class="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
          {{ mode === "snake" ? "دُم مار به کدام خانه برسد؟ (پایین‌تر)" : "نردبان به کدام خانه برسد؟ (بالاتر)" }}
          <input
            v-model.number="targetInput"
            type="number"
            inputmode="numeric"
            min="1"
            max="99"
            dir="ltr"
            class="w-full rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-900 dark:bg-slate-800 dark:text-slate-100"
          />
        </label>

        <label v-if="mode === 'challenge'" class="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
          متن چالش - برای نام‌ها از «{player}» (کسی که روی خانه رسید) و «{partner}» (طرف مقابل) استفاده کنید.
          <textarea
            v-model="textInput"
            rows="3"
            :maxlength="MAX_CHALLENGE_LENGTH"
            class="w-full resize-none rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-900 dark:bg-slate-800 dark:text-slate-100"
          />
        </label>

        <p v-if="errorMessage" class="text-xs font-medium text-rose-500 dark:text-rose-300" role="alert">{{ errorMessage }}</p>

        <button
          type="button"
          class="rounded-xl bg-teal-500/90 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-500"
          @click="applyChange"
        >
          اعمال تغییر
        </button>
      </template>
    </div>
  </div>
</template>
