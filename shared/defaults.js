/**
 * Startinhalte der Website (Seed-Daten).
 *
 * Diese Datei wird von zwei Seiten genutzt:
 *  - Server (`server/store.js`): legt beim allerersten Start die Datenbank-Datei damit an.
 *  - Frontend (`src/lib/useSiteData.js`): Fallback, falls die API nicht erreichbar ist
 *    (z. B. bei rein statischem Hosting) – die Seite bleibt dann lesbar.
 *
 * Inhaltliche Quelle: die bisherige Website (Hero-, Sortiments-, Team- und Footer-Texte).
 * Es wurden KEINE Fakten ergänzt. Unbekannte Angaben (Adresse, Markttage, Uhrzeiten,
 * Telefon, E-Mail, Preise, Apfelsorten) sind bewusst leer – die Website zeigt dafür einen
 * deutlich erkennbaren Platzhalter an. Pflege im Admin-Bereich unter „Standort & Zeiten“.
 */

export const PRODUCT_CATEGORIES = ['Obst', 'Gemüse', 'Saisonales', 'Besonderheiten', 'Sonstiges'];

export const PRODUCT_BADGES = ['', 'Beliebt', 'Neu', 'Nur solange der Vorrat reicht'];

/** Illustrationen, die ohne Foto angezeigt werden (siehe `src/components/FruitArt.jsx`). */
export const PRODUCT_ARTS = {
  apple: 'Apfel',
  cherry: 'Kirsche',
  plum: 'Zwetsche',
  pear: 'Birne',
  basket: 'Korb (allgemein)',
};

export const UNITS = ['Stück', 'kg'];

export const ORDER_STATUS = {
  neu: 'Neu',
  bestaetigt: 'Bestätigt',
  abgeholt: 'Abgeholt',
  storniert: 'Storniert',
};

export const CARD_PAYMENT_TEXT = 'Kartenzahlung ist bei uns ab einem Einkaufswert von 10 € problemlos möglich.';

export const DEFAULT_SETTINGS = {
  brand: 'Biohof Tambke',
  tagline: 'Frisch, fair, familiär.',
  marketName: 'Wochenmarkt Volksdorf',
  city: 'Hamburg-Volksdorf',
  /** Genaue Adresse des Marktplatzes – unbekannt, bitte eintragen. */
  address: '',
  /** Wo genau auf dem Markt steht der Stand? – unbekannt, bitte eintragen. */
  standHint: '',
  /** Markttage mit Uhrzeit, z. B. { day: 'Samstag', time: '8–13 Uhr' } – unbekannt, bitte eintragen. */
  hours: [],
  /** Wochentage, an denen abgeholt werden kann (0 = So … 6 = Sa). Leer = jeder Tag erlaubt. */
  pickupWeekdays: [],
  hoursNote: '',
  phone: '',
  email: '',
  website: 'https://biohof-tambke.de',
  imprintUrl: 'https://biohof-tambke.de/impressum.html',
  privacyUrl: 'https://biohof-tambke.de/datenschutz.html',
  /** Frühester Abholtag = heute + orderLeadDays. */
  orderLeadDays: 1,
  /** Optionales Foto für den Startbereich (URL oder Pfad unter /images/…). Leer = Illustration. */
  heroImage: '',
};

