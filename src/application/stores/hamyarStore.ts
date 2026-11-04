import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type {
  HamyarGuideData,
  HamyarSearchResult,
  HamyarCategory,
} from "@domain/hamyar/HamyarGuide";
import { HAMYAR_CATALOG, findHamyarGuideMeta } from "@presentation/hamyar/hamyarCatalog";
import { HamyarSearchEngine } from "@domain/hamyar/HamyarSearchEngine";

const STORAGE_KEY_CHECKLIST = "mahak_hamyar_checklist_completed_v1";

function loadSavedChecklist(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CHECKLIST);
    if (!raw) return new Set<string>();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set<string>(parsed) : new Set<string>();
  } catch {
    return new Set<string>();
  }
}

function persistChecklist(set: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY_CHECKLIST, JSON.stringify(Array.from(set)));
  } catch {
    // Ignore quota or private storage errors
  }
}

export const useHamyarStore = defineStore("hamyar", () => {
  const guidesData = ref<Record<string, HamyarGuideData>>({});
  const loading = ref(false);
  const loadingAll = ref(false);
  const error = ref<string | null>(null);

  // Filters & Search
  const selectedCategory = ref<"all" | HamyarCategory>("all");
  const searchQuery = ref("");
  const selectedResultType = ref<string>("all");

  // Checklist tracking
  const completedChecklistKeys = ref<Set<string>>(loadSavedChecklist());

  /** Load a single guide if not cached yet */
  async function loadGuide(guideId: string): Promise<HamyarGuideData | null> {
    if (guidesData.value[guideId]) {
      return guidesData.value[guideId];
    }
    const meta = findHamyarGuideMeta(guideId);
    if (!meta) {
      error.value = `راهنمای «${guideId}» پیدا نشد.`;
      return null;
    }

    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(`/help/${meta.jsonFile}`);
      if (!response.ok) {
        throw new Error(`خطا در دریافت اطلاعات (${response.status})`);
      }
      const data = (await response.json()) as HamyarGuideData;
      guidesData.value[guideId] = data;
      return data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "خطای ناشناخته در بارگذاری راهنما";
      return null;
    } finally {
      loading.value = false;
    }
  }

  /** Load all guides to enable comprehensive global search */
  async function loadAllGuides(): Promise<void> {
    if (loadingAll.value) return;
    const missing = HAMYAR_CATALOG.filter((m) => !guidesData.value[m.id]);
    if (missing.length === 0) return;

    loadingAll.value = true;
    try {
      await Promise.all(
        missing.map(async (meta) => {
          try {
            const res = await fetch(`/help/${meta.jsonFile}`);
            if (res.ok) {
              const data = (await res.json()) as HamyarGuideData;
              guidesData.value[meta.id] = data;
            }
          } catch {
            // Ignore individual fetch failure during preload
          }
        }),
      );
    } finally {
      loadingAll.value = false;
    }
  }

  /** Filtered guide meta list based on category */
  const visibleGuides = computed(() => {
    if (selectedCategory.value === "all") {
      return HAMYAR_CATALOG;
    }
    return HAMYAR_CATALOG.filter((g) => g.category === selectedCategory.value);
  });

  /** Global search results across all loaded guides */
  const globalSearchResults = computed<readonly HamyarSearchResult[]>(() => {
    const q = searchQuery.value.trim();
    if (!q || q.length < 2) return [];

    const list = HAMYAR_CATALOG.map((meta) => {
      const data = guidesData.value[meta.id];
      if (!data) return null;
      return { metaId: meta.id, metaTitle: meta.title, data };
    }).filter((x): x is { metaId: string; metaTitle: string; data: HamyarGuideData } => x !== null);

    const all = HamyarSearchEngine.searchAll(list, q, 100);

    if (selectedResultType.value === "all") {
      return all;
    }
    return all.filter((r) => r.contentType === selectedResultType.value);
  });

  /** Checklist actions */
  function isChecklistCompleted(key: string): boolean {
    return completedChecklistKeys.value.has(key);
  }

  function toggleChecklist(key: string): void {
    const next = new Set(completedChecklistKeys.value);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    completedChecklistKeys.value = next;
    persistChecklist(next);
  }

  function getGuideCompletion(guideId: string): { completed: number; total: number; percentage: number } {
    const data = guidesData.value[guideId];
    if (!data || !data.stages) return { completed: 0, total: 0, percentage: 0 };

    let total = 0;
    let completed = 0;

    data.stages.forEach((stage) => {
      (stage.practical_checklist || []).forEach((_, idx) => {
        total++;
        const key = `${guideId}:${stage.id}:${idx}`;
        if (completedChecklistKeys.value.has(key)) {
          completed++;
        }
      });
    });

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  }

  return {
    guidesData,
    loading,
    loadingAll,
    error,
    selectedCategory,
    searchQuery,
    selectedResultType,
    visibleGuides,
    globalSearchResults,
    loadGuide,
    loadAllGuides,
    isChecklistCompleted,
    toggleChecklist,
    getGuideCompletion,
  };
});
