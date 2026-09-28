#!/usr/bin/env bash
#
# Every check, against a dev server on :5219.
#
#   npm run dev -- --port 5219 --strictPort   (in another shell)
#   ./tools/run.sh
#
# playwright-core drives a local Chromium and is NOT a dependency of the site.
# Install it on demand and point BROWSER_PATH at any Chromium you have.
set -u
cd "$(dirname "$0")/.."

[ -d node_modules/playwright-core ] || npm install --no-save playwright-core

fail=0
for f in checks forms rm a11y state; do
  out=$(node "tools/$f.mjs" 2>&1)
  p=$(printf '%s' "$out" | grep -c '^PASS')
  n=$(printf '%s' "$out" | grep -c '^FAIL')
  printf '%-10s %2s passed, %s failed\n' "$f" "$p" "$n"
  if [ "$n" -gt 0 ]; then printf '%s\n' "$out" | grep '^FAIL' | sed 's/^/           /'; fail=1; fi
done
printf '%-10s ' contrast; node tools/contrast.mjs
printf '%-10s ' console;  node tools/warn.mjs
exit $fail
