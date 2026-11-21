<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import AppIcon from "./AppIcon.vue";

export interface AppSelectOption {
  readonly value: string;
  readonly label: string;
}

const props = withDefaults(
  defineProps<{
    modelValue: string;
    options: readonly AppSelectOption[];
    placeholder?: string;
    required?: boolean;
    allowCustom?: boolean;
    disabled?: boolean;
    customLabel?: string;
  }>(),
  {
    placeholder: "انتخاب کنید...",
    required: false,
    allowCustom: false,
    disabled: false,
    customLabel: "دسته",
  },
);

const emit = defineEmits<{
  (event: "update:modelValue", value: string): void;
  (event: "change", value: string): void;
  (event: "addCustom", label: string): void;
}>();

const isOpen = ref(false);
const searchQuery = ref("");
const containerRef = ref<HTMLElement | null>(null);
const searchInputRef = ref<HTMLInputElement | null>(null);

const selectedOption = computed(() =>
  props.options.find((option) => option.value === props.modelValue),
);

const displayLabel = computed(() => {
  if (selectedOption.value) {
    return selectedOption.value.label;
  }
  if (props.modelValue) {
    return props.modelValue;
  }
  return "";
});

const filteredOptions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) {
    return props.options;
  }
  return props.options.filter(
    (option) =>
      option.label.toLowerCase().includes(q) ||
      option.value.toLowerCase().includes(q),
  );
});

const canAddCustom = computed(() => {
  if (!props.allowCustom) return false;
  const q = searchQuery.value.trim();
  if (!q) return false;
  return !props.options.some(
    (o) => o.label.toLowerCase() === q.toLowerCase() || o.value.toLowerCase() === q.toLowerCase(),
  );
});

function toggleDropdown(): void {
  if (props.disabled) return;
  if (isOpen.value) {
    closeDropdown();
  } else {
    openDropdown();
  }
}

function openDropdown(): void {
  isOpen.value = true;
  searchQuery.value = "";
  nextTick(() => {
    searchInputRef.value?.focus();
  });
}

function closeDropdown(): void {
  isOpen.value = false;
  searchQuery.value = "";
}

function selectOption(option: AppSelectOption): void {
  emit("update:modelValue", option.value);
  emit("change", option.value);
  closeDropdown();
}

function selectCustom(): void {
  const custom = searchQuery.value.trim();
  if (!custom) return;
  emit("addCustom", custom);
  emit("update:modelValue", custom);
  emit("change", custom);
  closeDropdown();
}

function clearSelection(): void {
  emit("update:modelValue", "");
  emit("change", "");
}

function handleClickOutside(event: MouseEvent): void {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    closeDropdown();
  }
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape") {
    closeDropdown();
  } else if (event.key === "Enter" && isOpen.value) {
    if (filteredOptions.value.length > 0) {
      selectOption(filteredOptions.value[0]);
    } else if (canAddCustom.value) {
      selectCustom();
    }
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <div ref="containerRef" class="relative w-full" @keydown="handleKeydown">
    <!-- Trigger Button -->
    <div
      role="combobox"
      :aria-expanded="isOpen"
      :aria-disabled="disabled"
      tabindex="0"
      class="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 shadow-2xs transition focus:border-teal-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-teal-400 dark:focus:bg-slate-800 cursor-pointer select-none"
      :class="{
        'opacity-50 cursor-not-allowed': disabled,
        'ring-2 ring-teal-500/20 border-teal-500 bg-white dark:bg-slate-800': isOpen,
      }"
      @click="toggleDropdown"
    >
      <span v-if="displayLabel" class="truncate font-medium text-slate-900 dark:text-slate-100">
        {{ displayLabel }}
      </span>
      <span v-else class="truncate text-slate-400 dark:text-slate-500">
        {{ placeholder }}
      </span>

      <div class="flex items-center gap-1.5 shrink-0 text-slate-400 dark:text-slate-500">
        <button
          v-if="displayLabel && !required && !disabled"
          type="button"
          class="flex h-4 w-4 items-center justify-center rounded-full hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
          title="حذف انتخاب"
          @click.stop="clearSelection"
        >
          ✕
        </button>

        <svg
          class="h-4 w-4 transition-transform duration-200"
          :class="{ 'rotate-180': isOpen }"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>

    <!-- Dropdown Menu -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="isOpen"
        class="absolute z-50 mt-1.5 flex max-h-72 w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-850"
      >
        <!-- Search input inside dropdown -->
        <div class="border-b border-slate-100 p-2 dark:border-slate-800">
          <div class="relative flex items-center">
            <span class="pointer-events-none absolute right-2.5 text-slate-400 dark:text-slate-500">
              <AppIcon name="search" size="xs" />
            </span>
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              placeholder="جست‌وجو با تایپ کردن..."
              class="w-full rounded-xl bg-slate-50 py-1.5 pe-8 ps-7 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-800"
              @click.stop
            />
            <button
              v-if="searchQuery"
              type="button"
              class="absolute left-2 flex h-4 w-4 items-center justify-center rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              @click.stop="searchQuery = ''"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Scrollable Options List -->
        <ul class="flex max-h-56 flex-col overflow-y-auto p-1.5" role="listbox">
          <li
            v-if="!required"
            class="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-xs text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition"
            :class="{ 'bg-slate-100 font-bold text-slate-800 dark:bg-slate-800 dark:text-slate-200': !modelValue }"
            @click="clearSelection(); closeDropdown()"
          >
            <span>— بدون انتخاب</span>
          </li>

          <li
            v-for="option in filteredOptions"
            :key="option.value"
            role="option"
            :aria-selected="option.value === modelValue"
            class="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-xs text-slate-800 transition hover:bg-teal-50/70 hover:text-teal-900 dark:text-slate-200 dark:hover:bg-teal-950/50 dark:hover:text-teal-200"
            :class="{
              'bg-teal-50 font-bold text-teal-800 dark:bg-teal-950/60 dark:text-teal-300':
                option.value === modelValue,
            }"
            @click="selectOption(option)"
          >
            <span class="truncate">{{ option.label }}</span>
            <span v-if="option.value === modelValue" class="text-teal-600 dark:text-teal-400 shrink-0">
              ✓
            </span>
          </li>

          <!-- Empty search state -->
          <li
            v-if="filteredOptions.length === 0 && !canAddCustom"
            class="py-4 text-center text-xs text-slate-400 dark:text-slate-500"
          >
            گزینه‌ای منطبق با جست‌وجوی شما پیدا نشد.
          </li>

          <!-- Add Custom Category Option -->
          <li
            v-if="canAddCustom"
            class="mt-1 flex cursor-pointer items-center justify-between rounded-xl bg-teal-500/10 p-2.5 text-xs font-bold text-teal-700 hover:bg-teal-500/20 dark:text-teal-300 dark:hover:bg-teal-500/25 transition"
            @click="selectCustom"
          >
            <span>➕ افزودن «{{ searchQuery.trim() }}» به عنوان {{ customLabel }} جدید</span>
            <span>+</span>
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>
