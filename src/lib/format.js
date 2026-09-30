/** „2,5 kg“ · „6 Stück“ */
export const formatQty = (q, unit) => `${new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 }).format(q)} ${unit}`;

/** „30.09.2026, 14:05“ */
export const formatDateTime = (iso) =>
  iso ? new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Berlin' }).format(new Date(iso)) : '';
