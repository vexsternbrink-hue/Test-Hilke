# Biohof Tambke – Landingpage

Eine einzelne, komplett eigenständige Seite (`index.html`) für den Apfelstand des Biohofs Tambke auf dem Wochenmarkt Volksdorf. Alles – Styles, React, Three.js, Framer Motion, Lenis – liegt inline in dieser Datei; sie kann ohne Build-Schritt direkt auf jedem Webspace abgelegt werden.

## Aufbau der Seite

| Abschnitt | Inhalt |
| --- | --- |
| `#start` | 3D-Apfelbaum im Alten Land, scroll-gesteuerte Kamerafahrt, Äpfel pflücken per Klick |
| `#team` | Scroll-Allee mit Holzkisten für jedes Teammitglied |
| `#stand` | Drehbarer 3D-Marktstand mit Kisten für Äpfel, Kirschen und Zwetschen |
| `#sorten` | Fünf Apfelsorten als interaktive Karten mit Geschmacksprofil, Kennzahlen des Hofs |
| `#saison` | Saisonkalender mit Tagesmarkierung und Hinweis, was gerade am Stand liegt |
| `#danke` | Dankeschön an das Team mit Namens-Marquee |
| `#fragen` | Häufige Fragen als Akkordeon |
| `#kontakt` | Footer mit Adresse, Telefon und Links zur Hauptseite |

## Technik

- **React 19 + Three.js + Framer Motion** als vorkompiliertes Bundle (`<script type="module">`).
- **Erweiterungsschicht** in zwei markierten Blöcken, die ohne Bundle-Änderung gepflegt werden können:
  - `<style id="tb-enhance-css">` – Styles für Sorten, Saison, Fragen, Cursor, Menü und Nach-oben-Button.
  - `<script id="tb-enhance">` – Smooth Scrolling (Lenis), eigener Maus-Cursor mit Kontext-Labels, magnetische Buttons, Einblend-Animationen, Zähler, Saisonlogik, mobiles Vollbild-Menü, aktiver Navigationspunkt.
  - Die neuen Sektionen liegen als `<template id="tb-sections">` im Markup und werden nach dem Laden der 3D-Sektionen an ihre Position gesetzt.
- **Lenis 1.3.1** (MIT) liegt inline in `<script id="tb-lenis">`.
- `prefers-reduced-motion` wird respektiert: Ohne Bewegungswunsch entfallen Smooth Scrolling, Cursor, Neigungseffekte und Einblendungen.
- Ohne JavaScript zeigt ein `<noscript>`-Block Adresse, Telefon und Standort.

## Lokal ansehen

Die Datei einfach im Browser öffnen oder mit einem beliebigen statischen Server ausliefern, z. B.:

```bash
python3 -m http.server 8080
```

Dann `http://localhost:8080/` aufrufen.
