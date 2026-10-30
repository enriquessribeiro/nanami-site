import { useMemo, useState } from 'react';
import { useStore } from '../context/store';
import { ProductCard } from '../components/ProductCard';
import { CatFace } from '../components/Logo';
import { Button } from '../components/ui/Button';
import { Container } from '../components/ui/Container';
import { Eyebrow } from '../components/ui/Eyebrow';
import { cx } from '../components/ui/cx';
import { CloseIcon, SearchIcon } from '../components/Icons';

const sortOptions = [
  { value: 'destaque', label: 'Destaques primeiro' },
  { value: 'menor', label: 'Menor preço' },
  { value: 'maior', label: 'Maior preço' },
  { value: 'nome', label: 'Nome (A–Z)' },
];

export function Catalog() {
  const { category, setCategory, query, setQuery, mode, navigate, products, categories } =
    useStore();
  const [sort, setSort] = useState('destaque');

  const selectCategory = (id) => {
    setCategory(id);
    setQuery('');
  };

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    const list = products.filter((product) => {
      const matchesCategory = category === 'todos' || product.category === category;
      const matchesQuery =
        !needle ||
        product.name.toLowerCase().includes(needle) ||
        product.description.toLowerCase().includes(needle) ||
        product.tags.some((tag) => tag.includes(needle));
      return matchesCategory && matchesQuery;
    });

    const priceOf = (product) =>
      mode === 'atacado' ? product.wholesaleCents : product.priceCents;

    return [...list].sort((a, b) => {
      if (sort === 'menor') return priceOf(a) - priceOf(b);
      if (sort === 'maior') return priceOf(b) - priceOf(a);
      if (sort === 'nome') return a.name.localeCompare(b.name, 'pt-BR');
      return Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name, 'pt-BR');
    });
  }, [category, query, sort, mode, products]);

  const activeCategory = categories.find((item) => item.id === category);
  const hasFilters = category !== 'todos' || query.trim() !== '';

  return (
    <div className="py-5 pb-16 md:pt-7 md:pb-21">
      <Container>
        <nav className="flex flex-wrap items-center gap-[7px] text-[12.5px] text-muted" aria-label="Você está aqui">
          <a href="#/" className="hover:text-acao" onClick={() => navigate('')}>
            Início
          </a>
          <span className="opacity-50" aria-hidden="true">
            /
          </span>
          <span>Catálogo</span>
        </nav>

        <header className="mt-[22px] mb-[30px] flex flex-col items-start gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-7">
          <div>
            <Eyebrow>Tudo em um só lugar</Eyebrow>
            <h1 className="mt-2 font-display text-[clamp(34px,4.6vw,54px)] leading-tight">
              {activeCategory ? activeCategory.name : 'Catálogo Nanami'}
            </h1>
            <p className="mt-2.5 max-w-[62ch] text-[15.5px] text-muted">
              {mode === 'atacado'
                ? 'Preços por unidade no atacado. Cada item pede o mínimo de 6 peças.'
                : 'Preços de varejo, sem mínimo. Troque para atacado e economize a partir de 6 peças.'}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2.5 rounded-full border-2 border-line bg-surface py-1.5 pr-4 pl-1.5">
            <CatFace tone={activeCategory?.cat ?? 'rosa'} size={78} className="w-[62px]" />
            <span className="max-w-[110px] text-xs leading-tight font-bold text-muted">
              {filtered.length} {filtered.length === 1 ? 'produto' : 'produtos'}
            </span>
          </div>
        </header>

        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-5">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoria">
            {[{ id: 'todos', name: 'Tudo' }, ...categories].map((item) => (
              <button
                type="button"
                key={item.id}
                className={cx(
                  'inline-flex min-h-10 items-center gap-1.5 rounded-full border-2 px-3 py-[7px] font-display text-[13.5px] leading-none font-medium transition',
                  category === item.id
                    ? 'border-cacau bg-cacau text-creme'
                    : 'border-line bg-surface text-ink hover:border-rosa',
                )}
                aria-pressed={category === item.id}
                onClick={() => selectCategory(item.id)}
              >
                {item.name}
              </button>
            ))}
          </div>

          <div className="w-full lg:w-auto">
            <label className="flex w-full items-center justify-between gap-2 text-[12.5px] font-bold text-muted lg:w-auto">
              <span>Ordenar</span>
              <select
                className="min-h-10 flex-1 rounded-full border-2 border-line bg-surface px-3 py-[7px] font-body text-[13px] font-semibold text-ink lg:flex-none"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {hasFilters && (
          <div className="mb-[22px] flex flex-wrap items-center gap-2">
            {activeCategory && (
              <button
                type="button"
                className="inline-flex items-center gap-[7px] rounded-full border-[1.5px] border-line bg-surface px-[11px] py-[5px] text-xs font-bold"
                onClick={() => setCategory('todos')}
              >
                {activeCategory.name}
                <CloseIcon width={13} height={13} />
              </button>
            )}
            {query.trim() && (
              <button
                type="button"
                className="inline-flex items-center gap-[7px] rounded-full border-[1.5px] border-line bg-surface px-[11px] py-[5px] text-xs font-bold"
                onClick={() => setQuery('')}
              >
                Busca: “{query.trim()}”
                <CloseIcon width={13} height={13} />
              </button>
            )}
            <button
              type="button"
              className="border-0 bg-transparent text-xs font-extrabold text-acao underline underline-offset-[3px]"
              onClick={() => {
                setCategory('todos');
                setQuery('');
              }}
            >
              Limpar filtros
            </button>
          </div>
        )}

        {filtered.length > 0 ? (
          <div className="mt-1 grid grid-cols-2 gap-2.5 md:gap-3 lg:grid-cols-3 xl:grid-cols-4 xl:gap-5">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 px-5 py-15 text-center">
            <CatFace tone="azul" size={110} />
            <h2 className="font-display text-[clamp(26px,3vw,34px)]">Nada por aqui ainda</h2>
            <p className="max-w-[44ch] text-[14.5px] text-muted">
              Não encontramos produtos para essa busca. Tente outra palavra ou fale com a gente no
              WhatsApp — pode ser que chegue na próxima remessa.
            </p>
            <div className="mt-3.5 flex flex-wrap justify-center gap-2.5">
              <Button
                onClick={() => {
                  setCategory('todos');
                  setQuery('');
                }}
              >
                <SearchIcon width={17} height={17} />
                Ver todos os produtos
              </Button>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
