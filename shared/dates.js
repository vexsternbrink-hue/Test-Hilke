/** Datumshilfen, gemeinsam für Server und Browser. Datumswerte werden als 'YYYY-MM-DD' gespeichert. */

export const TIME_ZONE = 'Europe/Berlin';

export const WEEKDAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Heutiges Datum in Hamburger Ortszeit als 'YYYY-MM-DD'. */
export function todayIso(now = new Date()) {
  // en-CA liefert genau das ISO-Format YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(now);
}

export function isIsoDate(value) {
  if (typeof value !== 'string' || !ISO_DATE.test(value)) return false;
  const d = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

export function addDays(iso, days) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Wochentag (0 = Sonntag) eines ISO-Datums – unabhängig von der lokalen Zeitzone. */
export function weekdayOf(iso) {
  return new Date(`${iso}T12:00:00Z`).getUTCDay();
}

/** „Samstag, 4. Oktober 2026“ */
export function formatDateLong(iso) {
  if (!isIsoDate(iso)) return '';
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${iso}T12:00:00Z`));
}

/** „04.10.2026“ */
export function formatDateShort(iso) {
  if (!isIsoDate(iso)) return '';
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

/** Ist eine Meldung heute sichtbar? (aktiv, Veröffentlichung erreicht, nicht abgelaufen) */
export function isNoticeVisible(notice, today = todayIso()) {
  if (!notice.active) return false;
  if (notice.publishAt && notice.publishAt > today) return false;
  if (notice.expiresAt && notice.expiresAt < today) return false;
  return true;
}

/** Status für die Admin-Übersicht. */
export function noticeState(notice, today = todayIso()) {
  if (!notice.active) return 'inaktiv';
  if (notice.publishAt && notice.publishAt > today) return 'geplant';
  if (notice.expiresAt && notice.expiresAt < today) return 'abgelaufen';
  return 'sichtbar';
}
