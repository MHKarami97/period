#!/usr/bin/env node
/**
 * Encrypts the private positions catalog (JSON + images) into public/positions-data/.
 *
 *   private/positions/positions.json              <- plaintext source (git-ignored)
 *   private/positions/<item.image>                <- e.g. private/positions/assets/images/4.png
 *   public/positions-data/positions.enc           <- generated, safe to commit
 *   public/positions-data/images/<id>.enc         <- generated, safe to commit
 *
 * Usage:  node scripts/encrypt-positions.mjs
 * The password is read from src/domain/games/GameAccessPolicy.ts (single source of truth);
 * set POSITIONS_PASSWORD to override it.
 *
 * File formats (must stay in sync with src/infrastructure/positions/PositionsCipher.ts):
 *   positions.enc : "PTR1" | iterations (uint32 BE) | salt (16) | iv (12) | AES-256-GCM ciphertext + tag
 *   images/*.enc  : iv (12) | AES-256-GCM ciphertext + tag      (same key as positions.enc)
 */
import { createCipheriv, createHash, pbkdf2Sync, randomBytes } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = process.env.PROJECT_ROOT ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_DIR = path.join(ROOT, "private", "positions");
const OUTPUT_DIR = path.join(ROOT, "public", "positions-data");
const POLICY_FILE = path.join(ROOT, "src", "domain", "games", "GameAccessPolicy.ts");

const MAGIC = Buffer.from("PTR1");
const ITERATIONS = 600_000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const KEY_LENGTH = 32;
const IMAGE_MIME_TYPES = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

async function readPassword() {
  if (process.env.POSITIONS_PASSWORD) {
    return process.env.POSITIONS_PASSWORD;
  }
  const source = await readFile(POLICY_FILE, "utf8");
  const match = source.match(/PASSWORD\s*=\s*"([^"]+)"/);
  if (!match) {
    throw new Error(`Could not find the PASSWORD constant in ${POLICY_FILE}`);
  }
  return match[1];
}

function encrypt(key, iv, plaintext) {
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const body = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return Buffer.concat([body, cipher.getAuthTag()]);
}

function toUint32(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32BE(value);
  return buffer;
}

async function main() {
  const password = await readPassword();
  const items = JSON.parse(await readFile(path.join(SOURCE_DIR, "positions.json"), "utf8"));
  if (!Array.isArray(items)) {
    throw new Error("positions.json must contain a JSON array.");
  }

  const salt = randomBytes(SALT_LENGTH);
  const key = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, "sha256");

  await rm(OUTPUT_DIR, { recursive: true, force: true });
  await mkdir(path.join(OUTPUT_DIR, "images"), { recursive: true });

  const encryptedImages = new Map();
  let missingImages = 0;

  const publicItems = [];
  for (const item of items) {
    const publicItem = { ...item, image: "", imageType: "" };

    if (typeof item.image === "string" && item.image.length > 0) {
      const extension = path.extname(item.image).toLowerCase();
      const mime = IMAGE_MIME_TYPES[extension];
      const sourcePath = path.join(SOURCE_DIR, item.image);

      if (!mime) {
        console.warn(`! unsupported image type, skipped: ${item.image}`);
        missingImages += 1;
      } else {
        try {
          if (!encryptedImages.has(item.image)) {
            const id = createHash("sha256").update(item.image).digest("hex").slice(0, 24);
            const iv = randomBytes(IV_LENGTH);
            const payload = Buffer.concat([iv, encrypt(key, iv, await readFile(sourcePath))]);
            await writeFile(path.join(OUTPUT_DIR, "images", `${id}.enc`), payload);
            encryptedImages.set(item.image, `images/${id}.enc`);
          }
          publicItem.image = encryptedImages.get(item.image);
          publicItem.imageType = mime;
        } catch {
          console.warn(`! image not found, skipped: ${sourcePath}`);
          missingImages += 1;
        }
      }
    }
    publicItems.push(publicItem);
  }

  const iv = randomBytes(IV_LENGTH);
  const catalog = Buffer.concat([
    MAGIC,
    toUint32(ITERATIONS),
    salt,
    iv,
    encrypt(key, iv, Buffer.from(JSON.stringify(publicItems), "utf8")),
  ]);
  await writeFile(path.join(OUTPUT_DIR, "positions.enc"), catalog);

  console.log(`Encrypted ${publicItems.length} items and ${encryptedImages.size} images into ${OUTPUT_DIR}`);
  if (missingImages > 0) {
    console.log(`Warning: ${missingImages} item(s) have no usable image.`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
