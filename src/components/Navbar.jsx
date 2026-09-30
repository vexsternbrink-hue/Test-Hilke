import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const links = [
  ['#team', 'Team'],
  ['#markt', 'Marktstand'],
  ['#danke', 'Dankeschön'],
];

export default function Navbar() {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-500 ${solid ? 'glass shadow-[0_10px_40px_-20px_rgba(62,39,35,.35)]' : ''}`}
    >
      <nav className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 md:px-10">
        <a href="#top" className="flex items-center gap-3 text-wood no-underline">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-apple">
            <svg width="20" height="22" viewBox="0 0 20 22" fill="none" stroke="#F8F5F0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 6c-3-3-8-1-8 5 0 5 3 9 5.5 9 1 0 1.5-.5 2.5-.5s1.5.5 2.5.5c2.5 0 5.5-4 5.5-9 0-6-5-8-8-5z" />
              <path d="M10 6V2" />
              <path d="M10 3c2-1 4 0 4 2" />
            </svg>
          </span>
          <span className="whitespace-nowrap font-display text-xl font-semibold">Biohof Tambke</span>
        </a>
        <div className="hidden items-center gap-9 text-[15px] font-medium md:flex">
          {links.map(([href, label]) => (
            <a key={href} href={href} className="text-wood no-underline transition-colors hover:text-apple">
              {label}
            </a>
          ))}
        </div>
        <a
          href="#markt"
          className="inline-flex h-11 items-center whitespace-nowrap rounded-full bg-wood px-5 text-sm font-semibold text-cream no-underline transition-transform hover:-translate-y-0.5"
        >
          {/* Auf schmalen Screens passt der volle Text nicht neben das Logo */}
          <span className="sm:hidden">Marktstand</span>
          <span className="hidden sm:inline">Wochenmarkt Volksdorf</span>
        </a>
      </nav>
    </motion.header>
  );
}
