import { ref } from "vue";

const message = ref<string | null>(null);
let hideTimeoutId: ReturnType<typeof setTimeout> | null = null;

export function useToast() {
  function showToast(text: string, durationMs = 1000): void {
    message.value = text;
    if (hideTimeoutId) {
      clearTimeout(hideTimeoutId);
    }
    hideTimeoutId = setTimeout(() => {
      message.value = null;
    }, durationMs);
  }

  return { message, showToast };
}