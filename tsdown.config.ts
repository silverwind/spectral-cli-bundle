import {nodeCli} from "tsdown-config-silverwind";
import {defineConfig} from "tsdown";
import spectralCli from "@stoplight/spectral-cli/package.json" with {type: "json"};

export default defineConfig(nodeCli({
  url: import.meta.url,
  entry: ["./node_modules/@stoplight/spectral-cli/dist/index.js"],
  shims: true,
  deps: {neverBundle: ["fsevents"]},
  plugins: [{
    name: "spectral-version", // yargs guesses the version from the cwd's package.json when bundled as ESM
    transform(code: string, id: string) {
      if (!id.endsWith("/@stoplight/spectral-cli/dist/index.js")) return;
      if (!code.includes(".version()")) throw new Error(`spectral-cli no longer contains ".version()"`);
      return code.replace(".version()", () => `.version(${JSON.stringify(spectralCli.version)})`);
    },
  }, {
    name: "nimma-fallback", // nimma puts a stringified function into a template literal, which breaks on the minifier's backtick strings
    transform(code: string, id: string) {
      if (!id.endsWith("/nimma/dist/cjs/codegen/fallback.js")) return;
      const fixed = code.replace(/builders\.templateLiteral\(\[builders\.templateElement\(\{\s*raw: (`return \$\{this\.extraCode\}`)\s*\}\)\], \[\]\)/, (_match, raw) => `builders.stringLiteral(${raw})`);
      if (fixed === code) throw new Error(`nimma no longer contains the fallback template literal`);
      return fixed;
    },
  }, {
    name: "module-require", // rolldown's CommonJS wrapper lacks module.require
    transform(code: string, id: string) {
      if (!/\/(stacktracey\/stacktracey|get-source\/get-source)\.js$/.test(id)) return;
      if (!code.includes("module.require")) throw new Error(`${id} no longer contains "module.require"`);
      return code.replace("module.require", "require");
    },
  }],
  inputOptions: {
    resolve: {
      mainFields: ["module", "main"], // prefer ESM, rolldown fails to bundle jsonc-parser's UMD build
    },
  },
  env: {
    NODE_ENV: "production", // rolldown drops the exports of immer's CJS development build
  },
}));
