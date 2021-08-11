# PureScript esbuild plugin

[esbuild](https://esbuild.github.io/) integration for [PureScript](https://www.purescript.org/)

### What this plugin **does**:

- Allows you to import `.purs` files directly from your JavaScript

### What this plugin **does not do**:

- Run `spago build` or similar commands for you. This plugin will only point esbuild to your existing `output` directory
- Tree shake using [zephyr](https://github.com/coot/zephyr) for you. If you want to use zephyr, check out [this example](./zephyr-example)

## Usage

First, install the library from npm:

```shell
npm install esbuild-plugin-purescript
```

Example [`build.js`](./example/build.js):

```js
const esbuild = require("esbuild");
const PureScriptPlugin = require("esbuild-plugin-purescript");
const path = require("path");

esbuild
  .build({
    entryPoints: ["src/index.js"],
    bundle: true,
    outdir: "dist",
    plugins: [
      PureScriptPlugin({
        output: path.resolve(
          __dirname,
          "myOutput"
        ) /* set to 'output' by default */,
        sources: [
          "some/**/glob/*.purs",
        ] /* set to `spago sources` by default */,
      }),
    ],
  })
  .catch((_e) => process.exit(1));
```

Example [`src/index.js`](./example/src/index.js):

```js
import { main } from "./Main.purs";

console.log("Loaded PureScript code 🚀");

main();
```
