/** Read env with trim; empty string if unset. */
export function env(key: string, fallback = ''): string {
  const value = process.env[key];
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

/** true for 1 / true / yes / on (case-insensitive). */
export function envBool(key: string, fallback = false): boolean {
  const value = env(key).toLowerCase();
  if (!value) return fallback;
  if (['1', 'true', 'yes', 'on'].includes(value)) return true;
  if (['0', 'false', 'no', 'off'].includes(value)) return false;
  return fallback;
}

/** Join base URL and path without double slashes. */
export function joinUrl(base: string, pathPart: string): string {
  const b = base.replace(/\/+$/, '');
  const p = pathPart.replace(/^\/+/, '');
  if (!b) return p ? `/${p}` : '';
  if (!p) return b;
  return `${b}/${p}`;
}
