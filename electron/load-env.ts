import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';
import { app } from 'electron';

/** Load .env files; later paths override earlier (user config wins). */
export function loadAppEnv(): string | null {
  const candidates = [
    path.join(process.resourcesPath, '.env'),
    path.join(app.getAppPath(), '.env'),
    path.join(__dirname, '../../.env'),
    path.join(app.getPath('userData'), '.env'),
  ];

  const loaded: string[] = [];
  for (const envPath of candidates) {
    if (fs.existsSync(envPath)) {
      config({ path: envPath, override: true });
      loaded.push(envPath);
    }
  }

  return loaded.length > 0 ? loaded.join(' → ') : null;
}
