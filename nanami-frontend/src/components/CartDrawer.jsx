import { useEffect, useRef } from 'react';
import { useStore } from '../context/store';
import { formatPrice } from '../lib/format';
import { mediaGradient } from '../lib/media';
import { cartWhatsappLink } from '../lib/whatsapp';
import { CatFace } from './Logo';
import { ProductMedia } from './ProductMedia';
import { Button } from './ui/Button';
import { Eyebrow } from './ui/Eyebrow';
import { IconButton } from './ui/IconButton';
import { Tag } from './ui/Tag';
import { CloseIcon, MinusIcon, PlusIcon, TrashIcon, WhatsappIcon } from './Icons';

function QtyButton({ label, disabled, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      disabled={disabled}
      className="grid size-6 place-items-center rounded-full border-0 bg-transparent text-ink hover:bg-pessego/60 disabled:cursor-not-allowed disabled:opacity-35"
    >
      {children}
    </button>
  );
}

export function CartDrawer() {
  const { cart, cartOpen, setCartOpen, mode, setQty, removeFromCart, cartCount, store } =
    useStore();
  const closeRef = useRef(null);

  useEffect(() => {
    if (cartOpen) {
      const timer = window.setTimeout(() => closeRef.current?.focus(), 60);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [cartOpen]);

  if (!cartOpen) return null;

  const unitOf = (item) => (mode === 'atacado' ? item.wholesaleCents : item.priceCents);
  const subtotal = cart.reduce((sum, item) => sum + unitOf(item) * item.qty, 0);

  const hasWholesaleReady = cart.every(
    (item) => mode === 'varejo' || item.qty >= item.minWholesale,
  );

  return (
    <div className="fixed inset-0 z-[120]">
      <button
        type="button"
        className="absolute inset-0 size-full animate-fade-in border-0 bg-[#2b1d17]/50 p-0 backdrop-blur-[2px]"
        aria-label="Fechar carrinho"
        onClick={() => setCartOpen(false)}
      />
      <aside
        className="absolute inset-y-0 right-0 flex h-dvh w-full max-w-[420px] animate-slide-in flex-col bg-bg shadow-[-20px_0_60px_-30px_rgba(0,0,0,0.6)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        <header className="flex items-start justify-between gap-3 border-b-2 border-dashed border-line px-[22px] pt-5 pb-4">
          <div>
            <Eyebrow>Seu pedido</Eyebrow>
            <h2 id="cart-title" className="mt-[3px] font-display text-[28px]">
              Carrinho
            </h2>
          </div>
          <IconButton onClick={() => setCartOpen(false)} aria-label="Fechar carrinho" ref={closeRef}>
            <CloseIcon />
          </IconButton>
        </header>

        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-7 pt-8 pb-15 text-center">
            <CatFace tone="rosa" size={104} />
            <h3 className="mt-2.5 font-display text-[22px]">Seu carrinho está vazio</h3>
            <p className="max-w-[30ch] text-[13.5px] text-muted">
              Dá uma olhada nas novidades e escolha suas fofuras favoritas.
            </p>
            <Button className="mt-3.5" onClick={() => setCartOpen(false)}>
              Continuar comprando
            </Button>
          </div>
        ) : (
          <>
            <div className="mx-[22px] mt-3.5 flex items-center gap-2.5 rounded-[18px] border-2 border-line bg-surface px-3 py-[9px]">
              <Tag tone="estrela">{mode === 'atacado' ? 'Atacado' : 'Varejo'}</Tag>
              <p className="text-[11.5px] leading-snug text-muted">
                {mode === 'atacado'
                  ? `Preços por unidade no atacado, mínimo de ${store.wholesaleMin} peças por item.`
                  : 'Preços de varejo. Mude para atacado e economize a partir de 6 peças.'}
              </p>
            </div>

            <ul className="flex-1 overflow-y-auto overscroll-contain px-[22px] pt-1.5 pb-3">
              {cart.map((item) => {
                const unit = unitOf(item);
                const min = mode === 'atacado' ? item.minWholesale : 1;
                return (
                  <li className="flex gap-3 border-b border-dashed border-line py-3.5" key={item.id}>
                    <div
                      className="grid size-[72px] shrink-0 place-items-center overflow-hidden rounded-2xl p-[5px]"
                      style={mediaGradient(item.colors)}
                      aria-hidden="true"
                    >
                      <ProductMedia
                        product={item}
                        artClassName="size-16"
                        imageClassName="size-full rounded-xl object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-[14.5px] leading-tight">{item.name}</h3>
                      <p className="mt-0.5 text-xs text-muted">
                        {formatPrice(unit)} <small className="text-[10.5px]">/ un.</small>
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="inline-flex items-center gap-0.5 rounded-full border-2 border-line bg-surface p-0.5">
                          <QtyButton
                            label={`Diminuir quantidade de ${item.name}`}
                            onClick={() => setQty(item.id, item.qty - 1)}
                            disabled={item.qty <= min}
                          >
                            <MinusIcon width={14} height={14} />
                          </QtyButton>
                          <span
                            aria-live="polite"
                            className="min-w-6 text-center font-display text-[13px] font-semibold"
                          >
                            {item.qty}
                          </span>
                          <QtyButton
                            label={`Aumentar quantidade de ${item.name}`}
                            onClick={() => setQty(item.id, item.qty + 1)}
                          >
                            <PlusIcon width={14} height={14} />
                          </QtyButton>
                        </div>
                        <strong className="ml-auto font-display text-sm font-semibold">
                          {formatPrice(unit * item.qty)}
                        </strong>
                        <button
                          type="button"
                          className="grid size-[26px] place-items-center rounded-full border-0 bg-transparent text-muted hover:bg-acao/10 hover:text-acao"
                          onClick={() => removeFromCart(item.id)}
                          aria-label={`Remover ${item.name} do carrinho`}
                        >
                          <TrashIcon width={16} height={16} />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <footer className="border-t-2 border-line bg-surface px-[22px] pt-4 pb-[22px]">
              <div className="mb-3 flex items-baseline justify-between gap-3 text-sm font-bold">
                <span>
                  Subtotal{' '}
                  <small className="font-semibold text-muted">
                    ({cartCount} {cartCount === 1 ? 'peça' : 'peças'})
                  </small>
                </span>
                <strong className="font-display text-[23px] font-semibold">
                  {formatPrice(subtotal)}
                </strong>
              </div>
              {!hasWholesaleReady && (
                <p className="mb-2.5 text-[11.5px] font-bold text-acao">
                  Alguns itens ainda não atingiram o mínimo de atacado.
                </p>
              )}
              <a
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border-0 bg-acao px-[26px] py-3 text-center font-display text-[17px] font-medium leading-tight text-white transition hover:brightness-95 active:translate-y-px active:scale-[0.99]"
                href={cartWhatsappLink(cart, mode, store)}
                target="_blank"
                rel="noreferrer"
              >
                <WhatsappIcon width={19} height={19} />
                Finalizar pelo WhatsApp
              </a>
              <p className="mt-2.5 text-center text-[10.5px] leading-snug text-muted">
                Frete e formas de pagamento combinados no atendimento. Sem cadastro.
              </p>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
