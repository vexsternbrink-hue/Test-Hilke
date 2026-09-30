import { useEffect, useMemo, useRef, useState } from 'react';
import { UNITS } from '../../shared/defaults.js';
import { WEEKDAYS, addDays, formatDateLong } from '../../shared/dates.js';
import { LIMITS, earliestPickupDate, validateOrder } from '../../shared/validation.js';
import { api } from '../lib/api';
import { formatQty } from '../lib/format';
import Icon from '../components/Icon';
import Reveal from '../components/Reveal';
import { PaymentNote, SectionHeader } from '../components/Bits';

let keySeq = 0;
const newItem = (productId = '') => ({ key: ++keySeq, productId, variety: '', quantity: '', unit: 'kg' });

const EMPTY = { firstName: '', lastName: '', email: '', phone: '', pickupDate: '', pickupTime: '', message: '', consent: false, website: '' };

/** Feld mit Label, Hinweis und Fehlermeldung – alles per ARIA verknüpft. */
function Field({ id, label, required, hint, error, children, className = '' }) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
        {required ? (
          <span className="req" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="ml-1.5 text-sm font-medium text-muted">(optional)</span>
        )}
      </label>
      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined, required })}
      {hint && (
        <p id={`${id}-hint`} className="field-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="field-error">
          <Icon name="alert" size={16} className="mt-0.5 flex-none" />
          {error}
        </p>
      )}
    </div>
  );
}

function fieldId(path) {
  return `po-${path.replaceAll('.', '-')}`;
}

