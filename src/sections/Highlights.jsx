import Icon from '../components/Icon';
import Reveal from '../components/Reveal';

// Aussagen aus den bisherigen Texten der Website (Bio vom Hof, handgepflückt, Familienbetrieb)
const ITEMS = [
  { icon: 'leaf', title: 'Bio vom eigenen Hof', text: 'Obst vom Biohof Tambke – ohne Umwege vom Baum an unseren Stand.' },
  { icon: 'hand', title: 'Von Hand gepflückt', text: 'Schnell und fruchtschonend geerntet, damit jede Frucht ohne Druckstellen ankommt.' },
  { icon: 'heart', title: 'Familiär & persönlich', text: 'Familie Tambke und ihr Traumteam beraten dich gern zu Sorten und Verwendung.' },
  { icon: 'basket', title: 'Vorbestellen & abholen', text: 'Wunschmengen online anfragen und am Markttag fertig gepackt mitnehmen.' },
];

export default function Highlights() {
  return (
    <section aria-label="Warum zu uns" className="border-y border-line bg-white/60">
      <ul className="page-container grid gap-px py-2 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((it, i) => (
          <Reveal as="li" key={it.title} delay={i * 90} className="flex gap-4 px-2 py-6 lg:px-5">
            <span className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-forest text-paper">
              <Icon name={it.icon} size={22} />
            </span>
            <span>
              <span className="block font-display text-lg font-semibold">{it.title}</span>
              <span className="mt-1 block text-[0.95rem] leading-relaxed text-muted">{it.text}</span>
            </span>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
