<script setup lang="ts">
import { computed, reactive } from "vue";
import { DateOnly } from "@domain/valueObjects/DateOnly";
import type { HamdelFieldDefinition, HamdelSectionDefinition } from "@domain/hamdel/HamdelSectionDefinition";
import { buildDefaultValues } from "@domain/hamdel/hamdelDefaults";
import JalaliDatePicker from "@presentation/components/shared/JalaliDatePicker.vue";
import { useJalali } from "@presentation/composables/useJalali";

const props = defineProps<{
  definition: HamdelSectionDefinition;
  initialValues?: Readonly<Record<string, string>>;
  submitLabel?: string;
  error?: string | null;
}>();

const emit = defineEmits<{
  (event: "submit", values: Record<string, string>): void;
  (event: "cancel"): void;
}>();

const INPUT_CLASS =
  "w-full rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:text-slate-100";

const { toJalaliLabel } = useJalali();

// Hidden fields are not rendered, but their stored values are kept so editing never loses them.
const visibleFields = computed(() => props.definition.fields.filter((field) => !field.hidden));
const values = reactive<Record<string, string>>({
  ...buildDefaultValues(props.definition, DateOnly.today().toIsoString()),
  ...props.initialValues,
});

function dateOf(field: HamdelFieldDefinition): DateOnly {
  return values[field.key] ? DateOnly.fromIsoString(values[field.key]) : DateOnly.today();
}

function setDate(field: HamdelFieldDefinition, day: DateOnly): void {
  values[field.key] = day.toIsoString();
}

function submit(): void {
  emit("submit", { ...values });
}
</script>

<template>
  <form class="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800" @submit.prevent="submit">
    <component :is="field.kind === 'date' ? 'div' : 'label'" v-for="field in visibleFields" :key="field.key" class="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
      <span>{{ field.label }}<span v-if="field.required" class="text-rose-500"> *</span></span>

      <template v-if="field.kind === 'text'">
        <input
          v-model="values[field.key]"
          type="text"
          :class="INPUT_CLASS"
          :maxlength="field.maxLength"
          :placeholder="field.placeholder"
          :list="field.suggestions ? `${definition.id}-${field.key}-hints` : undefined"
        />
        <datalist v-if="field.suggestions" :id="`${definition.id}-${field.key}-hints`">
          <option v-for="hint in field.suggestions" :key="hint" :value="hint" />
        </datalist>
      </template>

      <textarea
        v-else-if="field.kind === 'textarea'"
        v-model="values[field.key]"
        rows="3"
        :class="[INPUT_CLASS, 'resize-none']"
        :maxlength="field.maxLength"
        :placeholder="field.placeholder"
      />

      <select v-else-if="field.kind === 'select'" v-model="values[field.key]" :class="INPUT_CLASS">
        <option v-if="!field.required" value="">—</option>
        <option v-else value="" disabled>انتخاب کنید</option>
        <option v-for="option in field.options" :key="option.value" :value="option.value">{{ option.label }}</option>
      </select>

      <div v-else-if="field.kind === 'date'" class="flex items-center gap-2">
        <div v-if="values[field.key] || field.required" class="min-w-0 flex-1">
          <JalaliDatePicker :model-value="dateOf(field)" @update:model-value="setDate(field, $event)" />
        </div>
        <button
          v-else
          type="button"
          class="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          @click="setDate(field, DateOnly.today())"
        >
          افزودن تاریخ
        </button>
        <button
          v-if="values[field.key] && !field.required"
          type="button"
          class="rounded-lg px-2 py-2 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          :aria-label="`حذف ${toJalaliLabel(dateOf(field))}`"
          @click="values[field.key] = ''"
        >
          ✕
        </button>
      </div>
    </component>

    <p v-if="error" class="text-xs font-medium text-rose-500 dark:text-rose-300" role="alert">{{ error }}</p>

    <div class="flex justify-end gap-2">
      <button type="button" class="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" @click="emit('cancel')">انصراف</button>
      <button type="submit" class="rounded-xl bg-teal-500/90 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500">{{ submitLabel ?? "ذخیره" }}</button>
    </div>
  </form>
</template>
