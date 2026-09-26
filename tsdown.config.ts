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
      return code.replace(".version()", `.version(${JSON.stringify(spectralCli.version)})`);
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
