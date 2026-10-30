import { useStore } from '../context/store';
import { formatPrice } from '../lib/format';
import { mediaGradient } from '../lib/media';
import { ProductMedia } from './ProductMedia';
import { PlusIcon } from './Icons';
import { Tag } from './ui/Tag';

const tagTone = {
  novo: 'estrela',
  fofo: 'creme',
  'mais vendido': 'rosa',
};

export function ProductCard({ product }) {
  const { mode, addToCart, navigate, getCategory } = useStore();
  const category = getCategory(product.category);
  const price = mode === 'atacado' ? product.wholesaleCents : product.priceCents;

  return (
    <article className="group flex flex-col rounded-card border-2 border-line bg-surface p-2.5 transition duration-200 hover:-translate-y-1 hover:border-rosa/55 hover:shadow-lift xl:p-[11px]">
      <a
        href={`#/produto/${product.slug}`}
        className="relative grid aspect-square place-items-center overflow-hidden rounded-img"
        style={mediaGradient(product.colors)}
        onClick={() => navigate(`produto/${product.slug}`)}
        aria-label={`Ver ${product.name}`}
      >
        <ProductMedia
          product={product}
          artClassName="w-[70%] drop-shadow-[0_8px_10px_rgba(91,64,52,0.12)] transition-transform duration-200 group-hover:scale-105 group-hover:-rotate-3 sm:w-[64%]"
          imageClassName="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute top-[9px] left-[9px] flex flex-wrap gap-[5px]">
          {product.tags.slice(0, 2).map((tag) => (
            <Tag key={tag} tone={tagTone[tag]}>
              {tag}
            </Tag>
          ))}
        </span>
        <span
          className="absolute -right-2 -bottom-2.5 rotate-[-16deg] text-cacau/15"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" width="54" height="54" fill="currentColor">
            <ellipse cx="7" cy="8" rx="2.1" ry="2.7" />
            <ellipse cx="12" cy="6.4" rx="2.1" ry="2.8" />
            <ellipse cx="17" cy="8" rx="2.1" ry="2.7" />
            <path d="M12 10.5c3.4 0 6 2.3 6 4.9 0 2-1.6 3.3-3.6 3.3-1 0-1.7-.4-2.4-.4s-1.4.4-2.4.4c-2 0-3.6-1.3-3.6-3.3 0-2.6 2.6-4.9 6-4.9Z" />
          </svg>
        </span>
      </a>

      <div className="flex flex-1 flex-col px-0.5 pt-2.5 pb-0.5 sm:px-1">
        <span className="font-body text-[10px] leading-snug font-extrabold tracking-[0.12em] text-muted uppercase">
          {category?.name}
        </span>
        <h3 className="mt-[3px] min-h-[2.5em] font-display text-[14.5px] leading-tight font-medium sm:text-[15.5px] xl:text-[16.5px]">
          <a
            href={`#/produto/${product.slug}`}
            onClick={() => navigate(`produto/${product.slug}`)}
            className="hover:text-acao"
          >
            {product.name}
          </a>
        </h3>

        <p className="mt-[7px] font-display text-[18px] leading-none font-semibold sm:text-[20px] xl:text-[21px]">
          {formatPrice(price)}
          <small className="mt-0.5 block font-body text-[11px] leading-tight font-semibold text-muted">
            {mode === 'atacado' ? `un. · mín. ${product.minWholesale}` : 'unidade'}
          </small>
        </p>

        {mode === 'varejo' ? (
          <p className="mt-1.5 mb-2.5 text-[10.5px] leading-snug text-muted sm:text-[11.5px]">
            Atacado a partir de {product.minWholesale} peças:{' '}
            <strong className="text-ink">{formatPrice(product.wholesaleCents)}</strong>/un.
          </p>
        ) : (
          <p className="mt-1.5 mb-2.5">
            <Tag tone="estrela" className="px-[9px] py-[3px] text-[10.5px]">
              preço de atacado
            </Tag>
          </p>
        )}

        <button
          type="button"
          className="mt-auto inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border-0 bg-acao px-2.5 py-2 font-display text-[13px] leading-tight font-medium text-white transition duration-150 hover:brightness-95 active:translate-y-px active:scale-[0.99] sm:px-4 sm:text-[15px]"
          onClick={() => addToCart(product)}
        >
          <PlusIcon width={16} height={16} />
          Adicionar
        </button>
      </div>
    </article>
  );
}
