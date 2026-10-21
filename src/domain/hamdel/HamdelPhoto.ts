export const MAX_PHOTOS_PER_ENTRY = 6;

export interface HamdelPhoto {
  readonly id: string;
  readonly entryId: string;
  readonly mime: string;
  readonly bytes: ArrayBuffer;
}

/** Port: photo storage for diary entries. Bytes are handed over already resized. */
export interface IHamdelPhotoRepository {
  listByEntry(entryId: string): Promise<HamdelPhoto[]>;
  countByEntry(entryId: string): Promise<number>;
  add(photo: HamdelPhoto, profileId: string): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByEntry(entryId: string): Promise<void>;
}
