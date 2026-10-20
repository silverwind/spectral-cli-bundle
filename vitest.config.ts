import {defineConfig} from "vitest/config";
import {backend} from "vitest-config-silverwind";

const config = backend({
  url: import.meta.url,
});
config.test!.setupFiles = []; // shared config injects jest-extended, unused here

export default defineConfig(config);
