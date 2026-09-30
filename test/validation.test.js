import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseQuantity, validateOrder } from '../shared/validation.js';
import { isNoticeVisible, noticeState, weekdayOf } from '../shared/dates.js';
import { DEFAULT_PRODUCTS, DEFAULT_SETTINGS } from '../shared/defaults.js';

const ctx = { products: DEFAULT_PRODUCTS, settings: DEFAULT_SETTINGS, today: '2026-09-30' };
const base = {
  firstName: 'A',
  lastName: 'B',
  email: 'a@b.de',
  pickupDate: '2026-10-03',
  consent: true,
  items: [{ productId: 'aepfel', quantity: '1', unit: 'kg' }],
};

test('Mengen mit Komma und Punkt', () => {
  assert.equal(parseQuantity('1,5'), 1.5);
  assert.equal(parseQuantity('2.25'), 2.25);
  assert.equal(parseQuantity(3), 3);
  assert.ok(Number.isNaN(parseQuantity('drei')));
  assert.ok(Number.isNaN(parseQuantity('-1')));
});

test('kg erlaubt Nachkommastellen (ohne Rundungsfehler), Stück nur ganze Zahlen', () => {
  for (const q of ['1,1', '0,3', '2,55', '99,99']) {
    assert.deepEqual(validateOrder({ ...base, items: [{ productId: 'aepfel', quantity: q, unit: 'kg' }] }, ctx).errors, {}, q);
  }
  assert.ok(validateOrder({ ...base, items: [{ productId: 'aepfel', quantity: '1,234', unit: 'kg' }] }, ctx).errors['items.0.quantity']);
  assert.ok(validateOrder({ ...base, items: [{ productId: 'aepfel', quantity: '2,5', unit: 'Stück' }] }, ctx).errors['items.0.quantity']);
  assert.ok(validateOrder({ ...base, items: [{ productId: 'aepfel', quantity: '501', unit: 'Stück' }] }, ctx).errors['items.0.quantity']);
});

test('Abholtag: Vorlauf und maximaler Zeitraum', () => {
  assert.ok(validateOrder({ ...base, pickupDate: '2026-09-30' }, ctx).errors.pickupDate);
  assert.equal(validateOrder({ ...base, pickupDate: '2026-10-01' }, ctx).errors.pickupDate, undefined);
  assert.ok(validateOrder({ ...base, pickupDate: '2027-06-01' }, ctx).errors.pickupDate);
  assert.ok(validateOrder({ ...base, pickupDate: '2026-02-30' }, ctx).errors.pickupDate);
});

test('Wochentag wird zeitzonenunabhängig bestimmt', () => {
  assert.equal(weekdayOf('2026-10-03'), 6); // Samstag
});

test('Sichtbarkeit von Meldungen', () => {
  const t = '2026-09-30';
  assert.equal(isNoticeVisible({ active: true }, t), true);
  assert.equal(isNoticeVisible({ active: false }, t), false);
  assert.equal(isNoticeVisible({ active: true, expiresAt: '2026-09-30' }, t), true, 'Ablaufdatum = letzter sichtbarer Tag');
  assert.equal(noticeState({ active: true, expiresAt: '2026-09-29' }, t), 'abgelaufen');
  assert.equal(noticeState({ active: true, publishAt: '2026-10-01' }, t), 'geplant');
});
