/**
 * Baut die API aus Umgebungsvariablen zusammen – gemeinsam genutzt von
 * vite.config.js (Entwicklung) und server/index.js (Produktion).
 *
 * Umgebungsvariablen (siehe .env.example):
 *   ADMIN_PASSWORD_HASH  scrypt-Hash des Admin-Passworts (`npm run admin:hash`) – empfohlen
 *   ADMIN_PASSWORD       Klartext-Alternative, nur für lokale Entwicklung gedacht
 *   DATA_DIR             Ordner für db.json (Standard: server/data)
 *   TRUST_PROXY=1        hinter einem Reverse-Proxy (nginx, Render, Fly …) die Client-IP aus X-Forwarded-For lesen
 */
import { fileURLToPath } from 'node:url';
import { createApiHandler } from './api.js';
import { createAuth } from './auth.js';
import { createStore } from './store.js';

const DEFAULT_DATA_DIR = fileURLToPath(new URL('./data', import.meta.url));

/**
 * Wird bei jeder neuen Vorbestellung aufgerufen.
 * TODO (Produktivbetrieb): hier eine E-Mail an den Hof und optional eine Eingangsbestätigung
 * an die Kundin / den Kunden verschicken, z. B. per SMTP (nodemailer) oder einen Mail-Dienst
 * (Postmark, Brevo, Mailjet). Benötigte Variablen dann z. B. SMTP_HOST, SMTP_USER, SMTP_PASS, ORDER_MAIL_TO.
 */
function notifyNewOrder(order) {
  console.info(`[vorbestellung] ${order.ref} · ${order.firstName} ${order.lastName} · Abholung ${order.pickupDate}`);
}

export function createAppApi(env = process.env, { production = false } = {}) {
  if (production && !env.ADMIN_PASSWORD_HASH && env.ADMIN_PASSWORD) {
    console.warn('[auth] ADMIN_PASSWORD (Klartext) ist gesetzt. Für den Produktivbetrieb bitte ADMIN_PASSWORD_HASH verwenden.');
  }
  const auth = createAuth({ passwordHash: env.ADMIN_PASSWORD_HASH || '', password: env.ADMIN_PASSWORD || '' });
  if (!auth.configured) {
    console.warn('[auth] Kein Admin-Passwort gesetzt – der Admin-Bereich bleibt gesperrt. Siehe .env.example.');
  }
  const store = createStore({ dataDir: env.DATA_DIR || DEFAULT_DATA_DIR });
  return createApiHandler({
    store,
    auth,
    secureCookies: production,
    trustProxy: env.TRUST_PROXY === '1',
    onOrderCreated: notifyNewOrder,
  });
}
