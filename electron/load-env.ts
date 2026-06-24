import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';
import { app } from 'electron';

/** Load .env from user config, packaged resources, or project root (dev). */
export function loadAppEnv(): string | null {
  const candidates = [
    path.join(app.getPath('userData'), '.env'),
    path.join(process.resourcesPath, '.env'),
    path.join(app.getAppPath(), '.env'),
    path.join(__dirname, '../../.env'),
  ];

  for (const envPath of candidates) {
    if (fs.existsSync(envPath)) {
      config({ path: envPath, override: true });
      return envPath;
    }
  }

  return null;
}
