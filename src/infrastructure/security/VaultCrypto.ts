import { asBuffer, concatBytes, fromBase64, toBase64, utf8 } from "./encoding";

/** OWASP (2023) recommends 600,000 iterations for PBKDF2-HMAC-SHA256. */
export const DEFAULT_PBKDF2_ITERATIONS = 600_000;
export const TEXT_PREFIX = "enc1:";
const BYTES_MAGIC = utf8("HEN1");
const IV_LENGTH = 12;
const KEY_BYTES = 32;

export interface WrappedKey {
  readonly iv: string;
  readonly data: string;
}

export function randomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

export function generateDataKeyBytes(): Uint8Array {
  return randomBytes(KEY_BYTES);
}

/** Stretches a PIN / passphrase into an AES-GCM key-encryption key with PBKDF2-HMAC-SHA256. */
export async function deriveKeyFromSecret(secret: string, salt: Uint8Array, iterations: number): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey("raw", asBuffer(utf8(secret.normalize("NFKC"))), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt: asBuffer(salt), iterations },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/** Turns the 32-byte WebAuthn PRF output into an AES-GCM key-encryption key with HKDF-SHA256. */
export async function deriveKeyFromPrf(prfOutput: ArrayBuffer): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey("raw", asBuffer(prfOutput), "HKDF", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "HKDF", hash: "SHA-256", salt: asBuffer(new Uint8Array(0)), info: asBuffer(utf8("mahak-hamdel-passkey-kek-v1")) },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/** Generates a non-extractable AES-GCM key for device-bound biometric protection. */
export function generateBiometricDeviceKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/** The data key is non-extractable: JavaScript can use it but never read its bytes back. */
export function importDataKey(keyBytes: Uint8Array): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", asBuffer(keyBytes), { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

export async function wrapBytes(kek: CryptoKey, bytes: Uint8Array): Promise<WrappedKey> {
  const iv = randomBytes(IV_LENGTH);
  const data = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: asBuffer(iv) }, kek, asBuffer(bytes)));
  return { iv: toBase64(iv), data: toBase64(data) };
}

/** @throws DOMException (OperationError) when the key is wrong or the data was modified (GCM authentication). */
export async function unwrapBytes(kek: CryptoKey, wrapped: WrappedKey): Promise<Uint8Array> {
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: asBuffer(fromBase64(wrapped.iv)) }, kek, asBuffer(fromBase64(wrapped.data)));
  return new Uint8Array(plain);
}

export function isEncryptedText(value: string): boolean {
  return value.startsWith(TEXT_PREFIX);
}

/** Output: "enc1:" + base64(iv || ciphertext+tag). A fresh random IV is used for every call. */
export async function encryptText(key: CryptoKey, plainText: string): Promise<string> {
  const iv = randomBytes(IV_LENGTH);
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: asBuffer(iv) }, key, asBuffer(utf8(plainText))));
  return TEXT_PREFIX + toBase64(concatBytes(iv, cipher));
}

export async function decryptText(key: CryptoKey, payload: string): Promise<string> {
  const bytes = fromBase64(payload.slice(TEXT_PREFIX.length));
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: asBuffer(bytes.subarray(0, IV_LENGTH)) },
    key,
    asBuffer(bytes.subarray(IV_LENGTH)),
  );
  return new TextDecoder().decode(plain);
}

export function isEncryptedBytes(buffer: ArrayBuffer): boolean {
  const view = new Uint8Array(buffer);
  return view.length > BYTES_MAGIC.length + IV_LENGTH && BYTES_MAGIC.every((byte, index) => view[index] === byte);
}

/** Output: "HEN1" || iv || ciphertext+tag. Plain images never start with these bytes (JPEG: FF D8). */
export async function encryptBytes(key: CryptoKey, buffer: ArrayBuffer): Promise<ArrayBuffer> {
  const iv = randomBytes(IV_LENGTH);
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: asBuffer(iv) }, key, asBuffer(buffer)));
  return concatBytes(BYTES_MAGIC, iv, cipher).buffer as ArrayBuffer;
}

export async function decryptBytes(key: CryptoKey, buffer: ArrayBuffer): Promise<ArrayBuffer> {
  const view = new Uint8Array(buffer);
  const iv = view.subarray(BYTES_MAGIC.length, BYTES_MAGIC.length + IV_LENGTH);
  return crypto.subtle.decrypt({ name: "AES-GCM", iv: asBuffer(iv) }, key, asBuffer(view.subarray(BYTES_MAGIC.length + IV_LENGTH)));
}