export const DEFAULT_PRODUCTS = [
  {
    id: 'aepfel',
    name: 'Äpfel',
    category: 'Obst',
    description:
      'Unsere Hauptsaison: Sortenvielfalt vom Hof, von Hand gepflückt – schnell und fruchtschonend, damit jeder Apfel ohne Druckstellen auf den Stand kommt.',
    origin: 'Biohof Tambke · Bio',
    price: '',
    season: 'Apfelzeit · Herbst',
    available: true,
    badge: '',
    image: '',
    art: 'apple',
    sort: 1,
  },
  {
    id: 'kirschen',
    name: 'Kirschen',
    category: 'Obst',
    description:
      'Süß, dunkel und nur wenige Wochen im Jahr auf dem Wochenmarkt in Volksdorf. Zur Kirschernte verstärken uns Saisonkräfte.',
    origin: 'Biohof Tambke · Bio',
    price: '',
    season: 'Kirschernte · Sommer',
    available: false,
    badge: '',
    image: '',
    art: 'cherry',
    sort: 2,
  },
  {
    id: 'zwetschen',
    name: 'Zwetschen',
    category: 'Obst',
    description:
      'Ideal für Kuchen und Mus. Mit Unterstützung unserer Saisonkräfte geerntet, bevor die Apfelzeit beginnt.',
    origin: 'Biohof Tambke · Bio',
    price: '',
    season: 'Zwetschenernte · Spätsommer',
    available: false,
    badge: '',
    image: '',
    art: 'plum',
    sort: 3,
  },
];

/**
 * Startmeldungen für das Schwarze Brett. Nur Aussagen, die sicher stimmen
 * (Kartenzahlung laut Vorgabe, Vorbestellung ist mit dieser Website neu, „Apfelzeit · Ernte 2026“
 * stand bereits auf der alten Startseite). Echte Tagesmeldungen bitte im Admin-Bereich pflegen.
 */
export const DEFAULT_NOTICES = [
  {
    id: 'n-vorbestellung',
    title: 'Neu: Online vorbestellen',
    body: 'Stell dir deine Wunschmengen bequem online zusammen und hol sie am Stand ab – bezahlt wird bei Abholung.',
    highlighted: true,
    active: true,
    publishAt: null,
    expiresAt: null,
  },
  {
    id: 'n-kartenzahlung',
    title: 'Kartenzahlung ab 10 €',
    body: CARD_PAYMENT_TEXT,
    highlighted: false,
    active: true,
    publishAt: null,
    expiresAt: null,
  },
  {
    id: 'n-apfelzeit',
    title: 'Apfelzeit · Ernte 2026',
    body: 'Die Apfelernte läuft – frisch gepflückte Bio-Äpfel vom Hof gibt es bei uns am Stand.',
    highlighted: false,
    active: true,
    publishAt: null,
    expiresAt: null,
  },
];

/** Teamdaten der bisherigen Website (Quelle: biohof-tambke.de/team.html). */
export const TEAM_GROUPS = [
  { id: 'familie', label: 'Familie' },
  { id: 'kernteam', label: 'Kernteam auf dem Hof' },
  { id: 'markt', label: 'Wochenmarkt-Team' },
];

export const TEAM = [
  { name: 'Hilke Tambke', role: 'Hof & Wochenmarkt', group: 'familie' },
  { name: 'Rolf Tambke', role: 'Hof', group: 'familie' },
  { name: 'Lea Theresa Tambke', role: 'Wochenmarkt', group: 'familie' },
  { name: 'Janna Sophie Tambke', role: 'Wochenmarkt', group: 'familie' },
  { name: 'Ismet', role: 'Obstbaumschnitt & Ernte', group: 'kernteam' },
  { name: 'Mathias', role: 'Hof & Maschinen, Anleitung der Erntehelfer, Wochenmarkt', group: 'kernteam' },
  { name: 'Hilke Lüders-Tambke', role: 'Wochenmarkt', group: 'markt' },
  { name: 'Matthis Götz', role: 'Wochenmarkt', group: 'markt' },
  { name: 'Angela Jäger', role: 'Wochenmarkt', group: 'markt' },
  { name: 'Finn Putz', role: 'Wochenmarkt', group: 'markt' },
  { name: 'Lilly Wolk', role: 'Wochenmarkt', group: 'markt' },
  { name: 'Caspar Wolk', role: 'Wochenmarkt', group: 'markt' },
  { name: 'Frauke Quast', role: 'Wochenmarkt', group: 'markt' },
  { name: 'Michaela Mumm', role: 'Wochenmarkt', group: 'markt' },
  { name: 'Marion Ellermeyer', role: 'Wochenmarkt', group: 'markt' },
];
