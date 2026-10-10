import { nextTick, onScopeDispose, ref, watch, type WatchSource } from "vue";

const ROOT_MARGIN = "600px 0px";

/**
 * useInfiniteScroll - calls `onReachEnd` whenever the sentinel element comes
 * (close to) the viewport. IntersectionObserver only reports CHANGES, so after
 * every batch `rearmSignal` re-observes the sentinel; this keeps loading
 * while the list is still too short to fill the screen.
 */
export function useInfiniteScroll(onReachEnd: () => void, rearmSignal: WatchSource<unknown>) {
  const sentinel = ref<HTMLElement | null>(null);
  let observer: IntersectionObserver | null = null;

  watch(
    sentinel,
    (element) => {
      observer?.disconnect();
      observer = null;
      if (!element) return;
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) onReachEnd();
        },
        { rootMargin: ROOT_MARGIN },
      );
      observer.observe(element);
    },
    { flush: "post" },
  );

  watch(rearmSignal, async () => {
    await nextTick();
    const element = sentinel.value;
    if (observer && element) {
      observer.unobserve(element);
      observer.observe(element);
    }
  });

  onScopeDispose(() => observer?.disconnect());

  return { sentinel };
}
