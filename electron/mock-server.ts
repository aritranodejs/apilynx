import http from 'http';
import type { IncomingMessage, ServerResponse } from 'http';

export interface MockRoute {
  method: string;
  path: string;
  status: number;
  body: string;
  contentType?: string;
}

let server: http.Server | null = null;
let currentPort = 0;

function normalizePath(url: string): string {
  try {
    if (url.startsWith('http')) return new URL(url).pathname;
    const q = url.indexOf('?');
    return q >= 0 ? url.slice(0, q) : url;
  } catch {
    return url.split('?')[0] ?? '/';
  }
}

function matchRoute(req: IncomingMessage, routes: MockRoute[]): MockRoute | undefined {
  const method = (req.method ?? 'GET').toUpperCase();
  const path = normalizePath(req.url ?? '/');
  return routes.find((r) => r.method.toUpperCase() === method && normalizePath(r.path) === path);
}

export function startMockServer(port: number, routes: MockRoute[]): Promise<number> {
  return new Promise((resolve, reject) => {
    stopMockServer();
    server = http.createServer((req, res) => {
      const route = matchRoute(req, routes);
      if (!route) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Mock route not found', path: req.url }));
        return;
      }
      res.writeHead(route.status, {
        'Content-Type': route.contentType ?? 'application/json',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(route.body);
    });
    server.on('error', reject);
    server.listen(port, '127.0.0.1', () => {
      const addr = server?.address();
      currentPort = typeof addr === 'object' && addr ? addr.port : port;
      resolve(currentPort);
    });
  });
}

export function stopMockServer(): void {
  if (server) {
    server.close();
    server = null;
    currentPort = 0;
  }
}

export function getMockServerStatus(): { running: boolean; port: number } {
  return { running: !!server, port: currentPort };
}
