const path = require("path");
const fs = require("fs");
const util = require("util");
const readline = require("readline");

const readFile = (fileName) => util.promisify(fs.readFile)(fileName, "utf8");

const namespace = "purescript";
const fileFilter = /\.purs$/;

const toBuildError = (error) => ({ text: error ? error.message : error });

module.exports = ({ output = `${process.cwd()}/output` } = {}) => ({
  name: "purescript",
  setup(build) {
    build.onResolve({ filter: fileFilter }, (args) => ({
      path: path.join(args.resolveDir, args.path),
      namespace,
    }));

    build.onLoad({ filter: /.*/, namespace }, async (args) => {
      try {
        const readInterface = readline.createInterface({
          input: fs.createReadStream(args.path),
          console: false,
        });

        let moduleName = null;
        let wordCount = 0;

        for await (const line of readInterface) {
          const words = line.split(" ");

          if (wordCount + words.length > 1) {
            moduleName = words[1 - wordCount];
            break;
          }

          wordCount += words.length;
        }

        const compiledPath = path.resolve(output, moduleName, "index.js");

        return {
          contents: await readFile(compiledPath),
          resolveDir: path.resolve(output, moduleName),
        };
      } catch (e) {
        console.log(e);
        return { errors: [toBuildError()] };
      }
    });
  },
});
