import { useState } from 'react';
import { useStore } from '../context/store';
import { ProductMedia } from '../components/ProductMedia';
import { formatPrice } from '../lib/format';
import { mediaGradient } from '../lib/media';
import { whatsappLink } from '../lib/whatsapp';
import { ProductCard } from '../components/ProductCard';
import { BearMark, CatFace } from '../components/Logo';
import { Button } from '../components/ui/Button';
import { buttonClass } from '../components/ui/buttonClass';
import { Container } from '../components/ui/Container';
import { Eyebrow } from '../components/ui/Eyebrow';
import { SectionHead } from '../components/ui/SectionHead';
import { Tag } from '../components/ui/Tag';
import {
  ArrowIcon,
  CardIcon,
  MinusIcon,
  PawIcon,
  PlusIcon,
  TruckIcon,
  WhatsappIcon,
} from '../components/Icons';

const breadcrumbItem = 'hover:text-acao';
const qtyButton =
  'grid size-8 place-items-center rounded-full border-0 bg-transparent text-ink hover:bg-pessego/60 disabled:cursor-not-allowed disabled:opacity-35';

function QuantityInput({ value, min, onChange }) {
  return (
    <div
      className="inline-flex items-center gap-1 rounded-full border-2 border-line bg-surface p-1"
      aria-label="Quantidade"
    >
      <button
        type="button"
        className={qtyButton}
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label="Diminuir quantidade"
        disabled={value <= min}
      >
        <MinusIcon width={16} height={16} />
      </button>
      <span aria-live="polite" className="min-w-9 text-center font-display text-base font-semibold">
        {value}
      </span>
      <button
        type="button"
        className={qtyButton}
        onClick={() => onChange(Math.min(99, value + 1))}
        aria-label="Aumentar quantidade"
      >
        <PlusIcon width={16} height={16} />
      </button>
    </div>
  );
}

function ProductGallery({ product }) {
  return (
    <div
      className="relative mx-auto grid aspect-square w-full max-w-[520px] place-items-center overflow-hidden rounded-[28px] border-2 border-line p-6 md:p-8 lg:max-w-none"
      style={mediaGradient(product.colors)}
    >
      <ProductMedia
        product={product}
        artClassName="w-[72%] drop-shadow-[0_18px_22px_rgba(91,64,52,0.16)]"
        imageClassName="size-full rounded-[22px] object-cover"
        loading="eager"
      />

      <span className="pointer-events-none absolute -right-4 -bottom-5 rotate-[-14deg] text-cacau/15" aria-hidden="true">
        <PawIcon width={140} height={140} />
      </span>

      <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5">
        {product.tags.map((tag) => (
          <Tag key={tag} tone="estrela">
            {tag}
          </Tag>
        ))}
      </div>

      <span className="absolute right-3.5 bottom-3.5 flex size-[86px] rotate-[6deg] flex-col items-center justify-center rounded-full border-[3px] border-dashed border-cacau/35 bg-estrela text-center text-cacau shadow-[0_12px_24px_-14px_rgba(91,64,52,0.7)]">
        <strong className="font-display text-sm leading-none font-semibold">
          {product.minWholesale} peças
        </strong>
        <small className="mt-1 max-w-16 font-body text-[8px] leading-tight font-extrabold tracking-[0.08em] uppercase">
          preço de atacado
        </small>
      </span>
    </div>
  );
}

