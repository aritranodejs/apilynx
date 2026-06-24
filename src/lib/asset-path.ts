/** Path for static files in public/ — works in dev (http) and packaged Electron (file://). */
export function assetPath(relativePath: string): string {
  const clean = relativePath.replace(/^\//, '');
  if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
    return `./${clean}`;
  }
  return `/${clean}`;
}
