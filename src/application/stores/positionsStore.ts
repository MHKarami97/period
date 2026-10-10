import { defineStore } from "pinia";
import { computed, ref, shallowRef, watch } from "vue";
import type { FacetKey } from "@domain/positions/facets";
import { InvalidAccessPasswordError } from "@domain/positions/errors";
import type { Position } from "@domain/positions/Position";
import { PositionCatalog } from "@domain/positions/PositionCatalog";
import { PositionFilter } from "@domain/positions/PositionFilter";
import { EncryptedPositionsSource } from "@infrastructure/positions/EncryptedPositionsSource";
import { useAccessStore } from "./accessStore";

export const PAGE_SIZE = 20;

export type LoadStatus = "idle" | "loading" | "ready" | "error";
export type LoadErrorKind = "password" | "data";

const source = new EncryptedPositionsSource();

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

  const results = computed<readonly Position[]>(() =>
    catalog.value ? catalog.value.query({ text: query.value, filter: filter.value }) : [],
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
    results,
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
    loadMore,
    resolveImage,
  };
});
