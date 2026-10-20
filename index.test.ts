import {execFile} from "node:child_process";
import {join} from "node:path";
import {promisify} from "node:util";
import spectralCli from "@stoplight/spectral-cli/package.json" with {type: "json"};

const execFileAsync = promisify(execFile);
const fixture = (path: string) => join(import.meta.dirname, "fixtures", path);
const script = join(import.meta.dirname, "dist/index.js");

async function spectral(...args: Array<string>) {
  try {
    const {stdout, stderr} = await execFileAsync(process.execPath, [script, ...args]);
    return {code: 0, output: stdout + stderr};
  } catch (err) {
    const {code, stdout, stderr} = err as {code: number, stdout: string, stderr: string};
    return {code, output: stdout + stderr};
  }
}

test.each([
  ["openapi.yaml", 0],
  ["invalid.yaml", 1],
  ["asyncapi.yaml", 0],
  ["arazzo.yaml", 0],
])("lints %s with exit code %i", async (file, expected) => {
  expect((await spectral("lint", "--ruleset", fixture(".spectral.yaml"), fixture(file))).code).toBe(expected);
});

test.each([
  "json", "stylish", "junit", "html", "text", "teamcity", "pretty", "github-actions", "sarif", "code-climate", "gitlab",
  "markdown",
])("formats results as %s", async format => {
  expect((await spectral("lint", "--ruleset", fixture(".spectral.yaml"), "--format", format, fixture("invalid.yaml"))).code).toBe(1);
});

test("runs custom functions and jsonpath-plus fallback expressions", async () => {
  const {code, output} = await spectral("lint", "--ruleset", fixture("custom.yaml"), fixture("openapi.yaml"));
  expect(code).toBe(1);
  expect(output).toContain("jsonpath-fallback");
  expect(output).toContain("custom-function");
});

test("prints the error stack with --verbose", async () => {
  const {code, output} = await spectral("lint", "--verbose", "--ruleset", fixture("throw.mjs"), fixture("openapi.yaml"));
  expect(code).toBe(2);
  expect(output).toContain("thrown by test");
  expect(output).not.toContain("TypeError");
});

test("prints the @stoplight/spectral-cli version on --version", async () => {
  const {output} = await spectral("--version");
  expect(output.trim()).toBe(spectralCli.version);
});
