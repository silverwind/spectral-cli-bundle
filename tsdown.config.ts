import {nodeCli} from "tsdown-config-silverwind";
import {defineConfig} from "tsdown";

export default defineConfig(nodeCli({
  url: import.meta.url,
  entry: ["./node_modules/@stoplight/spectral-cli/dist/index.js"],
  shims: true,
  deps: {neverBundle: ["fsevents"]},
  inputOptions: {
    resolve: {
      mainFields: ["module", "main"], // prefer ESM, rolldown fails to bundle jsonc-parser's UMD build
    },
  },
  env: {
    NODE_ENV: "production", // rolldown drops the exports of immer's CJS development build
  },
}));
