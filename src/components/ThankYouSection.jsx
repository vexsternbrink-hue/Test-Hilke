import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { seeded } from '../lib/random';

function DomLeaves({ count = 18 }) {
  const leaves = useMemo(() => {
    const r = seeded(77);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: r() * 100,
      delay: r() * 8,
      duration: 9 + r() * 8,
      size: 10 + r() * 14,
      rot: r() * 360,
      color: ['#F8F5F0', '#FBD5DB', '#E8A5B0'][i % 3],
    }));
  }, [count]);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {leaves.map((l) => (
        <motion.span
          key={l.id}
          initial={{ y: '-10%', x: 0, rotate: l.rot, opacity: 0 }}
          animate={{ y: '110vh', x: [0, 30, -20, 15, 0], rotate: l.rot + 540, opacity: [0, 0.8, 0.8, 0] }}
          transition={{ repeat: Infinity, duration: l.duration, delay: l.delay, ease: 'linear' }}
          style={{ left: `${l.left}%`, width: l.size, height: l.size * 1.6, background: l.color, borderRadius: '100% 0 100% 0' }}
          className="absolute top-0 block opacity-60"
        />
      ))}
    </div>
  );
}

export default function ThankYouSection() {
  return (
    <section id="danke" className="relative z-10 overflow-hidden bg-apple px-5 py-28 text-cream md:px-10 md:py-40" aria-label="Dankeschön">
      <div className="absolute -left-52 -top-64 h-[700px] w-[700px] rounded-full bg-apple-dark/60" />
      <div className="absolute -bottom-72 -right-60 h-[760px] w-[760px] rounded-full bg-apple-dark/60" />
      <DomLeaves />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto flex max-w-[900px] flex-col items-center gap-7 text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.12, 1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          className="grid h-28 w-28 place-items-center rounded-full bg-cream shadow-[0_30px_60px_-20px_rgba(0,0,0,.35)]"
          aria-hidden="true"
        >
          <svg width="56" height="52" viewBox="0 0 24 22" fill="#C41E3A">
            <path d="M12 21s-8.4-5.3-10.6-10A5.6 5.6 0 0 1 12 5.2 5.6 5.6 0 0 1 22.6 11C20.4 15.7 12 21 12 21z" />
          </svg>
        </motion.div>
        <span className="eyebrow text-[#FBD5DB]">04 · Von Herzen</span>
        <h2 className="font-display text-[clamp(2.2rem,5vw,4rem)] font-semibold leading-[1.08]">
          Ein riesengroßes Dankeschön an dieses <em>Traumteam</em>
        </h2>
        <p className="max-w-[720px] text-lg leading-relaxed text-[#FBE3E7] md:text-[21px]">
          Ohne Euch wäre unsere Arbeit nicht möglich. Bei Wind, Regen und Sonne, in Corona-Zeiten und in jeder Apfelzeit:
          Ihr seid der Grund, warum unser Stand ein Zuhause ist.
        </p>
        <div className="mt-2 flex items-center gap-4">
          <span className="h-px w-10 bg-[#FBD5DB] md:w-16" />
          <span className="font-display text-lg italic md:text-xl">Hilke, Rolf, Lea Theresa &amp; Janna Sophie Tambke</span>
          <span className="h-px w-10 bg-[#FBD5DB] md:w-16" />
        </div>
      </motion.div>
    </section>
  );
}
