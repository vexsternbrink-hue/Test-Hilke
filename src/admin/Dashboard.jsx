import { useCallback, useEffect, useRef, useState } from 'react';
import Icon from '../components/Icon';
import { Logo } from '../components/Bits';
import OrdersPanel from './OrdersPanel';
import NoticesPanel from './NoticesPanel';
import ProductsPanel from './ProductsPanel';
import SettingsPanel from './SettingsPanel';

const TABS = [
  { id: 'orders', label: 'Vorbestellungen', icon: 'basket', Panel: OrdersPanel },
  { id: 'notices', label: 'Schwarzes Brett', icon: 'pinNote', Panel: NoticesPanel },
  { id: 'products', label: 'Produkte', icon: 'leaf', Panel: ProductsPanel },
  { id: 'settings', label: 'Standort & Zeiten', icon: 'clock', Panel: SettingsPanel },
];

export default function Dashboard({ onLogout, onUnauthorized }) {
  const [tab, setTab] = useState('orders');
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(0);
  const tabRefs = useRef({});

  const notify = useCallback((text, tone = 'ok') => {
    clearTimeout(toastTimer.current);
    setToast({ text, tone, id: Date.now() });
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }, []);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  /** Führt einen API-Aufruf aus; bei abgelaufener Sitzung zurück zum Login. */
  const run = useCallback(
    async (fn) => {
      try {
        return { ok: true, data: await fn() };
      } catch (err) {
        if (err.status === 401) onUnauthorized();
        return { ok: false, error: err };
      }
    },
    [onUnauthorized],
  );

  const onTabKey = (e, i) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const next = TABS[(i + (e.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length];
    setTab(next.id);
    tabRefs.current[next.id]?.focus();
  };

  const Active = TABS.find((t) => t.id === tab).Panel;

  return (
    <div className="min-h-svh bg-paper">
      <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur">
        <div className="page-container flex h-16 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Logo compact />
            <span className="hidden rounded-full bg-forest px-2.5 py-1 text-xs font-bold text-paper sm:inline">Admin</span>
          </div>
          <div className="flex flex-none items-center gap-1">
            <a href="#start" className="btn btn-ghost btn-sm px-3" aria-label="Zur Website">
              <Icon name="globe" size={18} />
              <span className="hidden sm:inline">Zur Website</span>
            </a>
            <button type="button" onClick={onLogout} className="btn btn-outline btn-sm px-3" aria-label="Abmelden">
              <Icon name="logout" size={18} />
              <span className="hidden sm:inline">Abmelden</span>
            </button>
          </div>
        </div>
        <div className="page-container">
          <div role="tablist" aria-label="Admin-Bereiche" className="carousel -mx-1 flex gap-1 overflow-x-auto pb-2">
            {TABS.map((t, i) => (
              <button
                key={t.id}
                ref={(el) => (tabRefs.current[t.id] = el)}
                id={`tab-${t.id}`}
                role="tab"
                type="button"
                aria-selected={tab === t.id}
                aria-controls={`panel-${t.id}`}
                tabIndex={tab === t.id ? 0 : -1}
                onClick={() => setTab(t.id)}
                onKeyDown={(e) => onTabKey(e, i)}
                className={`flex min-h-11 flex-none items-center gap-2 rounded-full px-4 text-sm font-bold transition-colors ${
                  tab === t.id ? 'bg-forest text-paper' : 'text-muted hover:bg-paper-deep hover:text-ink'
                }`}
              >
                <Icon name={t.icon} size={17} />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="page-container py-8 md:py-10">
        <Active run={run} notify={notify} />
      </main>

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">
        {toast && (
          <p
            key={toast.id}
            className={`ticker-in pointer-events-auto flex items-center gap-2 rounded-full px-5 py-3 font-semibold shadow-xl ${
              toast.tone === 'error' ? 'bg-apple text-white' : 'bg-ink text-paper'
            }`}
          >
            <Icon name={toast.tone === 'error' ? 'alert' : 'check'} size={18} />
            {toast.text}
          </p>
        )}
      </div>
    </div>
  );
}
