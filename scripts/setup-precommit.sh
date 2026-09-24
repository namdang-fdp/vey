#!/usr/bin/env bash
set -euo pipefail
if ! command -v pre-commit >/dev/null; then
  echo 'Install pre-commit first (for example: pipx install pre-commit).' >&2
  exit 1
fi
pre-commit install
pre-commit install --hook-type commit-msg
