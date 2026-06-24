#!/usr/bin/env bash
# Install Apilynx from a .deb package (Ubuntu / Debian / Mint / Pop!_OS)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEB="$(ls -1 "$ROOT"/release/apilynx_*_amd64.deb "$ROOT"/release/Apilynx_*_amd64.deb 2>/dev/null | head -1 || true)"

if [[ -z "$DEB" ]]; then
  echo "No .deb found in release/. Build first:"
  echo "  npm run dist:linux:deb"
  exit 1
fi

echo "Installing: $DEB"
sudo dpkg -i "$DEB" || true
sudo apt-get install -f -y

echo ""
echo "Apilynx installed. Find it in your app menu or run: apilynx"
