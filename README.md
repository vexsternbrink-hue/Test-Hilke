# Biohof Tambke – Dein Apfelstand auf dem Markt

3D-scrollbare Single-Page-Website für den Apfelstand des Biohofs Tambke auf dem
Wochenmarkt Volksdorf. Beim Scrollen fährt die Kamera durch eine apfelbaumgesäumte
Marktallee, in der jedes Teammitglied als schwebende Apfelkiste auftaucht.

**Stack:** React 19 · Vite 8 · Three.js · React Three Fiber + drei · Tailwind CSS 4 · Framer Motion

## Setup

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # Produktions-Build nach dist/
npm run preview    # Build lokal ansehen
```

Node 20+ wird vorausgesetzt.

## Sektionen

| Sektion | Komponente | Was passiert |
| --- | --- | --- |
| Hero | `src/components/Hero3D.jsx` + `src/three/AppleTree.jsx` | Apfelbaum wiegt sich im Wind, Äpfel reagieren auf Hover, fallende Blätter, Textanimation |
| Team-Gallery | `src/components/TeamCarousel3D.jsx` + `src/three/Crate.jsx` | Scroll-getriebene Kamerafahrt durch die Allee; pro Teammitglied eine Apfelkiste mit Portrait, Namensschild und Info-Karte |
| Marktstand | `src/components/MarketStand3D.jsx` + `src/three/MarketStall.jsx` | Interaktiver 3D-Stand (lazy geladen), klickbare Kisten für Äpfel, Kirschen, Zwetschen |
| Dankeschön | `src/components/ThankYouSection.jsx` | Pulsierendes Herz, Blätter, Botschaft ans Traumteam |
| Footer | `src/components/Footer.jsx` | Kontakt, Impressum, Datenschutz (Links zur Originalseite) |

Weitere Bausteine: `Navbar`, `LoadingScreen`, `SoundToggle` (optionale, per WebAudio
synthetisierte Marktgeräusche – standardmäßig aus).

## Inhalte pflegen

- **Team:** `src/data/team.js` – Name, Rolle, Gruppe (`familie`, `kernteam`, `markt`, `saison`), Zitat.
- **Sortiment:** `src/data/sortiment.js`.
- **Team-Fotos:** JPGs nach `public/team/<slug>.jpg` legen (quadratisch, ca. 1024 px).
  Fehlt ein Foto, erzeugt die Seite automatisch eine Platzhalter-Textur mit Initialen.
- **Footer:** Platzhalter `[MARKTTAGE & UHRZEIT]`, `[TELEFON]`, `[E-MAIL]` in `Footer.jsx` ersetzen.

## 3D-Assets

Alle Modelle werden zur Laufzeit im Code erzeugt (kein GLTF-Download nötig):

- Apfel: Lathe-Geometrie mit Stiel und Blatt (`src/three/Apple.jsx`), eine geteilte Geometrie für alle Äpfel.
- Bäume: Hero-Baum aus Stamm, Ästen und Laubkugeln; Allee-Bäume als `InstancedMesh` (3 Drawcalls für alle Bäume).
- Texturen (Portraits, Schilder, Markise) werden per Canvas 2D generiert.

Wer echte GLTF-Modelle nutzen möchte, kann sie mit `useGLTF` aus drei laden und in
`Apple.jsx` bzw. `AppleTree.jsx` einsetzen.

## Performance

- Produktions-Build ≈ 1,4 MB (Three.js/R3F, Framer Motion und App-Code als separate Chunks).
- Marktstand-Canvas wird per `React.lazy` erst geladen, wenn die Sektion gerendert wird.
- Die Hauptszene pausiert das Rendering (`frameloop="never"`), sobald Hero und Team aus dem Viewport sind.
- `AdaptiveDpr` senkt bei Lastspitzen die Auflösung, Mobile bekommt weniger Blätter und kleinere Schattenkarten.
- Responsive: eigene Kameraposition, Kistenabstand und Text-Wash für Viewports unter 768 px.

## Farben & Typografie

| Token | Wert |
| --- | --- |
| Apfelrot | `#C41E3A` |
| Blattgrün | `#4A7C23` |
| Creme | `#F8F5F0` |
| Holz | `#3E2723` |

Headlines in *Playfair Display*, Fließtext in *Inter* (Google Fonts, in `index.html` eingebunden).
Die Tokens liegen als Tailwind-Theme in `src/index.css`.

## Design-Entwurf

Die Screens (Desktop 1440 px und Mobile 390 px) liegen als Design-Canvas vor:
https://claude.ai/artifact/WbgYTY2xJZ4sZSbarqVgEc
