/**
 * Eingabeprüfung – identisch im Browser (sofortige Fehlermeldungen) und auf dem Server
 * (verbindliche Prüfung; dem Browser wird nie vertraut).
 *
 * Jede Funktion liefert { value, errors }. `errors` ist ein Objekt „Feldpfad → Meldung“,
 * z. B. { email: '…', 'items.0.quantity': '…' }. Leeres Objekt = alles in Ordnung.
 */
import { ORDER_STATUS, PRODUCT_ARTS, PRODUCT_BADGES, PRODUCT_CATEGORIES, UNITS } from './defaults.js';
import { WEEKDAYS, addDays, formatDateShort, isIsoDate, todayIso, weekdayOf } from './dates.js';

export const LIMITS = {
  maxItems: 20,
  maxKg: 100,
  maxPieces: 500,
  maxDaysAhead: 90,
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+()0-9\s/-]{6,25}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

function str(v, max = 200) {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

/** Akzeptiert 2, "2", "1,5", "1.5". Liefert NaN bei ungültigen Werten. */
export function parseQuantity(v) {
  if (typeof v === 'number') return v;
  if (typeof v !== 'string') return NaN;
  const s = v.trim().replace(',', '.');
  return /^\d+(\.\d+)?$/.test(s) ? Number(s) : NaN;
}

export function earliestPickupDate(settings, today = todayIso()) {
  return addDays(today, Math.max(0, Number(settings?.orderLeadDays) || 0));
}

/**
 * Vorbestellung prüfen.
 * @param input    Rohdaten aus dem Formular
 * @param ctx      { products, settings, today }
 */
export function validateOrder(input, { products = [], settings = {}, today = todayIso() } = {}) {
  const errors = {};
  const src = input && typeof input === 'object' ? input : {};

  const value = {
    firstName: str(src.firstName, 80),
    lastName: str(src.lastName, 80),
    email: str(src.email, 160),
    phone: str(src.phone, 40),
    pickupDate: str(src.pickupDate, 10),
    pickupTime: str(src.pickupTime, 5),
    message: str(src.message, 1000),
    consent: src.consent === true,
    items: [],
  };

  if (!value.firstName) errors.firstName = 'Bitte gib deinen Vornamen an.';
  if (!value.lastName) errors.lastName = 'Bitte gib deinen Nachnamen an.';
  if (!value.email) errors.email = 'Bitte gib deine E-Mail-Adresse an.';
  else if (!EMAIL.test(value.email)) errors.email = 'Diese E-Mail-Adresse sieht nicht richtig aus (Beispiel: name@beispiel.de).';
  if (value.phone && !PHONE.test(value.phone)) errors.phone = 'Bitte gib eine gültige Telefonnummer an (nur Ziffern, Leerzeichen, +, -, /).';

  const earliest = earliestPickupDate(settings, today);
  const latest = addDays(today, LIMITS.maxDaysAhead);
  const weekdays = Array.isArray(settings.pickupWeekdays) ? settings.pickupWeekdays : [];
  if (!value.pickupDate) errors.pickupDate = 'Bitte wähle einen Abholtag.';
  else if (!isIsoDate(value.pickupDate)) errors.pickupDate = 'Bitte wähle ein gültiges Datum.';
  else if (value.pickupDate < earliest) errors.pickupDate = `Abholung ist frühestens am ${formatDateShort(earliest)} möglich.`;
  else if (value.pickupDate > latest) errors.pickupDate = `Bitte wähle einen Tag bis spätestens ${formatDateShort(latest)}.`;
  else if (weekdays.length && !weekdays.includes(weekdayOf(value.pickupDate))) {
    errors.pickupDate = `An diesem Tag sind wir nicht auf dem Markt. Abholung ist möglich: ${weekdays
      .map((d) => WEEKDAYS[d])
      .join(', ')}.`;
  }
  if (value.pickupTime && !TIME.test(value.pickupTime)) errors.pickupTime = 'Bitte gib eine Uhrzeit im Format hh:mm an.';

  const rawItems = Array.isArray(src.items) ? src.items.slice(0, LIMITS.maxItems + 1) : [];
  if (rawItems.length === 0) errors.items = 'Bitte füge mindestens ein Produkt hinzu.';
  if (rawItems.length > LIMITS.maxItems) errors.items = `Maximal ${LIMITS.maxItems} Positionen pro Vorbestellung.`;

  rawItems.slice(0, LIMITS.maxItems).forEach((raw, i) => {
    const it = raw && typeof raw === 'object' ? raw : {};
    const product = products.find((p) => p.id === it.productId);
    const unit = UNITS.includes(it.unit) ? it.unit : '';
    const quantity = parseQuantity(it.quantity);
    const item = {
      productId: str(it.productId, 60),
      productName: product ? product.name : '',
      variety: str(it.variety, 80),
      quantity: Number.isFinite(quantity) ? Math.round(quantity * 100) / 100 : 0,
      unit,
    };
    const p = `items.${i}`;
    if (!item.productId) errors[`${p}.productId`] = 'Bitte wähle ein Produkt.';
    else if (!product) errors[`${p}.productId`] = 'Dieses Produkt gibt es nicht (mehr).';
    else if (!product.available) errors[`${p}.productId`] = `${product.name} kann gerade nicht vorbestellt werden.`;

    if (!unit) errors[`${p}.unit`] = 'Bitte wähle Stück oder kg.';
    if (!Number.isFinite(quantity) || quantity <= 0) errors[`${p}.quantity`] = 'Bitte gib eine Menge größer als 0 an.';
    else if (unit === 'Stück' && !Number.isInteger(quantity)) errors[`${p}.quantity`] = 'Bei Stück bitte eine ganze Zahl angeben.';
    else if (unit === 'Stück' && quantity > LIMITS.maxPieces) errors[`${p}.quantity`] = `Bitte höchstens ${LIMITS.maxPieces} Stück – für größere Mengen sprich uns gern direkt an.`;
    else if (unit === 'kg' && quantity > LIMITS.maxKg) errors[`${p}.quantity`] = `Bitte höchstens ${LIMITS.maxKg} kg – für größere Mengen sprich uns gern direkt an.`;
    else if (unit === 'kg' && Math.abs(Math.round(quantity * 100) - quantity * 100) > 1e-6) errors[`${p}.quantity`] = 'Bitte höchstens zwei Nachkommastellen.';
    value.items.push(item);
  });

  if (!value.consent) errors.consent = 'Bitte bestätige, dass wir deine Angaben für die Vorbestellung verwenden dürfen.';

  return { value, errors };
}

export function validateNotice(input) {
  const src = input && typeof input === 'object' ? input : {};
  const errors = {};
  const value = {
    title: str(src.title, 120),
    body: str(src.body, 600),
    highlighted: src.highlighted === true,
    active: src.active !== false,
    publishAt: src.publishAt ? str(src.publishAt, 10) : null,
    expiresAt: src.expiresAt ? str(src.expiresAt, 10) : null,
  };
  if (!value.title) errors.title = 'Bitte gib eine Überschrift an.';
  if (value.publishAt && !isIsoDate(value.publishAt)) errors.publishAt = 'Ungültiges Datum.';
  if (value.expiresAt && !isIsoDate(value.expiresAt)) errors.expiresAt = 'Ungültiges Datum.';
  if (value.publishAt && value.expiresAt && !errors.publishAt && !errors.expiresAt && value.expiresAt < value.publishAt) {
    errors.expiresAt = 'Das Ablaufdatum liegt vor dem Veröffentlichungsdatum.';
  }
  return { value, errors };
}

function safeImageUrl(v) {
  const s = str(v, 500);
  if (!s) return '';
  // Nur eigene Pfade (/images/…) oder https-Adressen – keine javascript:/data:-URLs.
  return /^\/[^/]/.test(s) || /^https:\/\//i.test(s) ? s : null;
}

export function validateProduct(input) {
  const src = input && typeof input === 'object' ? input : {};
  const errors = {};
  const image = safeImageUrl(src.image);
  const value = {
    name: str(src.name, 80),
    category: PRODUCT_CATEGORIES.includes(src.category) ? src.category : 'Obst',
    description: str(src.description, 400),
    origin: str(src.origin, 120),
    price: str(src.price, 60),
    season: str(src.season, 80),
    available: src.available !== false,
    badge: PRODUCT_BADGES.includes(src.badge) ? src.badge : '',
    image: image ?? '',
    art: Object.hasOwn(PRODUCT_ARTS, src.art) ? src.art : 'basket',
    sort: Number.isFinite(Number(src.sort)) ? Number(src.sort) : 0,
  };
  if (!value.name) errors.name = 'Bitte gib einen Produktnamen an.';
  if (image === null) errors.image = 'Bitte einen Pfad wie /images/aepfel.jpg oder eine https-Adresse angeben.';
  return { value, errors };
}

export function validateSettings(input) {
  const src = input && typeof input === 'object' ? input : {};
  const errors = {};
  const hero = safeImageUrl(src.heroImage);
  const value = {
    marketName: str(src.marketName, 120),
    city: str(src.city, 120),
    address: str(src.address, 200),
    standHint: str(src.standHint, 200),
    hours: (Array.isArray(src.hours) ? src.hours : [])
      .slice(0, 14)
      .map((h) => ({ day: str(h?.day, 40), time: str(h?.time, 60) }))
      .filter((h) => h.day || h.time),
    pickupWeekdays: [...new Set((Array.isArray(src.pickupWeekdays) ? src.pickupWeekdays : []).map(Number))]
      .filter((d) => Number.isInteger(d) && d >= 0 && d <= 6)
      .sort(),
    hoursNote: str(src.hoursNote, 300),
    phone: str(src.phone, 40),
    email: str(src.email, 160),
    orderLeadDays: Math.min(14, Math.max(0, Math.floor(Number(src.orderLeadDays) || 0))),
    heroImage: hero ?? '',
  };
  if (!value.marketName) errors.marketName = 'Bitte gib den Namen des Marktes an.';
  if (value.email && !EMAIL.test(value.email)) errors.email = 'Diese E-Mail-Adresse sieht nicht richtig aus.';
  if (value.phone && !PHONE.test(value.phone)) errors.phone = 'Bitte gib eine gültige Telefonnummer an.';
  if (hero === null) errors.heroImage = 'Bitte einen Pfad wie /images/stand.jpg oder eine https-Adresse angeben.';
  return { value, errors };
}

export function validateOrderUpdate(input) {
  const src = input && typeof input === 'object' ? input : {};
  const errors = {};
  const value = {};
  if (src.status !== undefined) {
    if (Object.hasOwn(ORDER_STATUS, src.status)) value.status = src.status;
    else errors.status = 'Unbekannter Status.';
  }
  if (src.adminNote !== undefined) value.adminNote = str(src.adminNote, 500);
  return { value, errors };
}
