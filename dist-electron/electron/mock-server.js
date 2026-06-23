"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startMockServer = startMockServer;
exports.stopMockServer = stopMockServer;
exports.getMockServerStatus = getMockServerStatus;
const http_1 = __importDefault(require("http"));
let server = null;
let currentPort = 0;
function normalizePath(url) {
    try {
        if (url.startsWith('http'))
            return new URL(url).pathname;
        const q = url.indexOf('?');
        return q >= 0 ? url.slice(0, q) : url;
    }
    catch {
        return url.split('?')[0] ?? '/';
    }
}
function matchRoute(req, routes) {
    const method = (req.method ?? 'GET').toUpperCase();
    const path = normalizePath(req.url ?? '/');
    return routes.find((r) => r.method.toUpperCase() === method && normalizePath(r.path) === path);
}
function startMockServer(port, routes) {
    return new Promise((resolve, reject) => {
        stopMockServer();
        server = http_1.default.createServer((req, res) => {
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
function stopMockServer() {
    if (server) {
        server.close();
        server = null;
        currentPort = 0;
    }
}
function getMockServerStatus() {
    return { running: !!server, port: currentPort };
}
