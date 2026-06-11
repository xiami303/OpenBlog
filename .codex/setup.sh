#!/usr/bin/env bash
# Codex environment setup script for OpenBlog.
#
# The Codex cloud agent runs this when preparing a sandbox/container for the
# repository. Add dependency installation here as the project grows.
#
# Today the repo has no toolchain, so this is intentionally a near no-op.

set -euo pipefail

echo "[codex-setup] OpenBlog: preparing environment"

# --- Node.js / static-site generator (uncomment once a package.json exists) ---
# if [ -f package.json ]; then
#   echo "[codex-setup] installing npm dependencies"
#   npm ci || npm install
# fi

# --- Python (uncomment if a Python-based generator is used) -------------------
# if [ -f requirements.txt ]; then
#   echo "[codex-setup] installing pip dependencies"
#   pip install -r requirements.txt
# fi

echo "[codex-setup] done (no toolchain configured yet)"
