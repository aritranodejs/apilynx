import * as fs from 'fs';
import * as http from 'http';
import * as path from 'path';

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
};

/**
 * Serve Next static export (`out/`) on loopback so Chromium can load /app/ and /_next
 * like a normal website. file:// breaks App Router hydration (black "Loading…" screen).
 */
export function startStaticServer(rootDir: string): Promise<{ server: http.Server; port: number }> {
  const root = path.resolve(rootDir);

  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const url = new URL(req.url || '/', 'http://127.0.0.1');
        let pathname = decodeURIComponent(url.pathname);
        if (pathname.includes('\0')) {
          res.writeHead(400).end('Bad path');
          return;
        }
        if (pathname.endsWith('/')) {
          pathname = `${pathname}index.html`;
        }

        const filePath = path.resolve(path.join(root, pathname));
        if (!filePath.startsWith(root + path.sep) && filePath !== root) {
          res.writeHead(403).end('Forbidden');
          return;
        }

        if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
          res.writeHead(404).end('Not found');
          return;
        }

        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, {
          'Content-Type': MIME[ext] || 'application/octet-stream',
          'Cache-Control': 'no-cache',
        });
        fs.createReadStream(filePath).pipe(res);
      } catch (error) {
        res.writeHead(500).end(error instanceof Error ? error.message : 'Server error');
      }
    });

    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      if (!addr || typeof addr === 'string') {
        reject(new Error('Static server failed to bind a port'));
        return;
      }
      resolve({ server, port: addr.port });
    });
  });
}