function Confirmation({ result, settings, onReset }) {
  const headingRef = useRef(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);
  return (
    <div className="surface ticker-in overflow-hidden" role="status">
      <div className="bg-forest px-6 py-8 text-paper sm:px-10">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-paper text-forest">
          <Icon name="check" size={30} strokeWidth={2.4} />
        </span>
        <h3 ref={headingRef} tabIndex={-1} className="mt-4 text-[1.9rem] outline-none">
          Danke, {result.firstName}! Deine Vorbestellung ist bei uns eingegangen.
        </h3>
        <p className="mt-2 text-paper/85">
          Bitte nenne bei der Abholung deine Bestellnummer:{' '}
          <strong className="whitespace-nowrap rounded-lg bg-paper/15 px-2 py-0.5 font-mono text-lg tracking-wider text-paper">{result.ref}</strong>
        </p>
      </div>
      <div className="grid gap-8 px-6 py-8 sm:px-10 md:grid-cols-2">
        <dl className="grid gap-4 text-[0.98rem]">
          <div>
            <dt className="text-sm font-bold uppercase tracking-wider text-muted">Name</dt>
            <dd className="mt-0.5 font-semibold">
              {result.firstName} {result.lastName}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-bold uppercase tracking-wider text-muted">Abholung</dt>
            <dd className="mt-0.5 font-semibold">
              {formatDateLong(result.pickupDate)}
              {result.pickupTime && `, gegen ${result.pickupTime} Uhr`}
              <span className="block font-normal text-muted">
                an unserem Stand · {settings.marketName}, {settings.city}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-bold uppercase tracking-wider text-muted">Kontakt für Rückfragen</dt>
            <dd className="mt-0.5">
              {result.email}
              {result.phone && <span className="block">{result.phone}</span>}
            </dd>
          </div>
          {result.message && (
            <div>
              <dt className="text-sm font-bold uppercase tracking-wider text-muted">Deine Nachricht</dt>
              <dd className="mt-0.5 whitespace-pre-line">{result.message}</dd>
            </div>
          )}
        </dl>
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-muted" style={{ fontFamily: 'var(--font-body)' }}>
            Deine Produkte
          </h4>
          <ul className="mt-2 divide-y divide-line rounded-2xl border border-line">
            {result.items.map((it, i) => (
              <li key={i} className="flex items-center justify-between gap-4 px-4 py-3">
                <span>
                  <span className="font-semibold">{it.productName}</span>
                  {it.variety && <span className="block text-sm text-muted">{it.variety}</span>}
                </span>
                <span className="whitespace-nowrap font-bold">{formatQty(it.quantity, it.unit)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="grid gap-4 border-t border-line bg-paper px-6 py-6 sm:px-10">
        <p className="text-[0.98rem] text-muted">
          <strong className="text-ink">Wie geht es weiter?</strong> Deine Vorbestellung ist eine Anfrage. Wir stellen deine
          Produkte zusammen und melden uns, falls etwas nicht verfügbar ist. Bezahlt wird bei der Abholung am Stand.
        </p>
        <PaymentNote />
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={onReset} className="btn btn-outline btn-sm">
            <Icon name="plus" size={18} />
            Weitere Vorbestellung
          </button>
          <button type="button" onClick={() => window.print()} className="btn btn-ghost btn-sm">
            <Icon name="print" size={18} />
            Drucken
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Preorder({ products, settings, today, preselect, offline }) {
  const orderable = useMemo(() => products.filter((p) => p.available), [products]);
  const [form, setForm] = useState(EMPTY);
  const [items, setItems] = useState(() => [newItem()]);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | sending | done
  const [serverError, setServerError] = useState('');
  const [result, setResult] = useState(null);
  const summaryRef = useRef(null);
  const addRef = useRef(null);
  const focusNext = useRef(null);

  const earliest = earliestPickupDate(settings, today);
  const latest = addDays(today, LIMITS.maxDaysAhead);
  const weekdays = settings.pickupWeekdays ?? [];

  // Produkt aus einer Produktkarte übernehmen („… vorbestellen“). Bewusst während des Renderns
  // statt in einem Effect – so empfiehlt es React für „State an geänderte Props anpassen“.
  const [seenPreselect, setSeenPreselect] = useState(null);
  if (preselect?.productId && preselect !== seenPreselect) {
    setSeenPreselect(preselect);
    if (status === 'done') setStatus('idle');
    if (!items.some((it) => it.productId === preselect.productId)) {
      const emptyIdx = items.findIndex((it) => !it.productId);
      setItems(
        emptyIdx >= 0
          ? items.map((it, i) => (i === emptyIdx ? { ...it, productId: preselect.productId } : it))
          : [...items, newItem(preselect.productId)],
      );
    }
  }

  // Fokus nach Hinzufügen/Entfernen einer Position gezielt setzen
  useEffect(() => {
    if (focusNext.current) {
      document.getElementById(focusNext.current)?.focus();
      focusNext.current = null;
    }
  }, [items]);

  const payload = () => ({ ...form, items: items.map(({ productId, variety, quantity, unit }) => ({ productId, variety, quantity, unit })) });

  const revalidate = (nextForm = form, nextItems = items) => {
    if (!submitted) return;
    const { errors: e } = validateOrder(
      { ...nextForm, items: nextItems.map(({ productId, variety, quantity, unit }) => ({ productId, variety, quantity, unit })) },
      { products, settings, today },
    );
    setErrors(e);
  };

  const setField = (name) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    const next = { ...form, [name]: value };
    setForm(next);
    revalidate(next);
  };

  const setItem = (key, patch) => {
    const next = items.map((it) => (it.key === key ? { ...it, ...patch } : it));
    setItems(next);
    revalidate(form, next);
  };

  const addItem = () => {
    if (items.length >= LIMITS.maxItems) return;
    const it = newItem();
    focusNext.current = fieldId(`items.${items.length}.productId`);
    setItems([...items, it]);
  };

  const removeItem = (key) => {
    const idx = items.findIndex((it) => it.key === key);
    const next = items.filter((it) => it.key !== key);
    focusNext.current = idx > 0 ? fieldId(`items.${idx - 1}.productId`) : fieldId('items.0.productId');
    setItems(next);
    revalidate(form, next);
    if (!next.length) addRef.current?.focus();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setServerError('');
    const { errors: e2 } = validateOrder(payload(), { products, settings, today });
    setErrors(e2);
    if (Object.keys(e2).length) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setStatus('sending');
    try {
      const res = await api.createOrder(payload());
      setResult(res);
      setStatus('done');
      document.getElementById('vorbestellen')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      setStatus('idle');
      if (err.fields && Object.keys(err.fields).length) setErrors(err.fields);
      setServerError(
        err.status === 0 || err.status === 404
          ? 'Die Vorbestellung konnte gerade nicht gesendet werden, weil der Server nicht erreichbar ist. Bitte versuche es später erneut oder sprich uns direkt am Stand an.'
          : err.message,
      );
      requestAnimationFrame(() => summaryRef.current?.focus());
    }
  };

  const reset = () => {
    setForm(EMPTY);
    setItems([newItem()]);
    setErrors({});
    setSubmitted(false);
    setResult(null);
    setStatus('idle');
  };

  const errorList = Object.entries(errors);
  const pickupHint = weekdays.length
    ? `Abholung möglich: ${weekdays.map((d) => WEEKDAYS[d]).join(', ')} – frühestens ${formatDateLong(earliest)}.`
    : `Bitte wähle einen Markttag, an dem wir auf dem Markt sind – frühestens ${formatDateLong(earliest)}.`;

  return (
    <section id="vorbestellen" aria-labelledby="vorbestellen-title" className="section relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-10 h-[28rem] w-[28rem] rounded-full bg-sage/70 blur-3xl" />
      <div className="page-container relative grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
        <Reveal className="flex flex-col gap-8 lg:sticky lg:top-28 lg:self-start">
          <SectionHeader id="vorbestellen-title" eyebrow="Vorbestellen" title="Bestellen, abholen, genießen">
            Stell dir deine Wunschmengen zusammen – wir packen sie dir für den Markttag. Ganz ohne Konto und ohne
            Online-Zahlung.
          </SectionHeader>
          <ol className="grid gap-5">
            {[
              ['Anfrage senden', 'Produkte, Menge in Stück oder kg und deinen Abholtag angeben.'],
              ['Wir packen', 'Wir stellen alles zusammen und melden uns, falls etwas nicht verfügbar ist.'],
              ['Am Stand abholen', `Auf dem ${settings.marketName} – bezahlt wird bei der Abholung.`],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-4">
                <span className="grid h-11 w-11 flex-none place-items-center rounded-full border-2 border-forest font-display text-lg font-semibold text-forest">
                  {i + 1}
                </span>
                <span>
                  <span className="block font-bold">{t}</span>
                  <span className="text-muted">{d}</span>
                </span>
              </li>
            ))}
          </ol>
          <PaymentNote variant="honey" />
          <p className="flex gap-3 text-sm text-muted">
            <Icon name="info" size={18} className="mt-0.5 flex-none" />
            Die Vorbestellung ist eine unverbindliche Anfrage und keine Online-Bestellung mit Bezahlung. Die Ware wird am
            Marktstand abgeholt.
          </p>
        </Reveal>

        <div>
          {status === 'done' && result ? (
            <Confirmation result={result} settings={settings} onReset={reset} />
          ) : (
            <form noValidate onSubmit={onSubmit} className="surface grid gap-8 p-5 sm:p-8" aria-describedby="po-required-note">
              <p id="po-required-note" className="text-sm text-muted">
                Felder mit <span className="req">*</span> sind Pflichtfelder.
              </p>

              {offline && (
                <p className="rounded-2xl border border-honey bg-honey-soft px-4 py-3 text-sm font-semibold text-ink">
                  Hinweis: Die Online-Vorbestellung ist gerade nicht mit dem Server verbunden. Du kannst das Formular
                  ausfüllen – falls das Senden fehlschlägt, sprich uns bitte direkt am Stand an.
                </p>
              )}

              {(errorList.length > 0 || serverError) && (
                <div ref={summaryRef} tabIndex={-1} role="alert" className="rounded-2xl border-2 border-apple bg-[#fbeceb] p-5 outline-none">
                  <p className="flex items-center gap-2 font-bold text-apple-dark">
                    <Icon name="alert" size={20} />
                    {serverError || 'Bitte prüfe noch diese Angaben:'}
                  </p>
                  {errorList.length > 0 && (
                    <ul className="mt-2 list-disc space-y-1 pl-8 text-[0.95rem]">
                      {errorList.map(([path, msg]) => (
                        <li key={path}>
                          <a href={`#${fieldId(path)}`} className="text-apple-dark underline underline-offset-2">
                            {msg}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Produkte */}
              <fieldset className="grid gap-4">
                <legend className="mb-3 font-display text-2xl font-semibold">1. Deine Produkte</legend>
                {orderable.length === 0 ? (
                  <p className="rounded-2xl bg-paper-deep p-4 text-muted">
                    Gerade können keine Produkte vorbestellt werden. Schau gern bald wieder vorbei oder besuche uns am Stand.
                  </p>
                ) : (
                  <>
                    <ul className="grid gap-4" id="po-items">
                      {items.map((it, i) => {
                        const p = `items.${i}`;
                        return (
                          <li key={it.key} className="rounded-2xl border border-line bg-paper/60 p-4 sm:p-5">
                            <div className="mb-3 flex items-center justify-between">
                              <span className="text-sm font-bold uppercase tracking-wider text-muted">Position {i + 1}</span>
                              <button
                                type="button"
                                onClick={() => removeItem(it.key)}
                                disabled={items.length === 1}
                                className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-apple-dark transition-colors hover:bg-[#fbeceb] disabled:invisible"
                                aria-label={`Position ${i + 1} entfernen`}
                              >
                                <Icon name="trash" size={16} />
                                Entfernen
                              </button>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <Field id={fieldId(`${p}.productId`)} label="Produkt" required error={errors[`${p}.productId`]}>
                                {(a) => (
                                  <select {...a} className="input" value={it.productId} onChange={(e) => setItem(it.key, { productId: e.target.value })}>
                                    <option value="">Bitte wählen …</option>
                                    {orderable.map((prod) => (
                                      <option key={prod.id} value={prod.id}>
                                        {prod.name}
                                      </option>
                                    ))}
                                  </select>
                                )}
                              </Field>
                              <Field id={fieldId(`${p}.variety`)} label="Sorte oder Wunsch" error={errors[`${p}.variety`]}>
                                {(a) => (
                                  <input
                                    {...a}
                                    className="input"
                                    value={it.variety}
                                    maxLength={80}
                                    placeholder="z. B. Sortenname, säuerlich, zum Backen"
                                    onChange={(e) => setItem(it.key, { variety: e.target.value })}
                                  />
                                )}
                              </Field>
                              <Field
                                id={fieldId(`${p}.quantity`)}
                                label="Menge"
                                required
                                error={errors[`${p}.quantity`]}
                                hint={it.unit === 'kg' ? 'z. B. 2 oder 1,5' : 'ganze Zahl, z. B. 6'}
                              >
                                {(a) => (
                                  <input
                                    {...a}
                                    className="input"
                                    inputMode="decimal"
                                    autoComplete="off"
                                    value={it.quantity}
                                    onChange={(e) => setItem(it.key, { quantity: e.target.value })}
                                  />
                                )}
                              </Field>
                              <fieldset>
                                <legend className="field-label">
                                  Einheit<span className="req" aria-hidden="true">*</span>
                                </legend>
                                <div className="segmented" id={fieldId(`${p}.unit`)}>
                                  {UNITS.map((u) => (
                                    <label key={u}>
                                      <input
                                        type="radio"
                                        name={`unit-${it.key}`}
                                        value={u}
                                        checked={it.unit === u}
                                        onChange={() => setItem(it.key, { unit: u })}
                                      />
                                      <span>{u === 'kg' ? 'Kilogramm' : 'Stück'}</span>
                                    </label>
                                  ))}
                                </div>
                                {errors[`${p}.unit`] && <p className="field-error">{errors[`${p}.unit`]}</p>}
                              </fieldset>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                    {errors.items && (
                      <p className="field-error" id="po-items-error">
                        <Icon name="alert" size={16} className="mt-0.5 flex-none" />
                        {errors.items}
                      </p>
                    )}
                    <button
                      ref={addRef}
                      type="button"
                      onClick={addItem}
                      disabled={items.length >= LIMITS.maxItems}
                      className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#bfb29a] font-bold text-forest transition-colors hover:border-forest hover:bg-sage/50"
                    >
                      <Icon name="plus" size={20} />
                      Weiteres Produkt hinzufügen
                    </button>
                  </>
                )}
              </fieldset>

              {/* Abholung */}
              <fieldset className="grid gap-4 sm:grid-cols-2">
                <legend className="mb-3 font-display text-2xl font-semibold">2. Abholung am Stand</legend>
                <Field id={fieldId('pickupDate')} label="Abholtag" required error={errors.pickupDate} hint={pickupHint}>
                  {(a) => <input {...a} type="date" className="input" min={earliest} max={latest} value={form.pickupDate} onChange={setField('pickupDate')} />}
                </Field>
                <Field id={fieldId('pickupTime')} label="Ungefähre Uhrzeit" error={errors.pickupTime} hint="Hilft uns bei der Planung.">
                  {(a) => <input {...a} type="time" className="input" value={form.pickupTime} onChange={setField('pickupTime')} />}
                </Field>
              </fieldset>

              {/* Kontakt */}
              <fieldset className="grid gap-4 sm:grid-cols-2">
                <legend className="mb-3 font-display text-2xl font-semibold">3. Deine Kontaktdaten</legend>
                <Field id={fieldId('firstName')} label="Vorname" required error={errors.firstName}>
                  {(a) => <input {...a} className="input" autoComplete="given-name" value={form.firstName} onChange={setField('firstName')} />}
                </Field>
                <Field id={fieldId('lastName')} label="Nachname" required error={errors.lastName}>
                  {(a) => <input {...a} className="input" autoComplete="family-name" value={form.lastName} onChange={setField('lastName')} />}
                </Field>
                <Field id={fieldId('email')} label="E-Mail-Adresse" required error={errors.email} hint="Für Rückfragen zu deiner Vorbestellung.">
                  {(a) => <input {...a} type="email" className="input" autoComplete="email" inputMode="email" value={form.email} onChange={setField('email')} />}
                </Field>
                <Field id={fieldId('phone')} label="Telefon" error={errors.phone} hint="Empfohlen – so erreichen wir dich schnell.">
                  {(a) => <input {...a} type="tel" className="input" autoComplete="tel" value={form.phone} onChange={setField('phone')} />}
                </Field>
                <Field id={fieldId('message')} label="Nachricht oder Hinweise" error={errors.message} className="sm:col-span-2">
                  {(a) => (
                    <textarea {...a} className="input" maxLength={1000} placeholder="z. B. Wünsche zur Reifung oder Verpackung" value={form.message} onChange={setField('message')} />
                  )}
                </Field>
                {/* Honeypot gegen Spam-Bots – für Menschen unsichtbar */}
                <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                  <label htmlFor="po-website">Website</label>
                  <input id="po-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={setField('website')} />
                </div>
              </fieldset>

              <div>
                <div className="flex items-start gap-3">
                  <input
                    id={fieldId('consent')}
                    type="checkbox"
                    className="checkbox"
                    checked={form.consent}
                    onChange={setField('consent')}
                    aria-invalid={errors.consent ? true : undefined}
                    aria-describedby={errors.consent ? 'po-consent-error' : undefined}
                    required
                  />
                  <label htmlFor={fieldId('consent')} className="text-[0.95rem] leading-relaxed">
                    Ich bin einverstanden, dass meine Angaben zur Bearbeitung dieser Vorbestellung gespeichert und verwendet
                    werden. Weitere Informationen in der{' '}
                    <a href={settings.privacyUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-forest underline underline-offset-2">
                      Datenschutzerklärung
                    </a>
                    .<span className="req" aria-hidden="true">*</span>
                  </label>
                </div>
                {errors.consent && (
                  <p id="po-consent-error" className="field-error">
                    <Icon name="alert" size={16} className="mt-0.5 flex-none" />
                    {errors.consent}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted">Keine Zahlung online – du bezahlst bei der Abholung am Stand.</p>
                <button type="submit" className="btn btn-primary" disabled={status === 'sending' || orderable.length === 0}>
                  {status === 'sending' ? 'Wird gesendet …' : 'Vorbestellung absenden'}
                  {status !== 'sending' && <Icon name="arrow" className="arrow" />}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
