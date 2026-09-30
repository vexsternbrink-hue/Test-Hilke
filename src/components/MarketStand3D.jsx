import { Suspense, lazy, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SORTIMENT } from '../data/sortiment';

// Lazy Loading: die zweite Canvas + Marktstand-Geometrie werden erst geladen,
// wenn die Sektion gerendert wird.
const MarketCanvas = lazy(() => import('./MarketCanvas'));

export default function MarketStand3D() {
  const [selected, setSelected] = useState('apfel');
  const item = SORTIMENT.find((s) => s.id === selected);

  return (
    <section id="markt" className="relative z-10 bg-cream px-5 py-24 md:px-10 md:py-32" aria-label="Marktstand und Sortiment">
      <div className="mx-auto grid w-full max-w-[1280px] items-center gap-12 md:grid-cols-[minmax(0,480px)_minmax(0,1fr)] md:gap-16">
        <div className="flex flex-col gap-6">
          <span className="eyebrow text-apple">03 · Der Marktstand</span>
          <h2 className="font-display text-[clamp(2rem,4.6vw,3.6rem)] font-semibold leading-[1.05] text-wood">
            Klick dich durch <em className="text-leaf">unser Sortiment</em>
          </h2>
          <p className="text-[17px] leading-relaxed text-[#5B463F]">
            Jede Kiste auf dem Stand ist klickbar. Der Stand dreht sich sanft mit der Maus, die Kisten heben sich beim Hover.
          </p>

          <div className="flex gap-2" role="tablist" aria-label="Sortiment">
            {SORTIMENT.map((s) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={selected === s.id}
                onClick={() => setSelected(s.id)}
                className={`h-11 rounded-full border px-4 text-sm font-semibold transition-colors ${
                  selected === s.id ? 'border-wood bg-wood text-cream' : 'border-[#C9B8A8] text-wood hover:border-wood'
                }`}
              >
                {s.title}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              className="rounded-3xl border border-[#E2D8C8] bg-white p-7 shadow-[0_30px_60px_-40px_rgba(62,39,35,.4)]"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full px-3 py-1.5 text-xs font-semibold text-cream" style={{ background: item.color }}>
                  {item.season}
                </span>
                <span className="text-xs text-[#8C6E62]">Ausgewählt</span>
              </div>
              <h3 className="mt-4 font-display text-3xl font-semibold text-wood md:text-[34px]">{item.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-[#5B463F]">{item.text}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {item.tags.map((t) => (
                  <li key={t} className="rounded-full border border-[#E2D8C8] px-3 py-1.5 text-xs text-wood">
                    {t}
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[28px] bg-cream-dark md:aspect-[5/4]">
          <Suspense
            fallback={
              <div className="grid h-full w-full place-items-center text-sm text-[#8C6E62]">Marktstand wird aufgebaut …</div>
            }
          >
            <MarketCanvas selected={selected} onSelect={setSelected} />
          </Suspense>
          <div className="pointer-events-none absolute right-4 top-4 rounded-2xl bg-wood px-4 py-3 text-xs text-cream">
            <div className="font-semibold">Hover: Kiste hebt sich</div>
            <div className="text-[#D9C8BC]">Klick: Info-Karte</div>
          </div>
        </div>
      </div>
    </section>
  );
}
