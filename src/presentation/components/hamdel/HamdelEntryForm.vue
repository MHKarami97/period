<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { DateOnly } from "@domain/valueObjects/DateOnly";
import type { HamdelFieldDefinition, HamdelSectionDefinition } from "@domain/hamdel/HamdelSectionDefinition";
import { buildDefaultValues } from "@domain/hamdel/hamdelDefaults";
import { addCustomCategory } from "@domain/hamdel/customCategories";
import JalaliDatePicker from "@presentation/components/shared/JalaliDatePicker.vue";
import AppSelect from "@presentation/components/common/AppSelect.vue";
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

const customCategoryInputs = reactive<Record<string, string>>({});
const optionsVersion = ref(0);

function getFieldOptions(field: HamdelFieldDefinition) {
  void optionsVersion.value;
  return field.options ?? [];
}

function handleAddCustomCategory(field: HamdelFieldDefinition, label: string): void {
  const text = label.trim();
  if (!text) return;
  const newOpt = addCustomCategory(props.definition.id, field.key, text);
  values[field.key] = newOpt.value;
  optionsVersion.value++;
}

function openNewCategoryInput(field: HamdelFieldDefinition): void {
  customCategoryInputs[field.key] = "";
}

function cancelNewCategory(field: HamdelFieldDefinition): void {
  delete customCategoryInputs[field.key];
  if (values[field.key] === "__custom_new__") {
    values[field.key] = "";
  }
}

function saveNewCategory(field: HamdelFieldDefinition): void {
  const text = (customCategoryInputs[field.key] ?? "").trim();
  if (!text) return;
  handleAddCustomCategory(field, text);
  delete customCategoryInputs[field.key];
}

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
    <component :is="field.kind === 'date' || field.kind === 'select' ? 'div' : 'label'" v-for="field in visibleFields" :key="field.key" class="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
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
        <div v-if="field.suggestions && field.suggestions.length > 0" class="flex flex-wrap items-center gap-1.5 pt-1">
          <span class="text-[10px] text-slate-400 dark:text-slate-500">پیشنهادات سریع:</span>
          <button
            v-for="hint in field.suggestions"
            :key="hint"
            type="button"
            class="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 transition hover:bg-teal-50 hover:text-teal-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-teal-950/60 dark:hover:text-teal-300"
            @click="values[field.key] = hint"
          >
            + {{ hint }}
          </button>
        </div>
      </template>

      <textarea
        v-else-if="field.kind === 'textarea'"
        v-model="values[field.key]"
        rows="3"
        :class="[INPUT_CLASS, 'resize-none']"
        :maxlength="field.maxLength"
        :placeholder="field.placeholder"
      />

      <div v-else-if="field.kind === 'select'" class="flex flex-col gap-1.5">
        <div class="flex items-center gap-2">
          <div class="min-w-0 flex-1">
            <AppSelect
              v-model="values[field.key]"
              :options="getFieldOptions(field)"
              :placeholder="field.placeholder || 'انتخاب کنید...'"
              :required="field.required"
              :allow-custom="field.allowCustom"
              :custom-label="field.label"
              @add-custom="handleAddCustomCategory(field, $event)"
            />
          </div>
          <button
            v-if="field.allowCustom && customCategoryInputs[field.key] === undefined"
            type="button"
            class="shrink-0 rounded-xl bg-teal-50 px-2.5 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-100 dark:bg-teal-950/60 dark:text-teal-300 dark:hover:bg-teal-900/60 transition"
            title="افزودن دسته سفارشی"
            @click="openNewCategoryInput(field)"
          >
            + دسته جدید
          </button>
        </div>

        <div v-if="customCategoryInputs[field.key] !== undefined" class="flex items-center gap-1.5 rounded-xl bg-teal-500/10 p-2">
          <input
            v-model="customCategoryInputs[field.key]"
            type="text"
            placeholder="نام دسته جدید (مثلاً: عطر، تفریح...)"
            class="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            @keydown.enter.prevent="saveNewCategory(field)"
          />
          <button
            type="button"
            class="shrink-0 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-700"
            @click="saveNewCategory(field)"
          >
            ثبت
          </button>
          <button
            type="button"
            class="shrink-0 rounded-lg px-2 py-1.5 text-xs text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
            @click="cancelNewCategory(field)"
          >
            ✕
          </button>
        </div>
      </div>

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
