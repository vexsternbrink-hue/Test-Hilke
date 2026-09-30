# Biohof Tambke – Website für den Marktstand

Website für den Apfelstand des Biohofs Tambke auf dem Wochenmarkt Volksdorf:
Schwarzes Brett für aktuelle Hinweise, Sortiment, Online-Vorbestellung zur Abholung am Stand,
Infos zu Standort, Zeiten und Kartenzahlung sowie ein passwortgeschützter Admin-Bereich.

**Stack:** React 19 · Vite 8 · Tailwind CSS 4 · kleine Node-API ohne Zusatzpakete (`server/`)

## Schnellstart

```bash
npm install
cp .env.example .env          # dann ADMIN_PASSWORD_HASH setzen (siehe unten)
npm run admin:hash            # erzeugt den Hash für das Admin-Passwort
npm run dev                   # Website + API: http://localhost:5173
```

| Befehl | Zweck |
| --- | --- |
| `npm run dev` | Entwicklung – Vite mit eingebundener API |
| `npm run build` | Produktions-Build nach `dist/` |
| `npm start` | Produktionsserver (liefert `dist/` + API, Port `PORT` oder 3000) |
| `npm run lint` | ESLint |
| `npm test` | API-, Login- und Validierungstests (`node --test`) |
| `npm run admin:hash` | Hash für `ADMIN_PASSWORD_HASH` erzeugen |

Node ≥ 20.12 wird vorausgesetzt.

## Aufbau

```
shared/            Gemeinsam für Browser und Server
  defaults.js      Startinhalte (Produkte, Meldungen, Team, Standort) – nur Fakten der alten Seite
  validation.js    Eingabeprüfung (Vorbestellung, Meldungen, Produkte, Einstellungen)
  dates.js         Datumslogik (Europe/Berlin), Sichtbarkeit von Meldungen
server/
  api.js           REST-API (Routen siehe Kopfkommentar)
  auth.js          Admin-Login: scrypt-Hash, HttpOnly-Session-Cookie, Sperre nach Fehlversuchen
  store.js         Datenspeicher (JSON-Datei) – Anleitung für echte Datenbank im Kopfkommentar
  app.js           Verdrahtung aus Umgebungsvariablen + Hook für E-Mail-Benachrichtigung
  index.js         Produktionsserver mit Sicherheits-Headern (CSP u. a.)
src/
  PublicSite.jsx   Startseite (Reihenfolge der Abschnitte)
  sections/        Hero, Vorteile, Schwarzes Brett, Produkte, Vorbestellen, Über uns, Standort, Kontakt
  components/      Navigation, Schwarzes-Brett-Leiste, Footer, Illustrationen, Icons
  admin/           Login, Dashboard, Vorbestellungen, Meldungen, Produkte, Standort & Zeiten
test/              node:test-Tests
```

Der Admin-Bereich ist unter `/#/admin` erreichbar (Schloss-Symbol in der Navigation und „Admin“ im Footer).

## Inhalte pflegen

Alles Tagesaktuelle wird im Admin-Bereich gepflegt – ohne Code:

- **Schwarzes Brett:** Meldungen anlegen, bearbeiten, löschen, (de)aktivieren, „wichtig“ markieren,
  Veröffentlichungs- und Ablaufdatum setzen. Wichtige Meldungen stehen zuerst und erscheinen im Startbereich.
- **Produkte:** anlegen, bearbeiten, entfernen, „jetzt erhältlich“ umschalten (steuert auch das Vorbestellformular),
  Preis-Hinweis, Etikett (Beliebt / Neu / Nur solange der Vorrat reicht), Foto-URL.
- **Vorbestellungen:** nach Abholtag und Status filtern, suchen, Status (neu / bestätigt / abgeholt / storniert)
  setzen, interne Notiz, Packliste mit Summen je Produkt.
- **Standort & Zeiten:** Adresse, Standplatz, Markttage mit Uhrzeit, erlaubte Abholtage, Vorlauf, Telefon, E-Mail,
  Foto für den Startbereich.

### Noch einzutragen (auf der Website als gelber „Platzhalter“ markiert)

Diese Angaben waren auf der bisherigen Website nicht vorhanden und wurden bewusst **nicht erfunden**:

- Adresse des Marktplatzes und genauer Standplatz
- Markttage und Uhrzeiten (und passende „Abholung möglich an“-Wochentage)
- Telefonnummer und E-Mail-Adresse
- Preise und konkrete Apfelsorten (als eigene Produkte oder in der Beschreibung)

### Bilder

Im Projekt gab es keine Fotos. Statt unpassender Stockbilder zeigt die Seite gestochen scharfe
**Vektor-Illustrationen** (Marktstand, Äpfel, Kirschen, Zwetschen), klar als Platzhalter gekennzeichnet.
Echte Fotos: Datei nach `public/images/` legen (JPG/WebP, Produktfotos ca. 1200×900 px, Startbild mind. 1600 px breit)
und den Pfad (z. B. `/images/aepfel.jpg`) im Admin-Bereich beim Produkt bzw. unter „Standort & Zeiten“ eintragen.

## Produktivbetrieb

### Umgebungsvariablen

