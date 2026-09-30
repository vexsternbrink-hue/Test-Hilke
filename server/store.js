/**
 * Datenspeicher: eine JSON-Datei (Standard: server/data/db.json, per DATA_DIR änderbar).
 *
 * Für einen Marktstand mit überschaubaren Datenmengen reicht das und braucht keine
 * zusätzliche Software. Die Datei ist in .gitignore eingetragen – Kundendaten landen nie in Git.
 *
 * ── Umstieg auf eine echte Datenbank ────────────────────────────────────────────────
 * Die API (server/api.js) greift ausschließlich über `store.read()` und `store.update(fn)`
 * auf Daten zu. Für PostgreSQL/SQLite/Supabase genügt es, diese Datei zu ersetzen.
 * Passende Tabellen (Felder = Objekt-Felder unten):
 *
 *   settings  (key text primary key, value jsonb)                 – ein Datensatz „site“
 *   products  (id text pk, name, category, description, origin, price, season,
 *              available bool, badge, image, art, sort int, created_at, updated_at)
 *   notices   (id text pk, title, body, highlighted bool, active bool,
 *              publish_at date null, expires_at date null, created_at, updated_at)
 *   orders    (id uuid pk, ref text unique, status text, first_name, last_name, email, phone,
 *              pickup_date date, pickup_time text, message, admin_note, consent_at timestamptz,
 *              created_at, updated_at)
 *   order_items (id serial pk, order_id uuid fk → orders.id on delete cascade,
 *              product_id text, product_name text, variety text, quantity numeric, unit text)
 * ────────────────────────────────────────────────────────────────────────────────────
 */
import { mkdirSync, readFileSync, renameSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { DEFAULT_NOTICES, DEFAULT_PRODUCTS, DEFAULT_SETTINGS } from '../shared/defaults.js';

const SCHEMA_VERSION = 1;

function seed() {
  const now = new Date().toISOString();
  return {
    version: SCHEMA_VERSION,
    settings: { ...DEFAULT_SETTINGS },
    products: DEFAULT_PRODUCTS.map((p) => ({ ...p, createdAt: now, updatedAt: now })),
    notices: DEFAULT_NOTICES.map((n) => ({ ...n, createdAt: now, updatedAt: now })),
    orders: [],
  };
}

export function createStore({ dataDir }) {
  mkdirSync(dataDir, { recursive: true });
  const file = join(dataDir, 'db.json');

  let db;
  if (existsSync(file)) {
    db = JSON.parse(readFileSync(file, 'utf8'));
    // Neue Einstellungsfelder aus späteren Versionen mit Standardwerten ergänzen
    db.settings = { ...DEFAULT_SETTINGS, ...db.settings };
  } else {
    db = seed();
    persist();
  }

  function persist() {
    // Atomar schreiben: erst Temp-Datei, dann umbenennen – nie eine halb geschriebene db.json.
    const tmp = `${file}.${process.pid}.tmp`;
    writeFileSync(tmp, JSON.stringify(db, null, 2));
    renameSync(tmp, file);
  }

  return {
    /** Lesezugriff. Rückgabe nicht verändern – dafür `update` verwenden. */
    read() {
      return db;
    },
    /**
     * Schreibzugriff. `fn` bekommt eine Kopie, darf sie verändern und einen Rückgabewert liefern.
     * Wirft `fn`, bleibt der alte Stand erhalten. Node verarbeitet das synchron – keine Rennen.
     */
    update(fn) {
      const draft = structuredClone(db);
      const result = fn(draft);
      db = draft;
      persist();
      return result;
    },
    newId: () => randomUUID(),
  };
}
