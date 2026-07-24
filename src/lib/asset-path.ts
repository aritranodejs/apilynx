/** Path for static files in public/ — works in dev (http) and packaged Electron (file://). */
export function assetPath(relativePath: string): string {
  const clean = relativePath.replace(/^\//, '');
  if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
    // Packaged app may load out/app/index.html — static files live in out/
    const path = window.location.pathname.replace(/\\/g, '/');
    if (path.includes('/app/')) {
      return `../${clean}`;
    }
    return `./${clean}`;
  }
  return `/${clean}`;
}
