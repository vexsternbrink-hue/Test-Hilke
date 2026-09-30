import Icon from '../components/Icon';
import Reveal from '../components/Reveal';
import { Missing, SectionHeader } from '../components/Bits';

export default function Contact({ settings }) {
  const websiteLabel = settings.website?.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const rows = [
    {
      icon: 'phone',
      label: 'Telefon',
      value: settings.phone ? (
        <a href={`tel:${settings.phone.replace(/[^+\d]/g, '')}`} className="text-forest underline-offset-2 hover:underline">
          {settings.phone}
        </a>
      ) : (
        <Missing>Telefonnummer</Missing>
      ),
    },
    {
      icon: 'mail',
      label: 'E-Mail',
      value: settings.email ? (
        <a href={`mailto:${settings.email}`} className="text-forest underline-offset-2 hover:underline">
          {settings.email}
        </a>
      ) : (
        <Missing>E-Mail-Adresse</Missing>
      ),
    },
    {
      icon: 'globe',
      label: 'Website des Hofs',
      value: (
        <a href={settings.website} target="_blank" rel="noopener noreferrer" className="text-forest underline-offset-2 hover:underline">
          {websiteLabel}
        </a>
      ),
    },
    { icon: 'pin', label: 'Persönlich', value: `An unserem Stand auf dem ${settings.marketName}` },
  ];

  return (
    <section id="kontakt" aria-labelledby="kontakt-title" className="section pt-0 md:pt-0">
      <div className="page-container">
        <Reveal className="grid overflow-hidden rounded-[2rem] bg-forest text-paper lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="flex flex-col gap-5 p-8 md:p-12">
            <span className="eyebrow text-honey">Kontakt</span>
            <h2 id="kontakt-title" className="text-[clamp(2rem,1.3rem+2.6vw,3rem)] text-paper">
              Fragen? Sprich uns an.
            </h2>
            <p className="max-w-md text-lg text-paper/85">
              Ob Sortenwunsch, größere Mengen oder eine Frage zur Vorbestellung – wir helfen dir gern weiter.
            </p>
            <a href="#vorbestellen" className="btn mt-2 self-start bg-paper text-forest hover:bg-white">
              Zur Vorbestellung
              <Icon name="arrow" className="arrow" />
            </a>
          </div>
          <ul className="grid gap-px bg-forest-dark/60 sm:grid-cols-2">
            {rows.map((r) => (
              <li key={r.label} className="flex flex-col gap-2 bg-paper p-6 text-ink md:p-8">
                <Icon name={r.icon} size={24} className="text-apple" />
                <span className="text-sm font-bold uppercase tracking-wider text-muted">{r.label}</span>
                <span className="break-words text-[1.05rem] font-semibold">{r.value}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
