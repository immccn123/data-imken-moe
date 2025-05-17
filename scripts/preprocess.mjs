import UnpluginTypia from '@ryoppippi/unplugin-typia/bun'

await Bun.build({
    entrypoints: ["./scripts/build.ts", ...new Bun.Glob("./src/*.check.ts").scanSync()],
    plugins: [UnpluginTypia()],
    outdir: ".temp-build",
    format: "esm",
    target: "bun",
})
