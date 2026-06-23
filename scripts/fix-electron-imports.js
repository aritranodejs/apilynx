/**
 * tsc-alias incorrectly rewrites `require('electron')` to `require('../electron')`
 * because this project has a local `electron/` folder. Patch the compiled output.
 */
const fs = require('fs');
const path = require('path');

const targets = [
  path.join(__dirname, '../dist-electron/electron/main.js'),
  path.join(__dirname, '../dist-electron/electron/preload.js'),
];

for (const file of targets) {
  if (!fs.existsSync(file)) continue;
  const content = fs.readFileSync(file, 'utf8');
  const fixed = content.replace(/require\("\.\.\/electron"\)/g, 'require("electron")');
  if (fixed !== content) {
    fs.writeFileSync(file, fixed);
    console.log(`Patched: ${file}`);
  }
}
