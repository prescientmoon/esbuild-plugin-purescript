const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["src/index.js"],
    bundle: true,
    outdir: ".",
    plugins: [],
    platform: "node",
    minify: true,
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
