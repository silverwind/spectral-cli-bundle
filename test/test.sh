#!/bin/sh
set -eu

fail() { printf 'FAIL: %s\n' "$1" >&2; exit 1; }

check() {
  out=$(node dist/index.js lint --ruleset test/.spectral.yaml "$1" 2>&1) && rc=0 || rc=$?
  case "$out" in *"Error running Spectral"*) rc=crash ;; esac
  [ "$rc" = "$2" ] || { printf '%s\n' "$out" >&2; fail "$1: expected exit $2, got $rc"; }
}

check test/openapi.yaml 0
check test/invalid.yaml 1

[ "$(node dist/index.js --version)" = "$(node -p 'require("@stoplight/spectral-cli/package.json").version')" ] || fail "--version: not the @stoplight/spectral-cli version"

echo "ok"
