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

/**
 * Liest die Admin-Zugangsdaten aus der Umgebung – bewusst fehlertolerant, weil sie meist per Hand
 * im Dashboard des Hosters eingetragen werden:
 *  - Leerzeichen/Zeilenumbrüche am Anfang oder Ende werden entfernt.
 *  - Steht in ADMIN_PASSWORD_HASH kein gültiger Hash (beginnt nicht mit „scrypt:“), wird der Wert
 *    wie ein normales Passwort behandelt – mit Warnung im Protokoll.
 * Das Passwort selbst wird nie protokolliert.
 */
export function resolveAdminCredentials(env) {
  const hash = String(env.ADMIN_PASSWORD_HASH || '').trim();
  const plain = String(env.ADMIN_PASSWORD || '').trim();
  const validHash = /^scrypt:[0-9a-f]+:[0-9a-f]+$/i.test(hash);

  if (validHash) {
    if (plain) console.warn('[auth] ADMIN_PASSWORD wird ignoriert, weil ADMIN_PASSWORD_HASH gesetzt ist.');
    return { passwordHash: hash, password: '', mode: 'Hash aus ADMIN_PASSWORD_HASH' };
  }
  if (plain) {
    if (hash) console.warn('[auth] ADMIN_PASSWORD_HASH enthält keinen gültigen Hash und wird ignoriert – es gilt ADMIN_PASSWORD.');
    return { passwordHash: '', password: plain, mode: 'Passwort aus ADMIN_PASSWORD' };
  }
  if (hash) {
    console.warn(
      '[auth] ADMIN_PASSWORD_HASH enthält keinen Hash (muss mit „scrypt:“ beginnen). Der Wert wird als normales Passwort verwendet. Besser: `npm run admin:hash` oder die Variable ADMIN_PASSWORD nutzen.',
    );
    return { passwordHash: '', password: hash, mode: 'Passwort aus ADMIN_PASSWORD_HASH' };
  }
  return { passwordHash: '', password: '', mode: '' };
}

export function createAppApi(env = process.env, { production = false } = {}) {
  const { passwordHash, password, mode } = resolveAdminCredentials(env);
  const auth = createAuth({ passwordHash, password });
  if (auth.configured) console.info(`[auth] Admin-Login aktiv (${mode}).`);
  else console.warn('[auth] Kein Admin-Passwort gesetzt – der Admin-Bereich bleibt gesperrt. Siehe .env.example.');
  if (production && !passwordHash && password) {
    console.warn('[auth] Hinweis: Für den Produktivbetrieb wird ADMIN_PASSWORD_HASH (`npm run admin:hash`) empfohlen.');
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
