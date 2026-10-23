import { defineStore } from "pinia";
import { computed, ref, shallowRef, watch } from "vue";
import type { FacetKey } from "@domain/positions/facets";
import { InvalidAccessPasswordError } from "@domain/positions/errors";
import type { Position } from "@domain/positions/Position";
import { PositionCatalog } from "@domain/positions/PositionCatalog";
import { AutoAdvanceSettings } from "@domain/positions/AutoAdvanceSettings";
import { PositionFilter } from "@domain/positions/PositionFilter";
import { RandomExclusions } from "@domain/positions/RandomExclusions";
import { MathRandomSource } from "@infrastructure/random/MathRandomSource";
import { EncryptedPositionsSource } from "@infrastructure/positions/EncryptedPositionsSource";
import { createPositionAutoAdvanceRepository } from "@infrastructure/repositories/positionAutoAdvanceRepository";
import { createPositionRandomSettingsRepository } from "@infrastructure/repositories/positionRandomSettingsRepository";
import { useAccessStore } from "./accessStore";

export const PAGE_SIZE = 20;

export type LoadStatus = "idle" | "loading" | "ready" | "error";
export type LoadErrorKind = "password" | "data";

const source = new EncryptedPositionsSource();
const randomSource = new MathRandomSource();
const randomSettingsRepository = createPositionRandomSettingsRepository();
const autoAdvanceRepository = createPositionAutoAdvanceRepository();

/**
 * positionsStore - Application Service for the positions section: decrypts
 * the catalog once per session, then exposes search, filters and the
 * paginated (infinite-scroll) list. Decrypted data is dropped when the app is
 * locked again.
 */
export const usePositionsStore = defineStore("positions", () => {
  const access = useAccessStore();

  const status = ref<LoadStatus>("idle");
  const errorKind = ref<LoadErrorKind | null>(null);
  const catalog = shallowRef<PositionCatalog | null>(null);
  const query = ref("");
  const filter = shallowRef<PositionFilter>(PositionFilter.empty());
  const visibleCount = ref(PAGE_SIZE);
  // Preferences, not session data: they survive locking and reloads.
  const randomExclusions = shallowRef<RandomExclusions>(randomSettingsRepository.load() ?? RandomExclusions.none());
  const autoAdvance = shallowRef<AutoAdvanceSettings>(autoAdvanceRepository.load() ?? AutoAdvanceSettings.disabled());

  const results = computed<readonly Position[]>(() =>
    catalog.value ? catalog.value.query({ text: query.value, filter: filter.value }) : [],
  );
  const randomCandidates = computed<readonly Position[]>(() =>
    randomExclusions.value.count === 0 ? results.value : results.value.filter((position) => randomExclusions.value.allows(position)),
  );
  const visible = computed(() => results.value.slice(0, visibleCount.value));
  const hasMore = computed(() => visibleCount.value < results.value.length);
  const facetGroups = computed(() => catalog.value?.facetGroups ?? []);
  const totalCount = computed(() => catalog.value?.size ?? 0);

  async function ensureLoaded(): Promise<void> {
    if (status.value !== "idle" || !access.isUnlocked) {
      return;
    }
    status.value = "loading";
    errorKind.value = null;
    try {
      catalog.value = PositionCatalog.create(await source.load(access.savedPassword));
      status.value = "ready";
    } catch (error) {
      errorKind.value = error instanceof InvalidAccessPasswordError ? "password" : "data";
      status.value = "error";
    }
  }

  function reset(): void {
    source.close();
    catalog.value = null;
    status.value = "idle";
    errorKind.value = null;
    query.value = "";
    filter.value = PositionFilter.empty();
    visibleCount.value = PAGE_SIZE;
  }

  function retry(): void {
    reset();
    void ensureLoaded();
  }

  function setQuery(text: string): void {
    query.value = text;
    visibleCount.value = PAGE_SIZE;
  }

  function toggleFilter(key: FacetKey, value: string): void {
    filter.value = filter.value.toggle(key, value);
    visibleCount.value = PAGE_SIZE;
  }

  function clearFilters(): void {
    filter.value = PositionFilter.empty();
    visibleCount.value = PAGE_SIZE;
  }

  function loadMore(): void {
    if (hasMore.value) {
      visibleCount.value += PAGE_SIZE;
    }
  }

  function toggleRandomExclusion(key: FacetKey, value: string): void {
    randomExclusions.value = randomExclusions.value.toggle(key, value);
    randomSettingsRepository.save(randomExclusions.value);
  }

  function clearRandomExclusions(): void {
    randomExclusions.value = RandomExclusions.none();
    randomSettingsRepository.clear();
  }

  function setAutoAdvanceEnabled(enabled: boolean): void {
    autoAdvance.value = autoAdvance.value.withEnabled(enabled);
    autoAdvanceRepository.save(autoAdvance.value);
  }

  function setAutoAdvanceSeconds(seconds: number): void {
    autoAdvance.value = autoAdvance.value.withSeconds(seconds);
    autoAdvanceRepository.save(autoAdvance.value);
  }

  /**
   * Random pick among the CURRENT results (respects search and filters) minus
   * the values excluded in the random settings, never the same item twice in a row.
   */
  function pickRandom(excludeId: string | null): Position | null {
    return PositionCatalog.pickRandom(randomCandidates.value, randomSource, excludeId);
  }

  function resolveImage(position: Position): Promise<string | null> {
    return source.resolveImageUrl(position);
  }

  watch(
    () => access.isUnlocked,
    (isUnlocked) => {
      if (!isUnlocked) {
        reset();
      }
    },
  );

  return {
    status,
    errorKind,
    query,
    filter,
    visibleCount,
    randomExclusions,
    autoAdvance,
    results,
    randomCandidates,
    visible,
    hasMore,
    facetGroups,
    totalCount,
    ensureLoaded,
    reset,
    retry,
    setQuery,
    toggleFilter,
    clearFilters,
    toggleRandomExclusion,
    clearRandomExclusions,
    setAutoAdvanceEnabled,
    setAutoAdvanceSeconds,
    loadMore,
    pickRandom,
    resolveImage,
  };
});
