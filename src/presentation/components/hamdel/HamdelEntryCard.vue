<script setup lang="ts">
import { computed } from "vue";
import { DateOnly } from "@domain/valueObjects/DateOnly";
import type { HamdelEntry } from "@domain/hamdel/HamdelEntry";
import type { HamdelFieldDefinition, HamdelSectionDefinition } from "@domain/hamdel/HamdelSectionDefinition";
import { useJalali } from "@presentation/composables/useJalali";

const props = defineProps<{ entry: HamdelEntry; definition: HamdelSectionDefinition }>();
const emit = defineEmits<{
  (event: "edit", entry: HamdelEntry): void;
  (event: "remove", entry: HamdelEntry): void;
  (event: "toggle", entry: HamdelEntry): void;
  (event: "advance", entry: HamdelEntry): void;
}>();

const { toJalaliLabel } = useJalali();

const fieldsByKey = computed(() => new Map(props.definition.fields.map((field) => [field.key, field])));

function displayValue(field: HamdelFieldDefinition, value: string): string {
  if (field.kind === "select") {
    return field.options?.find((option) => option.value === value)?.label ?? value;
  }
  if (field.kind === "date") {
    return toJalaliLabel(DateOnly.fromIsoString(value));
  }
  return value;
}

const headline = computed(() => props.entry.valueOf(props.definition.titleField));

const badges = computed(() =>
  (props.definition.badgeFields ?? []).flatMap((key) => {
    const field = fieldsByKey.value.get(key);
    const value = props.entry.valueOf(key);
    return field && value ? [displayValue(field, value)] : [];
  }),
);

const detailRows = computed(() => {
  const hidden = new Set([props.definition.titleField, ...(props.definition.badgeFields ?? [])]);
  return props.definition.fields.flatMap((field) => {
    const value = props.entry.valueOf(field.key);
    return value && !field.hidden && !hidden.has(field.key)
      ? [{ key: field.key, label: field.label, kind: field.kind, text: displayValue(field, value) }]
      : [];
  });
});

const isDone = computed(() => {
  const toggle = props.definition.toggle;
  return toggle ? props.entry.valueOf(toggle.field) === toggle.doneValue : false;
});

const nextFlowLabel = computed(() => {
  const flow = props.definition.flow;
  if (!flow) return null;
  const index = flow.steps.indexOf(props.entry.valueOf(flow.field));
  const nextValue = flow.steps[(index + 1) % flow.steps.length];
  const field = fieldsByKey.value.get(flow.field);
  return field ? displayValue(field, nextValue) : nextValue;
});
</script>

<template>
  <article class="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800" :class="{ 'opacity-70': isDone }">
    <header class="flex items-start justify-between gap-2">
      <h3 class="text-sm font-semibold leading-6 text-slate-900 dark:text-slate-100" :class="{ 'line-through': isDone }">{{ headline }}</h3>
      <div class="flex shrink-0 gap-1">
        <button type="button" class="rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800" @click="emit('edit', entry)">ویرایش</button>
        <button type="button" class="rounded-lg px-2 py-1 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10" @click="emit('remove', entry)">حذف</button>
      </div>
    </header>

    <div v-if="badges.length" class="flex flex-wrap gap-1">
      <span v-for="badge in badges" :key="badge" class="rounded-full bg-teal-500/10 px-2 py-0.5 text-[11px] text-teal-700 dark:bg-teal-500/20 dark:text-teal-300">{{ badge }}</span>
    </div>

    <dl v-if="detailRows.length" class="flex flex-col gap-1 text-xs leading-6 text-slate-600 dark:text-slate-300">
      <div v-for="row in detailRows" :key="row.key" class="flex flex-wrap gap-x-1">
        <dt class="text-slate-400 dark:text-slate-500">{{ row.label }}:</dt>
        <dd class="min-w-0 break-words" :class="{ 'whitespace-pre-line': row.kind === 'textarea' }">{{ row.text }}</dd>
      </div>
    </dl>

    <button
      v-if="definition.toggle"
      type="button"
      class="mt-1 self-start rounded-lg px-3 py-1.5 text-xs transition"
      :class="isDone ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'"
      @click="emit('toggle', entry)"
    >
      {{ isDone ? `✓ ${definition.toggle.doneLabel}` : `○ ${definition.toggle.openLabel}` }}
    </button>

    <button
      v-if="definition.flow && nextFlowLabel"
      type="button"
      class="mt-1 self-start rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
      @click="emit('advance', entry)"
    >
      مرحله‌ی بعد: {{ nextFlowLabel }}
    </button>
  </article>
</template>
