import { useEffect, useState } from 'react';
import { DEFAULT_NOTICES, DEFAULT_PRODUCTS, DEFAULT_SETTINGS } from '../../shared/defaults.js';
import { todayIso } from '../../shared/dates.js';
import { api } from './api';

const FALLBACK = {
  today: todayIso(),
  settings: DEFAULT_SETTINGS,
  products: DEFAULT_PRODUCTS,
  notices: DEFAULT_NOTICES,
};

/**
 * Lädt die öffentlichen Inhalte (Meldungen, Produkte, Standort/Zeiten).
 * Bis die Antwort da ist – oder falls die API nicht erreichbar ist – werden die
 * Standardinhalte angezeigt, damit die Seite nie leer bleibt.
 */
export function useSiteData() {
  const [state, setState] = useState({ ...FALLBACK, status: 'loading' });

  useEffect(() => {
    let alive = true;
    api
      .getPublic()
      .then((data) => alive && setState({ ...data, status: 'ready' }))
      .catch(() => alive && setState((s) => ({ ...s, status: 'offline' })));
    return () => {
      alive = false;
    };
  }, []);

  return state;
}
