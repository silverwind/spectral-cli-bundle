#!/bin/sh
# Smoke tests for the bundled Spectral CLI.
#
# Besides checking that a valid spec passes and an invalid one fails, these guard
# against the bundle *crashing* (an unexpected runtime error) instead of
# reporting findings. A crash also exits non-zero, so the exit code alone cannot
# tell a crash apart from a normal lint failure. Spectral prints the
# "Error running Spectral!" banner only on a crash, so assert on that.
set -eu

bin="${BIN:-dist/index.js}"
ruleset="test/.spectral.yaml"

fail() { printf 'FAIL: %s\n' "$1" >&2; exit 1; }

# Lint a document, capturing output in $out and exit code in $rc. Any crash
# (banner present) fails immediately regardless of the exit code.
lint() {
  out=$(node "$bin" lint --ruleset "$ruleset" "$1" 2>&1) && rc=0 || rc=$?
  case "$out" in
    *"Error running Spectral"*) printf '%s\n' "$out" >&2; fail "$1: spectral crashed" ;;
  esac
}

# A valid document lints clean.
lint test/openapi.yaml
[ "$rc" -eq 0 ] || fail "test/openapi.yaml: expected clean pass (0), got $rc"

# A document containing a null value must not crash the linter. Regression guard
# for the oas duplicated-entry-in-enum rule (see the override in pnpm-workspace.yaml).
lint test/null.yaml
[ "$rc" -eq 0 ] || fail "test/null.yaml: expected clean pass (0), got $rc"

# An invalid document is reported as findings (exit 1), not a crash.
lint test/invalid.yaml
[ "$rc" -eq 1 ] || fail "test/invalid.yaml: expected lint findings (1), got $rc"

echo "ok"
