import { defineStore } from "pinia";
import { computed, ref, shallowRef } from "vue";
import { toggleChallengeDay } from "@domain/hamdel/challenge";
import { HamdelEntry, type HamdelValues } from "@domain/hamdel/HamdelEntry";
import { buildPresetValues } from "@domain/hamdel/hamdelDefaults";
import { getHamdelSection } from "@domain/hamdel/hamdelSections";
import { DateOnly } from "@domain/valueObjects/DateOnly";
import { DEFAULT_PROFILE_ID } from "@infrastructure/database/AppDatabase";
import { DexieHamdelPhotoRepository } from "@infrastructure/repositories/DexieHamdelPhotoRepository";
import { DexieHamdelRepository } from "@infrastructure/repositories/DexieHamdelRepository";
import { useProfileStore } from "./profileStore";

const repository = new DexieHamdelRepository();
const photoRepository = new DexieHamdelPhotoRepository();

function compareNewestFirst(left: HamdelEntry, right: HamdelEntry): number {
  const leftKey = left.dateIso ?? left.createdAtIso;
  const rightKey = right.dateIso ?? right.createdAtIso;
  if (leftKey !== rightKey) {
    return leftKey < rightKey ? 1 : -1;
  }
  return left.createdAtIso < right.createdAtIso ? 1 : -1;
}

/**
 * hamdelStore - Application Service for the "Hamdel" notebook. Holds every entry
 * of the ACTIVE profile in memory (they are small text records), and exposes
 * them grouped per section. Entries are immutable domain objects, hence shallowRef.
 */
export const useHamdelStore = defineStore("hamdel", () => {
  const entries = shallowRef<readonly HamdelEntry[]>([]);
  const loadedProfileId = ref<string | null>(null);
  const isLoading = ref(false);

  const entriesBySection = computed(() => {
    const grouped = new Map<string, HamdelEntry[]>();
    for (const entry of entries.value) {
      grouped.set(entry.section, [...(grouped.get(entry.section) ?? []), entry]);
    }
    for (const list of grouped.values()) {
      list.sort(compareNewestFirst);
    }
    return grouped;
  });

  function activeProfileId(): string {
    return useProfileStore().activeProfileId ?? DEFAULT_PROFILE_ID;
  }

  function entriesOf(section: string): readonly HamdelEntry[] {
    return entriesBySection.value.get(section) ?? [];
  }

  function countOf(section: string): number {
    return entriesOf(section).length;
  }

  async function load(): Promise<void> {
    const profileId = activeProfileId();
    isLoading.value = true;
    try {
      entries.value = await repository.listByProfile(profileId);
      loadedProfileId.value = profileId;
    } finally {
      isLoading.value = false;
    }
  }

  /** Drops decrypted data from memory (called when the app locks). */
  function clear(): void {
    entries.value = [];
    loadedProfileId.value = null;
  }

  /** Loads only when the active profile changed since the last load. */
  async function ensureLoaded(): Promise<void> {
    if (loadedProfileId.value !== activeProfileId()) {
      await load();
    }
  }

  async function add(section: string, values: HamdelValues): Promise<HamdelEntry> {
    getHamdelSection(section);
    const entry = HamdelEntry.create({
      id: crypto.randomUUID(),
      profileId: activeProfileId(),
      section,
      values,
      nowIso: new Date().toISOString(),
    });
    await repository.save(entry);
    entries.value = [...entries.value, entry];
    return entry;
  }

  /** Adds a ready-made entry (e.g. a message idea) with the section defaults filled in. */
  async function addPreset(section: string, preset: Readonly<Record<string, string>>): Promise<HamdelEntry> {
    const definition = getHamdelSection(section);
    return add(section, buildPresetValues(definition, preset, DateOnly.today().toIsoString()));
  }

  async function update(id: string, values: HamdelValues): Promise<void> {
    const current = entries.value.find((entry) => entry.id === id);
    if (!current) {
      return;
    }
    const next = current.withValues(values, new Date().toISOString());
    await repository.save(next);
    entries.value = entries.value.map((entry) => (entry.id === id ? next : entry));
  }

  async function remove(id: string): Promise<void> {
    await repository.delete(id);
    await photoRepository.deleteByEntry(id);
    entries.value = entries.value.filter((entry) => entry.id !== id);
  }

  /** One-tap status change defined by the section's `toggle` rule. */
  async function toggleStatus(id: string): Promise<void> {
    const current = entries.value.find((entry) => entry.id === id);
    const toggle = current ? getHamdelSection(current.section).toggle : undefined;
    if (!current || !toggle) {
      return;
    }
    const isDone = current.valueOf(toggle.field) === toggle.doneValue;
    await update(id, { ...current.values, [toggle.field]: isDone ? toggle.openValue : toggle.doneValue });
  }

  /** Moves a status along the section's `flow` (last step wraps back to the first). */
  async function advanceStatus(id: string): Promise<void> {
    const current = entries.value.find((entry) => entry.id === id);
    const flow = current ? getHamdelSection(current.section).flow : undefined;
    if (!current || !flow) {
      return;
    }
    const index = flow.steps.indexOf(current.valueOf(flow.field));
    const next = flow.steps[(index + 1) % flow.steps.length];
    await update(id, { ...current.values, [flow.field]: next });
  }

  async function toggleChallengeCheck(id: string, dayIso: string): Promise<void> {
    const current = entries.value.find((entry) => entry.id === id);
    if (!current || current.section !== "challenges") {
      return;
    }
    await update(id, { ...current.values, done: toggleChallengeDay(current, dayIso, DateOnly.today()) });
  }

  return {
    entries,
    isLoading,
    entriesBySection,
    entriesOf,
    countOf,
    load,
    clear,
    ensureLoaded,
    add,
    addPreset,
    update,
    remove,
    toggleStatus,
    advanceStatus,
    toggleChallengeCheck,
  };
});