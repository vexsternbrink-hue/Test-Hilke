import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import Login from './Login';
import Dashboard from './Dashboard';

/**
 * Admin-Bereich unter /#/admin.
 * Die Anmeldung wird ausschließlich vom Server geprüft (siehe server/auth.js). Das Frontend
 * kennt weder Passwort noch Hash – es fragt nur, ob die Cookie-Sitzung gültig ist.
 */
export default function AdminApp() {
  const [state, setState] = useState({ phase: 'checking', configured: true, notice: '' });

  useEffect(() => {
    api
      .session()
      .then((s) => setState({ phase: s.authenticated ? 'in' : 'out', configured: s.configured, notice: '' }))
      .catch(() => setState({ phase: 'out', configured: true, notice: 'Der Server ist nicht erreichbar. Der Admin-Bereich benötigt die laufende API.' }));
  }, []);

  const onUnauthorized = useCallback(() => {
    setState((s) => ({ ...s, phase: 'out', notice: 'Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.' }));
  }, []);

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setState((s) => ({ ...s, phase: 'out', notice: 'Du wurdest abgemeldet.' }));
    }
  };

  if (state.phase === 'checking') {
    return <div className="grid min-h-svh place-items-center bg-paper text-muted">Anmeldung wird geprüft …</div>;
  }
  if (state.phase === 'out') {
    return <Login configured={state.configured} notice={state.notice} onSuccess={() => setState((s) => ({ ...s, phase: 'in', notice: '' }))} />;
  }
  return <Dashboard onLogout={logout} onUnauthorized={onUnauthorized} />;
}
