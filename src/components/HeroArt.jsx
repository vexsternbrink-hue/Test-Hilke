import { useId, useMemo } from 'react';

/**
 * Illustrierter Marktstand für den Startbereich (Platzhalter, bis ein echtes Foto vorliegt –
 * im Admin-Bereich unter „Standort & Zeiten → Foto für den Startbereich“ eintragen).
 * Die Ebenen bewegen sich per CSS-Scroll-Timeline leicht gegeneinander (Parallax).
 */

function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Apfelhaufen über einer Kiste: hintere Reihen zuerst zeichnen. */
function heap(cx, top, width, r, seed) {
  const rand = seeded(seed);
  const step = r * 1.85;
  const base = Math.floor(width / step);
  const rows = [
    { y: top - r * 0.15, n: base },
    { y: top - r * 1.2, n: base - 1 },
    { y: top - r * 2.15, n: Math.max(1, base - 3) },
  ];
  const out = [];
  rows.forEach((row) => {
    const span = (row.n - 1) * step;
    for (let i = 0; i < row.n; i++) {
      out.push({
        x: cx - span / 2 + i * step + (rand() - 0.5) * r * 0.3,
        y: row.y + (rand() - 0.5) * r * 0.25,
        r: r * (0.93 + rand() * 0.12),
        tilt: (rand() - 0.5) * 50,
      });
    }
  });
  return out.sort((a, b) => a.y - b.y);
}

function AppleDot({ a, fill }) {
  const { x, y, r, tilt } = a;
  return (
    <g transform={`rotate(${tilt} ${x} ${y})`}>
      <ellipse cx={x} cy={y} rx={r * 1.04} ry={r * 0.96} fill={fill} />
      <ellipse cx={x - r * 0.38} cy={y - r * 0.38} rx={r * 0.26} ry={r * 0.16} fill="#fff" opacity=".35" transform={`rotate(-35 ${x - r * 0.38} ${y - r * 0.38})`} />
      <path d={`M${x} ${y - r * 0.72}q${r * 0.08} ${-r * 0.3} ${r * 0.28} ${-r * 0.44}`} stroke="#4A2E1A" strokeWidth={r * 0.11} strokeLinecap="round" fill="none" />
    </g>
  );
}

function Crate({ x, top, w, h, id, apples, fill }) {
  const slat = (h - 8) / 3;
  return (
    <g>
      {/* Innenraum */}
      <rect x={x + 4} y={top - 6} width={w - 8} height={16} rx="3" fill="#5C3A20" />
      {apples.map((a, i) => (
        <AppleDot key={i} a={a} fill={fill} />
      ))}
      {/* Frontlatten */}
      {[0, 1, 2].map((i) => (
        <rect key={i} x={x} y={top + i * (slat + 4)} width={w} height={slat} rx="3" fill={`url(#${id}-wood)`} />
      ))}
      <rect x={x} y={top} width="9" height={h} rx="2" fill="#8A5A33" />
      <rect x={x + w - 9} y={top} width="9" height={h} rx="2" fill="#8A5A33" />
      <path d={`M${x + 14} ${top + slat / 2}h${w - 28}`} stroke="#fff" strokeOpacity=".12" strokeWidth="2" />
    </g>
  );
}

