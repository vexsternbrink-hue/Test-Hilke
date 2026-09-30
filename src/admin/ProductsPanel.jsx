import { useCallback, useEffect, useState } from 'react';
import { PRODUCT_ARTS, PRODUCT_BADGES, PRODUCT_CATEGORIES } from '../../shared/defaults.js';
import { validateProduct } from '../../shared/validation.js';
import { api } from '../lib/api';
import FruitArt from '../components/FruitArt';
import Icon from '../components/Icon';
import { AField, Confirm, EmptyState, ErrorBox, Modal, StatusPill, Toggle } from './ui';

const BLANK = {
  name: '',
  category: 'Obst',
  description: '',
  origin: 'Biohof Tambke · Bio',
  price: '',
  season: '',
  available: true,
  badge: '',
  image: '',
  art: 'apple',
  sort: 10,
};

function Thumb({ product, className = '' }) {
  return (
    <div className={`overflow-hidden rounded-xl ${className}`}>
      {product.image ? <img src={product.image} alt="" className="h-full w-full object-cover" /> : <FruitArt art={product.art} />}
    </div>
  );
}

function ProductForm({ initial, onSave, onCancel }) {
  const [v, setV] = useState({ ...BLANK, ...initial });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (val) => setV((s) => ({ ...s, [k]: val }));
  const input = (k) => (e) => set(k)(e.target.value);

  const submit = async (e) => {
    e.preventDefault();
    const { errors: errs } = validateProduct(v);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    const fieldErrors = await onSave({ ...v, sort: Number(v.sort) || 0 });
    setBusy(false);
    if (fieldErrors) setErrors(fieldErrors);
  };

  return (
    <form onSubmit={submit} noValidate className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <AField id="p-name" label="Name" required error={errors.name} hint="z. B. „Äpfel“ oder eine Sorte wie „Apfel Elstar“">
          {(a) => <input {...a} className="input" maxLength={80} value={v.name} onChange={input('name')} />}
        </AField>
        <AField id="p-cat" label="Kategorie">
          {(a) => (
            <select {...a} className="input" value={v.category} onChange={input('category')}>
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          )}
        </AField>
      </div>
      <AField id="p-desc" label="Kurzbeschreibung" hint="1–2 Sätze">
        {(a) => <textarea {...a} className="input" maxLength={400} value={v.description} onChange={input('description')} />}
      </AField>
      <div className="grid gap-4 sm:grid-cols-2">
        <AField id="p-origin" label="Herkunft / Zusatz">
          {(a) => <input {...a} className="input" maxLength={120} value={v.origin} onChange={input('origin')} />}
        </AField>
        <AField id="p-season" label="Saison" hint="z. B. „Apfelzeit · Herbst“">
          {(a) => <input {...a} className="input" maxLength={80} value={v.season} onChange={input('season')} />}
        </AField>
        <AField id="p-price" label="Preis-Hinweis" hint="Leer = „Aktuelle Preise erfährst du am Stand.“">
          {(a) => <input {...a} className="input" maxLength={60} placeholder="z. B. 3,50 € / kg" value={v.price} onChange={input('price')} />}
        </AField>
        <AField id="p-badge" label="Hinweis-Etikett">
          {(a) => (
            <select {...a} className="input" value={v.badge} onChange={input('badge')}>
              {PRODUCT_BADGES.map((b) => (
                <option key={b} value={b}>
                  {b || 'Kein Etikett'}
                </option>
              ))}
            </select>
          )}
        </AField>
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <AField
          id="p-image"
          label="Foto (URL)"
          error={errors.image}
          hint="Eigenes Foto nach public/images/ legen und z. B. /images/aepfel.jpg eintragen – oder eine https-Adresse. Leer = Illustration."
        >
          {(a) => <input {...a} className="input" maxLength={500} value={v.image} onChange={input('image')} />}
        </AField>
        <AField id="p-art" label="Illustration">
          {(a) => (
            <select {...a} className="input" value={v.art} onChange={input('art')}>
              {Object.entries(PRODUCT_ARTS).map(([k, l]) => (
                <option key={k} value={k}>
                  {l}
                </option>
              ))}
            </select>
          )}
        </AField>
      </div>
      <div className="flex items-center gap-4 rounded-2xl bg-paper-deep p-3">
        <Thumb product={v} className="h-20 w-24 flex-none" />
        <p className="text-sm text-muted">Vorschau des Produktbilds{v.image ? '' : ' (Illustration, da kein Foto hinterlegt ist)'}.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_8rem] sm:items-end">
        <Toggle id="p-available" checked={v.available} onChange={set('available')} label="Jetzt erhältlich & vorbestellbar" description="Aus = „Außerhalb der Saison“, nicht im Vorbestellformular." />
        <AField id="p-sort" label="Reihenfolge">
          {(a) => <input {...a} type="number" className="input" value={v.sort} onChange={input('sort')} />}
        </AField>
      </div>
      <div className="flex justify-end gap-3 border-t border-line pt-5">
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
          Abbrechen
        </button>
        <button type="submit" className="btn btn-forest btn-sm" disabled={busy}>
          {busy ? 'Speichert …' : 'Speichern'}
        </button>
      </div>
    </form>
  );
}