| Variable | Pflicht | Beschreibung |
| --- | --- | --- |
| `ADMIN_PASSWORD_HASH` | ja | scrypt-Hash des Admin-Passworts (`npm run admin:hash`). Ohne ihn bleibt der Admin-Bereich gesperrt. |
| `ADMIN_PASSWORD` | – | Nur lokal: Klartext-Alternative zum Hash |
| `DATA_DIR` | empfohlen | Persistenter Ordner für `db.json` (muss Deployments überdauern) |
| `PORT` | – | Port des Servers (Standard 3000) |
| `TRUST_PROXY` | hinter Proxy | `1`, damit die Login-Sperre die echte Client-IP nutzt |

Das Passwort steht weder im Code noch im Frontend-Bundle; `.env` und `server/data/` sind in `.gitignore`.
HTTPS bitte über den Hoster oder einen Reverse-Proxy bereitstellen – das Session-Cookie ist in Produktion `Secure`.

**Hosting:** Die Seite braucht einen Node-Server (`npm run build && npm start`), z. B. ein kleiner VPS, Render,
Railway oder Fly.io mit persistentem Volume für `DATA_DIR`. Reines Static-Hosting (z. B. GitHub Pages) zeigt nur
die Standardinhalte – Vorbestellung und Admin funktionieren dort nicht.

### Noch anzuschließen

- **E-Mail-Benachrichtigung** bei neuen Vorbestellungen (an den Hof, optional Eingangsbestätigung an Kund:innen):
  Hook `notifyNewOrder` in `server/app.js` – z. B. per SMTP (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `ORDER_MAIL_TO`).
  Bis dahin erscheinen Vorbestellungen nur im Admin-Bereich.
- **Datenbank (optional):** Für mehrere Server-Instanzen oder größere Datenmengen `server/store.js` durch eine
  Datenbank ersetzen. Tabellen: `settings`, `products`, `notices`, `orders`, `order_items` (Felder im Kopfkommentar).
  Sessions dann ebenfalls zentral speichern (DB/Redis).
- **Datenschutzerklärung** auf biohof-tambke.de um das Vorbestellformular ergänzen (Zweck, Speicherdauer, Löschung).
  Erledigte Vorbestellungen können im Admin-Bereich gelöscht werden.
- **Zahlungen:** Es gibt bewusst keine Online-Zahlung – bezahlt wird bei Abholung am Stand.

## API

| Methode & Pfad | Zugriff | Zweck |
| --- | --- | --- |
| `GET /api/public` | öffentlich | sichtbare Meldungen, Produkte, Standort/Zeiten |
| `POST /api/orders` | öffentlich | Vorbestellung (Anfrage) – validiert, Honeypot + Rate-Limit |
| `GET /api/admin/session` | öffentlich | `{ configured, authenticated }` |
| `POST /api/admin/login` · `/logout` | öffentlich | Anmeldung (Sperre nach 5 Fehlversuchen für 15 min) |
| `GET/POST /api/admin/notices`, `PUT/DELETE /api/admin/notices/:id` | Admin | Schwarzes Brett |
| `GET/POST /api/admin/products`, `PUT/DELETE /api/admin/products/:id` | Admin | Produkte |
| `GET /api/admin/orders?status=&from=&to=`, `PATCH/DELETE /api/admin/orders/:id` | Admin | Vorbestellungen |
| `GET/PUT /api/admin/settings` | Admin | Standort, Zeiten, Kontakt |

Schreibende Admin-Aufrufe verlangen zusätzlich den Header `X-Requested-With: fetch` (CSRF-Schutz neben `SameSite=Strict`).

## Design

| Token | Wert | Einsatz |
| --- | --- | --- |
| Papier | `#FBF7EF` | Hintergrund |
| Waldgrün | `#1E4A34` | Hauptfarbe, Navigation, Buttons |
| Apfelrot | `#B42E26` | Handlungsaufforderungen („Jetzt vorbestellen“) |
| Honig | `#E8A83A` | Akzente, wichtige Hinweise |
| Schiefer | `#1D2923` | Schwarzes Brett, Footer |

Schriften: *Fraunces* (Überschriften) und *Manrope* (Text), lokal über `@fontsource` eingebunden – keine
Verbindung zu Google-Servern. Animationen nur über `opacity`/`transform` (Einblenden per IntersectionObserver,
Parallax per CSS-Scroll-Timeline); bei `prefers-reduced-motion` ist alles statisch.

## Aufräumen: alter 3D-Flow

Der frühere 3D-Flow (Three.js-Szenen) ist nicht mehr eingebunden. Die alten Dateien liegen noch im Repository
und können gelöscht werden, zusammen mit den nicht mehr benötigten Paketen:

```bash
git rm -r src/three src/data \
  src/lib/textures.js src/lib/random.js src/lib/scroll.js src/lib/cursor.js \
  src/components/{Hero3D,TeamCarousel3D,MarketStand3D,MarketCanvas,ThankYouSection,LoadingScreen,SoundToggle}.jsx \
  public/team
npm uninstall three @react-three/fiber @react-three/drei framer-motion
```

Danach in `eslint.config.js` die Ignore-Einträge des alten 3D-Codes und in `vite.config.js` die `manualChunks`-Regeln entfernen.
