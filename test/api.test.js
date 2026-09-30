import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApiHandler } from '../server/api.js';
import { createAuth, hashPassword } from '../server/auth.js';
import { createStore } from '../server/store.js';
import { addDays, todayIso, weekdayOf } from '../shared/dates.js';

const PASSWORD = 'richtig-langes-passwort';
const TODAY = todayIso();

function startServer({ configured = true } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'markt-'));
  const store = createStore({ dataDir: dir });
  const auth = createAuth(configured ? { passwordHash: hashPassword(PASSWORD) } : {});
  const handler = createApiHandler({ store, auth, today: () => TODAY });
  const server = createServer((req, res) => handler(req, res));
  return new Promise((resolve) =>
    server.listen(0, '127.0.0.1', () => {
      const base = `http://127.0.0.1:${server.address().port}`;
      resolve({ base, dir, store, close: () => new Promise((r) => server.close(() => (rmSync(dir, { recursive: true, force: true }), r()))) });
    }),
  );
}

function client(base) {
  let cookie = '';
  return {
    async call(method, path, body, { csrf = true } = {}) {
      const res = await fetch(base + path, {
        method,
        headers: {
          ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
          ...(csrf ? { 'X-Requested-With': 'fetch' } : {}),
          ...(cookie ? { Cookie: cookie } : {}),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
      const set = res.headers.get('set-cookie');
      if (set) cookie = set.split(';')[0];
      return { status: res.status, headers: res.headers, data: await res.json().catch(() => null) };
    },
  };
}

const validOrder = (over = {}) => ({
  firstName: 'Erika',
  lastName: 'Muster',
  email: 'erika@example.org',
  phone: '040 123456',
  pickupDate: addDays(TODAY, 2),
  pickupTime: '10:30',
  message: 'Bitte gut gemischt',
  consent: true,
  items: [
    { productId: 'aepfel', variety: 'säuerlich', quantity: '2,5', unit: 'kg' },
    { productId: 'aepfel', variety: '', quantity: 6, unit: 'Stück' },
  ],
  ...over,
});

describe('öffentliche API', () => {
  let srv;
  before(async () => (srv = await startServer()));
  after(() => srv.close());

  test('liefert Startinhalte ohne interne Felder', async () => {
    const { status, data } = await client(srv.base).call('GET', '/api/public');
    assert.equal(status, 200);
    assert.equal(data.settings.marketName, 'Wochenmarkt Volksdorf');
    assert.deepEqual(
      data.products.map((p) => p.id),
      ['aepfel', 'kirschen', 'zwetschen'],
    );
    assert.ok(data.notices.length >= 1);
    assert.equal(data.notices[0].highlighted, true, 'wichtige Meldungen zuerst');
    assert.equal(data.notices[0].createdAt, undefined);
  });

  test('nimmt eine gültige Vorbestellung mit Stück und kg an', async () => {
    const { status, data } = await client(srv.base).call('POST', '/api/orders', validOrder());
    assert.equal(status, 201);
    assert.match(data.ref, /^VB-\d{6}-[A-Z2-9]{4}$/);
    assert.equal(data.items[0].quantity, 2.5);
    assert.equal(data.items[0].productName, 'Äpfel');
    assert.equal(data.items[1].unit, 'Stück');
    const stored = srv.store.read().orders.at(-1);
    assert.equal(stored.status, 'neu');
    assert.equal(stored.consent, undefined);
    assert.ok(stored.consentAt);
  });

  test('lehnt ungültige Vorbestellungen mit Feldfehlern ab', async () => {
    const { status, data } = await client(srv.base).call(
      'POST',
      '/api/orders',
      validOrder({
        email: 'kein-at',
        consent: false,
        pickupDate: TODAY, // Vorlauf 1 Tag
        items: [
          { productId: 'aepfel', quantity: '1,5', unit: 'Stück' },
          { productId: 'kirschen', quantity: 1, unit: 'kg' }, // außerhalb der Saison
          { productId: 'gibt-es-nicht', quantity: 0, unit: 'Liter' },
        ],
      }),
    );
    assert.equal(status, 422);
    for (const key of ['email', 'consent', 'pickupDate', 'items.0.quantity', 'items.1.productId', 'items.2.productId', 'items.2.quantity', 'items.2.unit']) {
      assert.ok(data.fields[key], `Fehler für ${key} erwartet`);
    }
  });

  test('lehnt leere Positionslisten ab', async () => {
    const { status, data } = await client(srv.base).call('POST', '/api/orders', validOrder({ items: [] }));
    assert.equal(status, 422);
    assert.ok(data.fields.items);
  });

  test('Honeypot: Bot-Anfragen werden nicht gespeichert', async () => {
    const before = srv.store.read().orders.length;
    const { status } = await client(srv.base).call('POST', '/api/orders', validOrder({ website: 'http://spam' }));
    assert.equal(status, 201);
    assert.equal(srv.store.read().orders.length, before);
  });

  test('verlangt JSON', async () => {
    const res = await fetch(`${srv.base}/api/orders`, { method: 'POST', body: 'a=b', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    assert.equal(res.status, 415);
  });
});

describe('Admin-Anmeldung und -Funktionen', () => {
  let srv;
  before(async () => (srv = await startServer()));
  after(() => srv.close());

  test('Admin-Daten sind ohne Anmeldung gesperrt', async () => {
    const c = client(srv.base);
    for (const path of ['/api/admin/orders', '/api/admin/notices', '/api/admin/products', '/api/admin/settings']) {
      assert.equal((await c.call('GET', path)).status, 401, path);
    }
    assert.deepEqual((await c.call('GET', '/api/admin/session')).data, { configured: true, authenticated: false });
  });

  test('falsches Passwort → 401, nach 5 Fehlversuchen gesperrt → 429', async () => {
    const c = client(srv.base);
    for (let i = 0; i < 5; i++) {
      const r = await c.call('POST', '/api/admin/login', { password: 'falsch' });
      assert.equal(r.status, 401);
      assert.equal(r.data.error, 'Das Passwort ist nicht korrekt.');
    }
    const locked = await c.call('POST', '/api/admin/login', { password: PASSWORD });
    assert.equal(locked.status, 429);
  });
});

describe('Admin nach erfolgreicher Anmeldung', () => {
  let srv;
  let c;
  before(async () => {
    srv = await startServer();
    c = client(srv.base);
  });
  after(() => srv.close());

  test('Login setzt ein HttpOnly-Cookie', async () => {
    const r = await c.call('POST', '/api/admin/login', { password: PASSWORD });
    assert.equal(r.status, 200);
    const cookie = r.headers.get('set-cookie');
    assert.match(cookie, /HttpOnly/);
    assert.match(cookie, /SameSite=Strict/);
    assert.equal((await c.call('GET', '/api/admin/session')).data.authenticated, true);
  });

  test('schreibende Aufrufe ohne CSRF-Header werden abgelehnt', async () => {
    const r = await c.call('POST', '/api/admin/notices', { title: 'x' }, { csrf: false });
    assert.equal(r.status, 403);
  });

  test('Meldungen: anlegen, planen, ablaufen lassen, deaktivieren, löschen', async () => {
    const future = await c.call('POST', '/api/admin/notices', { title: 'Geplant', publishAt: addDays(TODAY, 3) });
    const expired = await c.call('POST', '/api/admin/notices', { title: 'Vorbei', expiresAt: addDays(TODAY, -1) });
    const now = await c.call('POST', '/api/admin/notices', { title: 'Heute nicht auf dem Markt', highlighted: true });
    assert.equal(now.status, 201);

    let pub = (await c.call('GET', '/api/public')).data.notices.map((n) => n.title);
    assert.ok(pub.includes('Heute nicht auf dem Markt'));
    assert.ok(!pub.includes('Geplant'));
    assert.ok(!pub.includes('Vorbei'));

    const off = await c.call('PUT', `/api/admin/notices/${now.data.id}`, { ...now.data, active: false });
    assert.equal(off.data.active, false);
    pub = (await c.call('GET', '/api/public')).data.notices.map((n) => n.title);
    assert.ok(!pub.includes('Heute nicht auf dem Markt'));

    const bad = await c.call('POST', '/api/admin/notices', { title: '', publishAt: '2026-10-10', expiresAt: '2026-10-01' });
    assert.equal(bad.status, 422);
    assert.ok(bad.data.fields.title && bad.data.fields.expiresAt);

    for (const n of [future, expired, now]) assert.equal((await c.call('DELETE', `/api/admin/notices/${n.data.id}`)).status, 200);
    assert.equal((await c.call('DELETE', `/api/admin/notices/${now.data.id}`)).status, 404);
  });

  test('Produkte: anlegen, bearbeiten, entfernen', async () => {
    const created = await c.call('POST', '/api/admin/products', { name: 'Apfel Beispielsorte', category: 'Obst', art: 'apple', sort: 5 });
    assert.equal(created.status, 201);
    const upd = await c.call('PUT', `/api/admin/products/${created.data.id}`, { ...created.data, price: '3 € / kg', badge: 'Neu' });
    assert.equal(upd.data.price, '3 € / kg');
    const xss = await c.call('PUT', `/api/admin/products/${created.data.id}`, { ...created.data, image: 'javascript:alert(1)' });
    assert.equal(xss.status, 422);
    assert.equal((await c.call('DELETE', `/api/admin/products/${created.data.id}`)).status, 200);
  });

  test('Vorbestellungen: filtern und Status ändern', async () => {
    const pub = client(srv.base);
    const d1 = addDays(TODAY, 2);
    const d2 = addDays(TODAY, 9);
    await pub.call('POST', '/api/orders', validOrder({ pickupDate: d1 }));
    await pub.call('POST', '/api/orders', validOrder({ pickupDate: d2, firstName: 'Max' }));

    const all = await c.call('GET', '/api/admin/orders');
    assert.equal(all.data.length, 2);
    const ranged = await c.call('GET', `/api/admin/orders?from=${d2}&to=${d2}`);
    assert.deepEqual(ranged.data.map((o) => o.firstName), ['Max']);

    const id = all.data[0].id;
    for (const s of ['bestaetigt', 'abgeholt', 'storniert', 'neu']) {
      assert.equal((await c.call('PATCH', `/api/admin/orders/${id}`, { status: s })).data.status, s);
    }
    assert.equal((await c.call('PATCH', `/api/admin/orders/${id}`, { status: 'bezahlt' })).status, 422);
    await c.call('PATCH', `/api/admin/orders/${id}`, { status: 'bestaetigt' });
    const byStatus = await c.call('GET', '/api/admin/orders?status=bestaetigt');
    assert.deepEqual(byStatus.data.map((o) => o.id), [id]);
  });

  test('Einstellungen: Abholtage schränken die Vorbestellung ein', async () => {
    const current = (await c.call('GET', '/api/admin/settings')).data;
    const target = addDays(TODAY, 3);
    const otherDay = (weekdayOf(target) + 1) % 7;
    const saved = await c.call('PUT', '/api/admin/settings', {
      ...current,
      hours: [{ day: 'Samstag', time: '8–13 Uhr' }, { day: '', time: '' }],
      pickupWeekdays: [otherDay],
    });
    assert.equal(saved.status, 200);
    assert.equal(saved.data.hours.length, 1, 'leere Zeilen werden entfernt');

    const r = await client(srv.base).call('POST', '/api/orders', validOrder({ pickupDate: target }));
    assert.equal(r.status, 422);
    assert.match(r.data.fields.pickupDate, /nicht auf dem Markt/);

    const bad = await c.call('PUT', '/api/admin/settings', { ...current, email: 'x', marketName: '' });
    assert.equal(bad.status, 422);
  });

  test('Daten werden dauerhaft in der JSON-Datei gespeichert', () => {
    const db = JSON.parse(readFileSync(join(srv.dir, 'db.json'), 'utf8'));
    assert.ok(db.orders.length >= 2);
  });

  test('Logout beendet die Sitzung', async () => {
    await c.call('POST', '/api/admin/logout', {});
    assert.equal((await c.call('GET', '/api/admin/orders')).status, 401);
  });
});

describe('ohne konfiguriertes Passwort', () => {
  let srv;
  before(async () => (srv = await startServer({ configured: false })));
  after(() => srv.close());

  test('Admin bleibt gesperrt', async () => {
    const c = client(srv.base);
    assert.equal((await c.call('GET', '/api/admin/session')).data.configured, false);
    assert.equal((await c.call('POST', '/api/admin/login', { password: '' })).status, 503);
    assert.equal((await c.call('GET', '/api/admin/orders')).status, 401);
  });
});
