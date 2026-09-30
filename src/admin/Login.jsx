import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import Icon from '../components/Icon';
import { Logo } from '../components/Bits';

export default function Login({ configured, notice, onSuccess }) {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('Bitte gib das Passwort ein.');
      inputRef.current?.focus();
      return;
    }
    setBusy(true);
    setError('');
    try {
      await api.login(password);
      setPassword('');
      onSuccess();
    } catch (err) {
      setError(err.message);
      setPassword('');
      inputRef.current?.focus();
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="relative grid min-h-svh place-items-center overflow-hidden bg-paper px-4 py-12">
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-sage blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-honey-soft blur-3xl" />
      <div className="relative w-full max-w-md">
        <a href="#start" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted no-underline hover:text-ink">
          <Icon name="chevronLeft" size={18} />
          Zurück zur Website
        </a>
        <div className="surface ticker-in p-7 sm:p-9">
          <Logo />
          <h1 className="mt-8 flex items-center gap-3 text-[2rem]">
            <Icon name="lock" size={26} className="text-forest" />
            Admin-Anmeldung
          </h1>
          <p className="mt-2 text-muted">Zugang für das Team vom Biohof Tambke.</p>

          {notice && (
            <p role="status" className="mt-6 rounded-2xl bg-sage px-4 py-3 text-sm font-semibold text-forest-dark">
              {notice}
            </p>
          )}

          {!configured ? (
            <div role="alert" className="mt-6 rounded-2xl border-2 border-honey bg-honey-soft p-4 text-sm text-ink">
              <p className="font-bold">Der Admin-Zugang ist noch nicht eingerichtet.</p>
              <p className="mt-1">
                Auf dem Server muss die Umgebungsvariable <code className="font-mono">ADMIN_PASSWORD_HASH</code> gesetzt werden
                (erzeugen mit <code className="font-mono">npm run admin:hash</code>). Details in der README.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="mt-6 grid gap-5">
              <div>
                <label htmlFor="admin-password" className="field-label">
                  Passwort
                </label>
                <div className="relative">
                  <input
                    ref={inputRef}
                    id="admin-password"
                    type={show ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="input pr-14"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? 'admin-password-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    className="absolute right-1.5 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-lg text-muted hover:bg-paper-deep hover:text-ink"
                    aria-label={show ? 'Passwort verbergen' : 'Passwort anzeigen'}
                    aria-pressed={show}
                  >
                    <Icon name={show ? 'eyeOff' : 'eye'} />
                  </button>
                </div>
                {error && (
                  <p id="admin-password-error" role="alert" className="field-error">
                    <Icon name="alert" size={16} className="mt-0.5 flex-none" />
                    {error}
                  </p>
                )}
              </div>
              <button type="submit" className="btn btn-forest w-full" disabled={busy}>
                {busy ? 'Wird geprüft …' : 'Anmelden'}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
