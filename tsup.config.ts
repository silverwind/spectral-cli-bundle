import {defineConfig} from 'tsup'

export default defineConfig({
  entry: ["./node_modules/@stoplight/spectral-cli/dist/index.js"],
  minify: true,
  sourcemap: false,
  shims: true,
  clean: true,
});
