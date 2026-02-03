#!/usr/bin/env bash
set -euo pipefail

UPSTREAM_URL="https://github.com/lidofinance/defi-wrapper-widget-template.git"
UPSTREAM_REMOTE="upstream"

# Add upstream if missing
if ! git remote get-url "$UPSTREAM_REMOTE" >/dev/null 2>&1; then
  git remote add "$UPSTREAM_REMOTE" "$UPSTREAM_URL"
fi

# Fetch the specified tag and merge it
TAG="${1:-}"
if [ -z "$TAG" ]; then
  echo "Usage: $0 <tag>"
  exit 1
fi
git fetch "$UPSTREAM_REMOTE" "refs/tags/$TAG:refs/tags/$TAG"
git merge "$TAG"
