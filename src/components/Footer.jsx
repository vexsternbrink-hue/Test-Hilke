import { CARD_PAYMENT_TEXT } from '../../shared/defaults.js';
import Icon from './Icon';
import { Logo } from './Bits';
import { NAV } from '../lib/nav';

export default function Footer({ settings }) {
  const hours = settings.hours?.length ? settings.hours : null;
  return (
    <footer className="bg-chalk text-chalk-text" aria-label="Fußzeile">
      <div className="page-container grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-4">
          <Logo light />
          <p className="max-w-xs text-chalk-muted">{settings.tagline} Bio-Obst vom eigenen Hof auf dem {settings.marketName}.</p>
          <p className="flex max-w-xs items-start gap-2 text-sm font-semibold text-honey">
            <Icon name="card" size={18} className="mt-0.5 flex-none" />
            {CARD_PAYMENT_TEXT}
          </p>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-chalk-muted" style={{ fontFamily: 'var(--font-body)' }}>
            Marktstand
          </h2>
          <p className="mt-3 leading-relaxed">
            {settings.marketName}
            <br />
            {settings.city}
          </p>
          <ul className="mt-2 text-chalk-muted">
            {hours ? hours.map((h, i) => <li key={i}>{[h.day, h.time].filter(Boolean).join(' · ')}</li>) : <li>Markttage &amp; Zeiten: siehe „Standort &amp; Zeiten“</li>}
          </ul>
        </div>

        <nav aria-label="Fußzeilen-Navigation">
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-chalk-muted" style={{ fontFamily: 'var(--font-body)' }}>
            Auf dieser Seite
          </h2>
          <ul className="mt-3 grid gap-1.5">
            {NAV.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} className="text-chalk-text no-underline hover:text-honey">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-chalk-muted" style={{ fontFamily: 'var(--font-body)' }}>
            Rechtliches
          </h2>
          <ul className="mt-3 grid gap-1.5">
            <li>
              <a href={settings.imprintUrl} target="_blank" rel="noopener noreferrer" className="text-chalk-text no-underline hover:text-honey">
                Impressum
              </a>
            </li>
            <li>
              <a href={settings.privacyUrl} target="_blank" rel="noopener noreferrer" className="text-chalk-text no-underline hover:text-honey">
                Datenschutz
              </a>
            </li>
            <li>
              <a href={settings.website} target="_blank" rel="noopener noreferrer" className="text-chalk-text no-underline hover:text-honey">
                biohof-tambke.de
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="page-container flex flex-col gap-3 py-6 text-sm text-chalk-muted sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} {settings.brand} · Familie Tambke
          </span>
          <a href="#/admin" className="inline-flex items-center gap-1.5 text-chalk-muted no-underline hover:text-chalk-text">
            <Icon name="lock" size={14} />
            Admin
          </a>
        </div>
      </div>
    </footer>
  );
}
