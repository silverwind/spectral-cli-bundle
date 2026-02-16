import {nodeCli} from "tsdown-config-silverwind";
import {defineConfig} from "tsdown";

export default defineConfig(nodeCli({
  url: import.meta.url,
  entry: ["./node_modules/@stoplight/spectral-cli/dist/index.js"],
  shims: true,
  clean: true,
  format: "esm",
  target: "node20",
  external: ["fsevents"],
  // Rolldown's default mainFields for node is ["main", "module"], which causes
  // jsonc-parser's UMD build to be picked over its ESM build. The UMD build has
  // require("./impl/format") calls that rolldown fails to bundle into ESM output.
  // Workaround: prioritize "module" over "main" to prefer ESM entry points.
  inputOptions: {
    resolve: {
      mainFields: ["module", "main"],
    },
  },
  // Set NODE_ENV to "production" to work around a rolldown bug where immer's
  // CJS development build loses its exports assignments during bundling.
  env: {
    NODE_ENV: "production",
  },
}));
