#!/usr/bin/env bash
set -euo pipefail
if ! git diff --cached --name-only | grep -Eq '^api/(pom.xml|.*\.java|checkstyle/.*)$'; then exit 0; fi
(cd api && ./mvnw -q spotless:check checkstyle:check)
