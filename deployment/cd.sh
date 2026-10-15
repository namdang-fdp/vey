#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

version="${1:?Usage: cd.sh 0.N}"
[[ "$version" =~ ^0\.[1-9][0-9]*$ ]] || { echo "Invalid release version" >&2; exit 1; }
root="${VEY_DEPLOY_ROOT:-/root/selfhost/vey}"
exec 9>"$root/.deploy.lock"
flock -n 9 || { echo "Another deployment is running" >&2; exit 1; }

backend="$root/vey-backend/.env"
frontend="$root/vey-frontend/.env"
previous=$(sed -n 's/^VERSION=//p' "$backend")
[[ "$previous" =~ ^0\.[0-9]+$ ]] || { echo "Invalid current VERSION" >&2; exit 1; }
[[ "$previous" == "$(sed -n 's/^VERSION=//p' "$frontend")" ]] || {
  echo "Inconsistent backend/frontend versions; repair before deploying" >&2; exit 1;
}

compose() {
  local app="$1"
  shift
  docker compose --project-directory "$root/$app" --env-file "$root/$app/.env" \
    -f "$root/$app/compose.yaml" "$@"
}

# Resolve and pull the requested version before changing either env file.
export VERSION="$version"
if ! compose vey-backend pull || ! compose vey-frontend pull; then
  echo "Image pull failed; current deployment was preserved" >&2
  exit 1
fi

backup=$(mktemp -d "$root/.rollback.XXXXXX")
cp "$backend" "$backup/backend.env"
cp "$frontend" "$backup/frontend.env"
cleanup() {
  rm -f -- "$backup/backend.env" "$backup/frontend.env"
  rmdir -- "$backup"
}
trap cleanup EXIT

rollback() {
  trap - ERR HUP INT TERM
  set +e
  echo "Deploy failed; restoring version $previous" >&2
  cp "$backup/backend.env" "$backend"
  cp "$backup/frontend.env" "$frontend"
  export VERSION="$previous"
  if [[ "$previous" == 0.0 ]]; then
    compose vey-frontend stop
    compose vey-backend stop
  else
    local failed=0
    compose vey-backend up -d --wait --wait-timeout 180 || failed=1
    compose vey-frontend up -d --wait --wait-timeout 180 || failed=1
    if [[ "$failed" == 1 ]]; then echo "Rollback needs operator attention" >&2; fi
  fi
  exit 1
}
trap rollback ERR HUP INT TERM

# Read env as data, never source it as shell code. Keep every secret unchanged.
python3 - "$version" "$backend" "$frontend" <<'PY'
import os
import re
import sys
from pathlib import Path

for filename in sys.argv[2:]:
    path = Path(filename)
    value, count = re.subn(r"^VERSION=.*$", "VERSION=" + sys.argv[1], path.read_text(), flags=re.M)
    if count != 1:
        raise ValueError("Expected exactly one VERSION entry")
    temporary = path.with_name(".env.next")
    temporary.write_text(value)
    temporary.chmod(0o600)
    os.replace(temporary, path)
PY

compose vey-backend up -d --wait --wait-timeout 180
compose vey-frontend up -d --wait --wait-timeout 180
trap - ERR HUP INT TERM
echo "Deployed Vey $version; both containers are healthy"
