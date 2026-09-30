import { useEffect, useRef } from 'react';

let observer;
function getObserver() {
  if (observer || typeof IntersectionObserver === 'undefined') return observer;
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          observer.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );
  return observer;
}

/**
 * Blendet Inhalte beim Scrollen weich ein (Opacity + Transform → GPU-freundlich).
 * Ein gemeinsamer IntersectionObserver für alle Elemente; ohne Observer-Unterstützung
 * oder bei „reduzierter Bewegung“ sind Inhalte sofort sichtbar.
 */
export default function Reveal({ as: Tag = 'div', delay = 0, variant = 'up', className = '', style, children, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const io = getObserver();
    if (!el) return undefined;
    if (!io) {
      el.classList.add('is-visible');
      return undefined;
    }
    io.observe(el);
    return () => io.unobserve(el);
  }, []);
  return (
    <Tag
      ref={ref}
      className={`${variant === 'scale' ? 'reveal-scale' : 'reveal'} ${className}`}
      style={{ ...style, '--reveal-delay': `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
