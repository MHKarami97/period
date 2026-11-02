#!/usr/bin/env node
/**
 * One-shot, idempotent patch for src/presentation/router/index.ts:
 * game routes require the password only when the game is not "open".
 *
 * Usage: node scripts/apply-router-patch.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = process.env.PROJECT_ROOT ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROUTER_FILE = path.join(ROOT, "src", "presentation", "router", "index.ts");
const IMPORT_LINE = 'import { GameVisibilityPolicy } from "@domain/games/GameVisibilityPolicy";';
const META_PATTERN = /meta:\s*\{\s*requiresGameAccess:\s*true\s*\}/;
const META_REPLACEMENT = "meta: { requiresGameAccess: !GameVisibilityPolicy.isOpen(game.id) }";

async function main() {
  let source = await readFile(ROUTER_FILE, "utf8");

  if (source.includes("GameVisibilityPolicy")) {
    console.log("Router is already patched.");
    return;
  }
  if (!META_PATTERN.test(source)) {
    throw new Error("Could not find `meta: { requiresGameAccess: true }` in the router. Apply the change manually.");
  }

  source = source.replace(META_PATTERN, META_REPLACEMENT);
  const lastImport = [...source.matchAll(/^import .+;\r?$/gm)].pop();
  const insertAt = lastImport.index + lastImport[0].length;
  source = `${source.slice(0, insertAt)}\n${IMPORT_LINE}${source.slice(insertAt)}`;

  await writeFile(ROUTER_FILE, source, "utf8");
  console.log("Router patched.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
