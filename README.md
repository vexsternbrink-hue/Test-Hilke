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

- **React 19 + Three.js + Framer Motion** als vorkompiliertes Bundle (`<script type="module">`), mit wenigen gezielten Korrekturen:
  - Hero kürzer (340vh statt 420vh), der textlose Kameraflug ist gerafft, am Ende kein leerer, cremefarbener Bildschirm mehr.
  - Team-Allee kürzer (42vh statt 72vh pro Person).
  - 3D-Szenen werden weit außerhalb des Bildschirms freigegeben und beim Zurückscrollen neu aufgebaut. Verliert ein Handy den WebGL-Kontext, wird die Szene neu aufgebaut; klappt das wiederholt nicht, erscheint eine Apfel-Grafik statt einer weißen Fläche.
- **Erweiterungsschicht** in zwei markierten Blöcken:
  - `<style id="tb-enhance-css">` – Styles für Sorten, Apfel-Finder, Saison, Fragen, Menü und Hilfsknöpfe.
  - `<script id="tb-enhance">` – Einblend-Animationen, Zähler, Apfel-Finder, klickbarer Saisonkalender, Akkordeon, mobiles Vollbild-Menü, „Team überspringen“, Nach-oben-Button, Teilen, Hinweis-Etiketten über den 3D-Szenen.
  - Die neuen Sektionen liegen als `<template id="tb-sections">` im Markup und werden nach dem Laden der 3D-Sektionen an ihre Position gesetzt.
- Gescrollt wird nativ vom Browser (keine Smooth-Scroll-Bibliothek) – das bleibt auch flüssig, wenn die 3D-Szenen viel Rechenzeit brauchen.
- `prefers-reduced-motion` wird respektiert: Neigungseffekte und Einblendungen entfallen.
- Ohne JavaScript zeigt ein `<noscript>`-Block Adresse, Telefon und Standort.

## Lokal ansehen

Die Datei einfach im Browser öffnen oder mit einem beliebigen statischen Server ausliefern, z. B.:

```bash
python3 -m http.server 8080
```

Dann `http://localhost:8080/` aufrufen.
