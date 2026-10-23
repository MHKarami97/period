<script setup lang="ts">
import { computed } from "vue";
import { BOARD_SIZE, type SnakeLadderBoard } from "@domain/games/snakeLadder/SnakeLadderBoard";
import BoardIcon from "./BoardIcon.vue";
import PlayerPawn from "./PlayerPawn.vue";
import { iconKindOfCell } from "./boardIcons";
import { placePawns, type BoardToken } from "./boardToken";

const COLUMNS = 10;

/**
 * Visual order of cell numbers: boustrophedon ("snake-like") layout, cell 1 at
 * bottom-left, cell 100 at top-left. Computed once at module level because it never changes.
 */
const DISPLAY_ORDER: readonly number[] = Array.from({ length: BOARD_SIZE }, (_, index) => {
  const boardRow = COLUMNS - 1 - Math.floor(index / COLUMNS);
  const column = index % COLUMNS;
  return boardRow * COLUMNS + (boardRow % 2 === 0 ? column + 1 : COLUMNS - column);
});

const props = withDefaults(
  defineProps<{
    board: SnakeLadderBoard;
    tokens?: readonly BoardToken[];
    selectedCell?: number | null;
    interactive?: boolean;
  }>(),
  { tokens: () => [], selectedCell: null, interactive: false },
);

const emit = defineEmits<{ (event: "select-cell", cell: number): void }>();

const tokensByCell = computed(() => {
  const map = new Map<number, BoardToken[]>();
  for (const token of props.tokens) {
    if (token.position < 1) continue;
    map.set(token.position, [...(map.get(token.position) ?? []), token]);
  }
  return map;
});

const cells = computed(() =>
  DISPLAY_ORDER.map((number) => {
    const kind = props.board.kindOf(number);
    const target = props.board.jumpTarget(number);
    return {
      number,
      kind,
      iconKind: iconKindOfCell(kind, number),
      targetLabel: target === null ? "" : `${kind === "snake" ? "↓" : "↑"}${target}`,
      pawns: placePawns(tokensByCell.value.get(number) ?? []),
    };
  }),
);

function cellClasses(kind: string, cellNumber: number, hasPawn: boolean): string[] {
  const classes = ["relative flex aspect-square flex-col items-center justify-center gap-px rounded-md text-slate-700 dark:text-slate-200"];
  if (kind === "snake") classes.push("bg-rose-100 dark:bg-rose-500/20");
  else if (kind === "ladder") classes.push("bg-emerald-100 dark:bg-emerald-500/20");
  else if (kind === "challenge") classes.push("bg-amber-100 dark:bg-amber-500/20");
  else classes.push("bg-slate-100 dark:bg-slate-800");
  if (props.selectedCell === cellNumber) classes.push("ring-2 ring-teal-500");
  if (props.interactive) classes.push("cursor-pointer hover:brightness-95");
  if (hasPawn) classes.push("z-10");
  return classes;
}
</script>

<template>
  <div
    dir="ltr"
    class="mx-auto grid w-full max-w-xl grid-cols-10 gap-0.5 rounded-2xl bg-white p-1.5 pt-3 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 sm:gap-1 sm:p-3 sm:pt-5"
  >
    <button
      v-for="cell in cells"
      :key="cell.number"
      type="button"
      :disabled="!interactive"
      :class="cellClasses(cell.kind, cell.number, cell.pawns.length > 0)"
      :aria-label="`خانه ${cell.number}`"
      @click="emit('select-cell', cell.number)"
    >
      <span class="text-[10px] font-medium leading-none sm:text-xs">{{ cell.number }}</span>
      <BoardIcon v-if="cell.iconKind" :kind="cell.iconKind" class="h-3.5 w-3.5 sm:h-5 sm:w-5" />
      <span v-if="cell.targetLabel" class="text-[8px] leading-none opacity-70 sm:text-[10px]">{{ cell.targetLabel }}</span>
      <span v-if="cell.pawns.length" class="pointer-events-none absolute inset-x-0 bottom-[-12%] h-[135%]">
        <span
          v-for="pawn in cell.pawns"
          :key="pawn.role"
          class="pawn-slot absolute bottom-0 flex"
          :style="{ left: `${pawn.leftPercent}%`, height: `${pawn.heightPercent}%`, zIndex: pawn.zIndex }"
        >
          <PlayerPawn :role="pawn.role" class="pawn-hop" />
        </span>
      </span>
    </button>
  </div>
</template>

<style scoped>
@keyframes pawn-hop {
  0% {
    transform: translateY(-30%) scale(1.08);
  }
  60% {
    transform: translateY(4%) scale(0.97);
  }
  100% {
    transform: translateY(0) scale(1);
  }
}

/* The slot is centred on `left`; moving between layouts is eased so nothing jumps. */
.pawn-slot {
  transform: translateX(-50%);
  transition: left 180ms ease, height 180ms ease;
}

.pawn-hop {
  animation: pawn-hop 200ms ease-out;
  transform-origin: bottom center;
}

@media (prefers-reduced-motion: reduce) {
  .pawn-hop {
    animation: none;
  }

  .pawn-slot {
    transition: none;
  }
}
</style>
