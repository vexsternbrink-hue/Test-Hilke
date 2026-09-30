/**
 * REST-API der Website. Wird in zwei Umgebungen verwendet:
 *  - Entwicklung: als Middleware im Vite-Dev-Server (siehe vite.config.js) → `npm run dev`
 *  - Produktion:  im Node-Server (server/index.js)                          → `npm start`
 *
 * Öffentlich:
 *   GET    /api/public                 Meldungen (nur sichtbare), Produkte, Standort/Zeiten
 *   POST   /api/orders                 Vorbestellung absenden (Anfrage, keine Zahlung)
 * Admin (Login nötig, Cookie-Sitzung):
 *   GET    /api/admin/session          { configured, authenticated }
 *   POST   /api/admin/login            { password }
 *   POST   /api/admin/logout
 *   GET    /api/admin/notices          POST /api/admin/notices
 *   PUT    /api/admin/notices/:id      DELETE /api/admin/notices/:id
 *   GET    /api/admin/products         POST /api/admin/products
 *   PUT    /api/admin/products/:id     DELETE /api/admin/products/:id
 *   GET    /api/admin/orders           PATCH /api/admin/orders/:id   DELETE /api/admin/orders/:id
 *   GET    /api/admin/settings         PUT /api/admin/settings
 */
import { randomBytes } from 'node:crypto';
import { isNoticeVisible, todayIso } from '../shared/dates.js';
import {
  validateNotice,
  validateOrder,
  validateOrderUpdate,
  validateProduct,
  validateSettings,
} from '../shared/validation.js';
import { SESSION_TTL_MS } from './auth.js';

const COOKIE = 'bt_admin';
const MAX_BODY = 64 * 1024;

class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(body === undefined ? '' : JSON.stringify(body));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    const type = req.headers['content-type'] || '';
    if (!type.startsWith('application/json')) {
      reject(new HttpError(415, 'Bitte JSON senden.'));
      return;
    }
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(new HttpError(413, 'Anfrage zu groß.'));
        req.destroy();
      } else chunks.push(c);
    });
    req.on('end', () => {
      try {
        resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {});
      } catch {
        reject(new HttpError(400, 'Ungültiges JSON.'));
      }
    });
    req.on('error', reject);
  });
}

