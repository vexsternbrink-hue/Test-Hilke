import { formatDateShort } from '../../shared/dates.js';
import Icon from '../components/Icon';
import Reveal from '../components/Reveal';

/** Schwarzes Brett – ausführliche Ansicht aller aktuellen Meldungen. */
export default function Board({ notices }) {
  return (
    <section id="aktuelles" aria-labelledby="aktuelles-title" className="section">
      <div className="page-container">
        <Reveal variant="scale" className="chalkboard chalkboard-frame rounded-[1.75rem] px-5 py-10 sm:px-10 md:py-14">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 text-[0.78rem] font-bold uppercase tracking-[0.16em] text-honey">
                <Icon name="pinNote" size={16} />
                Aktuelle Informationen
              </span>
              <h2 id="aktuelles-title" className="mt-2 text-[clamp(2rem,1.3rem+2.6vw,3.25rem)] text-chalk-text">
                Unser Schwarzes Brett
              </h2>
              <svg className="mt-1 h-3 w-48 text-honey/80" viewBox="0 0 200 12" fill="none" aria-hidden="true">
                <path d="M2 8c40-6 90-7 196-3" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
            <p className="max-w-sm text-chalk-muted">Kurzfristige Änderungen, Neuigkeiten vom Hof und was es gerade frisch gibt.</p>
          </div>

          {notices.length ? (
            <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {notices.map((n, i) => (
                <Reveal as="li" key={n.id} delay={i * 80} className={`chalk-note p-5 md:p-6 ${n.highlighted ? 'chalk-note-important' : ''}`}>
                  <div className="flex items-center justify-between gap-3">
                    {n.highlighted ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-honey px-2.5 py-1 text-xs font-bold text-ink">
                        <Icon name="alert" size={14} /> Wichtig
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-chalk-muted">
                        <Icon name="info" size={14} /> Info
                      </span>
                    )}
                    {n.publishAt && <span className="text-xs text-chalk-muted">seit {formatDateShort(n.publishAt)}</span>}
                  </div>
                  <h3 className="mt-3 text-xl leading-snug text-chalk-text md:text-[1.35rem]">{n.title}</h3>
                  {n.body && <p className="mt-2 leading-relaxed text-chalk-muted">{n.body}</p>}
                </Reveal>
              ))}
            </ul>
          ) : (
            <p className="mt-8 rounded-2xl border border-white/15 p-6 text-chalk-muted">
              Gerade gibt es keine besonderen Hinweise – wir sind wie gewohnt auf dem Markt für dich da.
            </p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
