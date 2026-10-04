#!/bin/bash
# Claude cloud sessions only: install the app's dependencies so tests, typecheck, lint and the owner
# scripts (npm run owner:*) work from the first prompt. Your own machine is left alone.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"
npm install --no-save --no-audit --no-fund # --no-save: never rewrites package-lock.json
