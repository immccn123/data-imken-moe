import esbuild from "esbuild";

await esbuild.build({
  outdir: "public",
  entryPoints: ["src/**/*.js"],
  bundle: true,
  minify: true,
  platform: "browser",
  format: "esm",
  charset: "utf8",
});
