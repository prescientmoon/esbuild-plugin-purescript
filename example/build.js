const esbuild = require("esbuild");
const PureScriptPlugin = require("../index"); // require('esbuild-plugin-purescript')

const development = process.env.NODE_ENV === "development";

esbuild
  .build({
    entryPoints: ["src/index.js"],
    bundle: true,
    outdir: "dist",
    watch: development,
    plugins: [PureScriptPlugin()],
  })
  .catch((_e) => {
    console.log(_e);
    if (!development) process.exit(1);
  });
