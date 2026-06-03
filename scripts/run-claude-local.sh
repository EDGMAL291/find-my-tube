#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLAUDE_BIN="$ROOT_DIR/.local-tools/bin/claude"

if [[ ! -x "$CLAUDE_BIN" ]]; then
  echo "Claude binary not found at: $CLAUDE_BIN"
  echo "Install it locally in .local-tools/bin first."
  exit 1
fi

cd "$ROOT_DIR"
exec "$CLAUDE_BIN" "$@"
