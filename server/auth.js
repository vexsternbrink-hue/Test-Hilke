/**
 * Admin-Anmeldung – vollständig serverseitig.
 *
 *  - Das Passwort steht NIRGENDS im Code und nicht im Frontend-Bundle. Der Server liest
 *    ADMIN_PASSWORD_HASH (empfohlen, erzeugt mit `npm run admin:hash`) aus der Umgebung.
 *    Nur für die lokale Entwicklung ist alternativ ADMIN_PASSWORD (Klartext in .env) erlaubt.
 *  - Ist keines von beiden gesetzt, ist der Admin-Bereich gesperrt (Login liefert 503).
 *  - Nach erfolgreichem Login gibt es ein zufälliges Sitzungs-Token im HttpOnly-Cookie
 *    (für JavaScript nicht lesbar, SameSite=Strict gegen CSRF, Secure in Produktion).
 *  - Fehlversuche werden pro IP begrenzt (Brute-Force-Schutz).
 *
 * Sitzungen liegen im Arbeitsspeicher: nach einem Server-Neustart muss man sich neu anmelden.
 * Bei mehreren Server-Instanzen die Sitzungen in die Datenbank / Redis auslagern.
 */
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64 };
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const MAX_FAILURES = 5;
const LOCK_MS = 15 * 60 * 1000;

/**
 * Erzeugt einen Hash im Format scrypt:<salt-hex>:<hash-hex> (für ADMIN_PASSWORD_HASH).
 * Bewusst ohne „$“, weil Vite/dotenv „$…“ in .env-Dateien als Variable auflösen würde.
 */
export function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, SCRYPT.keylen, { N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p });
  return `scrypt:${salt.toString('hex')}:${hash.toString('hex')}`;
}

function verifyHash(password, stored) {
  const [algo, saltHex, hashHex] = String(stored).trim().split(':');
  if (algo !== 'scrypt' || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length, {
    N: SCRYPT.N,
    r: SCRYPT.r,
    p: SCRYPT.p,
  });
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function verifyPlain(password, expectedPlain) {
  // Gleich lange Digests vergleichen – kein Zeitunterschied je nach Passwortlänge.
  const a = createHash('sha256').update(password).digest();
  const b = createHash('sha256').update(expectedPlain).digest();
  return timingSafeEqual(a, b);
}

export function createAuth({ passwordHash = '', password = '', now = () => Date.now() } = {}) {
  const sessions = new Map(); // token → Ablaufzeit
  const failures = new Map(); // ip → { count, until }
  const configured = Boolean(passwordHash || password);

  function prune() {
    const t = now();
    for (const [k, exp] of sessions) if (exp <= t) sessions.delete(k);
    for (const [k, f] of failures) if (f.until && f.until <= t) failures.delete(k);
  }

  return {
    configured,

    /** Sekunden bis zur Entsperrung, oder 0 wenn Login erlaubt ist. */
    lockedFor(ip) {
      const f = failures.get(ip);
      if (!f?.until) return 0;
      const rest = f.until - now();
      return rest > 0 ? Math.ceil(rest / 1000) : 0;
    },

    verify(ip, candidate) {
      if (!configured || typeof candidate !== 'string' || candidate.length === 0 || candidate.length > 200) {
        this.recordFailure(ip);
        return false;
      }
      const ok = passwordHash ? verifyHash(candidate, passwordHash) : verifyPlain(candidate, password);
      if (ok) failures.delete(ip);
      else this.recordFailure(ip);
      return ok;
    },

    recordFailure(ip) {
      const f = failures.get(ip) ?? { count: 0, until: 0 };
      f.count += 1;
      if (f.count >= MAX_FAILURES) {
        f.until = now() + LOCK_MS;
        f.count = 0;
      }
      failures.set(ip, f);
    },

    createSession() {
      prune();
      const token = randomBytes(32).toString('base64url');
      sessions.set(token, now() + SESSION_TTL_MS);
      return token;
    },

    isValid(token) {
      if (!token) return false;
      const exp = sessions.get(token);
      if (!exp) return false;
      if (exp <= now()) {
        sessions.delete(token);
        return false;
      }
      return true;
    },

    destroy(token) {
      sessions.delete(token);
    },
  };
}
