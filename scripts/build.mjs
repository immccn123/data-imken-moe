import esbuild from "esbuild";

await import("./transform.mjs");
await esbuild.build({
  outdir: "public",
  entryPoints: [".temp/**/*.js"],
  bundle: true,
  minify: true,
  platform: "browser",
  format: "esm",
  charset: "utf8",
});
import fs from "fs";
import path from "path";

const srcDir = "./.temp";
const outDir = "./public";

async function copyJsonFiles(srcDir, outDir) {
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