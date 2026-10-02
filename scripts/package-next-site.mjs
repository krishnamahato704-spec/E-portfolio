import { cp, rm, mkdir, writeFile, readdir } from "node:fs/promises";
import path from "node:path";
const root = path.resolve(import.meta.dirname, "..");
const dist = path.resolve(root, "dist");
if (dist !== path.join(root, "dist"))
  throw new Error("Unexpected output directory");
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(path.join(root, "out"), dist, { recursive: true });
// Next's Windows exporter leaves native separators inside segment filenames.
// The browser protocol requests dot-separated names on every platform.
async function normalizeSegments(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const target = path.join(directory, entry.name);
    if (entry.name.startsWith("__next.")) {
      async function flattenSegments(folder, prefix) {
        for (const segment of await readdir(folder, { withFileTypes: true })) {
          const source = path.join(folder, segment.name);
          const filename = `${prefix}.${segment.name}`;
          if (segment.isDirectory()) await flattenSegments(source, filename);
          else if (segment.name.endsWith(".txt"))
            await cp(source, path.join(directory, filename));
        }
      }
      await flattenSegments(target, entry.name);
    } else if (!["assets", "src", "_next"].includes(entry.name)) {
      await normalizeSegments(target);
    }
  }
}
await normalizeSegments(dist);
await writeFile(path.join(dist, ".nojekyll"), "");
console.log("Packaged the Next.js static export for GitHub Pages.");
