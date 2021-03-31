const esbuild = require("esbuild");
const PurescriptPlugin = require("../index"); // require('esbuild-plugin-purescript')

esbuild
  .build({
    entryPoints: ["src/index.js"],
    bundle: true,
    outdir: "dist",
    plugins: [PurescriptPlugin()],
  })
  .catch((_e) => process.exit(1));
