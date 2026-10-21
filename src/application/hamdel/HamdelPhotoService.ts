import { MAX_PHOTOS_PER_ENTRY, type HamdelPhoto } from "@domain/hamdel/HamdelPhoto";
import { useProfileStore } from "@application/stores/profileStore";
import { DEFAULT_PROFILE_ID } from "@infrastructure/database/AppDatabase";
import { resizeImage } from "@infrastructure/hamdel/imageResizer";
import { DexieHamdelPhotoRepository } from "@infrastructure/repositories/DexieHamdelPhotoRepository";

const repository = new DexieHamdelPhotoRepository();

/** Application Service: validates, shrinks and stores the photos of a diary entry. */
export const HamdelPhotoService = {
  list(entryId: string): Promise<HamdelPhoto[]> {
    return repository.listByEntry(entryId);
  },

  /** @returns how many files were stored; files beyond the per-entry limit are ignored. */
  async addFiles(entryId: string, files: readonly File[]): Promise<number> {
    const profileId = useProfileStore().activeProfileId ?? DEFAULT_PROFILE_ID;
    const room = MAX_PHOTOS_PER_ENTRY - (await repository.countByEntry(entryId));
    let stored = 0;
    for (const file of files.filter((candidate) => candidate.type.startsWith("image/")).slice(0, Math.max(0, room))) {
      const { bytes, mime } = await resizeImage(file);
      await repository.add({ id: crypto.randomUUID(), entryId, mime, bytes }, profileId);
      stored += 1;
    }
    return stored;
  },

  remove(photoId: string): Promise<void> {
    return repository.delete(photoId);
  },
};
