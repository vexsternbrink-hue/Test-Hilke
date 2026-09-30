import { CARD_PAYMENT_TEXT } from '../../shared/defaults.js';
import Icon from './Icon';

/**
 * Sichtbarer Platzhalter für Angaben, die noch fehlen (z. B. Markttage, Telefon).
 * Bewusst auffällig gestaltet, damit er vor dem Livegang nicht übersehen wird.
 */
export function Missing({ children }) {
  return (
    <span className="placeholder-chip" title="Platzhalter – bitte im Admin-Bereich unter „Standort & Zeiten“ eintragen">
      <Icon name="edit" size={14} />
      Platzhalter: {children}
    </span>
  );
}

/** Hinweis zur Kartenzahlung – an mehreren Stellen der Seite eingesetzt. */
export function PaymentNote({ variant = 'light', className = '', style }) {
  const styles = {
    light: 'bg-sage text-forest-dark border-[#c9d6bb]',
    dark: 'bg-white/8 text-chalk-text border-white/15',
    honey: 'bg-honey-soft text-ink border-[#ecd09a]',
  };
  return (
    <p style={style} className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-[0.95rem] font-semibold leading-snug ${styles[variant]} ${className}`}>
      <Icon name="card" size={22} className="mt-px flex-none" />
      <span>{CARD_PAYMENT_TEXT}</span>
    </p>
  );
}

export function SectionHeader({ eyebrow, title, children, align = 'left', id }) {
  return (
    <div className={`flex flex-col gap-4 ${align === 'center' ? 'items-center text-center' : ''}`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 id={id} className="section-title">
        {title}
      </h2>
      {children && <div className={`lead ${align === 'center' ? 'mx-auto' : ''}`}>{children}</div>}
    </div>
  );
}

export function Logo({ light = false, compact = false }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className={`grid h-10 w-10 flex-none place-items-center rounded-full ${light ? 'bg-paper' : 'bg-forest'}`}>
        <svg width="20" height="22" viewBox="0 0 20 22" fill="none" aria-hidden="true">
          <path
            d="M10 6.5c-3-3-8.5-1.5-8.5 5 0 5 3 9.5 5.8 9.5 1 0 1.6-.5 2.7-.5s1.7.5 2.7.5c2.8 0 5.8-4.5 5.8-9.5 0-6.5-5.5-8-8.5-5z"
            fill="#B42E26"
          />
          <path d="M10 6.5V2.5" stroke={light ? '#1E4A34' : '#FBF7EF'} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M10.5 3.5c1.8-1.8 4.4-1.8 5.5-.6-1.6 1.6-3.8 1.7-5.5.6z" fill="#8DBA55" />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className={`whitespace-nowrap font-display text-[1.2rem] font-semibold tracking-tight ${light ? 'text-paper' : 'text-ink'}`}>Biohof Tambke</span>
        {!compact && (
          <span className={`mt-1 text-[0.7rem] font-bold uppercase tracking-[0.14em] ${light ? 'text-chalk-muted' : 'text-muted'}`}>
            Wochenmarkt Volksdorf
          </span>
        )}
      </span>
    </span>
  );
}
