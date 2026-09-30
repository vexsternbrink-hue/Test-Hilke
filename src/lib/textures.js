import * as THREE from 'three';
import { initials } from '../data/team';

const cache = new Map();

const FONTS = ['600 100px "Playfair Display"', '500 40px Inter'];
let fontsLoaded = null;
/** Lädt die Webfonts explizit – `document.fonts.ready` allein reicht nicht, weil Canvas-Text sie nicht anfordert. */
function loadFonts() {
  if (!fontsLoaded) {
    fontsLoaded = document.fonts?.load
      ? Promise.all(FONTS.map((f) => document.fonts.load(f))).catch(() => {})
      : Promise.resolve();
  }
  return fontsLoaded;
}

/**
 * Erzeugt eine gecachte Canvas-Textur. `draw(ctx)` wird sofort und noch einmal
 * nach dem Laden der Webfonts ausgeführt – sonst zeigen die Schilder je nach Ladezeit
 * mal Playfair/Inter, mal die Fallback-Schrift (und falsch berechnete Textbreiten).
 */
function canvasTexture(key, width, height, draw) {
  if (cache.has(key)) return cache.get(key);
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  const ctx = c.getContext('2d');
  draw(ctx);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  cache.set(key, tex);
  loadFonts().then(() => {
    ctx.clearRect(0, 0, width, height);
    draw(ctx);
    tex.needsUpdate = true;
  });
  return tex;
}

/** Platzhalter-Portrait: Initialen auf Creme, Akzentring in Gruppenfarbe. */
export function makePortraitTexture(member, color = '#C41E3A') {
  const size = 512;
  return canvasTexture(`portrait:${member.slug}`, size, size, (ctx) => {
    ctx.fillStyle = '#EFE7DA';
    ctx.fillRect(0, 0, size, size);
    // sanfter Lichtkreis
    const g = ctx.createRadialGradient(size * 0.5, size * 0.42, 40, size * 0.5, size * 0.5, size * 0.75);
    g.addColorStop(0, '#F8F5F0');
    g.addColorStop(1, '#E2D8C8');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    // Ring
    ctx.beginPath();
    ctx.arc(size / 2, size / 2 - 20, 150, 0, Math.PI * 2);
    ctx.lineWidth = 10;
    ctx.strokeStyle = color;
    ctx.stroke();
    // Initialen
    ctx.fillStyle = '#3E2723';
    ctx.font = '600 150px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials(member.name), size / 2, size / 2 - 20);
    ctx.font = '500 26px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#6B5A52';
    ctx.fillText('FOTO-PLATZHALTER', size / 2, size - 56);
  });
}

/** Holzschild mit Name + Rolle (Label auf der Apfelkiste). */
export function makeLabelTexture(name, role) {
  const w = 1024;
  const h = 384;
  return canvasTexture(`label:${name}:${role}`, w, h, (ctx) => {
    ctx.fillStyle = '#F8F5F0';
    ctx.fillRect(0, 0, w, h);
    // Papierkante
    ctx.strokeStyle = '#C41E3A';
    ctx.lineWidth = 8;
    ctx.strokeRect(16, 16, w - 32, h - 32);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#3E2723';
    let fontSize = 92;
    ctx.font = `600 ${fontSize}px "Playfair Display", Georgia, serif`;
    while (ctx.measureText(name).width > w - 120 && fontSize > 40) {
      fontSize -= 4;
      ctx.font = `600 ${fontSize}px "Playfair Display", Georgia, serif`;
    }
    ctx.fillText(name, w / 2, h / 2 - 44);
    ctx.fillStyle = '#4A7C23';
    let roleSize = 40;
    ctx.font = `500 ${roleSize}px Inter, system-ui, sans-serif`;
    while (ctx.measureText(role).width > w - 120 && roleSize > 22) {
      roleSize -= 2;
      ctx.font = `500 ${roleSize}px Inter, system-ui, sans-serif`;
    }
    ctx.fillText(role, w / 2, h / 2 + 56);
  });
}

/** Rot-cremefarbene Markisenstreifen. */
export function makeStripeTexture() {
  const tex = canvasTexture('stripes', 512, 64, (ctx) => {
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i % 2 ? '#C41E3A' : '#F8F5F0';
      ctx.fillRect(i * 64, 0, 64, 64);
    }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 1);
  return tex;
}

/** Schriftzug „Biohof Tambke“ für die Standrückwand. */
export function makeSignTexture(text = 'Biohof Tambke', sub = 'Wochenmarkt Volksdorf') {
  return canvasTexture(`sign:${text}:${sub}`, 1024, 320, (ctx) => {
    ctx.fillStyle = '#3E2723';
    ctx.fillRect(0, 0, 1024, 320);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#F8F5F0';
    ctx.font = '600 110px "Playfair Display", Georgia, serif';
    ctx.fillText(text, 512, 130);
    ctx.fillStyle = '#E8A5B0';
    ctx.font = '500 40px Inter, system-ui, sans-serif';
    ctx.fillText(sub.toUpperCase(), 512, 240);
  });
}

/** Versucht, /team/<slug>.jpg zu laden; fällt sonst auf den Platzhalter zurück. */
export function loadPortrait(member, color, onLoaded) {
  const url = `${import.meta.env.BASE_URL}team/${member.slug}.jpg`;
  const loader = new THREE.TextureLoader();
  loader.load(
    url,
    (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      onLoaded(tex);
    },
    undefined,
    () => onLoaded(makePortraitTexture(member, color)),
  );
}
