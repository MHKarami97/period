import { watch } from "vue";
import { useThemeStore } from "@application/stores/themeStore";

const DARK_THEME_COLOR = "#0f172a";
const LIGHT_THEME_COLOR = "#f8fafc";

/**
 * useThemeSync - presentation-layer composable that applies the
 * themeStore's preference to the DOM: toggles the `dark` class on
 * <html> (consumed by Tailwind's `darkMode: "class"` strategy) and keeps
 * the mobile browser chrome color (`<meta name="theme-color">`) in sync.
 * DOM access is intentionally isolated here rather than in the Pinia
 * store, which stays a framework-agnostic state container.
 */
export function useThemeSync(): void {
  const themeStore = useThemeStore();

  function applyTheme(isDark: boolean): void {
    document.documentElement.classList.toggle("dark", isDark);

    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute("content", isDark ? DARK_THEME_COLOR : LIGHT_THEME_COLOR);
    }
  }

  applyTheme(themeStore.isDark);
  watch(() => themeStore.isDark, applyTheme);
}
