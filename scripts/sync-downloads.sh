#!/usr/bin/env bash
# Copy built installers from release/ → public/downloads/ for the marketing site.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/release"
DEST="$ROOT/public/downloads"
mkdir -p "$DEST"

copied=0
for pattern in \
  'Apilynx-Setup-*.exe' \
  'Apilynx-*-arm64.dmg' \
  'Apilynx-*-x64.dmg' \
  'Apilynx-*.dmg' \
  'apilynx_*_amd64.deb' \
  'Apilynx-*.AppImage'
do
  # shellcheck disable=SC2086
  for f in "$SRC"/$pattern; do
    if [[ -f "$f" ]]; then
      cp -f "$f" "$DEST/"
      echo "Copied $(basename "$f")"
      copied=$((copied + 1))
    fi
  done
done

if [[ "$copied" -eq 0 ]]; then
  echo "No installers found in release/. Build first, e.g.:"
  echo "  npm run dist:linux"
  echo "  npm run dist:win    # needs Windows or Wine on Linux"
  echo "  npm run dist:mac    # needs macOS"
  exit 1
fi

echo ""
echo "Done — $copied file(s) in public/downloads/"
echo "Set NEXT_PUBLIC_DOWNLOADS_LIVE=true and platform URLs in .env, then restart next."
ls -lh "$DEST"
