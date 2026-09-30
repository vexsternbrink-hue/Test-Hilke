/**
 * Produktionsserver: liefert die gebaute Website (dist/) und die API aus.
 *
 *   npm run build && npm start      → http://localhost:3000 (PORT änderbar)
 *
 * Läuft ohne zusätzliche Pakete (nur Node ≥ 20.12). Für HTTPS einen Reverse-Proxy
 * (z. B. nginx, Caddy) oder die Plattform des Hosters davorschalten und TRUST_PROXY=1 setzen.
 */
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAppApi } from './app.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const envFile = join(root, '.env');
if (existsSync(envFile)) process.loadEnvFile(envFile);

const DIST = join(root, 'dist');
const PORT = Number(process.env.PORT) || 3000;

if (!existsSync(join(DIST, 'index.html'))) {
  console.error('dist/ fehlt – bitte zuerst `npm run build` ausführen.');
  process.exit(1);
}

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
};

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy':
    "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self'; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
};

const api = createAppApi(process.env, { production: true });

function serveStatic(req, res) {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  let file = normalize(join(DIST, urlPath));
  if (!file.startsWith(DIST + sep) && file !== DIST) {
    res.writeHead(403).end();
    return;
  }
  if (!existsSync(file) || statSync(file).isDirectory()) file = join(DIST, 'index.html'); // SPA-Fallback
  const isAsset = file.includes(`${sep}assets${sep}`);
  res.writeHead(200, {
    'Content-Type': TYPES[extname(file)] || 'application/octet-stream',
    // Gehashte Dateien in /assets dürfen lange gecacht werden, index.html nie.
    'Cache-Control': isAsset ? 'public, max-age=31536000, immutable' : 'no-cache',
  });
  if (req.method === 'HEAD') res.end();
  else createReadStream(file).pipe(res);
}

createServer((req, res) => {
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.setHeader(k, v);
  if ((req.url || '').startsWith('/api/')) return api(req, res);
  if (req.method !== 'GET' && req.method !== 'HEAD') return res.writeHead(405).end();
  return serveStatic(req, res);
}).listen(PORT, () => {
  console.info(`Marktstand-Website läuft auf http://localhost:${PORT}`);
});
