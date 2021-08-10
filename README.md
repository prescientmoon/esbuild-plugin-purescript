# Purescript esbuild plugin

[Esbuild](https://esbuild.github.io/) integration for [purescript](https://www.purescript.org/)

### What this plugin **does**:

- Allows you to import `.purs` file directly from within your javascript.

### What this plugin **doesn not do**:

- Run `spago build` or similar commands for you: this will only point esbuild to your existing `output` directory
- Tree shake using [zephyr](https://github.com/coot/zephyr) for you. If you want to use zephyr, checkout [this example](./zephyr-example)

## Usage

First, install the library from npm:

```shell
npm install esbuild-plugin-purescript
```

Example [build.js](./example/build.js):

```js
const esbuild = require("esbuild");
const PurescriptPlugin = require("esbuild-plugin-purescript");
const path = require("path");

esbuild
  .build({
    entryPoints: ["src/index.js"],
    bundle: true,
    outdir: "dist",
    plugins: [
      PurescriptPlugin({
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

console.log("Loaded purescript code 🚀");

main();
```
