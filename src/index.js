const path = require("path");
const fs = require("fs");
const util = require("util");
const purs = require("../output/Main");
const { exec } = require("child_process");

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

const moduleDependencies = async (name, sources) =>
  new Promise((resolve, reject) => {
    const withSources = (sources) => {
      const command = `purs graph ${sources
        .split("\n")
        .map((source) => source.trim())
        .filter((source) => source.length)
        .map((source) => `'${source}'`)
        .join(" ")}`;

      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(String(error));
          return resolve([]);
        } else if (stderr) {
          console.error(stderr);
          return resolve([]);
        }
        try {
          const graph = JSON.parse(stdout);

          const visited = {}

          const go = function* (name) {
            if (!graph[name])
              return reject(`No module ${name} in dependency graph`);

            yield name;

            const hasBeenVisited = name in visited;
            visited[name] = true;
            const dependencies = graph[name].depends;

            if (!hasBeenVisited) {
              for (const dependency of dependencies) {
                yield* go(dependency);
              }
            }
          };

          resolve([...new Set(go(name))]);
        } catch (e) {
          return reject(e);
        }
      });
    };

    if (sources === null)
      exec("spago sources", (error, stdout, stderr) => {
        if (error) reject(error);
        else if (stderr) reject(stderr);
        else withSources(stdout);
      });
    else withSources(sources);
  });

module.exports = ({
  output = `${process.cwd()}/output`,
  sources = null,
} = {}) => ({
  name: "purescript",
  setup(build) {
    build.onResolve({ filter: fileFilter }, (args) => ({
      path: path.join(args.resolveDir, args.path),
      namespace,
      watchDirs: [output],
    }));

    build.onLoad({ filter: /.*/, namespace }, async (args) => {
      try {
        const moduleName = await getModuleName(args.path);
        const dependencies = await moduleDependencies(moduleName, sources);

        const compiledPath = path.resolve(output, moduleName, "index.js");

        return {
          contents: await readFile(compiledPath),
          resolveDir: path.resolve(output, moduleName),
          watchDirs: [output],
          watchFiles: dependencies.flatMap((dependency) => [
            path.resolve(output, dependency, "index.js"),
            path.resolve(output, dependency, "foreign.js"),
          ]),
        };
      } catch (e) {
        return { errors: [toBuildError(e)] };
      }
    });
  },
});
