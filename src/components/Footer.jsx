export default function Footer() {
  return (
    <footer className="relative z-10 bg-wood px-5 pb-10 pt-16 text-cream md:px-10" aria-label="Fußzeile">
      <div className="mx-auto grid max-w-[1280px] gap-10 md:grid-cols-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-apple">
              <svg width="20" height="22" viewBox="0 0 20 22" fill="none" stroke="#F8F5F0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 6c-3-3-8-1-8 5 0 5 3 9 5.5 9 1 0 1.5-.5 2.5-.5s1.5.5 2.5.5c2.5 0 5.5-4 5.5-9 0-6-5-8-8-5z" />
                <path d="M10 6V2" />
                <path d="M10 3c2-1 4 0 4 2" />
              </svg>
            </span>
            <span className="font-display text-xl font-semibold">Biohof Tambke</span>
          </div>
          <p className="text-sm leading-relaxed text-[#D9C8BC]">Frisch, fair, familiär. Dein Apfelstand auf dem Wochenmarkt in Volksdorf.</p>
        </div>
        <div className="flex flex-col gap-3">
          <span className="eyebrow text-[#E8A5B0]">Marktstand</span>
          <p className="text-[15px] leading-relaxed">
            Wochenmarkt Volksdorf
            <br />
            [MARKTTAGE &amp; UHRZEIT]
            <br />
            Hamburg-Volksdorf
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <span className="eyebrow text-[#E8A5B0]">Kontakt</span>
          <a href="https://biohof-tambke.de" className="text-[15px] text-cream no-underline hover:text-[#E8C9B0]">
            biohof-tambke.de
          </a>
          <span className="text-[15px]">[TELEFON]</span>
          <span className="text-[15px]">[E-MAIL]</span>
        </div>
        <div className="flex flex-col gap-3">
          <span className="eyebrow text-[#E8A5B0]">Rechtliches</span>
          <a href="https://biohof-tambke.de/impressum.html" className="text-[15px] text-cream no-underline hover:text-[#E8C9B0]">
            Impressum
          </a>
          <a href="https://biohof-tambke.de/datenschutz.html" className="text-[15px] text-cream no-underline hover:text-[#E8C9B0]">
            Datenschutz
          </a>
          <a href="https://biohof-tambke.de/team.html" className="text-[15px] text-cream no-underline hover:text-[#E8C9B0]">
            Team auf der Originalseite
          </a>
        </div>
      </div>
      <div className="mx-auto mt-12 flex max-w-[1280px] flex-col gap-2 border-t border-wood-light pt-6 text-[13px] text-[#B39A8E] md:flex-row md:items-center md:justify-between">
        <span>© {new Date().getFullYear()} Biohof Tambke · Familie Tambke</span>
        <span>Mit Herz gepflückt. Mit Three.js gebaut.</span>
      </div>
    </footer>
  );
}
