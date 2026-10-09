<script setup lang="ts">
import { computed } from "vue";
import { BOARD_SIZE, type SnakeLadderBoard } from "@domain/games/snakeLadder/SnakeLadderBoard";
import { PlayerRole } from "@domain/games/snakeLadder/SnakeLadderGame";
import type { BoardToken } from "./boardToken";

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

const TOKEN_CLASS: Record<PlayerRole, string> = {
  [PlayerRole.Woman]: "bg-fuchsia-500",
  [PlayerRole.Man]: "bg-sky-500",
};

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

const rolesByCell = computed(() => {
  const map = new Map<number, PlayerRole[]>();
  for (const token of props.tokens) {
    if (token.position < 1) continue;
    map.set(token.position, [...(map.get(token.position) ?? []), token.role]);
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
      icon: kind === "snake" ? "🐍" : kind === "ladder" ? "🪜" : kind === "challenge" ? "🔥" : number === BOARD_SIZE ? "🏁" : "",
      targetLabel: target === null ? "" : `${kind === "snake" ? "↓" : "↑"}${target}`,
      roles: rolesByCell.value.get(number) ?? [],
    };
  }),
);

function cellClasses(kind: string, cellNumber: number): string[] {
  const classes = ["relative flex aspect-square flex-col items-center justify-center gap-px rounded-md text-slate-700 dark:text-slate-200"];
  if (kind === "snake") classes.push("bg-rose-100 dark:bg-rose-500/20");
  else if (kind === "ladder") classes.push("bg-emerald-100 dark:bg-emerald-500/20");
  else if (kind === "challenge") classes.push("bg-amber-100 dark:bg-amber-500/20");
  else classes.push("bg-slate-100 dark:bg-slate-800");
  if (props.selectedCell === cellNumber) classes.push("ring-2 ring-teal-500");
  if (props.interactive) classes.push("cursor-pointer hover:brightness-95");
  return classes;
}
</script>

<template>
  <div
    dir="ltr"
    class="mx-auto grid w-full max-w-xl grid-cols-10 gap-0.5 rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 sm:gap-1 sm:p-3"
  >
    <button
      v-for="cell in cells"
      :key="cell.number"
      type="button"
      :disabled="!interactive"
      :class="cellClasses(cell.kind, cell.number)"
      :aria-label="`خانه ${cell.number}`"
      @click="emit('select-cell', cell.number)"
    >
      <span class="text-[10px] font-medium leading-none sm:text-xs">{{ cell.number }}</span>
      <span v-if="cell.icon" class="text-[11px] leading-none sm:text-base">{{ cell.icon }}</span>
      <span v-if="cell.targetLabel" class="text-[8px] leading-none opacity-70 sm:text-[10px]">{{ cell.targetLabel }}</span>
      <span v-if="cell.roles.length" class="absolute inset-x-0 bottom-0.5 flex justify-center gap-0.5">
        <span v-for="role in cell.roles" :key="role" class="h-2 w-2 rounded-full ring-1 ring-white sm:h-3 sm:w-3" :class="TOKEN_CLASS[role]" />
      </span>
    </button>
  </div>
</template>
