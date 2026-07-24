#!/usr/bin/env node
/**
 * Next static export + assetPrefix './' emits "./_next/..." which only works
 * for out/index.html. Nested routes (out/app/, out/docs/...) must use ../_next.
 * Without this fix, packaged Electron (AppImage/deb) shows a black screen.
 */
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'out');

if (!fs.existsSync(outDir)) {
  console.error('out/ missing — run next build first');
  process.exit(1);
}

function walk(dir, depth) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === '_next' || ent.name.startsWith('.')) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      walk(full, depth + 1);
    } else if (ent.name.endsWith('.html')) {
      fixHtml(full, depth);
    }
  }
}

function fixHtml(file, depth) {
  if (depth < 1) return;

  const prefix = '../'.repeat(depth);
  let html = fs.readFileSync(file, 'utf8');
  const before = html;

  html = html.replaceAll('./_next/', `${prefix}_next/`);
  html = html.replaceAll('"/_next/', `"${prefix}_next/`);
  html = html.replaceAll("'/_next/", `'${prefix}_next/`);

  // Absolute public assets break under file://
  html = html.replaceAll('"/favicon.ico', `"${prefix}favicon.ico`);
  html = html.replaceAll('"/icon.png', `"${prefix}icon.png`);

  if (html !== before) {
    fs.writeFileSync(file, html);
    console.log(`Fixed: ${path.relative(path.join(__dirname, '..'), file)} → ${prefix}_next/`);
  }
}

walk(outDir, 0);
console.log('✓ Electron static asset paths fixed for nested routes');
