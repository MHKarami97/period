import { defineStore } from "pinia";
import { shallowRef, computed, ref } from "vue";
import { Profile } from "@domain/entities/Profile";
import { DateOnly } from "@domain/valueObjects/DateOnly";
import { DexieProfileRepository } from "@infrastructure/repositories/DexieProfileRepository";
import { DEFAULT_PROFILE_ID } from "@infrastructure/database/AppDatabase";

const profileRepository = new DexieProfileRepository();
const ACTIVE_PROFILE_STORAGE_KEY = "period-tracker:activeProfileId";

/**
 * profileStore - Application Service for multi-person tracking. A single
 * device (typically a partner's phone) can hold several Profiles (wife,
 * sister, daughter, ...); every Cycle/Symptom is scoped to whichever
 * profile is currently active. Self-tracking mode simply never exposes UI
 * to switch profiles, so it transparently keeps using the one default
 * profile created on first launch.
 */
export const useProfileStore = defineStore("profile", () => {
  const profiles = shallowRef<Profile[]>([]);
  const activeProfileId = ref<string>(localStorage.getItem(ACTIVE_PROFILE_STORAGE_KEY) ?? DEFAULT_PROFILE_ID);

  const activeProfile = computed<Profile | null>(
    () => profiles.value.find((profile) => profile.id === activeProfileId.value) ?? null,
  );

  function persistActiveProfileId(id: string): void {
    activeProfileId.value = id;
    localStorage.setItem(ACTIVE_PROFILE_STORAGE_KEY, id);
  }

  async function initialize(): Promise<void> {
    let allProfiles = await profileRepository.getAll();

    if (allProfiles.length === 0) {
      const defaultProfile = Profile.reconstitute({
        id: DEFAULT_PROFILE_ID,
        name: "من",
        createdAt: DateOnly.today(),
      });
      await profileRepository.save(defaultProfile);
      allProfiles = [defaultProfile];
    }

    profiles.value = allProfiles;

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
    if (profiles.value.length <= 1) {
      return; // always keep at least one profile
    }
    await profileRepository.delete(id);
    profiles.value = profiles.value.filter((profile) => profile.id !== id);
    if (activeProfileId.value === id) {
      persistActiveProfileId(profiles.value[0].id);
    }
  }

  function reset(): void {
    profiles.value = [];
    localStorage.removeItem(ACTIVE_PROFILE_STORAGE_KEY);
    activeProfileId.value = DEFAULT_PROFILE_ID;
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
