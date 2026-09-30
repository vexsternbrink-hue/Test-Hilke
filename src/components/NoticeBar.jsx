import { useEffect, useState } from 'react';
import { CARD_PAYMENT_TEXT } from '../../shared/defaults.js';
import Icon from './Icon';

const ROTATE_MS = 7000;

/**
 * Schwarzes Brett – Leiste ganz oben auf der Seite.
 * Zeigt die aktuellen Meldungen (wichtige zuerst) und wechselt automatisch durch,
 * außer bei Hover/Fokus oder wenn „reduzierte Bewegung“ eingestellt ist.
 */
export default function NoticeBar({ notices }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = notices.length;
  const current = count ? notices[index % count] : null;

  useEffect(() => {
    if (count < 2 || paused) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), ROTATE_MS);
    return () => clearInterval(t);
  }, [count, paused]);

  const go = (d) => setIndex((i) => (i + d + count) % count);

  return (
    <section
      aria-label="Schwarzes Brett – aktuelle Hinweise"
      className="chalkboard relative z-50 border-b-4 border-[#7a5534]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="page-container flex min-h-14 items-center gap-3 py-2.5 sm:gap-4">
        <span className="hidden flex-none items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-honey sm:inline-flex">
          <Icon name="pinNote" size={15} />
          Schwarzes Brett
        </span>

        <a href="#aktuelles" className="grid h-9 w-9 flex-none place-items-center rounded-full bg-white/10 text-honey sm:hidden" aria-label="Schwarzes Brett – alle Infos">
          <Icon name="pinNote" size={17} />
        </a>
        <div className="min-w-0 flex-1">
          {current ? (
            <p key={current.id} className="ticker-in flex items-baseline gap-2 text-[0.95rem] leading-snug">
              {current.highlighted && <span className="pulse-dot mt-1.5 inline-block h-2.5 w-2.5 flex-none translate-y-[-1px] rounded-full bg-honey" aria-hidden="true" />}
              <span>
                <strong className="font-bold text-chalk-text">{current.title}</strong>
                {current.body && current.body !== current.title && (
                  <span className="hidden text-chalk-muted md:inline"> – {current.body}</span>
                )}
                {current.highlighted && <span className="sr-only"> (wichtiger Hinweis)</span>}
              </span>
            </p>
          ) : (
            <p className="flex items-center gap-2 text-[0.95rem] text-chalk-text">
              <Icon name="card" size={18} className="flex-none text-honey" />
              {CARD_PAYMENT_TEXT}
            </p>
          )}
        </div>

        {count > 1 && (
          <div className="flex flex-none items-center gap-1">
            <button type="button" onClick={() => go(-1)} className="grid h-10 w-10 place-items-center rounded-full text-chalk-text transition-colors hover:bg-white/10" aria-label="Vorherige Meldung">
              <Icon name="chevronLeft" size={18} />
            </button>
            <span className="min-w-9 text-center text-xs tabular-nums text-chalk-muted" aria-live="polite">
              {(index % count) + 1}/{count}
            </span>
            <button type="button" onClick={() => go(1)} className="grid h-10 w-10 place-items-center rounded-full text-chalk-text transition-colors hover:bg-white/10" aria-label="Nächste Meldung">
              <Icon name="chevronRight" size={18} />
            </button>
          </div>
        )}
        <a href="#aktuelles" className="hidden flex-none rounded-full bg-honey px-4 py-2 text-sm font-bold text-ink no-underline transition-transform hover:-translate-y-0.5 sm:inline-flex">
          Alle Infos
        </a>
      </div>
    </section>
  );
}
