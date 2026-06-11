#!/usr/bin/env bash
# Codex environment setup script for OpenBlog.
#
# The Codex cloud agent runs this when preparing a sandbox/container for the
# repository. Add dependency installation here as the project grows.
#
# Today the repo has no toolchain, so this is intentionally a near no-op.

set -euo pipefail

echo "[codex-setup] OpenBlog: preparing environment"

# --- Node.js / static-site generator ------------------------------------------
if [ -f package.json ]; then
  echo "[codex-setup] installing npm dependencies"
  npm ci || npm install
fi

echo "[codex-setup] done"
