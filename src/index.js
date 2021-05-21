const path = require("path");
const fs = require("fs");
const util = require("util");
const purs = require("../output/Main");

const readFile = (fileName) => util.promisify(fs.readFile)(fileName, "utf8");

const namespace = "purescript";
const fileFilter = /\.purs$/;

const toBuildError = (error) => {
  if (error.fromPurs)
    // TODO: add location data
    return {
      text: `Couldn't find module name for module ${path.relative(
        process.cwd(),
        error.file
      )}`,
      detail: purs.printParseError(error.error.error),
    };

  return { text: error ? error.message : error };
};

const getModuleName = async (pursFile) => {
  const text = await readFile(pursFile);

  const moduleName = purs.getModuleName(text);

  const result = purs.either((error) => {
    throw { fromPurs: true, error, file: pursFile };
  })((name) => name)(moduleName);

  return result;
};

module.exports = ({ output = `${process.cwd()}/output` } = {}) => ({
  name: "purescript",
  setup(build) {
    build.onResolve({ filter: fileFilter }, (args) => ({
      path: path.join(args.resolveDir, args.path),
      namespace,
    }));

    build.onLoad({ filter: /.*/, namespace }, async (args) => {
      try {
        const moduleName = await getModuleName(args.path);

        const compiledPath = path.resolve(output, moduleName, "index.js");

        return {
          contents: await readFile(compiledPath),
          resolveDir: path.resolve(output, moduleName),
        };
      } catch (e) {
        return { errors: [toBuildError(e)] };
      }
    });
  },
});
