import { useId } from 'react';

/**
 * Vektor-Illustrationen für Produkte ohne Foto. Gestochen scharf auf jedem Display,
 * wenige hundert Bytes, keine erfundenen Produkt- oder Markenfotos.
 * Sobald echte Fotos vorliegen, im Admin-Bereich beim Produkt eine Bild-URL eintragen.
 */

const TINTS = {
  apple: ['#FBE3DC', '#F4C9BD'],
  cherry: ['#F9DDE2', '#EFC0C9'],
  plum: ['#E7E1F1', '#D3C8E6'],
  pear: ['#EEF2D6', '#DCE5B5'],
  basket: ['#F6EAD2', '#EBD6AE'],
  tree: ['#E8F0DA', '#D2E0BC'],
};

function Leaf({ id, d, vein, transform }) {
  return (
    <g transform={transform}>
      <path d={d} fill={`url(#${id}-leaf)`} />
      <path d={vein} stroke="#2F5A1E" strokeOpacity=".45" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Defs({ id }) {
  return (
    <defs>
      <radialGradient id={`${id}-apple`} cx="36%" cy="32%" r="78%">
        <stop offset="0" stopColor="#F4785F" />
        <stop offset=".45" stopColor="#D23A2F" />
        <stop offset="1" stopColor="#8E1C17" />
      </radialGradient>
      <radialGradient id={`${id}-blush`} cx="70%" cy="75%" r="55%">
        <stop offset="0" stopColor="#F2C14E" stopOpacity=".75" />
        <stop offset="1" stopColor="#F2C14E" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${id}-cherry`} cx="35%" cy="30%" r="80%">
        <stop offset="0" stopColor="#D5374B" />
        <stop offset=".5" stopColor="#961428" />
        <stop offset="1" stopColor="#4F0914" />
      </radialGradient>
      <radialGradient id={`${id}-plum`} cx="35%" cy="28%" r="85%">
        <stop offset="0" stopColor="#8A7BBE" />
        <stop offset=".5" stopColor="#4F3F85" />
        <stop offset="1" stopColor="#261B4A" />
      </radialGradient>
      <linearGradient id={`${id}-bloom`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#E9E4F5" stopOpacity=".55" />
        <stop offset=".6" stopColor="#E9E4F5" stopOpacity=".08" />
        <stop offset="1" stopColor="#E9E4F5" stopOpacity="0" />
      </linearGradient>
      <radialGradient id={`${id}-pear`} cx="38%" cy="40%" r="80%">
        <stop offset="0" stopColor="#EEF08A" />
        <stop offset=".55" stopColor="#B9C94A" />
        <stop offset="1" stopColor="#6F8A22" />
      </radialGradient>
      <linearGradient id={`${id}-leaf`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#8DBA55" />
        <stop offset="1" stopColor="#3F7426" />
      </linearGradient>
      <linearGradient id={`${id}-wood`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#D2A06A" />
        <stop offset="1" stopColor="#9C6A3C" />
      </linearGradient>
      <radialGradient id={`${id}-shadow`} cx="50%" cy="50%" r="50%">
        <stop offset="0" stopColor="#3B2A1A" stopOpacity=".28" />
        <stop offset="1" stopColor="#3B2A1A" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

function Apple({ id }) {
  return (
    <g>
      <ellipse cx="100" cy="172" rx="58" ry="9" fill={`url(#${id}-shadow)`} />
      <path
        d="M100 64c-15-12-50-13-62 17-11 28 3 66 24 80 12 8 24 7 38 1 14 6 26 7 38-1 21-14 35-52 24-80-12-30-47-29-62-17z"
        fill={`url(#${id}-apple)`}
      />
      <path
        d="M100 64c-15-12-50-13-62 17-11 28 3 66 24 80 12 8 24 7 38 1 14 6 26 7 38-1 21-14 35-52 24-80-12-30-47-29-62-17z"
        fill={`url(#${id}-blush)`}
      />
      <ellipse cx="68" cy="92" rx="11" ry="20" fill="#fff" opacity=".28" transform="rotate(28 68 92)" />
      <path d="M100 66c0-12 3-22 10-30" stroke="#4A2E1A" strokeWidth="5" strokeLinecap="round" fill="none" />
      <Leaf id={id} d="M108 44c10-16 30-20 44-14-8 16-28 22-44 14z" vein="M110 43c12-5 24-8 38-12" />
    </g>
  );
}

function Cherries({ id }) {
  return (
    <g>
      <ellipse cx="100" cy="174" rx="60" ry="8" fill={`url(#${id}-shadow)`} />
      <path d="M72 128C80 92 96 58 118 40M132 132c-2-34-6-66-14-92" stroke="#4E6B2A" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <Leaf id={id} d="M118 40c14-14 36-14 46-4-12 12-32 14-46 4z" vein="M120 40c14-2 28-3 40-4" />
      <circle cx="70" cy="146" r="28" fill={`url(#${id}-cherry)`} />
      <circle cx="134" cy="148" r="27" fill={`url(#${id}-cherry)`} />
      <ellipse cx="60" cy="136" rx="7" ry="11" fill="#fff" opacity=".35" transform="rotate(30 60 136)" />
      <ellipse cx="124" cy="138" rx="7" ry="11" fill="#fff" opacity=".35" transform="rotate(30 124 138)" />
      <path d="M72 120c-3 2-4 4-3 6M132 123c-3 2-4 4-3 6" stroke="#2A0710" strokeWidth="2" strokeLinecap="round" fill="none" opacity=".5" />
    </g>
  );
}

function Plums({ id }) {
  return (
    <g>
      <ellipse cx="100" cy="172" rx="62" ry="9" fill={`url(#${id}-shadow)`} />
      <g transform="rotate(-18 76 118)">
        <ellipse cx="76" cy="118" rx="34" ry="46" fill={`url(#${id}-plum)`} />
        <ellipse cx="76" cy="118" rx="34" ry="46" fill={`url(#${id}-bloom)`} />
        <path d="M79 74c6 20 6 60-2 88" stroke="#1C1238" strokeOpacity=".35" strokeWidth="2.5" fill="none" />
        <path d="M76 72c0-8 2-14 6-18" stroke="#4A2E1A" strokeWidth="4" strokeLinecap="round" fill="none" />
      </g>
      <g transform="rotate(14 132 126)">
        <ellipse cx="132" cy="126" rx="31" ry="42" fill={`url(#${id}-plum)`} />
        <ellipse cx="132" cy="126" rx="31" ry="42" fill={`url(#${id}-bloom)`} />
        <path d="M135 86c5 18 5 54-2 80" stroke="#1C1238" strokeOpacity=".35" strokeWidth="2.5" fill="none" />
      </g>
      <Leaf id={id} d="M84 56c-2-18 14-32 32-32 0 18-14 32-32 32z" vein="M86 54c8-8 16-18 26-26" />
    </g>
  );
}

function Pear({ id }) {
  return (
    <g>
      <ellipse cx="100" cy="174" rx="54" ry="8" fill={`url(#${id}-shadow)`} />
      <path
        d="M100 50c-14 0-18 16-20 30-2 16-24 30-24 56 0 26 20 38 44 38s44-12 44-38c0-26-22-40-24-56-2-14-6-30-20-30z"
        fill={`url(#${id}-pear)`}
      />
      <ellipse cx="80" cy="126" rx="8" ry="18" fill="#fff" opacity=".3" transform="rotate(15 80 126)" />
      <path d="M100 52c0-10 2-18 8-24" stroke="#4A2E1A" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      <Leaf id={id} d="M106 34c8-14 26-18 38-12-8 14-24 18-38 12z" vein="M108 33c10-4 22-7 32-10" />
    </g>
  );
}

function Basket({ id }) {
  return (
    <g>
      <ellipse cx="100" cy="176" rx="72" ry="9" fill={`url(#${id}-shadow)`} />
      <circle cx="74" cy="104" r="24" fill={`url(#${id}-apple)`} />
      <circle cx="120" cy="100" r="24" fill={`url(#${id}-pear)`} />
      <circle cx="98" cy="90" r="22" fill={`url(#${id}-apple)`} />
      <ellipse cx="140" cy="112" rx="16" ry="21" fill={`url(#${id}-plum)`} />
      <path d="M40 112h120l-12 56a8 8 0 0 1-8 6H60a8 8 0 0 1-8-6z" fill={`url(#${id}-wood)`} />
      <path d="M44 128h112M48 146h104M52 162h96" stroke="#7A4E2A" strokeWidth="3" opacity=".5" />
      <path d="M40 112h120" stroke="#7A4E2A" strokeWidth="6" strokeLinecap="round" />
    </g>
  );
}

function Tree({ id }) {
  const apples = [
    [72, 86],
    [104, 70],
    [132, 92],
    [92, 110],
    [120, 118],
    [60, 112],
  ];
  return (
    <g>
      <ellipse cx="100" cy="178" rx="64" ry="8" fill={`url(#${id}-shadow)`} />
      <path d="M94 176c4-20 4-44 0-66h14c-4 22-4 46 0 66z" fill="#7A5232" />
      <path d="M101 132c-10-8-20-10-30-8M103 124c10-8 20-10 28-8" stroke="#7A5232" strokeWidth="5" strokeLinecap="round" fill="none" />
      <circle cx="100" cy="86" r="50" fill={`url(#${id}-leaf)`} />
      <circle cx="66" cy="104" r="30" fill={`url(#${id}-leaf)`} />
      <circle cx="136" cy="104" r="30" fill={`url(#${id}-leaf)`} />
      <circle cx="84" cy="66" r="18" fill="#fff" opacity=".12" />
      {apples.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="8" fill={`url(#${id}-apple)`} />
      ))}
    </g>
  );
}

const ART = { apple: Apple, cherry: Cherries, plum: Plums, pear: Pear, basket: Basket, tree: Tree };

export default function FruitArt({ art = 'basket', className = '', title }) {
  const id = useId().replace(/:/g, '');
  const Art = ART[art] ?? Basket;
  const [a, b] = TINTS[art] ?? TINTS.basket;
  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className}`}
      style={{ background: `radial-gradient(120% 90% at 30% 20%, ${a}, ${b})` }}
    >
      <svg
        viewBox="0 0 200 200"
        className="zoom-media absolute inset-0 m-auto h-[82%] w-[82%]"
        role={title ? 'img' : undefined}
        aria-label={title}
        aria-hidden={title ? undefined : 'true'}
      >
        <Defs id={id} />
        <Art id={id} />
      </svg>
    </div>
  );
}
