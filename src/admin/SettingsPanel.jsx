import { useEffect, useState } from 'react';
import { WEEKDAYS } from '../../shared/dates.js';
import { validateSettings } from '../../shared/validation.js';
import { api } from '../lib/api';
import Icon from '../components/Icon';
import { AField, ErrorBox } from './ui';

// Montag zuerst – so wie man Markttage liest
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

export default function SettingsPanel({ run, notify }) {
  const [v, setV] = useState(null);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    run(() => api.getSettings()).then((res) => (res.ok ? setV(res.data) : setError(res.error.message)));
  }, [run]);

  if (!v) return <ErrorBox>{error}</ErrorBox>;

  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));
  const setHour = (i, k, val) => setV((s) => ({ ...s, hours: s.hours.map((h, j) => (j === i ? { ...h, [k]: val } : h)) }));
  const toggleDay = (d) =>
    setV((s) => ({ ...s, pickupWeekdays: s.pickupWeekdays.includes(d) ? s.pickupWeekdays.filter((x) => x !== d) : [...s.pickupWeekdays, d] }));

  const submit = async (e) => {
    e.preventDefault();
    const { errors: errs } = validateSettings(v);
    setErrors(errs);
    if (Object.keys(errs).length) {
      notify('Bitte die markierten Felder prüfen.', 'error');
      return;
    }
    setBusy(true);
    const res = await run(() => api.saveSettings(v));
    setBusy(false);
    if (res.ok) {
      setV(res.data);
      notify('Einstellungen gespeichert');
    } else {
      setErrors(res.error.fields || {});
      notify(res.error.message, 'error');
    }
  };

  const text = (k, label, props = {}) => (
    <AField id={`s-${k}`} label={label} error={errors[k]} hint={props.hint} required={props.required}>
      {(a) => <input {...a} className="input" value={v[k] ?? ''} onChange={set(k)} placeholder={props.placeholder} type={props.type || 'text'} />}
    </AField>
  );

  return (
    <form onSubmit={submit} noValidate className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[2rem]">Standort &amp; Zeiten</h1>
          <p className="text-muted">Leere Felder erscheinen auf der Website als gelb markierter Platzhalter.</p>
        </div>
        <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>
          <Icon name="check" size={18} />
          {busy ? 'Speichert …' : 'Speichern'}
        </button>
      </div>

      <section className="surface grid gap-5 p-6" aria-labelledby="s-loc">
        <h2 id="s-loc" className="text-xl">
          Standort
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {text('marketName', 'Name des Marktes', { required: true })}
          {text('city', 'Ort / Stadtteil')}
          {text('address', 'Adresse des Marktplatzes', { placeholder: 'Straße, PLZ Ort' })}
          {text('standHint', 'Wo steht unser Stand?', { placeholder: 'z. B. gegenüber dem Brunnen' })}
        </div>
      </section>

      <section className="surface grid gap-5 p-6" aria-labelledby="s-hours">
        <h2 id="s-hours" className="text-xl">
          Markttage &amp; Uhrzeiten
        </h2>
        {v.hours.length === 0 && <p className="text-muted">Noch keine Markttage eingetragen.</p>}
        <ul className="grid gap-3">
          {v.hours.map((h, i) => (
            <li key={i} className="grid grid-cols-[1fr_1fr_auto] items-end gap-3">
              <label className="text-sm font-bold">
                Tag
                <input className="input mt-1" value={h.day} placeholder="z. B. Samstag" onChange={(e) => setHour(i, 'day', e.target.value)} />
              </label>
              <label className="text-sm font-bold">
                Uhrzeit
                <input className="input mt-1" value={h.time} placeholder="z. B. 8–13 Uhr" onChange={(e) => setHour(i, 'time', e.target.value)} />
              </label>
              <button
                type="button"
                onClick={() => setV((s) => ({ ...s, hours: s.hours.filter((_, j) => j !== i) }))}
                className="grid h-12 w-12 place-items-center rounded-full text-apple-dark hover:bg-[#fbeceb]"
                aria-label={`Markttag ${i + 1} entfernen`}
              >
                <Icon name="trash" size={18} />
              </button>
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => setV((s) => ({ ...s, hours: [...s.hours, { day: '', time: '' }] }))} className="btn btn-outline btn-sm self-start justify-self-start">
          <Icon name="plus" size={18} />
          Markttag hinzufügen
        </button>
        {text('hoursNote', 'Zusatzhinweis zu den Zeiten', { placeholder: 'z. B. An Feiertagen abweichend – siehe Schwarzes Brett' })}
      </section>

      <section className="surface grid gap-5 p-6" aria-labelledby="s-orders">
        <h2 id="s-orders" className="text-xl">
          Vorbestellung
        </h2>
        <fieldset>
          <legend className="field-label">Abholung möglich an</legend>
          <div className="flex flex-wrap gap-2">
            {WEEK_ORDER.map((d) => (
              <label key={d} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-2 border-line bg-white px-4 text-sm font-bold has-[:checked]:border-forest has-[:checked]:bg-sage">
                <input type="checkbox" className="checkbox mt-0 h-4 w-4" checked={v.pickupWeekdays.includes(d)} onChange={() => toggleDay(d)} />
                {WEEKDAYS[d]}
              </label>
            ))}
          </div>
          <p className="field-hint">Keiner ausgewählt = jeder Tag wählbar. Tipp: nur die Markttage anhaken.</p>
        </fieldset>
        <AField id="s-lead" label="Vorlauf in Tagen" hint="Frühester Abholtag = heute + Vorlauf (0–14).">
          {(a) => <input {...a} type="number" min={0} max={14} className="input max-w-32" value={v.orderLeadDays} onChange={set('orderLeadDays')} />}
        </AField>
      </section>

      <section className="surface grid gap-5 p-6" aria-labelledby="s-contact">
        <h2 id="s-contact" className="text-xl">
          Kontakt &amp; Bild
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {text('phone', 'Telefon', { type: 'tel' })}
          {text('email', 'E-Mail', { type: 'email' })}
        </div>
        {text('heroImage', 'Foto für den Startbereich (URL)', {
          hint: 'Querformat, mind. 1600 px breit. Datei nach public/images/ legen und z. B. /images/marktstand.jpg eintragen. Leer = Illustration.',
        })}
      </section>

      <div className="flex justify-end">
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Speichert …' : 'Einstellungen speichern'}
        </button>
      </div>
    </form>
  );
}
