import { forwardRef } from 'react';
import { motion } from 'framer-motion';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.9 } },
};
const item = {
  hidden: { y: 40, opacity: 0, filter: 'blur(8px)' },
  show: { y: 0, opacity: 1, filter: 'blur(0px)', transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
};

/**
 * Hero – der DOM-Layer über der 3D-Szene (Baum im Wind kommt aus Scene.jsx).
 * `progress` (0..1) blendet den Text beim Scrollen weich aus.
 */
const Hero3D = forwardRef(function Hero3D({ progress = 0 }, ref) {
  const fade = Math.max(0, 1 - progress * 2.2);
  return (
    <section ref={ref} id="top" className="relative z-10 flex min-h-svh flex-col justify-end px-5 pb-24 pt-28 md:justify-center md:px-10 md:pb-16">
      {/* Lesbarkeits-Wash über der 3D-Szene: links (Desktop) bzw. unten (Mobile) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden md:block"
        style={{ opacity: fade, background: 'linear-gradient(90deg, rgba(248,245,240,.94) 0%, rgba(248,245,240,.78) 34%, rgba(248,245,240,0) 60%)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 md:hidden"
        style={{ opacity: fade, background: 'linear-gradient(180deg, rgba(248,245,240,0) 28%, rgba(248,245,240,.92) 50%, rgba(248,245,240,.96) 100%)' }}
      />
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        style={{ opacity: fade, transform: `translateY(${progress * -80}px)` }}
        className="mx-auto flex w-full max-w-7xl flex-col gap-7 md:max-w-[1280px]"
      >
        <motion.div variants={item} className="eyebrow inline-flex w-fit items-center gap-2.5 rounded-full border border-apple px-3.5 py-2 text-apple">
          <span className="h-2 w-2 rounded-full bg-apple" />
          Apfelzeit · Ernte 2026
        </motion.div>
        <motion.h1
          variants={item}
          className="max-w-[12ch] font-display text-[clamp(2.6rem,7.2vw,5.4rem)] font-semibold leading-[1.02] tracking-[-0.01em] text-wood"
        >
          Biohof Tambke – <em className="text-apple">Dein Apfelstand</em> auf dem Markt
        </motion.h1>
        <motion.p variants={item} className="font-display text-2xl italic text-leaf md:text-[26px]">
          Frisch, fair, familiär.
        </motion.p>
        <motion.p variants={item} className="max-w-[520px] text-[17px] leading-relaxed text-[#5B463F]">
          Äpfel, Kirschen und Zwetschen vom Biohof – von Hand gepflückt und von Familie Tambke und ihrem Traumteam auf dem
          Wochenmarkt in Volksdorf verkauft.
        </motion.p>
        <motion.div variants={item} className="flex flex-wrap items-center gap-4">
          <a href="#team" className="btn btn-primary">
            Team kennenlernen
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="M13 6l6 6-6 6" />
            </svg>
          </a>
          <a href="#markt" className="btn btn-outline text-wood">
            Unser Sortiment
          </a>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
        style={{ opacity: fade }}
        className="pointer-events-none absolute inset-x-0 bottom-6 mx-auto hidden w-full max-w-[1280px] items-end justify-between px-5 md:flex md:px-10"
      >
        <div className="eyebrow flex items-center gap-3 text-cream">
          <span className="flex h-11 w-7 justify-center rounded-full border-[1.5px] border-cream pt-2">
            <motion.span
              animate={{ y: [0, 10, 0], opacity: [1, 0.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              className="h-2 w-1 rounded-full bg-cream"
            />
          </span>
          Scrollen · durch die Marktallee
        </div>
        <div className="hidden gap-10 text-sm text-cream md:flex">
          <span>
            <strong className="font-semibold">Wochenmarkt Volksdorf</strong>
          </span>
          <span>
            <strong className="font-semibold">Familienbetrieb</strong> · Hilke &amp; Rolf Tambke
          </span>
        </div>
      </motion.div>
    </section>
  );
});

export default Hero3D;
