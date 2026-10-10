import { PositionsDataError } from "@domain/positions/errors";
import type { IPositionsSource } from "@domain/positions/IPositionsSource";
import { Position } from "@domain/positions/Position";
import { PositionsCipher } from "./PositionsCipher";

const DATA_FOLDER = `${import.meta.env.BASE_URL}positions-data/`;
const CATALOG_FILE = "positions.enc";
const DEFAULT_IMAGE_TYPE = "image/png";

/**
 * EncryptedPositionsSource - loads the encrypted catalog and images that
 * live under /positions-data/ (static files; only ciphertext is ever
 * published). Decrypted image blobs are exposed as object URLs, created
 * lazily, cached per image and revoked on close().
 */
export class EncryptedPositionsSource implements IPositionsSource {
  private key: CryptoKey | null = null;
  private readonly imageUrls = new Map<string, Promise<string>>();

  public async load(password: string): Promise<readonly Position[]> {
    this.close();
    const bytes = await EncryptedPositionsSource.fetchBytes(CATALOG_FILE);
    const { key, plaintext } = await PositionsCipher.openCatalog(password, bytes);
    this.key = key;

    let raw: unknown;
    try {
      raw = JSON.parse(new TextDecoder().decode(plaintext));
    } catch {
      throw new PositionsDataError("The decrypted positions file is not valid JSON.");
    }
    if (!Array.isArray(raw)) {
      throw new PositionsDataError("The decrypted positions file must contain an array.");
    }
    return raw.map((item, index) => Position.fromRaw(item, index));
  }

  public async resolveImageUrl(position: Position): Promise<string | null> {
    if (!this.key || position.image.length === 0) {
      return null;
    }

    const cached = this.imageUrls.get(position.image);
    if (cached) {
      return cached;
    }

    const key = this.key;
    const pending = (async () => {
      const encrypted = await EncryptedPositionsSource.fetchBytes(position.image);
      const decrypted = await PositionsCipher.decryptFile(key, encrypted);
      return URL.createObjectURL(new Blob([decrypted], { type: position.imageType || DEFAULT_IMAGE_TYPE }));
    })();

    this.imageUrls.set(position.image, pending);
    pending.catch(() => this.imageUrls.delete(position.image));
    return pending;
  }

  public close(): void {
    for (const pending of this.imageUrls.values()) {
      pending.then((url) => URL.revokeObjectURL(url)).catch(() => undefined);
    }
    this.imageUrls.clear();
    this.key = null;
  }

  private static async fetchBytes(relativePath: string): Promise<ArrayBuffer> {
    let response: Response;
    try {
      response = await fetch(`${DATA_FOLDER}${relativePath}`);
    } catch {
      throw new PositionsDataError("Could not reach the positions data (offline?).");
    }
    if (!response.ok) {
      throw new PositionsDataError(`Positions file not found (${response.status}).`);
    }
    return response.arrayBuffer();
  }
}