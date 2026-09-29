// Inhaltliche Basis: https://biohof-tambke.de/team.html
// Gruppen: familie · kernteam · markt · saison

export const GROUPS = {
  familie: { label: 'Familie', color: '#C41E3A' },
  kernteam: { label: 'Kernteam', color: '#4A7C23' },
  markt: { label: 'Wochenmarkt-Team', color: '#3E2723' },
  saison: { label: 'Saisonkräfte', color: '#A98A72' },
};

export const TEAM = [
  {
    slug: 'hilke-tambke',
    name: 'Hilke Tambke',
    role: 'Familie · Hof & Wochenmarkt',
    group: 'familie',
    quote: 'Das Herz des Standes – jeden Markttag mit einem Lächeln.',
  },
  {
    slug: 'rolf-tambke',
    name: 'Rolf Tambke',
    role: 'Familie · Hof',
    group: 'familie',
    quote: 'Zwischen Baumreihen und Ernte – der Blick fürs Ganze.',
  },
  {
    slug: 'lea-theresa-tambke',
    name: 'Lea Theresa Tambke',
    role: 'Familie · Wochenmarkt',
    group: 'familie',
    quote: 'Aufgewachsen zwischen Apfelkisten – und heute am Stand dabei.',
  },
  {
    slug: 'janna-sophie-tambke',
    name: 'Janna Sophie Tambke',
    role: 'Familie · Wochenmarkt',
    group: 'familie',
    quote: 'Die nächste Generation am Marktstand.',
  },
  {
    slug: 'ismet',
    name: 'Ismet',
    role: 'Obstbaumschnitt · Ernte',
    group: 'kernteam',
    quote: 'Unser schnellster und fruchtschonendster Pflücker.',
  },
  {
    slug: 'mathias',
    name: 'Mathias',
    role: 'Hof & Maschinen · Erntehelfer-Anleiter · Wochenmarkt',
    group: 'kernteam',
    quote: 'Hält den Hof am Laufen – und leitet die Erntehelfer an.',
  },
  { slug: 'hilke-lueders-tambke', name: 'Hilke Lüders-Tambke', role: 'Wochenmarkt-Team', group: 'markt', quote: 'Corona-beständig und immer da.' },
  { slug: 'matthis-goetz', name: 'Matthis Götz', role: 'Wochenmarkt-Team', group: 'markt', quote: 'Kisten schleppen, Kunden beraten, gute Laune.' },
  { slug: 'angela-jaeger', name: 'Angela Jäger', role: 'Wochenmarkt-Team', group: 'markt', quote: 'Kennt jede Sorte – und jeden Stammkunden.' },
  { slug: 'finn-putz', name: 'Finn Putz', role: 'Wochenmarkt-Team', group: 'markt', quote: 'Frühaufsteher für den Marktaufbau.' },
  { slug: 'lilly-wolk', name: 'Lilly Wolk', role: 'Wochenmarkt-Team', group: 'markt', quote: 'Mit Herz am Stand.' },
  { slug: 'caspar-wolk', name: 'Caspar Wolk', role: 'Wochenmarkt-Team', group: 'markt', quote: 'Packt an, wo es nötig ist.' },
  { slug: 'frauke-quast', name: 'Frauke Quast', role: 'Wochenmarkt-Team', group: 'markt', quote: 'Ruhe und Überblick, auch wenn es voll wird.' },
  { slug: 'michaela-mumm', name: 'Michaela Mumm', role: 'Wochenmarkt-Team', group: 'markt', quote: 'Freundliche Stimme am Samstagmorgen.' },
  { slug: 'marion-ellermeyer', name: 'Marion Ellermeyer', role: 'Wochenmarkt-Team', group: 'markt', quote: 'Seit vielen Saisons Teil des Teams.' },
  {
    slug: 'saisonkraefte',
    name: 'Unsere Saisonkräfte',
    role: 'Kirsch- & Zwetschenernte · Apfelzeit',
    group: 'saison',
    quote: 'Nur zur Ernte dabei – und doch unverzichtbar.',
  },
];

export function initials(name) {
  return name
    .replace(/^Unsere\s+/, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}
