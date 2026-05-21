#!/usr/bin/env bash
# One-time: log in to GitHub, create repo, and push HEXCloud.
set -euo pipefail
cd "$(dirname "$0")/.."

GH="${GH:-gh}"
if ! command -v "$GH" >/dev/null 2>&1; then
  echo "Install GitHub CLI: https://cli.github.com/"
  echo "  macOS: brew install gh"
  exit 1
fi

if ! "$GH" auth status >/dev/null 2>&1; then
  echo "Log in to GitHub (browser will open)..."
  "$GH" auth login --hostname github.com --git-protocol https --web
fi

REPO_NAME="${1:-hexcloud}"
VISIBILITY="${2:-private}"

"$GH" repo create "$REPO_NAME" --source=. --remote=origin --push --"${VISIBILITY}"

echo ""
echo "Done. Remote:"
git remote -v
echo ""
echo "Repo URL:"
"$GH" repo view --web 2>/dev/null || "$GH" repo view --json url -q .url
