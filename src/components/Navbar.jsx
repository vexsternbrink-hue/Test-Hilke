import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import { Logo, PaymentNote } from './Bits';
import { NAV } from '../lib/nav';

/** Markiert den Menüpunkt des Abschnitts, der gerade im Bild ist. */
function useActiveSection() {
  const [active, setActive] = useState('start');
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: [0, 0.01] },
    );
    NAV.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);
  return active;
}

export default function Navbar() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const [menuTop, setMenuTop] = useState(72);
  const active = useActiveSection();
  const toggleRef = useRef(null);
  const panelRef = useRef(null);
  const headerRef = useRef(null);

  const toggleMenu = () => {
    // Das Menü beginnt direkt unter dem Header – egal, ob das Schwarze Brett darüber noch sichtbar ist.
    setMenuTop(Math.max(0, headerRef.current?.getBoundingClientRect().bottom ?? 72));
    setOpen((v) => !v);
  };

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Mobiles Menü: Escape schließt, Fokus wandert ins Menü und zurück, Seite scrollt nicht mit.
  useEffect(() => {
    if (!open) return undefined;
    const toggle = toggleRef.current;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    panelRef.current?.querySelector('a')?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      toggle?.focus();
    };
  }, [open]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1280px)');
    const close = (e) => e.matches && setOpen(false);
    mq.addEventListener('change', close);
    return () => mq.removeEventListener('change', close);
  }, []);

  const linkClass = (id) =>
    `relative rounded-full px-3 py-2 text-[0.95rem] font-semibold no-underline transition-colors ${
      active === id ? 'text-forest' : 'text-ink/80 hover:text-forest'
    }`;

  return (
    <>
      <header
        ref={headerRef}
        className={`sticky top-0 z-40 transition-[background-color,box-shadow,backdrop-filter] duration-500 ${
          solid || open ? 'bg-paper/90 shadow-[0_12px_40px_-28px_rgba(23,35,28,.6)] backdrop-blur-md' : 'bg-paper'
        }`}
      >
        <nav aria-label="Hauptnavigation" className="page-container flex h-[4.5rem] items-center justify-between gap-4">
          <a href="#start" className="no-underline" aria-label="Biohof Tambke – zum Seitenanfang">
            <Logo />
          </a>
  
          <ul className="hidden items-center gap-0.5 xl:flex">
            {NAV.filter((n) => n.id !== 'vorbestellen').map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} className={linkClass(n.id)} aria-current={active === n.id ? 'location' : undefined}>
                  {n.label}
                  <span
                    className={`absolute inset-x-3 -bottom-0.5 h-0.5 origin-left rounded-full bg-apple transition-transform duration-500 ${
                      active === n.id ? 'scale-x-100' : 'scale-x-0'
                    }`}
                    aria-hidden="true"
                  />
                </a>
              </li>
            ))}
          </ul>
  
          <div className="flex items-center gap-2">
            <a
              href="#/admin"
              className="hidden h-10 w-10 place-items-center rounded-full text-muted transition-colors hover:bg-paper-deep hover:text-ink xl:grid"
              aria-label="Admin-Bereich (Anmeldung)"
              title="Admin"
            >
              <Icon name="lock" size={18} />
            </a>
            <a href="#vorbestellen" className="btn btn-primary btn-sm hidden sm:inline-flex">
              Vorbestellen
            </a>
            <button
              ref={toggleRef}
              type="button"
              className="grid h-11 w-11 place-items-center rounded-full border border-line bg-white text-ink xl:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Menü schließen' : 'Menü öffnen'}
              onClick={toggleMenu}
            >
              <Icon name={open ? 'close' : 'menu'} size={22} />
            </button>
          </div>
        </nav>
      </header>

      {/* Außerhalb des Headers: dessen backdrop-filter würde sonst position:fixed auf den Header begrenzen. */}
      {open && (
        <div
          id="mobile-menu"
          ref={panelRef}
          style={{ top: menuTop }}
          className="ticker-in fixed inset-x-0 bottom-0 z-40 overflow-y-auto border-t border-line bg-paper xl:hidden"
        >
          <div className="page-container flex min-h-full flex-col gap-8 py-6">
            <ul className="flex flex-col">
              {NAV.map((n, i) => (
                <li key={n.id} className="hero-in border-b border-line" style={{ '--d': `${i * 40}ms` }}>
                  <a
                    href={`#${n.id}`}
                    onClick={() => setOpen(false)}
                    aria-current={active === n.id ? 'location' : undefined}
                    className={`flex items-center justify-between py-4 font-display text-2xl no-underline ${active === n.id ? 'text-apple' : 'text-ink'}`}
                  >
                    {n.label}
                    <Icon name="chevronRight" size={20} className="text-muted" />
                  </a>
                </li>
              ))}
            </ul>
            <PaymentNote />
            <a href="#/admin" onClick={() => setOpen(false)} className="mt-auto inline-flex items-center gap-2 self-start py-2 text-sm font-semibold text-muted no-underline">
              <Icon name="lock" size={16} />
              Admin
            </a>
          </div>
        </div>
      )}
    </>
  );
}
