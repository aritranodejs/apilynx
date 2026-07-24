#!/usr/bin/env bash
# Create or update a GitHub Release and upload installer assets.
#
# Usage:
#   bash scripts/publish-release.sh              # tag v{version from package.json}
#   bash scripts/publish-release.sh v1.0.1       # custom tag
#   bash scripts/publish-release.sh v1.0.0 --assets-only
#
# Auth: GH_TOKEN / GITHUB_TOKEN, or a token embedded in `git remote get-url origin`
# (prefer: export GH_TOKEN=... and remove tokens from the remote URL).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

TAG="${1:-}"
ASSETS_ONLY=false
if [[ "${2:-}" == "--assets-only" ]] || [[ "${1:-}" == "--assets-only" ]]; then
  ASSETS_ONLY=true
  if [[ "${1:-}" == "--assets-only" ]]; then
    TAG=""
  fi
fi

VERSION="$(node -p "require('./package.json').version")"
if [[ -z "$TAG" ]]; then
  TAG="v${VERSION}"
fi

REPO="aritranodejs/apilynx"
API="https://api.github.com/repos/${REPO}"

resolve_token() {
  if [[ -n "${GH_TOKEN:-}" ]]; then
    echo "$GH_TOKEN"
    return
  fi
  if [[ -n "${GITHUB_TOKEN:-}" ]]; then
    echo "$GITHUB_TOKEN"
    return
  fi
  local remote
  remote="$(git remote get-url origin 2>/dev/null || true)"
  if [[ "$remote" =~ https://([^@]+)@github.com/ ]]; then
    echo "${BASH_REMATCH[1]}"
    return
  fi
  echo ""
}

TOKEN="$(resolve_token)"
if [[ -z "$TOKEN" ]]; then
  echo "No GitHub token found. Set GH_TOKEN and retry."
  exit 1
fi

auth_hdr=(-H "Authorization: Bearer ${TOKEN}" -H "Accept: application/vnd.github+json" -H "X-GitHub-Api-Version: 2022-11-28")

echo "Repo: ${REPO}"
echo "Tag:  ${TAG}"

RELEASE_JSON="$(curl -sS "${auth_hdr[@]}" "${API}/releases/tags/${TAG}" || true)"
RELEASE_ID="$(node -e "const j=JSON.parse(process.argv[1]||'{}'); if(j.id) console.log(j.id)" "$RELEASE_JSON" 2>/dev/null || true)"

if [[ -z "$RELEASE_ID" && "$ASSETS_ONLY" == true ]]; then
  echo "Release ${TAG} does not exist yet. Run without --assets-only first."
  exit 1
fi

if [[ -z "$RELEASE_ID" ]]; then
  echo "Creating release ${TAG}..."
  BODY="$(cat <<EOF
## Apilynx ${TAG}

Desktop installers for Apilynx.

### Linux
- \`.deb\` — Ubuntu / Debian / Mint
- AppImage — portable

### Coming next
- Windows \`.exe\`
- macOS \`.dmg\` (Apple Silicon + Intel)

Upload more assets later with:
\`\`\`bash
bash scripts/publish-release.sh ${TAG} --assets-only
\`\`\`
EOF
)"
  CREATE_PAYLOAD="$(node -e "
    const tag=process.argv[1], body=process.argv[2];
    process.stdout.write(JSON.stringify({
      tag_name: tag,
      name: 'Apilynx ' + tag,
      body,
      draft: false,
      prerelease: false,
      generate_release_notes: true
    }));
  " "$TAG" "$BODY")"
  RELEASE_JSON="$(curl -sS "${auth_hdr[@]}" -X POST "${API}/releases" -d "$CREATE_PAYLOAD")"
  RELEASE_ID="$(node -e "const j=JSON.parse(process.argv[1]); if(!j.id){console.error(j.message||JSON.stringify(j)); process.exit(1)}; console.log(j.id)" "$RELEASE_JSON")"
  echo "Created release id=${RELEASE_ID}"
else
  echo "Release already exists (id=${RELEASE_ID}) — uploading/updating assets"
fi

UPLOAD_URL="https://uploads.github.com/repos/${REPO}/releases/${RELEASE_ID}/assets"

upload_file() {
  local file="$1"
  local name
  name="$(basename "$file")"
  if [[ ! -f "$file" ]]; then
    echo "Skip missing: $name"
    return 0
  fi

  # Delete existing asset with same name (allows re-upload / update)
  local assets
  assets="$(curl -sS "${auth_hdr[@]}" "${API}/releases/${RELEASE_ID}/assets")"
  local existing_id
  existing_id="$(node -e "
    const assets=JSON.parse(process.argv[1]);
    const name=process.argv[2];
    const hit=assets.find(a=>a.name===name);
    if(hit) console.log(hit.id);
  " "$assets" "$name" 2>/dev/null || true)"
  if [[ -n "$existing_id" ]]; then
    echo "Replacing existing asset: $name"
    curl -sS -o /dev/null -w "" "${auth_hdr[@]}" -X DELETE "${API}/releases/assets/${existing_id}"
  fi

  echo "Uploading $name ($(du -h "$file" | cut -f1))..."
  local encoded
  encoded="$(node -e "console.log(encodeURIComponent(process.argv[1]))" "$name")"
  curl -sS "${auth_hdr[@]}" \
    -H "Content-Type: application/octet-stream" \
    --data-binary @"$file" \
    "${UPLOAD_URL}?name=${encoded}" \
    | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const j=JSON.parse(d); if(!j.browser_download_url){console.error(j.message||d); process.exit(1)}; console.log('  → '+j.browser_download_url)})"
}

shopt -s nullglob
FILES=(
  "$ROOT"/release/Apilynx-Setup-*.exe
  "$ROOT"/release/Apilynx-*-arm64.dmg
  "$ROOT"/release/Apilynx-*-x64.dmg
  "$ROOT"/release/Apilynx-*.dmg
  "$ROOT"/release/apilynx_*_amd64.deb
  "$ROOT"/release/Apilynx-*.AppImage
)

count=0
for f in "${FILES[@]}"; do
  upload_file "$f"
  count=$((count + 1))
done

if [[ "$count" -eq 0 ]]; then
  echo "No assets found in release/. Build installers first."
  exit 1
fi

echo ""
echo "Done. Release page: https://github.com/${REPO}/releases/tag/${TAG}"
echo "Set .env download URLs to:"
echo "  https://github.com/${REPO}/releases/download/${TAG}/<filename>"
