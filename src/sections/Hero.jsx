import HeroArt from '../components/HeroArt';
import Icon from '../components/Icon';
import { Missing, PaymentNote } from '../components/Bits';

export default function Hero({ settings, notices }) {
  const important = notices.find((n) => n.highlighted) ?? notices[0];
  const hours = settings.hours?.length ? settings.hours.map((h) => [h.day, h.time].filter(Boolean).join(' ')).join(' · ') : null;

  return (
    <section id="start" aria-labelledby="hero-title" className="relative overflow-hidden">
      <div className="page-container grid items-center gap-10 pb-16 pt-8 md:pt-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12 lg:pb-24 lg:pt-16">
        <div className="flex flex-col gap-6">
          <span className="eyebrow hero-in">Bio-Obst vom Hof · {settings.marketName}</span>
          <h1 id="hero-title" className="hero-in text-[clamp(2.4rem,1.6rem+3.4vw,4rem)] leading-[1.04] text-ink" style={{ '--d': '80ms' }}>
            Dein Apfelstand auf dem <em className="font-medium text-forest">Wochenmarkt Volksdorf</em>
          </h1>
          <p className="hero-in lead text-[1.15rem] md:text-[1.25rem]" style={{ '--d': '160ms' }}>
            Äpfel, Kirschen und Zwetschen vom Biohof Tambke – von Hand gepflückt und von Familie Tambke und ihrem
            Team frisch an den Stand gebracht. <span className="font-display italic text-apple">{settings.tagline}</span>
          </p>

          <ul className="hero-in grid gap-3 text-[0.98rem] sm:grid-cols-2" style={{ '--d': '240ms' }}>
            <li className="flex items-start gap-3">
              <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-sage text-forest">
                <Icon name="pin" />
              </span>
              <span>
                <span className="block font-bold">{settings.marketName}</span>
                <span className="text-muted">{settings.city}</span>
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-sage text-forest">
                <Icon name="clock" />
              </span>
              <span>
                <span className="block font-bold">Markttage</span>
                {hours ? <span className="text-muted">{hours}</span> : <Missing>Markttage &amp; Uhrzeiten</Missing>}
              </span>
            </li>
          </ul>

          <div className="hero-in flex flex-wrap gap-3" style={{ '--d': '320ms' }}>
            <a href="#vorbestellen" className="btn btn-primary">
              Jetzt vorbestellen
              <Icon name="arrow" className="arrow" />
            </a>
            <a href="#standort" className="btn btn-outline">
              <Icon name="pin" />
              Standort &amp; Öffnungszeiten
            </a>
          </div>

          <PaymentNote className="hero-in max-w-xl" style={{ '--d': '400ms' }} />
        </div>

        <div className="relative">
          <div className="reveal-scale is-visible relative mx-auto aspect-[16/15] w-full max-w-[40rem] overflow-hidden rounded-[2rem] bg-paper-deep">
            {settings.heroImage ? (
              <img
                src={settings.heroImage}
                alt="Unser Marktstand auf dem Wochenmarkt Volksdorf"
                className="h-full w-full object-cover"
                fetchPriority="high"
              />
            ) : (
              <>
                <HeroArt className="h-full w-full" />
                <span className="absolute left-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-[0.7rem] font-semibold text-muted backdrop-blur">
                  Illustration · Platzhalter für Foto
                </span>
              </>
            )}
          </div>

          {important && (
            <a
              href="#aktuelles"
              className="chalkboard hero-in lift absolute -bottom-6 left-3 right-3 block rounded-2xl p-4 no-underline shadow-xl sm:right-auto sm:left-6 sm:max-w-xs"
              style={{ '--d': '550ms' }}
            >
              <span className="flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-honey">
                <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-honey" aria-hidden="true" />
                Aktuell wichtig
              </span>
              <span className="mt-1.5 block font-display text-lg leading-snug text-chalk-text">{important.title}</span>
              <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-chalk-muted">
                Zum Schwarzen Brett <Icon name="arrow" size={16} />
              </span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
