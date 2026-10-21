import { asBuffer, fromBase64, toBase64, utf8 } from "../security/encoding";
import { BackupPasswordRequiredError, InvalidBackupFormatError, InvalidSecretError } from "../security/errors";
import { DEFAULT_PBKDF2_ITERATIONS, deriveKeyFromSecret, randomBytes } from "../security/VaultCrypto";

const FORMAT = "mahak-encrypted-backup";
const SALT_BYTES = 16;
const IV_BYTES = 12;

interface EncryptedBackupEnvelope {
  readonly format: typeof FORMAT;
  readonly version: 1;
  readonly kdf: { readonly name: "PBKDF2"; readonly hash: "SHA-256"; readonly iterations: number; readonly salt: string };
  readonly cipher: { readonly name: "AES-GCM"; readonly iv: string; readonly data: string };
}

function parseEnvelope(text: string): EncryptedBackupEnvelope | null {
  try {
    const parsed = JSON.parse(text) as Partial<EncryptedBackupEnvelope> | null;
    if (parsed?.format !== FORMAT || parsed.version !== 1 || !parsed.kdf || !parsed.cipher) return null;
    return parsed as EncryptedBackupEnvelope;
  } catch {
    return null;
  }
}

export function isEncryptedBackup(text: string): boolean {
  return parseEnvelope(text) !== null;
}

/** Password-protected backup: PBKDF2-HMAC-SHA256 -> AES-256-GCM. The password is independent of the app PIN. */
export async function encryptBackup(plainJson: string, password: string, iterations = DEFAULT_PBKDF2_ITERATIONS): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const iv = randomBytes(IV_BYTES);
  const key = await deriveKeyFromSecret(password, salt, iterations);
  const data = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: asBuffer(iv) }, key, asBuffer(utf8(plainJson))));
  const envelope: EncryptedBackupEnvelope = {
    format: FORMAT,
    version: 1,
    kdf: { name: "PBKDF2", hash: "SHA-256", iterations, salt: toBase64(salt) },
    cipher: { name: "AES-GCM", iv: toBase64(iv), data: toBase64(data) },
  };
  return JSON.stringify(envelope);
}

/** @throws BackupPasswordRequiredError when no password is given, InvalidSecretError when it is wrong. */
export async function decryptBackup(encryptedText: string, password: string | undefined): Promise<string> {
  const envelope = parseEnvelope(encryptedText);
  if (!envelope) throw new InvalidBackupFormatError();
  if (!password) throw new BackupPasswordRequiredError();
  const key = await deriveKeyFromSecret(password, fromBase64(envelope.kdf.salt), envelope.kdf.iterations);
  try {
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: asBuffer(fromBase64(envelope.cipher.iv)) },
      key,
      asBuffer(fromBase64(envelope.cipher.data)),
    );
    return new TextDecoder().decode(plain);
  } catch {
    throw new InvalidSecretError("رمز بکاپ اشتباه است یا فایل آسیب دیده است.");
  }
}
