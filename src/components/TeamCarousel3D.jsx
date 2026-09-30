import { forwardRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GROUPS, TEAM } from '../data/team';

export const TEAM_VH_PER_MEMBER = 55;

/**
 * Team-Gallery: die Kisten stehen in der 3D-Allee (Scene.jsx). Diese Sektion liefert die
 * Scroll-Länge (eine Kiste pro ~55vh) und die sticky Info-Karte des aktiven Mitglieds.
 */
const TeamCarousel3D = forwardRef(function TeamCarousel3D({ activeIndex }, ref) {
  const m = TEAM[activeIndex] ?? TEAM[0];
  const group = GROUPS[m.group];
  return (
    <section
      ref={ref}
      id="team"
      className="relative z-10"
      style={{ height: `${TEAM.length * TEAM_VH_PER_MEMBER + 60}vh` }}
      aria-label="Unser Team"
    >
      <div className="sticky top-0 flex h-svh flex-col justify-between px-5 pb-8 pt-24 md:px-10 md:pb-24">
        <div className="mx-auto flex w-full max-w-[1280px] items-start justify-between gap-6">
          <div className="max-w-[560px]">
            <span className="eyebrow text-apple">02 · Das Traumteam</span>
            <h2 className="mt-3 font-display text-[clamp(2rem,4.6vw,3.6rem)] font-semibold leading-[1.05] text-wood">
              Die Menschen hinter <em className="text-apple">jedem Apfel</em>
            </h2>
          </div>
          <div className="glass hidden rounded-2xl px-4 py-3 text-sm text-wood md:block">
            <span className="font-semibold">{String(activeIndex + 1).padStart(2, '0')}</span>
            <span className="text-[#8C6E62]"> / {String(TEAM.length).padStart(2, '0')}</span>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-[1280px] items-end justify-between gap-6">
          <AnimatePresence mode="wait">
            <motion.article
              key={m.slug}
              initial={{ opacity: 0, y: 28, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -18, scale: 0.98 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="glass w-full max-w-[440px] rounded-3xl border border-[#E2D8C8] p-6 md:p-8"
            >
              <span
                className="inline-block rounded-full px-3 py-1.5 text-xs font-semibold text-cream"
                style={{ background: group.color }}
              >
                {group.label}
              </span>
              <h3 className="mt-4 font-display text-3xl font-semibold leading-tight text-wood md:text-4xl">{m.name}</h3>
              <p className="mt-2 text-sm font-medium text-leaf">{m.role}</p>
              <p className="mt-4 font-display text-lg italic leading-snug text-[#5B463F]">„{m.quote}“</p>
            </motion.article>
          </AnimatePresence>

          <ol className="glass hidden max-w-[440px] flex-wrap justify-end gap-2 rounded-2xl p-3 md:flex" aria-label="Alle Teammitglieder">
            {TEAM.map((t, i) => (
              <li
                key={t.slug}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  i === activeIndex ? 'border-apple bg-apple text-cream' : 'border-[#C9B8A8] text-[#5B463F]'
                }`}
              >
                {t.name.replace('Unsere ', '')}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
});

export default TeamCarousel3D;
