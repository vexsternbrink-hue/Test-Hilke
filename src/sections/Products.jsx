import { useMemo, useState } from 'react';
import FruitArt from '../components/FruitArt';
import Icon from '../components/Icon';
import Reveal from '../components/Reveal';
import { SectionHeader } from '../components/Bits';

function ProductMedia({ product }) {
  const [failed, setFailed] = useState(false);
  if (product.image && !failed) {
    return (
      <img
        src={product.image}
        alt={product.name}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className="zoom-media h-full w-full object-cover"
      />
    );
  }
  return <FruitArt art={product.art} />;
}

function ProductCard({ product, onPreorder, delay }) {
  return (
    <Reveal as="li" delay={delay} className="h-full">
      <article className="group surface lift flex h-full flex-col overflow-hidden">
        <div className="relative aspect-[4/3] overflow-hidden">
          <ProductMedia product={product} />
          {product.badge && (
            <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-apple shadow-sm">
              {product.badge}
            </span>
          )}
          <span
            className={`absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold shadow-sm ${
              product.available ? 'bg-forest text-paper' : 'bg-white/95 text-muted'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${product.available ? 'bg-[#9fd36f]' : 'bg-[#b8b0a0]'}`} aria-hidden="true" />
            {product.available ? 'Jetzt erhältlich' : 'Außerhalb der Saison'}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-6">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
            <span>{product.category}</span>
            {product.season && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-leaf">{product.season}</span>
              </>
            )}
          </div>
          <h3 className="text-[1.6rem]">{product.name}</h3>
          {product.description && <p className="text-[0.98rem] leading-relaxed text-muted">{product.description}</p>}

          <dl className="mt-auto grid gap-1.5 border-t border-line pt-4 text-sm">
            {product.origin && (
              <div className="flex gap-2">
                <dt className="font-bold">Herkunft:</dt>
                <dd className="text-muted">{product.origin}</dd>
              </div>
            )}
            <div className="flex gap-2">
              <dt className="font-bold">Preis:</dt>
              <dd className="text-muted">{product.price || 'Aktuelle Preise erfährst du am Stand.'}</dd>
            </div>
          </dl>

          {product.available ? (
            <button type="button" onClick={() => onPreorder(product.id)} className="btn btn-forest btn-sm mt-2 self-start">
              <Icon name="basket" size={18} />
              {product.name} vorbestellen
            </button>
          ) : (
            <p className="mt-2 text-sm font-semibold text-muted">Zur Saison wieder bei uns am Stand.</p>
          )}
        </div>
      </article>
    </Reveal>
  );
}

export default function Products({ products, onPreorder }) {
  const [filter, setFilter] = useState('alle');

  const filters = useMemo(() => {
    const cats = [...new Set(products.map((p) => p.category))];
    const list = [{ id: 'alle', label: 'Alle' }];
    if (products.some((p) => p.available) && products.some((p) => !p.available)) list.push({ id: 'jetzt', label: 'Jetzt erhältlich' });
    // Kategorie-Filter nur anzeigen, wenn es mehr als eine Kategorie gibt
    if (cats.length > 1) cats.forEach((c) => list.push({ id: `cat:${c}`, label: c }));
    return list;
  }, [products]);

  const visible = products.filter((p) => {
    if (filter === 'jetzt') return p.available;
    if (filter.startsWith('cat:')) return p.category === filter.slice(4);
    return true;
  });

  return (
    <section id="produkte" aria-labelledby="produkte-title" className="section bg-white/50">
      <div className="page-container">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <SectionHeader id="produkte-title" eyebrow="Unser Sortiment" title="Frisch vom Biohof an den Stand">
              Wir verkaufen, was auf unserem Hof wächst – je nach Saison. Welche Sorten gerade da sind, sagen wir dir gern am
              Stand.
            </SectionHeader>
          </Reveal>
          {filters.length > 1 && (
            <div role="group" aria-label="Produkte filtern" className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={filter === f.id}
                  onClick={() => setFilter(f.id)}
                  className={`min-h-11 rounded-full border-2 px-4 text-sm font-bold transition-colors ${
                    filter === f.id ? 'border-forest bg-forest text-paper' : 'border-line bg-white text-ink hover:border-forest'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
          {visible.map((p, i) => (
            <ProductCard key={p.id} product={p} onPreorder={onPreorder} delay={(i % 3) * 90} />
          ))}
        </ul>
        {visible.length === 0 && <p className="mt-10 text-muted">In dieser Auswahl gibt es gerade keine Produkte.</p>}
      </div>
    </section>
  );
}
