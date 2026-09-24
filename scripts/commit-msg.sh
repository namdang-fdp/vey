#!/usr/bin/env bash
set -euo pipefail
message=$(head -n 1 "$1")
if [[ "$message" =~ ^(Merge|Revert)\  ]]; then exit 0; fi
if [[ ! "$message" =~ ^(feat|fix|chore|docs|refactor|test|build|ci)(\([a-z0-9-]+\))?:\ .+ ]]; then
  echo 'Expected conventional commit: type(scope): subject' >&2
  exit 1
fi
