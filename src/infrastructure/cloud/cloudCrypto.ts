export function bufferToHex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function hexToBuffer(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new Error("Invalid hex string length");
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

export function getRandomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

export function newSaltHex(): string {
  return bufferToHex(getRandomBytes(16));
}

export async function hashSha256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest("SHA-256", encoder.encode(data));
  return bufferToHex(buffer);
}

export async function deriveKey(
  passphrase: string,
  saltHex: string,
  iterations: number,
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase.normalize("NFKC")),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  const salt = hexToBuffer(saltHex);
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as unknown as BufferSource,
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false, // extractable: false so key cannot be extracted
    ["encrypt", "decrypt"],
  );
}

export async function encryptWithKey(
  plainText: string,
  key: CryptoKey,
): Promise<{ ciphertext: string; iv: string }> {
  const iv = getRandomBytes(12);
  const data = new TextEncoder().encode(plainText);
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as unknown as BufferSource, tagLength: 128 },
    key,
    data as unknown as BufferSource,
  );
  return { ciphertext: bufferToHex(cipher), iv: bufferToHex(iv) };
}

export async function decryptWithKey(
  ciphertextHex: string,
  ivHex: string,
  key: CryptoKey,
): Promise<string> {
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: hexToBuffer(ivHex) as unknown as BufferSource, tagLength: 128 },
    key,
    hexToBuffer(ciphertextHex) as unknown as BufferSource,
  );
  return new TextDecoder().decode(plain);
}

// Deterministic JSON (sorted keys) so equal data always yields an equal hash across devices.
export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return "[" + value.map((item) => stableStringify(item)).join(",") + "]";
  const record = value as Record<string, unknown>;
  const parts: string[] = [];
  for (const key of Object.keys(record).sort()) {
    if (record[key] === undefined) continue;
    parts.push(JSON.stringify(key) + ":" + stableStringify(record[key]));
  }
  return "{" + parts.join(",") + "}";
}
