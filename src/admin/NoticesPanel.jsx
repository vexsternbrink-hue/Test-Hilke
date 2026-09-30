import { useCallback, useEffect, useState } from 'react';
import { formatDateShort, noticeState } from '../../shared/dates.js';
import { validateNotice } from '../../shared/validation.js';
import { api } from '../lib/api';
import Icon from '../components/Icon';
import { AField, Confirm, EmptyState, ErrorBox, Modal, StatusPill, Toggle } from './ui';

const STATE = {
  sichtbar: { tone: 'green', label: 'Sichtbar' },
  geplant: { tone: 'blue', label: 'Geplant' },
  abgelaufen: { tone: 'muted', label: 'Abgelaufen' },
  inaktiv: { tone: 'muted', label: 'Deaktiviert' },
};

const BLANK = { title: '', body: '', highlighted: false, active: true, publishAt: '', expiresAt: '' };

function NoticeForm({ initial, onSave, onCancel }) {
  const [v, setV] = useState({ ...BLANK, ...initial, publishAt: initial?.publishAt || '', expiresAt: initial?.expiresAt || '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (val) => setV((s) => ({ ...s, [k]: val }));

  const submit = async (e) => {
    e.preventDefault();
    const { errors: errs } = validateNotice(v);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    const fieldErrors = await onSave(v);
    setBusy(false);
    if (fieldErrors) setErrors(fieldErrors);
  };

  return (
    <form onSubmit={submit} noValidate className="grid gap-5">
      <AField id="n-title" label="Überschrift" required error={errors.title} hint="Kurz und klar, z. B. „Samstag nicht auf dem Markt“.">
        {(a) => <input {...a} className="input" maxLength={120} value={v.title} onChange={(e) => set('title')(e.target.value)} />}
      </AField>
      <AField id="n-body" label="Text" error={errors.body} hint="Optional, max. 600 Zeichen.">
        {(a) => <textarea {...a} className="input" maxLength={600} value={v.body} onChange={(e) => set('body')(e.target.value)} />}
      </AField>
      <div className="grid gap-4 sm:grid-cols-2">
        <AField id="n-publish" label="Veröffentlichen ab" error={errors.publishAt} hint="Leer = sofort">
          {(a) => <input {...a} type="date" className="input" value={v.publishAt} onChange={(e) => set('publishAt')(e.target.value)} />}
        </AField>
        <AField id="n-expire" label="Ablaufdatum" error={errors.expiresAt} hint="Leer = bleibt stehen. Letzter sichtbarer Tag.">
          {(a) => <input {...a} type="date" className="input" value={v.expiresAt} onChange={(e) => set('expiresAt')(e.target.value)} />}
        </AField>
      </div>
      <Toggle id="n-active" checked={v.active} onChange={set('active')} label="Aktiv" description="Deaktivierte Meldungen bleiben gespeichert, werden aber nicht angezeigt." />
      <Toggle id="n-highlight" checked={v.highlighted} onChange={set('highlighted')} label="Als wichtig hervorheben" description="Erscheint zuerst und im Startbereich unter „Aktuell wichtig“." />
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

export default function NoticesPanel({ run, notify }) {
  const [list, setList] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | notice
  const [toDelete, setToDelete] = useState(null);

  const [refresh, setRefresh] = useState(0);
  const load = useCallback(() => setRefresh((n) => n + 1), []);

  useEffect(() => {
    let alive = true;
    run(() => api.list('notices')).then((res) => {
      if (!alive) return;
      if (res.ok) setList(res.data);
      else setError(res.error.message);
    });
    return () => {
      alive = false;
    };
  }, [run, refresh]);

  const save = async (values) => {
    const payload = { ...values, publishAt: values.publishAt || null, expiresAt: values.expiresAt || null };
    const isNew = editing === 'new';
    const res = await run(() => (isNew ? api.create('notices', payload) : api.update('notices', editing.id, payload)));
    if (!res.ok) {
      notify(res.error.message, 'error');
      return res.error.fields;
    }
    setEditing(null);
    notify(isNew ? 'Meldung erstellt' : 'Meldung gespeichert');
    load();
    return null;
  };

  const toggleActive = async (n) => {
    const res = await run(() => api.update('notices', n.id, { ...n, active: !n.active }));
    if (res.ok) {
      notify(res.data.active ? 'Meldung aktiviert' : 'Meldung deaktiviert');
      load();
    } else notify(res.error.message, 'error');
  };

  const remove = async () => {
    const n = toDelete;
    setToDelete(null);
    const res = await run(() => api.remove('notices', n.id));
    if (res.ok) {
      notify('Meldung gelöscht');
      load();
    } else notify(res.error.message, 'error');
  };

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[2rem]">Schwarzes Brett</h1>
          <p className="text-muted">Kurzfristige Hinweise für die Leiste ganz oben und den Bereich „Aktuelles“.</p>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setEditing('new')}>
          <Icon name="plus" size={18} />
          Neue Meldung
        </button>
      </div>

      <ErrorBox>{error}</ErrorBox>

      {list &&
        (list.length ? (
          <ul className="grid gap-3">
            {list.map((n) => {
              const st = STATE[noticeState(n)];
              return (
                <li key={n.id} className="surface flex flex-col gap-4 p-5 md:flex-row md:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill tone={st.tone}>{st.label}</StatusPill>
                      {n.highlighted && <StatusPill tone="honey">Wichtig</StatusPill>}
                      {(n.publishAt || n.expiresAt) && (
                        <span className="text-xs text-muted">
                          {n.publishAt ? `ab ${formatDateShort(n.publishAt)}` : 'ab sofort'}
                          {n.expiresAt ? ` · bis ${formatDateShort(n.expiresAt)}` : ''}
                        </span>
                      )}
                    </div>
                    <h2 className="mt-2 text-xl">{n.title}</h2>
                    {n.body && <p className="mt-1 line-clamp-2 text-muted">{n.body}</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button type="button" onClick={() => toggleActive(n)} className="btn btn-ghost btn-sm" aria-label={`${n.title} ${n.active ? 'deaktivieren' : 'aktivieren'}`}>
                      {n.active ? 'Deaktivieren' : 'Aktivieren'}
                    </button>
                    <button type="button" onClick={() => setEditing(n)} className="btn btn-outline btn-sm" aria-label={`${n.title} bearbeiten`}>
                      <Icon name="edit" size={16} />
                      Bearbeiten
                    </button>
                    <button
                      type="button"
                      onClick={() => setToDelete(n)}
                      className="grid h-10 w-10 place-items-center rounded-full text-apple-dark hover:bg-[#fbeceb]"
                      aria-label={`${n.title} löschen`}
                    >
                      <Icon name="trash" size={18} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState>Noch keine Meldungen. Lege die erste mit „Neue Meldung“ an.</EmptyState>
        ))}

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing === 'new' ? 'Neue Meldung' : 'Meldung bearbeiten'}>
        {editing && <NoticeForm key={editing === 'new' ? 'new' : editing.id} initial={editing === 'new' ? BLANK : editing} onSave={save} onCancel={() => setEditing(null)} />}
      </Modal>
      <Confirm
        open={Boolean(toDelete)}
        title="Meldung löschen?"
        text={toDelete ? `„${toDelete.title}“ wird endgültig gelöscht. Zum vorübergehenden Ausblenden lieber „Deaktivieren“ nutzen.` : ''}
        onConfirm={remove}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
