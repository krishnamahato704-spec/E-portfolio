import { cp, mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import responsiveImages from "../frontend/lib/responsive-images.json" with { type: "json" };
const root = path.resolve(import.meta.dirname, "..");
const publicDir = path.join(root, "public");
await mkdir(path.join(publicDir, "admin"), { recursive: true });
await cp(path.join(root, "assets"), path.join(publicDir, "assets"), {
  recursive: true,
});
// Build display variants; downloadable evidence remains byte-for-byte original.
const widths = [160, 240, 320, 480, 640, 768, 960, 1200];
for (const file of responsiveImages) {
  const source = path.join(root, "assets", file);
  const destination = path.join(
    publicDir,
    "assets",
    "responsive",
    file.replace(/\.webp$/, ""),
  );
  await mkdir(path.dirname(destination), { recursive: true });
  await Promise.all(
    widths.map((width) =>
      sharp(source)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 78, effort: 4 })
        .toFile(`${destination}-${width}.webp`),
    ),
  );
}
await mkdir(path.join(publicDir, "src"), { recursive: true });
for (const file of await readdir(path.join(root, "src"))) {
  if (/\.(js|css|json)$/.test(file))
    await cp(path.join(root, "src", file), path.join(publicDir, "src", file));
}
// Preserve the original studio document and its relative module imports verbatim.
await cp(
  path.join(root, "admin", "index.html"),
  path.join(publicDir, "admin", "studio.html"),
);
await writeFile(path.join(publicDir, ".nojekyll"), "");
console.log("Prepared local evidence, fonts, and the unchanged owner studio.");
