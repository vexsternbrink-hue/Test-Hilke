# Biohof Tambke – Landingpage

Eine einzelne, komplett eigenständige Seite (`index.html`) für den Apfelstand des Biohofs Tambke auf dem Wochenmarkt Volksdorf. Alles – Styles, React, Three.js, Framer Motion – liegt inline in dieser Datei; sie kann ohne Build-Schritt direkt auf jedem Webspace abgelegt werden.

## Aufbau der Seite

| Abschnitt | Inhalt |
| --- | --- |
| `#start` | 3D-Apfelbaum im Alten Land, scroll-gesteuerte Kamerafahrt mit den Kapiteln „Frisch“, „Fair“, „Familiär“, Äpfel pflücken per Klick |
| `#team` | Scroll-Allee mit Holzkisten für jedes Teammitglied, Knopf „Team überspringen“ |
| `#stand` | Drehbarer 3D-Marktstand mit Kisten für Äpfel, Kirschen und Zwetschen |
| `#sorten` | „Viele Sorten – alle aus eigenem Anbau“: Kennzahlen, eine Auswahl an Lieblingssorten als Karten, Apfel-Finder |
| `#saison` | Saisonkalender mit Tagesmarkierung; jeder Monat ist anklickbar und zeigt, was dann reif ist |
| `#danke` | Dankeschön an das Team mit Namens-Marquee |
| `#fragen` | Häufige Fragen als Akkordeon, „Route planen“ und „Seite teilen“ |
| `#kontakt` | Footer mit Adresse, Telefon und Links zur Hauptseite |

## Technik

Alles steckt in **einer Datei** (`index.html`). Zum Anpassen genügen drei markierte Blöcke darin:

| Block | Inhalt |
| --- | --- |
| `<style id="tb-enhance-css">` | Alle zusätzlichen Styles: Bewegungs-Variablen, Karten, Finder, Kalender, Fragen, Cursor, Menü |
| `<template id="tb-sections">` (und `tb-menu-tpl`) | Markup der neuen Sektionen und des mobilen Menüs |
| `<script id="tb-enhance">` | Feder-Physik, Cursor, Einblendungen, Finder, Kalender, Akkordeon, Menü |

Das vorkompilierte Bundle (`<script type="module">`: React 19, Three.js, Framer Motion) wurde nur an wenigen Stellen gezielt verändert (Easing-Kurve, Einblende-Bauteil, Hero-Buchstaben, Laufzeit der Hero-/Team-Sektion, 3D-Speicherverwaltung).

### Bewegung

- **Eine Easing-Kurve für alles:** `cubic-bezier(.16, 1, .3, 1)` – in CSS (`--tb-ease`) und für alle Framer-Motion-Animationen der App.
- **Einblenden beim Scrollen:** `translateY(30px) scale(.98) blur(10px)` → scharf und in Position; gestaffelt über `--d`. Auf Touch-Geräten mit kleinerem Radius (5 px), große Flächen bleiben ohne Unschärfe.
- **Hero-Auftritt:** Erst wenn der Preloader die Seite freigibt, fächern die Titel-Buchstaben auf, danach folgen die Wörter des Untertitels und die untere Zeile. Die scroll-gesteuerte Zerstreuung der App bleibt unverändert.
- **Überschriften** der neuen Sektionen erscheinen Wort für Wort (Screenreader lesen den unveränderten Text).
- **Akkordeon:** Die Höhe animiert per CSS Grid (`0fr` → `1fr`), bedienbar mit Maus, Touch und Pfeiltasten.
- **Fortschrittsleiste** am oberen Rand: die Framer-Motion-Leiste der App, mit Verlauf und Glow.

### Interaktion (Maus)

- **Feder-Physik:** Ein gemeinsamer Animationstakt, der nur läuft, solange sich etwas bewegt (im Leerlauf 0 Frames).
- **Eigener Cursor** folgt per Feder, wächst über Klickbarem, zeigt über den 3D-Szenen „Pflücken“, „Ansehen“, „Drehen“.
- **Magnetische Buttons:** Buttons ziehen sich in Reichweite leicht zum Zeiger und federn zurück.
- **Karten:** 3D-Tilt, Spotlight und leuchtender Rand folgen dem Zeiger.
- **Touch:** Statt Hover gibt es einen Druck-Effekt mit Spotlight am Fingerabdruck; Scrollen wird nie blockiert.

### Performance und Barrierefreiheit

- Gescrollt wird nativ vom Browser (keine Smooth-Scroll-Bibliothek).
- Frosted-Glass-Look auf großen Flächen über Verläufe, Glanzkanten und Schatten statt `backdrop-filter` (der halbierte im Test die Bildrate); echte Hintergrund-Unschärfe nur auf kleinen Elementen.
- 3D-Szenen werden weit außerhalb des Bildschirms freigegeben und beim Zurückscrollen neu aufgebaut; bei Verlust des WebGL-Kontexts wird neu aufgebaut, notfalls erscheint eine Apfel-Grafik.
- `prefers-reduced-motion`: kein Hero-Auftritt, kein Cursor, kein Tilt/Magnet, keine Einblende-Animationen – alle Inhalte sofort sichtbar.
- Ohne JavaScript zeigt ein `<noscript>`-Block Adresse, Telefon und Standort.

## Lokal ansehen

Die Datei einfach im Browser öffnen oder mit einem beliebigen statischen Server ausliefern, z. B.:

```bash
python3 -m http.server 8080
```

Dann `http://localhost:8080/` aufrufen.
