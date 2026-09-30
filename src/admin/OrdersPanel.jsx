import { useCallback, useEffect, useMemo, useState } from 'react';
import { ORDER_STATUS } from '../../shared/defaults.js';
import { addDays, formatDateLong, todayIso } from '../../shared/dates.js';
import { api } from '../lib/api';
import { formatDateTime, formatQty } from '../lib/format';
import Icon from '../components/Icon';
import { Confirm, EmptyState, ErrorBox, StatusPill } from './ui';

const STATUS_TONE = { neu: 'honey', bestaetigt: 'blue', abgeholt: 'green', storniert: 'red' };

const RANGES = [
  { id: 'upcoming', label: 'Ab heute' },
  { id: 'today', label: 'Heute' },
  { id: 'week', label: 'Nächste 7 Tage' },
  { id: 'all', label: 'Alle' },
  { id: 'custom', label: 'Zeitraum …' },
];

function rangeDates(range, custom) {
  const t = todayIso();
  if (range === 'today') return { from: t, to: t };
  if (range === 'upcoming') return { from: t, to: '' };
  if (range === 'week') return { from: t, to: addDays(t, 6) };
  if (range === 'custom') return custom;
  return { from: '', to: '' };
}

function OrderCard({ order, onStatus, onNote, onDelete }) {
  const [note, setNote] = useState(order.adminNote || '');
  return (
    <article className={`surface overflow-hidden ${order.status === 'storniert' ? 'opacity-70' : ''}`}>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-paper/70 px-5 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-[0.95rem] font-bold tracking-wide">{order.ref}</span>
          <StatusPill tone={STATUS_TONE[order.status]}>{ORDER_STATUS[order.status]}</StatusPill>
        </div>
        <span className="text-xs text-muted">eingegangen {formatDateTime(order.createdAt)}</span>
      </header>
      <div className="grid gap-6 p-5 md:grid-cols-[1fr_1.2fr]">
        <div className="grid content-start gap-3 text-[0.95rem]">
          <p className="text-lg font-bold">
            {order.firstName} {order.lastName}
          </p>
          <p className="flex items-center gap-2">
            <Icon name="calendar" size={18} className="text-forest" />
            <span>
              <strong>{formatDateLong(order.pickupDate)}</strong>
              {order.pickupTime && ` · ca. ${order.pickupTime} Uhr`}
            </span>
          </p>
          <p className="flex items-center gap-2 break-all">
            <Icon name="mail" size={18} className="flex-none text-forest" />
            <a href={`mailto:${order.email}?subject=${encodeURIComponent(`Deine Vorbestellung ${order.ref}`)}`} className="text-forest underline-offset-2 hover:underline">
              {order.email}
            </a>
          </p>
          {order.phone && (
            <p className="flex items-center gap-2">
              <Icon name="phone" size={18} className="text-forest" />
              <a href={`tel:${order.phone.replace(/[^+\d]/g, '')}`} className="text-forest underline-offset-2 hover:underline">
                {order.phone}
              </a>
            </p>
          )}
          {order.message && <p className="whitespace-pre-line rounded-xl bg-paper-deep p-3 text-muted">„{order.message}“</p>}
        </div>
        <div className="grid content-start gap-4">
          <ul className="divide-y divide-line rounded-2xl border border-line">
            {order.items.map((it, i) => (
              <li key={i} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <span>
                  <span className="font-semibold">{it.productName}</span>
                  {it.variety && <span className="text-muted"> · {it.variety}</span>}
                </span>
                <span className="whitespace-nowrap font-bold">{formatQty(it.quantity, it.unit)}</span>
              </li>
            ))}
          </ul>
          <div>
            <label htmlFor={`note-${order.id}`} className="text-sm font-bold text-muted">
              Interne Notiz
            </label>
            <input
              id={`note-${order.id}`}
              className="input mt-1 min-h-10 py-2 text-sm"
              value={note}
              maxLength={500}
              placeholder="z. B. telefonisch bestätigt"
              onChange={(e) => setNote(e.target.value)}
              onBlur={() => note !== (order.adminNote || '') && onNote(order, note)}
            />
          </div>
        </div>
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3">
        <div role="group" aria-label={`Status von ${order.ref}`} className="flex flex-wrap gap-1.5">
          {Object.entries(ORDER_STATUS).map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={order.status === key}
              onClick={() => order.status !== key && onStatus(order, key)}
              className={`min-h-10 rounded-full border-2 px-3.5 text-sm font-bold transition-colors ${
                order.status === key ? 'border-forest bg-forest text-paper' : 'border-line bg-white text-ink hover:border-forest'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => onDelete(order)} className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-apple-dark hover:bg-[#fbeceb]">
          <Icon name="trash" size={16} />
          Löschen
        </button>
      </footer>
    </article>
  );
}

export default function OrdersPanel({ run, notify }) {
  const [status, setStatus] = useState('');
  const [range, setRange] = useState('upcoming');
  const [custom, setCustom] = useState({ from: todayIso(), to: addDays(todayIso(), 13) });
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');
  const [toDelete, setToDelete] = useState(null);

  const { from, to } = rangeDates(range, custom);

  const [refresh, setRefresh] = useState(0);
  const load = useCallback(() => setRefresh((n) => n + 1), []);

  useEffect(() => {
    let alive = true;
    const q = new URLSearchParams();
    if (status) q.set('status', status);
    if (from) q.set('from', from);
    if (to) q.set('to', to);
    run(() => api.list('orders', `?${q}`)).then((res) => {
      if (!alive) return;
      if (res.ok) {
        setOrders(res.data);
        setError('');
      } else setError(res.error.message);
    });
    return () => {
      alive = false;
    };
  }, [run, status, from, to, refresh]);

  const visible = useMemo(() => {
    if (!orders) return [];
    const s = search.trim().toLowerCase();
    if (!s) return orders;
    return orders.filter((o) => `${o.ref} ${o.firstName} ${o.lastName} ${o.email} ${o.phone}`.toLowerCase().includes(s));
  }, [orders, search]);

  // Packliste: Summen je Produkt/Sorte/Einheit über alle nicht stornierten Vorbestellungen der Auswahl
  const packlist = useMemo(() => {
    const map = new Map();
    for (const o of visible) {
      if (o.status === 'storniert') continue;
      for (const it of o.items) {
        const key = `${it.productName}|${it.variety}|${it.unit}`;
        map.set(key, { ...it, quantity: (map.get(key)?.quantity || 0) + it.quantity });
      }
    }
    return [...map.values()].sort((a, b) => a.productName.localeCompare(b.productName, 'de'));
  }, [visible]);

  const counts = useMemo(() => {
    const c = { neu: 0, bestaetigt: 0, abgeholt: 0, storniert: 0 };
    visible.forEach((o) => (c[o.status] += 1));
    return c;
  }, [visible]);

  const replace = (updated) => setOrders((list) => list.map((o) => (o.id === updated.id ? updated : o)));

  const changeStatus = async (order, next) => {
    const res = await run(() => api.patch('orders', order.id, { status: next }));
    if (res.ok) {
      replace(res.data);
      notify(`${order.ref}: ${ORDER_STATUS[next]}`);
    } else notify(res.error.message, 'error');
  };

  const saveNote = async (order, adminNote) => {
    const res = await run(() => api.patch('orders', order.id, { adminNote }));
    if (res.ok) {
      replace(res.data);
      notify('Notiz gespeichert');
    } else notify(res.error.message, 'error');
  };

  const confirmDelete = async () => {
    const order = toDelete;
    setToDelete(null);
    const res = await run(() => api.remove('orders', order.id));
    if (res.ok) {
      setOrders((list) => list.filter((o) => o.id !== order.id));
      notify(`${order.ref} gelöscht`);
    } else notify(res.error.message, 'error');
  };

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[2rem]">Vorbestellungen</h1>
          <p className="text-muted">Anfragen einsehen, bestätigen und als abgeholt markieren.</p>
        </div>
        <button type="button" onClick={load} className="btn btn-ghost btn-sm">
          Aktualisieren
        </button>
      </div>

      <div className="surface grid gap-4 p-5 md:grid-cols-[1.4fr_1fr_1fr]">
        <fieldset>
          <legend className="field-label">Abholtag</legend>
          <div className="flex flex-wrap gap-1.5">
            {RANGES.map((r) => (
              <button
                key={r.id}
                type="button"
                aria-pressed={range === r.id}
                onClick={() => setRange(r.id)}
                className={`min-h-10 rounded-full border-2 px-3.5 text-sm font-bold ${range === r.id ? 'border-forest bg-forest text-paper' : 'border-line bg-white hover:border-forest'}`}
              >
                {r.label}
              </button>
            ))}
          </div>
          {range === 'custom' && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="text-sm font-bold">
                von
                <input type="date" className="input mt-1" value={custom.from} onChange={(e) => setCustom((c) => ({ ...c, from: e.target.value }))} />
              </label>
              <label className="text-sm font-bold">
                bis
                <input type="date" className="input mt-1" value={custom.to} onChange={(e) => setCustom((c) => ({ ...c, to: e.target.value }))} />
              </label>
            </div>
          )}
        </fieldset>
        <div>
          <label htmlFor="order-status" className="field-label">
            Status
          </label>
          <select id="order-status" className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Alle Status</option>
            {Object.entries(ORDER_STATUS).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="order-search" className="field-label">
            Suche
          </label>
          <input id="order-search" type="search" className="input" placeholder="Name, E-Mail, Nummer" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <ErrorBox>{error}</ErrorBox>

      {orders && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="grid content-start gap-4">
            <p className="flex flex-wrap gap-2 text-sm" aria-live="polite">
              <strong>{visible.length} Vorbestellung(en)</strong>
              {Object.entries(counts)
                .filter(([, n]) => n)
                .map(([k, n]) => (
                  <StatusPill key={k} tone={STATUS_TONE[k]}>
                    {n} {ORDER_STATUS[k].toLowerCase()}
                  </StatusPill>
                ))}
            </p>
            {visible.length ? (
              visible.map((o) => <OrderCard key={`${o.id}-${o.updatedAt}`} order={o} onStatus={changeStatus} onNote={saveNote} onDelete={setToDelete} />)
            ) : (
              <EmptyState>Keine Vorbestellungen für diese Auswahl.</EmptyState>
            )}
          </div>
          <aside className="surface h-fit p-5 lg:sticky lg:top-36" aria-labelledby="packlist-title">
            <h2 id="packlist-title" className="flex items-center gap-2 text-xl">
              <Icon name="basket" className="text-forest" />
              Packliste
            </h2>
            <p className="mt-1 text-sm text-muted">Summe der Auswahl, ohne stornierte.</p>
            {packlist.length ? (
              <ul className="mt-4 divide-y divide-line">
                {packlist.map((p) => (
                  <li key={`${p.productName}|${p.variety}|${p.unit}`} className="flex justify-between gap-3 py-2 text-[0.95rem]">
                    <span>
                      {p.productName}
                      {p.variety && <span className="block text-sm text-muted">{p.variety}</span>}
                    </span>
                    <strong className="whitespace-nowrap">{formatQty(p.quantity, p.unit)}</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted">Nichts zu packen.</p>
            )}
          </aside>
        </div>
      )}

      <Confirm
        open={Boolean(toDelete)}
        title="Vorbestellung löschen?"
        text={toDelete ? `${toDelete.ref} von ${toDelete.firstName} ${toDelete.lastName} wird endgültig gelöscht. Tipp: Für abgesagte Bestellungen lieber den Status „Storniert“ verwenden.` : ''}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
