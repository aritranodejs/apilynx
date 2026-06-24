/**
 * tsc-alias incorrectly rewrites `require('electron')` to `require('../electron')`
 * because this project has a local `electron/` folder. Patch the compiled output.
 */
const fs = require('fs');
const path = require('path');

const electronDir = path.join(__dirname, '../dist-electron/electron');
if (!fs.existsSync(electronDir)) {
  process.exit(0);
}

for (const file of fs.readdirSync(electronDir)) {
  if (!file.endsWith('.js')) continue;
  const filePath = path.join(electronDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const fixed = content.replace(/require\("\.\.\/electron"\)/g, 'require("electron")');
  if (fixed !== content) {
    fs.writeFileSync(filePath, fixed);
    console.log(`Patched: ${filePath}`);
  }
}