export default function ProductsPanel({ run, notify }) {
  const [list, setList] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const [refresh, setRefresh] = useState(0);
  const load = useCallback(() => setRefresh((n) => n + 1), []);

  useEffect(() => {
    let alive = true;
    run(() => api.list('products')).then((res) => {
      if (!alive) return;
      if (res.ok) setList(res.data);
      else setError(res.error.message);
    });
    return () => {
      alive = false;
    };
  }, [run, refresh]);

  const save = async (values) => {
    const isNew = editing === 'new';
    const res = await run(() => (isNew ? api.create('products', values) : api.update('products', editing.id, values)));
    if (!res.ok) {
      notify(res.error.message, 'error');
      return res.error.fields;
    }
    setEditing(null);
    notify(isNew ? 'Produkt angelegt' : 'Produkt gespeichert');
    load();
    return null;
  };

  const toggleAvailable = async (p) => {
    const res = await run(() => api.update('products', p.id, { ...p, available: !p.available }));
    if (res.ok) {
      notify(res.data.available ? `${p.name}: jetzt erhältlich` : `${p.name}: außerhalb der Saison`);
      load();
    } else notify(res.error.message, 'error');
  };

  const remove = async () => {
    const p = toDelete;
    setToDelete(null);
    const res = await run(() => api.remove('products', p.id));
    if (res.ok) {
      notify('Produkt entfernt');
      load();
    } else notify(res.error.message, 'error');
  };

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[2rem]">Produkte</h1>
          <p className="text-muted">Sortiment, Saison und Verfügbarkeit für die Produktkarten und das Vorbestellformular.</p>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setEditing('new')}>
          <Icon name="plus" size={18} />
          Neues Produkt
        </button>
      </div>

      <ErrorBox>{error}</ErrorBox>

      {list &&
        (list.length ? (
          <ul className="grid gap-3">
            {list.map((p) => (
              <li key={p.id} className="surface flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <Thumb product={p} className="aspect-[4/3] w-full flex-none sm:h-20 sm:w-24" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl">{p.name}</h2>
                    <StatusPill tone={p.available ? 'green' : 'muted'}>{p.available ? 'Erhältlich' : 'Außerhalb der Saison'}</StatusPill>
                    {p.badge && <StatusPill tone="honey">{p.badge}</StatusPill>}
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {[p.category, p.season, p.price || 'kein Preis hinterlegt'].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => toggleAvailable(p)} className="btn btn-ghost btn-sm">
                    {p.available ? 'Nicht verfügbar' : 'Verfügbar'}
                  </button>
                  <button type="button" onClick={() => setEditing(p)} className="btn btn-outline btn-sm" aria-label={`${p.name} bearbeiten`}>
                    <Icon name="edit" size={16} />
                    Bearbeiten
                  </button>
                  <button type="button" onClick={() => setToDelete(p)} className="grid h-10 w-10 place-items-center rounded-full text-apple-dark hover:bg-[#fbeceb]" aria-label={`${p.name} entfernen`}>
                    <Icon name="trash" size={18} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState>Noch keine Produkte angelegt.</EmptyState>
        ))}

      <Modal wide open={Boolean(editing)} onClose={() => setEditing(null)} title={editing === 'new' ? 'Neues Produkt' : 'Produkt bearbeiten'}>
        {editing && <ProductForm key={editing === 'new' ? 'new' : editing.id} initial={editing === 'new' ? BLANK : editing} onSave={save} onCancel={() => setEditing(null)} />}
      </Modal>
      <Confirm
        open={Boolean(toDelete)}
        title="Produkt entfernen?"
        text={toDelete ? `„${toDelete.name}“ wird aus dem Sortiment entfernt. Bestehende Vorbestellungen behalten den Produktnamen. Nur saisonal pausieren? Dann lieber „Nicht verfügbar“ wählen.` : ''}
        confirmLabel="Entfernen"
        onConfirm={remove}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
