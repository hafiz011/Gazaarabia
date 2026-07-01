// Copies the self-hosted TinyMCE distribution into /public so the editor
// loads from our own domain instead of the Tiny Cloud CDN (which requires a
// registered API key per domain and breaks in production).
import { cp, rm, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const src = path.join(root, "node_modules", "tinymce");
const dest = path.join(root, "public", "tinymce");

if (!existsSync(src)) {
  console.warn("[copy-tinymce] node_modules/tinymce not found, skipping.");
  process.exit(0);
}

await rm(dest, { recursive: true, force: true });
await mkdir(path.dirname(dest), { recursive: true });
await cp(src, dest, { recursive: true });
console.log(`[copy-tinymce] Copied TinyMCE -> ${path.relative(root, dest)}`);
