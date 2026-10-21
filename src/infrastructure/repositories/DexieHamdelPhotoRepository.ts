import type { HamdelPhoto, IHamdelPhotoRepository } from "@domain/hamdel/HamdelPhoto";
import { appDatabase } from "../database/AppDatabase";
import { hamdelBytesCodec } from "../hamdel/HamdelBytesCodec";

export class DexieHamdelPhotoRepository implements IHamdelPhotoRepository {
  public async listByEntry(entryId: string): Promise<HamdelPhoto[]> {
    const records = await appDatabase.hamdelPhotos.where("entryId").equals(entryId).sortBy("createdAtIso");
    const photos = await Promise.all(
      records.map(async (record) => {
        try {
          return { id: record.id, entryId: record.entryId, mime: record.mime, bytes: await hamdelBytesCodec.decode(record.bytes) };
        } catch {
          return null;
        }
      }),
    );
    return photos.filter((photo): photo is HamdelPhoto => photo !== null);
  }

  public countByEntry(entryId: string): Promise<number> {
    return appDatabase.hamdelPhotos.where("entryId").equals(entryId).count();
  }

  public async add(photo: HamdelPhoto, profileId: string): Promise<void> {
    await appDatabase.hamdelPhotos.put({
      id: photo.id,
      entryId: photo.entryId,
      profileId,
      mime: photo.mime,
      bytes: await hamdelBytesCodec.encode(photo.bytes),
      createdAtIso: new Date().toISOString(),
    });
  }

  public async delete(id: string): Promise<void> {
    await appDatabase.hamdelPhotos.delete(id);
  }

  public async deleteByEntry(entryId: string): Promise<void> {
    await appDatabase.hamdelPhotos.where("entryId").equals(entryId).delete();
  }
}