export default function HeroArt({ className = '' }) {
  const id = useId().replace(/:/g, '');
  const crates = useMemo(
    () => [
      { x: 88, tone: 'red', apples: heap(88 + 75, 330, 150, 17, 7) },
      { x: 245, tone: 'green', apples: heap(245 + 75, 330, 150, 17, 21) },
      { x: 402, tone: 'blush', apples: heap(402 + 75, 330, 150, 17, 42) },
    ],
    [],
  );
  const stripes = Array.from({ length: 10 }, (_, i) => 40 + i * 56);

  return (
    <svg viewBox="0 0 640 600" className={className} role="img" aria-label="Illustration: Marktstand mit Kisten voller Äpfel unter einer grün gestreiften Markise">
      <defs>
        <radialGradient id={`${id}-red`} cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#F4785F" />
          <stop offset=".45" stopColor="#D23A2F" />
          <stop offset="1" stopColor="#931D18" />
        </radialGradient>
        <radialGradient id={`${id}-green`} cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#E6EE9A" />
          <stop offset=".5" stopColor="#A9C24B" />
          <stop offset="1" stopColor="#5F7F24" />
        </radialGradient>
        <radialGradient id={`${id}-blush`} cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#F9D76B" />
          <stop offset=".5" stopColor="#E7873B" />
          <stop offset="1" stopColor="#B23A24" />
        </radialGradient>
        <linearGradient id={`${id}-wood`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D3A26C" />
          <stop offset="1" stopColor="#A8743F" />
        </linearGradient>
        <linearGradient id={`${id}-counter`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8E5E36" />
          <stop offset="1" stopColor="#6B4426" />
        </linearGradient>
        <linearGradient id={`${id}-shade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity=".18" />
          <stop offset=".6" stopColor="#000" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-leaf`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8DBA55" />
          <stop offset="1" stopColor="#3F7426" />
        </linearGradient>
        <radialGradient id={`${id}-ground`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#3B2A1A" stopOpacity=".25" />
          <stop offset="1" stopColor="#3B2A1A" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Hintergrund */}
      <g className="parallax-slow">
        <circle cx="330" cy="330" r="265" fill="#E3EAD9" />
        <circle cx="520" cy="120" r="62" fill="#F8E7C4" />
      </g>

      <ellipse cx="330" cy="545" rx="300" ry="26" fill={`url(#${id}-ground)`} />

      {/* Pfosten */}
      <rect x="62" y="96" width="14" height="440" rx="4" fill="#7A5232" />
      <rect x="564" y="96" width="14" height="440" rx="4" fill="#7A5232" />

      {/* Markise */}
      <rect x="30" y="58" width="580" height="44" rx="8" fill="#6B4426" />
      <text x="320" y="87" textAnchor="middle" fill="#FBF7EF" fontFamily="var(--font-display)" fontSize="21" fontWeight="600" letterSpacing="5">
        BIOHOF TAMBKE
      </text>
      {stripes.map((x, i) => (
        <path key={x} d={`M${x} 100h56v84a28 28 0 0 1-56 0z`} fill={i % 2 ? '#FBF7EF' : '#1E4A34'} />
      ))}
      <rect x="40" y="100" width="560" height="84" fill={`url(#${id}-shade)`} />

      {/* Theke */}
      <rect x="54" y="398" width="532" height="20" rx="5" fill="#A8743F" />
      <rect x="66" y="418" width="508" height="104" fill={`url(#${id}-counter)`} />
      {[140, 214, 288, 362, 436, 510].map((x) => (
        <path key={x} d={`M${x} 422v96`} stroke="#4E311B" strokeOpacity=".45" strokeWidth="3" />
      ))}

      {/* Kisten mit Äpfeln */}
      {crates.map((c) => (
        <Crate key={c.x} x={c.x} top={330} w={150} h={70} id={id} apples={c.apples} fill={`url(#${id}-${c.tone})`} />
      ))}

      {/* Kreidetafel-Aufsteller */}
      <g className="parallax-fast">
        <path d="M478 452l-18 110M598 452l18 110" stroke="#7A5232" strokeWidth="8" strokeLinecap="round" />
        <rect x="466" y="420" width="144" height="118" rx="10" fill="#7A5232" />
        <rect x="476" y="430" width="124" height="98" rx="6" fill="#1D2923" />
        <text x="538" y="468" textAnchor="middle" fill="#F4F1E8" fontFamily="var(--font-display)" fontStyle="italic" fontSize="25">
          Äpfel
        </text>
        <text x="538" y="496" textAnchor="middle" fill="#E8A83A" fontFamily="var(--font-display)" fontStyle="italic" fontSize="17">
          frisch vom Hof
        </text>
        <path d="M500 510c26 6 50 6 76 0" stroke="#F4F1E8" strokeOpacity=".6" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>

      {/* Lose Äpfel & Blätter im Vordergrund */}
      <g className="parallax-fast">
        <AppleDot a={{ x: 120, y: 548, r: 20, tilt: -12 }} fill={`url(#${id}-red)`} />
        <AppleDot a={{ x: 162, y: 556, r: 17, tilt: 18 }} fill={`url(#${id}-blush)`} />
        <path className="sway" d="M28 250c10-22 36-30 56-20-10 22-36 30-56 20z" fill={`url(#${id}-leaf)`} />
        <path className="sway" style={{ animationDelay: '-2s' }} d="M606 270c-6-20 6-40 26-44 6 20-6 40-26 44z" fill={`url(#${id}-leaf)`} />
      </g>
    </svg>
  );
}