function WholesaleBox({ product, mode, missing, setMode }) {
  if (mode === 'varejo') {
    return (
      <button
        type="button"
        className="flex w-full items-center gap-3 rounded-[18px] border-2 border-dashed border-ouro/60 bg-pessego/40 px-3.5 py-3 text-left text-ink transition hover:border-ouro hover:bg-pessego/60"
        onClick={() => setMode('atacado')}
      >
        <BearMark size={34} className="shrink-0 text-ouro" />
        <span className="min-w-0 flex-1">
          <strong className="block font-display text-[15px] leading-tight font-semibold">
            No atacado: {formatPrice(product.wholesaleCents)}/un.
          </strong>
          <small className="mt-0.5 block text-[12.5px] leading-snug text-muted">
            Comprando {product.minWholesale} peças ou mais. Toque para ativar os preços de atacado.
          </small>
        </span>
        <ArrowIcon width={18} height={18} className="shrink-0 text-muted" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-[18px] border-2 border-estrela bg-estrela/20 px-3.5 py-3 text-ink">
      <BearMark size={34} className="shrink-0 text-ouro" />
      <span className="min-w-0">
        <strong className="block font-display text-[15px] leading-tight font-semibold">
          Preço de atacado ativo
        </strong>
        <small className="mt-0.5 block text-[12.5px] leading-snug text-muted">
          {missing > 0
            ? `Adicione mais ${missing} ${missing === 1 ? 'peça' : 'peças'} para fechar o mínimo.`
            : `Mínimo de ${product.minWholesale} peças atingido neste item.`}
        </small>
      </span>
    </div>
  );
}

function Benefits() {
  const { store } = useStore();

  const items = [
    [TruckIcon, store.freeShippingNote],
    [CardIcon, 'Pix, crédito ou débito'],
    [PawIcon, 'Trocas em até 7 dias'],
  ];

  return (
    <ul className="mt-4 grid gap-1.5">
      {items.map(([Icon, text]) => (
        <li key={text} className="flex items-center gap-2 text-[13px] text-muted">
          <Icon width={18} height={18} className="shrink-0 text-acao" />
          {text}
        </li>
      ))}
    </ul>
  );
}

export function ProductPage() {
  const { route, mode, setMode, addToCart, navigate, getProduct, getCategory, products, store } =
    useStore();
  const product = getProduct(route.slug);
  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <div className="py-12 pb-20">
        <Container className="flex flex-col items-center gap-2 px-5 py-15 text-center">
          <CatFace tone="creme" size={110} />
          <h1 className="font-display text-[clamp(26px,3vw,34px)]">Produto não encontrado</h1>
          <p className="max-w-[44ch] text-[14.5px] text-muted">
            Esse item pode ter saído do catálogo. Veja as novidades da loja.
          </p>
          <Button className="mt-2" onClick={() => navigate('catalogo')}>
            Voltar ao catálogo
          </Button>
        </Container>
      </div>
    );
  }

  const category = getCategory(product.category);
  const unitPrice = mode === 'atacado' ? product.wholesaleCents : product.priceCents;
  const min = mode === 'atacado' ? product.minWholesale : 1;
  const quantity = Math.max(qty, min);
  const total = unitPrice * quantity;
  const savings = Math.round((1 - product.wholesaleCents / product.priceCents) * 100);
  const missing = Math.max(product.minWholesale - quantity, 0);
  const related = products
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 4);

  return (
    <div className="py-5 pb-16 md:pt-7 md:pb-21">
      <Container>
        <nav
          className="flex flex-wrap items-center gap-[7px] text-[12.5px] text-muted"
          aria-label="Você está aqui"
        >
          <a href="#/" className={breadcrumbItem} onClick={() => navigate('')}>
            Início
          </a>
          <span className="opacity-50" aria-hidden="true">
            /
          </span>
          <a href="#/catalogo" className={breadcrumbItem} onClick={() => navigate('catalogo')}>
            Catálogo
          </a>
          <span className="opacity-50" aria-hidden="true">
            /
          </span>
          <a href="#/catalogo" className={breadcrumbItem} onClick={() => navigate('catalogo')}>
            {category?.name}
          </a>
          <span className="opacity-50" aria-hidden="true">
            /
          </span>
          <span className="text-ink">{product.name}</span>
        </nav>

        <div className="mt-6 grid items-start gap-7 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10 xl:gap-12">
          <ProductGallery product={product} />

          <div>
            <span className="font-body text-[11px] leading-snug font-extrabold tracking-[0.14em] text-acao uppercase">
              {category?.name}
            </span>
            <h1 className="mt-1.5 font-display text-[clamp(28px,4vw,42px)] leading-tight">
              {product.name}
            </h1>

            <div className="mt-3.5 flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
              <p className="font-display text-[clamp(26px,3.4vw,34px)] leading-none font-semibold">
                {formatPrice(unitPrice)}
                <small className="ml-1 font-body text-[13px] font-semibold text-muted">
                  {mode === 'atacado' ? 'por unidade no atacado' : 'a unidade'}
                </small>
              </p>
              <Tag tone="rosa">{savings}% off no atacado</Tag>
            </div>

            <div className="mt-4">
              <WholesaleBox product={product} mode={mode} missing={missing} setMode={setMode} />
            </div>

            <p className="mt-4 text-[14.5px] leading-relaxed text-muted">{product.description}</p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <QuantityInput value={quantity} min={min} onChange={setQty} />
              <Button className="flex-1" onClick={() => addToCart(product, quantity)}>
                Adicionar · {formatPrice(total)}
              </Button>
            </div>

            <a
              className={buttonClass({ variant: 'ghost', block: true, className: 'mt-2.5' })}
              href={whatsappLink(store, `Olá, Nanami! Quero saber mais sobre ${product.name}.`)}
              target="_blank"
              rel="noreferrer"
            >
              <WhatsappIcon width={18} height={18} />
              Tirar dúvida no WhatsApp
            </a>

            <Benefits />

            <div className="mt-5 rounded-[18px] border-2 border-line bg-surface-soft px-4 py-3.5">
              <h2 className="font-display text-[17px]">Detalhes do produto</h2>
              <ul className="mt-2 grid gap-1.5">
                {product.details.map((detail) => (
                  <li
                    key={detail}
                    className="flex items-start gap-2 text-[13.5px] leading-snug text-muted"
                  >
                    <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-rosa" aria-hidden="true" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-14 border-t-2 border-dashed border-line pt-10 md:mt-[72px] md:pt-12">
            <SectionHead
              eyebrow={<Eyebrow>Combina com</Eyebrow>}
              title="Você também vai gostar"
            />
            <div className="grid grid-cols-2 gap-2.5 md:gap-3 lg:grid-cols-3 xl:grid-cols-4 xl:gap-5">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </Container>
    </div>
  );
}
