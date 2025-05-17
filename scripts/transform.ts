import { load } from "js-toml";

import * as fs from "fs/promises";
import typia from "typia";
import path from "path";
import { Meta } from "../types/meta.schema.js";

const srcDir = "./src";
const outDir = "./.temp";

async function resetOutputDir(dir: string) {
  if (await fs.exists(dir)) {
    await fs.rm(dir, { recursive: true, force: true });
  }
  await fs.mkdir(dir, { recursive: true });
}

async function traverseDir(dir: string) {
  const files = await fs.readdir(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);

    if (stat.isDirectory()) {
      const subOutDir = path.join(outDir, path.basename(filePath));
      await fs.mkdir(subOutDir, { recursive: true });
      await traverseDir(filePath);
    } else if (path.extname(file) === ".toml" && file.endsWith(".data.toml")) {
      const baseName = path.basename(file, ".data.toml");
      const jsonFilePath = path.join(outDir, `${baseName}.data.json`);
      const jsFilePath = path.join(outDir, `${baseName}.js`);

      let toml = load(await fs.readFile(filePath, "utf8")) as any;

      const meta = typia.assert<Meta>(toml?.meta);

      if (meta?.type === "list") toml = toml.item;
      else if (meta?.type === "raw") delete toml.meta;

      // validate type
      try {
        const checker = await import(
          `${import.meta.dir}/../src/${baseName}.check.js`
        ).then((x) => x.default);

        checker(toml);
      } catch (e) {
        console.error(e);
      }

      await fs.writeFile(jsonFilePath, JSON.stringify(toml));
      const jsContent = `export {default} from "./${baseName}.data.json";`;
      await fs.writeFile(jsFilePath, jsContent);

      console.log(
        `Transformed: ${filePath} -> ${jsonFilePath} and ${jsFilePath}`
      );
    }
  }
}

await resetOutputDir(outDir);
await traverseDir(srcDir);
