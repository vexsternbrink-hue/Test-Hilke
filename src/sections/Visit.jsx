import Icon from '../components/Icon';
import Reveal from '../components/Reveal';
import { Missing, PaymentNote, SectionHeader } from '../components/Bits';

export default function Visit({ settings }) {
  const mapQuery = encodeURIComponent([settings.address || settings.marketName, settings.city].filter(Boolean).join(', '));
  return (
    <section id="standort" aria-labelledby="standort-title" className="section">
      <div className="page-container">
        <Reveal>
          <SectionHeader id="standort-title" eyebrow="Standort & Öffnungszeiten" title="So findest du uns auf dem Markt">
            Komm vorbei, probier dich durch die Sorten oder hol deine Vorbestellung ab.
          </SectionHeader>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <Reveal className="surface flex flex-col gap-5 p-7 lg:col-span-1">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sage text-forest">
              <Icon name="pin" size={24} />
            </span>
            <div>
              <h3 className="text-2xl">{settings.marketName}</h3>
              <p className="mt-1 text-muted">{settings.city}</p>
            </div>
            <dl className="grid gap-3 text-[0.98rem]">
              <div>
                <dt className="font-bold">Adresse</dt>
                <dd className="mt-0.5 text-muted">{settings.address || <Missing>Adresse des Marktplatzes</Missing>}</dd>
              </div>
              <div>
                <dt className="font-bold">Unser Stand</dt>
                <dd className="mt-0.5 text-muted">{settings.standHint || <Missing>Wo genau steht der Stand?</Missing>}</dd>
              </div>
            </dl>
            <a
              href={`https://www.openstreetmap.org/search?query=${mapQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm mt-auto self-start"
            >
              Auf der Karte ansehen
              <span className="sr-only">(öffnet OpenStreetMap in neuem Tab)</span>
            </a>
          </Reveal>

          <Reveal delay={100} className="chalkboard chalkboard-frame flex flex-col gap-5 rounded-3xl p-7">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-honey">
              <Icon name="clock" size={24} />
            </span>
            <h3 className="text-2xl text-chalk-text">Markttage &amp; Zeiten</h3>
            {settings.hours?.length ? (
              <ul className="divide-y divide-white/15">
                {settings.hours.map((h, i) => (
                  <li key={i} className="flex items-baseline justify-between gap-4 py-3">
                    <span className="font-display text-lg text-chalk-text">{h.day}</span>
                    <span className="font-semibold text-honey">{h.time}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                <Missing>Markttage &amp; Uhrzeiten</Missing>
              </p>
            )}
            {settings.hoursNote && <p className="text-chalk-muted">{settings.hoursNote}</p>}
            <p className="mt-auto text-sm text-chalk-muted">
              Kurzfristige Änderungen – etwa wenn wir einmal nicht auf dem Markt sind – findest du immer auf dem{' '}
              <a href="#aktuelles" className="font-semibold text-honey underline underline-offset-2">
                Schwarzen Brett
              </a>
              .
            </p>
          </Reveal>

          <Reveal delay={200} className="surface flex flex-col gap-5 p-7">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-honey-soft text-[#8a5a0c]">
              <Icon name="card" size={24} />
            </span>
            <h3 className="text-2xl">Bezahlen am Stand</h3>
            <PaymentNote variant="honey" />
            <p className="text-muted">Vorbestellungen bezahlst du ganz normal bei der Abholung am Stand – online wird nichts abgebucht.</p>
            <a href="#vorbestellen" className="btn btn-primary btn-sm mt-auto self-start">
              Jetzt vorbestellen
              <Icon name="arrow" size={18} className="arrow" />
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
