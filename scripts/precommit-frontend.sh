#!/usr/bin/env bash
set -euo pipefail
if ! git diff --cached --name-only | grep -Eq '^frontend/.*\.(ts|tsx|js|mjs|json|css)$'; then exit 0; fi
(cd frontend && bun run lint && bun run typecheck)
