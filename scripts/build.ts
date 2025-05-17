await import("./transform.js");

await Bun.build({
  outdir: "public",
  entrypoints: [...new Bun.Glob(".temp/**/*.js").scanSync({ dot: true })],
  minify: true,
  target: "browser",
  format: "esm",
});

import fs from "fs";
import path from "path";

const srcDir = "./.temp";
const outDir = "./public";

async function copyJsonFiles(srcDir: string, outDir: string) {
  const files = await fs.promises.readdir(srcDir);

  for (const file of files) {
    const srcFilePath = path.join(srcDir, file);
    const stat = await fs.promises.stat(srcFilePath);
    if (stat.isDirectory()) {
      const subOutDir = path.join(outDir, path.basename(srcFilePath));
      await fs.promises.mkdir(subOutDir, { recursive: true });
      await copyJsonFiles(srcFilePath, subOutDir);
    } else if (path.extname(file) === ".json") {
      const destFilePath = path.join(outDir, file);

      await fs.promises.copyFile(srcFilePath, destFilePath);
      console.log(`Copied: ${srcFilePath} -> ${destFilePath}`);
    }
  }
}

await copyJsonFiles(srcDir, outDir);
