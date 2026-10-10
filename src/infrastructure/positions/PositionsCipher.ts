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
  plaintext: Uint8Array;
}

/**
 * PositionsCipher - WebCrypto adapter for the file formats produced by
 * scripts/encrypt-positions.mjs (keep both in sync):
 *   catalog: "PTR1" | iterations (uint32 BE) | salt (16) | iv (12) | AES-GCM ciphertext+tag
 *   image  : iv (12) | AES-GCM ciphertext+tag   (same key as the catalog)
 * The key is derived once per session with PBKDF2-HMAC-SHA256 and kept as a
 * non-extractable CryptoKey. AES-GCM authenticates the data, so a wrong
 * password is detected reliably (decryption fails) instead of yielding garbage.
 */
export class PositionsCipher {
  public static async openCatalog(password: string, bytes: Uint8Array): Promise<OpenedCatalog> {
    if (bytes.length <= CATALOG_HEADER_LENGTH || new TextDecoder().decode(bytes.subarray(0, MAGIC_LENGTH)) !== MAGIC) {
      throw new PositionsDataError("Unrecognised positions file format.");
    }

    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const iterations = view.getUint32(MAGIC_LENGTH, false);
    if (iterations < 1 || iterations > MAX_ACCEPTED_ITERATIONS) {
      throw new PositionsDataError("Unsupported key-derivation settings.");
    }

    const saltStart = MAGIC_LENGTH + ITERATIONS_LENGTH;
    const salt = bytes.slice(saltStart, saltStart + SALT_LENGTH);
    const iv = bytes.slice(saltStart + SALT_LENGTH, CATALOG_HEADER_LENGTH);
    const ciphertext = bytes.slice(CATALOG_HEADER_LENGTH);

    const key = await PositionsCipher.deriveKey(password, salt, iterations);
    const plaintext = await PositionsCipher.decrypt(key, iv, ciphertext);
    return { key, plaintext };
  }

  public static async decryptFile(key: CryptoKey, bytes: Uint8Array): Promise<Uint8Array> {
    if (bytes.length <= IV_LENGTH) {
      throw new PositionsDataError("Unrecognised image file format.");
    }
    return PositionsCipher.decrypt(key, bytes.slice(0, IV_LENGTH), bytes.slice(IV_LENGTH));
  }

  private static async deriveKey(password: string, salt: Uint8Array, iterations: number): Promise<CryptoKey> {
    const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
      material,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"],
    );
  }

  private static async decrypt(key: CryptoKey, iv: Uint8Array, ciphertext: Uint8Array): Promise<Uint8Array> {
    try {
      return new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext));
    } catch {
      throw new InvalidAccessPasswordError();
    }
  }
}