function parseCookies(header = '') {
  const out = {};
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

function cookieHeader(value, { maxAge, secure }) {
  return [
    `${COOKIE}=${value}`,
    'Path=/api',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${maxAge}`,
    secure ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');
}

function assertValid({ errors }) {
  if (Object.keys(errors).length) throw new HttpError(422, 'Bitte die markierten Felder prüfen.', errors);
}

/** Bestellnummer wie VB-261004-K7QF – kurz genug zum Vorlesen am Stand. */
function makeRef(existing, today) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // ohne 0/O/1/I
  for (;;) {
    const bytes = randomBytes(4);
    const code = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
    const ref = `VB-${today.slice(2).replaceAll('-', '')}-${code}`;
    if (!existing.has(ref)) return ref;
  }
}

function sortProducts(list) {
  return [...list].sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name, 'de'));
}

function sortNotices(list) {
  return [...list].sort(
    (a, b) =>
      Number(b.highlighted) - Number(a.highlighted) ||
      (b.publishAt || b.createdAt || '').localeCompare(a.publishAt || a.createdAt || ''),
  );
}

/**
 * @param {object} opts
 * @param {ReturnType<import('./store.js').createStore>} opts.store
 * @param {ReturnType<import('./auth.js').createAuth>} opts.auth
 * @param {boolean} [opts.secureCookies]  In Produktion (HTTPS) true
 * @param {boolean} [opts.trustProxy]     X-Forwarded-For auswerten (hinter Reverse-Proxy)
 * @param {(order: object) => void} [opts.onOrderCreated]  Hook z. B. für E-Mail-Benachrichtigung
 * @param {() => string} [opts.today]
 */
export function createApiHandler({ store, auth, secureCookies = false, trustProxy = false, onOrderCreated, today = todayIso }) {
  const orderRate = new Map(); // ip → Zeitstempel der letzten Bestellungen

  function clientIp(req) {
    if (trustProxy) {
      const fwd = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
      if (fwd) return fwd;
    }
    return req.socket?.remoteAddress || 'unknown';
  }

  function sessionToken(req) {
    return parseCookies(req.headers.cookie)[COOKIE];
  }

  function requireAdmin(req) {
    if (!auth.isValid(sessionToken(req))) throw new HttpError(401, 'Bitte melde dich erneut an.');
    // CSRF-Schutz zusätzlich zu SameSite=Strict: schreibende Admin-Aufrufe brauchen diesen Header,
    // den ein fremdes Formular nicht setzen kann.
    if (req.method !== 'GET' && req.headers['x-requested-with'] !== 'fetch') {
      throw new HttpError(403, 'Anfrage abgelehnt.');
    }
  }

  function crud(collection, validate, { sort }) {
    return {
      list: () => sort(store.read()[collection]),
      create: async (req) => {
        const v = validate(await readJson(req));
        assertValid(v);
        const now = new Date().toISOString();
        return store.update((db) => {
          const item = { id: store.newId(), ...v.value, createdAt: now, updatedAt: now };
          db[collection].push(item);
          return item;
        });
      },
      replace: async (req, id) => {
        const v = validate(await readJson(req));
        assertValid(v);
        return store.update((db) => {
          const i = db[collection].findIndex((x) => x.id === id);
          if (i < 0) throw new HttpError(404, 'Nicht gefunden.');
          db[collection][i] = { ...db[collection][i], ...v.value, id, updatedAt: new Date().toISOString() };
          return db[collection][i];
        });
      },
      remove: (id) =>
        store.update((db) => {
          const before = db[collection].length;
          db[collection] = db[collection].filter((x) => x.id !== id);
          if (db[collection].length === before) throw new HttpError(404, 'Nicht gefunden.');
        }),
    };
  }

  const notices = crud('notices', validateNotice, { sort: sortNotices });
  const products = crud('products', validateProduct, { sort: sortProducts });

  async function route(req, res, path) {
    const method = req.method;
    const seg = path.split('/').filter(Boolean); // ['api', 'admin', 'notices', ':id']

    // ── Öffentlich ────────────────────────────────────────────────────────────
    if (path === '/api/public' && method === 'GET') {
      const db = store.read();
      const t = today();
      return send(res, 200, {
        today: t,
        settings: db.settings,
        products: sortProducts(db.products),
        notices: sortNotices(db.notices.filter((n) => isNoticeVisible(n, t))).map(
          ({ id, title, body, highlighted, publishAt }) => ({ id, title, body, highlighted, publishAt }),
        ),
      });
    }

    if (path === '/api/orders' && method === 'POST') {
      const ip = clientIp(req);
      const now = Date.now();
      const recent = (orderRate.get(ip) || []).filter((t) => now - t < 60 * 60 * 1000);
      if (recent.length >= 10) throw new HttpError(429, 'Zu viele Vorbestellungen in kurzer Zeit. Bitte versuche es später erneut.');

      const body = await readJson(req);
      const db = store.read();
      const t = today();
      // Honeypot: ein für Menschen unsichtbares Feld. Bots füllen es aus → still verwerfen.
      if (body.website) return send(res, 201, { ref: makeRef(new Set(), t), received: true });

      const v = validateOrder(body, { products: db.products, settings: db.settings, today: t });
      assertValid(v);
      recent.push(now);
      orderRate.set(ip, recent);

      const stamp = new Date().toISOString();
      const data = { ...v.value };
      delete data.consent; // gespeichert wird der Zeitpunkt der Zustimmung
      const order = store.update((draft) => {
        const o = {
          id: store.newId(),
          ref: makeRef(new Set(draft.orders.map((x) => x.ref)), t),
          status: 'neu',
          ...data,
          consentAt: stamp,
          adminNote: '',
          createdAt: stamp,
          updatedAt: stamp,
        };
        draft.orders.push(o);
        return o;
      });
      onOrderCreated?.(order);
      const { ref, firstName, lastName, email, phone, pickupDate, pickupTime, items, message } = order;
      return send(res, 201, { ref, firstName, lastName, email, phone, pickupDate, pickupTime, items, message });
    }

    // ── Admin: Sitzung ────────────────────────────────────────────────────────
    if (path === '/api/admin/session' && method === 'GET') {
      return send(res, 200, { configured: auth.configured, authenticated: auth.isValid(sessionToken(req)) });
    }

    if (path === '/api/admin/login' && method === 'POST') {
      if (!auth.configured) {
        throw new HttpError(503, 'Der Admin-Zugang ist noch nicht eingerichtet. Bitte ADMIN_PASSWORD_HASH auf dem Server setzen.');
      }
      const ip = clientIp(req);
      const wait = auth.lockedFor(ip);
      if (wait) throw new HttpError(429, `Zu viele Fehlversuche. Bitte warte ${Math.ceil(wait / 60)} Minute(n).`);
      const body = await readJson(req);
      if (!auth.verify(ip, body.password)) throw new HttpError(401, 'Das Passwort ist nicht korrekt.');
      const token = auth.createSession();
      res.setHeader('Set-Cookie', cookieHeader(token, { maxAge: SESSION_TTL_MS / 1000, secure: secureCookies }));
      return send(res, 200, { authenticated: true });
    }

    if (path === '/api/admin/logout' && method === 'POST') {
      auth.destroy(sessionToken(req));
      res.setHeader('Set-Cookie', cookieHeader('', { maxAge: 0, secure: secureCookies }));
      return send(res, 200, { authenticated: false });
    }

    // ── Admin: geschützte Bereiche ───────────────────────────────────────────
    if (seg[0] === 'api' && seg[1] === 'admin') {
      requireAdmin(req);
      const [, , resource, id] = seg;

      if (resource === 'notices' || resource === 'products') {
        const c = resource === 'notices' ? notices : products;
        if (!id && method === 'GET') return send(res, 200, c.list());
        if (!id && method === 'POST') return send(res, 201, await c.create(req));
        if (id && method === 'PUT') return send(res, 200, await c.replace(req, id));
        if (id && method === 'DELETE') return send(res, 200, c.remove(id) ?? { deleted: true });
      }

      if (resource === 'orders') {
        if (!id && method === 'GET') {
          const url = new URL(req.url, 'http://x');
          const status = url.searchParams.get('status');
          const from = url.searchParams.get('from');
          const to = url.searchParams.get('to');
          const list = store
            .read()
            .orders.filter((o) => (!status || o.status === status) && (!from || o.pickupDate >= from) && (!to || o.pickupDate <= to))
            .sort((a, b) => a.pickupDate.localeCompare(b.pickupDate) || a.createdAt.localeCompare(b.createdAt));
          return send(res, 200, list);
        }
        if (id && method === 'PATCH') {
          const v = validateOrderUpdate(await readJson(req));
          assertValid(v);
          const updated = store.update((db) => {
            const o = db.orders.find((x) => x.id === id);
            if (!o) throw new HttpError(404, 'Vorbestellung nicht gefunden.');
            Object.assign(o, v.value, { updatedAt: new Date().toISOString() });
            return o;
          });
          return send(res, 200, updated);
        }
        if (id && method === 'DELETE') {
          store.update((db) => {
            const before = db.orders.length;
            db.orders = db.orders.filter((x) => x.id !== id);
            if (db.orders.length === before) throw new HttpError(404, 'Vorbestellung nicht gefunden.');
          });
          return send(res, 200, { deleted: true });
        }
      }

      if (resource === 'settings' && !id) {
        if (method === 'GET') return send(res, 200, store.read().settings);
        if (method === 'PUT') {
          const v = validateSettings(await readJson(req));
          assertValid(v);
          const settings = store.update((db) => {
            db.settings = { ...db.settings, ...v.value };
            return db.settings;
          });
          return send(res, 200, settings);
        }
      }
    }

    throw new HttpError(404, 'Unbekannter API-Pfad.');
  }

  return async function apiHandler(req, res, next) {
    const path = (req.url || '').split('?')[0];
    if (!path.startsWith('/api/')) {
      if (next) return next();
      return send(res, 404, { error: 'Nicht gefunden.' });
    }
    try {
      await route(req, res, path);
    } catch (err) {
      if (err instanceof HttpError) {
        send(res, err.status, { error: err.message, ...(err.details ? { fields: err.details } : {}) });
      } else {
        console.error('[api]', err);
        send(res, 500, { error: 'Interner Fehler. Bitte später erneut versuchen.' });
      }
    }
  };
}
