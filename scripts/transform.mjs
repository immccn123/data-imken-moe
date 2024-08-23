import { load } from "js-toml";

import fs from "fs";
import path from "path";

const srcDir = "./src";
const outDir = "./.temp";

async function resetOutputDir(dir) {
  if (fs.existsSync(dir)) {
    await fs.promises.rm(dir, { recursive: true, force: true });
  }
  await fs.promises.mkdir(dir, { recursive: true });
}

// 遍历目录函数
async function traverseDir(dir) {
  const files = await fs.promises.readdir(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.promises.stat(filePath);

    if (stat.isDirectory()) {
      const subOutDir = path.join(outDir, path.basename(filePath));
      await fs.promises.mkdir(subOutDir, { recursive: true });
      await traverseDir(filePath, subOutDir);
    } else if (path.extname(file) === ".toml" && file.endsWith(".data.toml")) {
      const baseName = path.basename(file, ".data.toml");
      const jsonFilePath = path.join(outDir, `${baseName}.data.json`);
      const jsFilePath = path.join(outDir, `${baseName}.js`);

      let toml = load(await fs.promises.readFile(filePath, "utf8"));
      if (toml?.type === "list") toml = toml[toml["item-name"] ?? "item"];
      else if (toml?.type === "object") toml = toml.object;
      else if (toml?.type === "raw-no-type") delete toml.type;

      await fs.promises.writeFile(jsonFilePath, JSON.stringify(toml));
      const jsContent = `export {default} from "./${baseName}.data.json";`;
      await fs.promises.writeFile(jsFilePath, jsContent);

      console.log(
        `Transformed: ${filePath} -> ${jsonFilePath} and ${jsFilePath}`
      );
    }
  }
}

await resetOutputDir(outDir);
await traverseDir(srcDir);
