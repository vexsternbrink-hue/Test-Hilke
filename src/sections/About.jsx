import { useEffect, useRef, useState } from 'react';
import { TEAM, TEAM_GROUPS } from '../../shared/defaults.js';
import Icon from '../components/Icon';
import Reveal from '../components/Reveal';
import FruitArt from '../components/FruitArt';
import { SectionHeader } from '../components/Bits';

// „Vom Baum an den Stand“ – Inhalte aus der bisherigen Team- und Sortimentsseite
const STEPS = [
  {
    art: 'tree',
    title: 'Baumpflege das ganze Jahr',
    text: 'Obstbaumschnitt und Pflege der Bäume sind die Grundlage für gesunde Bäume und eine gute Ernte.',
    who: 'Ismet',
  },
  {
    art: 'apple',
    title: 'Von Hand gepflückt',
    text: 'Schnell und fruchtschonend geerntet – damit jede Frucht ohne Druckstellen auf den Stand kommt.',
    who: 'Ismet & Erntehelfer',
  },
  {
    art: 'cherry',
    title: 'Verstärkung zur Ernte',
    text: 'Zur Kirsch- und Zwetschenernte und in der Apfelzeit verstärken uns Saisonkräfte – nur zur Ernte dabei und doch unverzichtbar.',
    who: 'Unsere Saisonkräfte',
  },
  {
    art: 'plum',
    title: 'Hof & Maschinen',
    text: 'Einer hält den Hof am Laufen und leitet die Erntehelfer an, damit alles rechtzeitig vom Baum in die Kiste kommt.',
    who: 'Mathias',
  },
  {
    art: 'basket',
    title: 'Am Stand in Volksdorf',
    text: 'Aufbauen, Kisten schleppen, beraten: Unser Wochenmarkt-Team kennt jede Sorte – und viele Stammkundinnen und Stammkunden.',
    who: 'Das Wochenmarkt-Team',
  },
];

const GROUP_STYLE = {
  familie: 'bg-apple text-white',
  kernteam: 'bg-forest text-paper',
  markt: 'bg-honey text-ink',
};

function initials(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function StoryCarousel() {
  const trackRef = useRef(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;
    const update = () => {
      setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const scrollBy = (dir) => {
    const el = trackRef.current;
    const card = el?.firstElementChild;
    if (!el || !card) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * (card.getBoundingClientRect().width + 20), behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <div className="mt-14">
      <div className="flex items-end justify-between gap-4">
        <h3 id="story-title" className="text-[1.75rem] md:text-[2rem]">
          Vom Baum an den Stand
        </h3>
        <div className="flex gap-2">
          <button type="button" onClick={() => scrollBy(-1)} disabled={edge.start} aria-label="Vorheriger Schritt" className="grid h-12 w-12 place-items-center rounded-full border-2 border-forest text-forest transition-colors hover:bg-forest hover:text-paper disabled:border-line disabled:text-line disabled:hover:bg-transparent">
            <Icon name="chevronLeft" />
          </button>
          <button type="button" onClick={() => scrollBy(1)} disabled={edge.end} aria-label="Nächster Schritt" className="grid h-12 w-12 place-items-center rounded-full border-2 border-forest text-forest transition-colors hover:bg-forest hover:text-paper disabled:border-line disabled:text-line disabled:hover:bg-transparent">
            <Icon name="chevronRight" />
          </button>
        </div>
      </div>
      <ol
        ref={trackRef}
        aria-labelledby="story-title"
        tabIndex={0}
        className="carousel -mx-4 mt-6 flex gap-5 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0"
      >
        {STEPS.map((s, i) => (
          <li key={s.title} className="group surface flex w-[82%] flex-none flex-col overflow-hidden sm:w-[46%] lg:w-[31.5%]">
            <div className="relative aspect-[16/10]">
              <FruitArt art={s.art} />
              <span className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white font-display text-lg font-semibold text-forest shadow">
                {i + 1}
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-2 p-6">
              <h4 className="text-xl">{s.title}</h4>
              <p className="text-[0.97rem] leading-relaxed text-muted">{s.text}</p>
              <p className="mt-auto pt-2 text-sm font-bold text-leaf">{s.who}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function About() {
  return (
    <section id="ueber-uns" aria-labelledby="ueber-uns-title" className="section bg-white/50">
      <div className="page-container">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end">
          <Reveal>
            <SectionHeader id="ueber-uns-title" eyebrow="Über uns" title="Ein Familienbetrieb mit Traumteam">
              Hinter dem Biohof Tambke stehen Hilke und Rolf Tambke mit ihren Töchtern Lea Theresa und Janna Sophie. Gemeinsam
              mit einem eingespielten Team bringen sie das Obst vom eigenen Hof auf den Wochenmarkt in Volksdorf.
            </SectionHeader>
          </Reveal>
          <Reveal delay={120}>
            <blockquote className="relative rounded-3xl bg-forest p-7 text-paper md:p-9">
              <Icon name="heart" size={28} className="text-honey" />
              <p className="mt-3 font-display text-[1.3rem] italic leading-snug md:text-[1.45rem]">
                „Ein riesengroßes Dankeschön an dieses Traumteam! Ohne Euch wäre unsere Arbeit nicht möglich – bei Wind, Regen
                und Sonne und in jeder Apfelzeit.“
              </p>
              <footer className="mt-4 text-sm font-semibold text-paper/80">Hilke, Rolf, Lea Theresa &amp; Janna Sophie Tambke</footer>
            </blockquote>
          </Reveal>
        </div>

        <StoryCarousel />

        <div className="mt-16">
          <h3 className="text-[1.75rem] md:text-[2rem]">Die Menschen hinter jedem Apfel</h3>
          <div className="mt-6 grid gap-8">
            {TEAM_GROUPS.map((g) => (
              <div key={g.id}>
                <h4 className="mb-3 text-sm font-bold uppercase tracking-[0.14em] text-muted" style={{ fontFamily: 'var(--font-body)' }}>
                  {g.label}
                </h4>
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {TEAM.filter((m) => m.group === g.id).map((m, i) => (
                    <Reveal as="li" key={m.name} delay={(i % 4) * 60} className="lift flex items-center gap-3 rounded-2xl border border-line bg-white p-3.5">
                      <span className={`grid h-12 w-12 flex-none place-items-center rounded-full font-display text-base font-semibold ${GROUP_STYLE[g.id]}`} aria-hidden="true">
                        {initials(m.name)}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-bold leading-tight">{m.name}</span>
                        <span className="block text-sm leading-snug text-muted">{m.role}</span>
                      </span>
                    </Reveal>
                  ))}
                </ul>
              </div>
            ))}
            <p className="text-muted">
              Dazu kommen unsere <strong className="text-ink">Saisonkräfte</strong> zur Kirsch- und Zwetschenernte und in der
              Apfelzeit.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
