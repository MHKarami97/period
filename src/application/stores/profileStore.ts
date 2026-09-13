import { defineStore } from "pinia";
import { shallowRef, computed, ref } from "vue";
import { Profile } from "@domain/entities/Profile";
import { DateOnly } from "@domain/valueObjects/DateOnly";
import { DexieProfileRepository } from "@infrastructure/repositories/DexieProfileRepository";
import { DEFAULT_PROFILE_ID } from "@infrastructure/database/AppDatabase";
import { useAppModeStore } from "./appModeStore";

const profileRepository = new DexieProfileRepository();
const ACTIVE_PROFILE_STORAGE_KEY = "period-tracker:activeProfileId";

export const useProfileStore = defineStore("profile", () => {
  const profiles = shallowRef<Profile[]>([]);
  const activeProfileId = ref<string | null>(
    localStorage.getItem(ACTIVE_PROFILE_STORAGE_KEY),
  );

  const activeProfile = computed<Profile | null>(
    () =>
      profiles.value.find((profile) => profile.id === activeProfileId.value) ??
      null,
  );

  function persistActiveProfileId(id: string | null): void {
    activeProfileId.value = id;
    if (id) {
      localStorage.setItem(ACTIVE_PROFILE_STORAGE_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_PROFILE_STORAGE_KEY);
    }
  }

  async function initialize(): Promise<void> {
    const appModeStore = useAppModeStore();
    let allProfiles = await profileRepository.getAll();

    if (allProfiles.length === 0 && appModeStore.isSelfMode) {
      const defaultProfile = Profile.reconstitute({
        id: DEFAULT_PROFILE_ID,
        name: "من",
        createdAt: DateOnly.today(),
      });
      await profileRepository.save(defaultProfile);
      allProfiles = [defaultProfile];
    }

    profiles.value = allProfiles;

    if (allProfiles.length === 0) {
      persistActiveProfileId(null);
      return;
    }

    if (!allProfiles.some((profile) => profile.id === activeProfileId.value)) {
      persistActiveProfileId(allProfiles[0].id);
    }
  }

  function setActiveProfile(id: string): void {
    if (id === activeProfileId.value) {
      return;
    }
    persistActiveProfileId(id);
  }

  async function addProfile(name: string): Promise<Profile> {
    const profile = Profile.create({ id: crypto.randomUUID(), name });
    await profileRepository.save(profile);
    profiles.value = [...profiles.value, profile];
    setActiveProfile(profile.id);
    return profile;
  }

  async function renameProfile(id: string, newName: string): Promise<void> {
    const index = profiles.value.findIndex((profile) => profile.id === id);
    if (index === -1) return;
    const renamed = profiles.value[index].rename(newName);
    await profileRepository.save(renamed);
    const next = [...profiles.value];
    next.splice(index, 1, renamed);
    profiles.value = next;
  }

  async function removeProfile(id: string): Promise<void> {
    const appModeStore = useAppModeStore();
    if (appModeStore.isSelfMode) {
      return;
    }

    await profileRepository.delete(id);
    profiles.value = profiles.value.filter((profile) => profile.id !== id);

    if (activeProfileId.value === id) {
      const fallback = profiles.value[0]?.id ?? null;
      persistActiveProfileId(fallback);
    }
  }

  function reset(): void {
    profiles.value = [];
    persistActiveProfileId(null);
  }

  return {
    profiles,
    activeProfileId,
    activeProfile,
    initialize,
    setActiveProfile,
    addProfile,
    renameProfile,
    removeProfile,
    reset,
  };
});
