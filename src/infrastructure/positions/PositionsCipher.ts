import { InvalidAccessPasswordError, PositionsDataError } from "@domain/positions/errors";

const MAGIC = "PTR1";
const MAGIC_LENGTH = 4;
const ITERATIONS_LENGTH = 4;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const CATALOG_HEADER_LENGTH = MAGIC_LENGTH + ITERATIONS_LENGTH + SALT_LENGTH + IV_LENGTH;
const MAX_ACCEPTED_ITERATIONS = 5_000_000;

export interface OpenedCatalog {
  key: CryptoKey;
  plaintext: ArrayBuffer;
}

/**
 * PositionsCipher - WebCrypto adapter for the file formats produced by
 * scripts/encrypt-positions.mjs (keep both in sync):
 *   catalog: "PTR1" | iterations (uint32 BE) | salt (16) | iv (12) | AES-GCM ciphertext+tag
 *   image  : iv (12) | AES-GCM ciphertext+tag   (same key as the catalog)
 * Works on ArrayBuffer/BufferSource (not Uint8Array) so it compiles with every
 * TypeScript version, including the generic Uint8Array<ArrayBufferLike> of TS >= 5.7.
 * The key is derived once per session with PBKDF2-HMAC-SHA256 and kept as a
 * non-extractable CryptoKey. AES-GCM authenticates the data, so a wrong
 * password is detected reliably (decryption fails) instead of yielding garbage.
 */
export class PositionsCipher {
  public static async openCatalog(password: string, bytes: ArrayBuffer): Promise<OpenedCatalog> {
    const magic = bytes.byteLength >= MAGIC_LENGTH ? new TextDecoder().decode(new Uint8Array(bytes, 0, MAGIC_LENGTH)) : "";
    if (bytes.byteLength <= CATALOG_HEADER_LENGTH || magic !== MAGIC) {
      throw new PositionsDataError("Unrecognised positions file format.");
    }

    const iterations = new DataView(bytes).getUint32(MAGIC_LENGTH, false);
    if (iterations < 1 || iterations > MAX_ACCEPTED_ITERATIONS) {
      throw new PositionsDataError("Unsupported key-derivation settings.");
    }

    const saltStart = MAGIC_LENGTH + ITERATIONS_LENGTH;
    const salt = new Uint8Array(bytes, saltStart, SALT_LENGTH);
    const iv = new Uint8Array(bytes, saltStart + SALT_LENGTH, IV_LENGTH);
    const ciphertext = bytes.slice(CATALOG_HEADER_LENGTH);

    const key = await PositionsCipher.deriveKey(password, salt, iterations);
    const plaintext = await PositionsCipher.decrypt(key, iv, ciphertext);
    return { key, plaintext };
  }

  public static async decryptFile(key: CryptoKey, bytes: ArrayBuffer): Promise<ArrayBuffer> {
    if (bytes.byteLength <= IV_LENGTH) {
      throw new PositionsDataError("Unrecognised image file format.");
    }
    return PositionsCipher.decrypt(key, new Uint8Array(bytes, 0, IV_LENGTH), bytes.slice(IV_LENGTH));
  }

  private static async deriveKey(password: string, salt: BufferSource, iterations: number): Promise<CryptoKey> {
    const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
      material,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"],
    );
  }

  private static async decrypt(key: CryptoKey, iv: BufferSource, ciphertext: BufferSource): Promise<ArrayBuffer> {
    try {
      return await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
    } catch {
      throw new InvalidAccessPasswordError();
    }
  }
}