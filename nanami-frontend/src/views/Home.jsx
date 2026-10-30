import { useStore } from '../context/store';
import { formatPrice } from '../lib/format';
import { mediaGradient } from '../lib/media';
import { whatsappLink } from '../lib/whatsapp';
import { CatFace } from '../components/Logo';
import { ProductCard } from '../components/ProductCard';
import { ProductMedia } from '../components/ProductMedia';
import { Storefront } from '../components/Storefront';
import { Button } from '../components/ui/Button';
import { buttonClass } from '../components/ui/buttonClass';
import { Container } from '../components/ui/Container';
import { Eyebrow } from '../components/ui/Eyebrow';
import { SectionHead } from '../components/ui/SectionHead';
import { cx } from '../components/ui/cx';
import {
  ArrowIcon,
  CardIcon,
  ClockIcon,
  PawIcon,
  PinIcon,
  StarIcon,
  TruckIcon,
  WhatsappIcon,
} from '../components/Icons';

const heroPicks = ['pelucia-urso-grande', 'laco-cetim-rosa', 'garrafa-termica-creme'];

const heroCats = [
  { tone: 'rosa', className: '-rotate-[7deg]' },
  { tone: 'laranja', className: 'rotate-[5deg] -translate-y-[3px]' },
  { tone: 'creme', className: '-rotate-[3deg]' },
  { tone: 'amarelo', className: 'rotate-[7deg] -translate-y-[5px]' },
];

const floatPositions = [
  'top-[18px] left-0 -rotate-6 sm:top-[26px] sm:left-[2px]',
  'top-[140px] right-0 rotate-[5deg] sm:top-[160px] lg:top-[188px]',
  'bottom-2.5 left-[6%] rotate-[2deg] sm:bottom-[38px] sm:left-[26px]',
];

const sectionLink =
  'inline-flex shrink-0 items-center gap-1.5 self-start border-b-2 border-transparent text-sm font-extrabold text-acao hover:border-current';

function Hero() {
  const { mode, navigate, setMode, products } = useStore();

  const goWholesale = () => {
    setMode('atacado');
    navigate('catalogo');
  };

  return (
    <section className="relative overflow-hidden py-9 md:py-13">
      <span
        className="pointer-events-none absolute -top-[38%] -right-[12%] size-[620px] rounded-full bg-[radial-gradient(circle,rgba(250,220,196,0.7),transparent_68%)]"
        aria-hidden="true"
      />
      <Container className="relative grid items-center gap-6 lg:grid-cols-[1.04fr_0.96fr] lg:gap-8 xl:gap-12">
        <div className="max-w-[640px]">
          <div className="mb-[18px] flex items-end" aria-hidden="true">
            {heroCats.map((cat) => (
              <CatFace
                key={cat.tone}
                tone={cat.tone}
                size={62}
                blink
                className={cx(
                  '-mr-3 w-[50px] drop-shadow-[0_5px_8px_rgba(91,64,52,0.12)] sm:w-[60px]',
                  cat.className,
                )}
              />
            ))}
          </div>

          <Eyebrow>
            <StarIcon width={14} height={14} />
            Atacado &amp; varejo na mesma loja
          </Eyebrow>

          <h1 className="mt-3.5 font-display text-[clamp(36px,10.5vw,46px)] leading-[1.04] tracking-[-0.005em] sm:text-[clamp(38px,9vw,52px)] lg:text-[clamp(42px,5.4vw,64px)]">
            Fofuras para você
            <br />
            <span className="rounded bg-[linear-gradient(transparent_64%,#ffd64a8c_64%)] text-acao">
              e para revender
            </span>
          </h1>

          <p className="mt-[18px] max-w-[53ch] text-[15.5px] text-muted sm:text-[17.5px]">
            Bolsas, pelúcias, copos térmicos, acessórios e achadinhos para o dia a dia. Compre uma
            peça no varejo ou monte seu pedido de atacado — a gente separa tudo pelo WhatsApp.
          </p>

          <div className="mt-7 flex flex-wrap gap-3 max-sm:flex-col max-sm:items-stretch">
            <a
              className={buttonClass()}
              href="#/catalogo"
              onClick={() => navigate('catalogo')}
            >
              Ver novidades
              <ArrowIcon width={18} height={18} />
            </a>
            <Button variant="alt" onClick={goWholesale}>
              Pedir no atacado
            </Button>
          </div>

          <ul className="mt-[34px] flex flex-wrap gap-x-[22px] gap-y-4">
            {[
              ['6+', 'peças no atacado'],
              ['1 un.', 'também no varejo'],
              ['Brasil', 'envio para todo o país'],
            ].map(([strong, span]) => (
              <li
                key={strong}
                className="flex flex-col gap-0.5 border-r border-dashed border-line pr-[22px] last:border-0 last:pr-0 max-sm:pr-3.5"
              >
                <strong className="font-display text-lg leading-tight font-semibold sm:text-[21px]">
                  {strong}
                </strong>
                <span className="text-[11px] font-semibold text-muted sm:text-[12.5px]">{span}</span>
              </li>
            ))}
          </ul>
        </div>

        <div
          className="relative mx-auto min-h-[350px] w-full max-w-[560px] sm:min-h-[390px] lg:min-h-[440px] xl:min-h-[480px] 2xl:min-h-[520px]"
          aria-label="Destaques da loja"
        >
          <span className="hero-blob" aria-hidden="true" />

          {heroPicks.map((slug, index) => {
            const product = products.find((item) => item.slug === slug);
            if (!product) return null;
            return (
              <a
                key={slug}
                href={`#/produto/${slug}`}
                className={cx(
                  'absolute z-[3] flex w-[47%] max-w-[220px] items-center gap-2 rounded-[18px] border-2 border-line bg-surface p-2 shadow-soft transition-transform hover:translate-y-[-5px] hover:rotate-0 sm:w-[210px] sm:gap-[11px] sm:rounded-[22px] sm:p-2.5 lg:w-[236px]',
                  floatPositions[index],
                )}
                onClick={() => navigate(`produto/${slug}`)}
              >
                <span
                  className="grid size-11 shrink-0 place-items-center rounded-[13px] p-1 sm:size-14 sm:rounded-2xl"
                  style={mediaGradient(product.colors)}
                  aria-hidden="true"
                >
                  <ProductMedia
                    product={product}
                    artClassName="w-full"
                    imageClassName="size-full rounded-[10px] object-cover"
                  />
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="font-body text-[11px] leading-tight font-bold text-ink sm:text-[12.5px]">
                    {product.name}
                  </span>
                  <span className="font-display text-[15px] leading-none font-semibold text-ink sm:text-lg">
                    {formatPrice(mode === 'atacado' ? product.wholesaleCents : product.priceCents)}
                    <small className="text-[9px] font-semibold text-muted sm:text-[10.5px]">
                      {mode === 'atacado' ? ' no atacado' : ' unidade'}
                    </small>
                  </span>
                </span>
              </a>
            );
          })}

          <span
            className="absolute top-1.5 right-0.5 z-[4] flex size-[82px] rotate-[8deg] flex-col items-center justify-center rounded-full border-[3px] border-dashed border-cacau/35 bg-estrela text-center text-cacau shadow-[0_12px_24px_-14px_rgba(91,64,52,0.7)] sm:size-[96px] xl:size-[118px]"
            aria-hidden="true"
          >
            <span className="font-display text-[15px] leading-none font-semibold sm:text-[17px] xl:text-[21px]">
              6 peças
            </span>
            <small className="mt-1 max-w-[62px] font-body text-[8px] leading-tight font-extrabold tracking-[0.08em] uppercase sm:max-w-[80px] sm:text-[9.5px]">
              preço de atacado
            </small>
          </span>

          <span className="absolute top-[8%] left-[48%] z-[2] animate-twinkle text-laranja" aria-hidden="true">✦</span>
          <span className="absolute right-[8%] bottom-[18%] z-[2] animate-twinkle text-[20px] text-laranja [animation-delay:1.2s]" aria-hidden="true">✦</span>
          <span className="absolute bottom-[6%] left-[6%] z-[2] animate-twinkle text-[34px] text-rosa [animation-delay:2.4s]" aria-hidden="true">✧</span>
        </div>
      </Container>
    </section>
  );
}

function TrustStrip() {
  const items = [
    [PawIcon, 'Varejo e atacado', 'Compre 1 peça ou a partir de 6'],
    [TruckIcon, 'Enviamos para todo o Brasil', 'Frete calculado no atendimento'],
    [CardIcon, 'Pix, crédito e débito', 'Sem cadastro e sem complicação'],
    [ClockIcon, 'Atendimento humano', 'Seg a sáb, direto no WhatsApp'],
  ];

  return (
    <section className="border-y-2 border-line bg-surface py-[18px]" aria-label="Vantagens da Nanami">
      <Container className="grid grid-cols-2 gap-3.5 lg:grid-cols-4 lg:gap-[18px]">
        {items.map(([Icon, title, text]) => (
          <div className="flex items-center gap-[11px]" key={title}>
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-pessego/70 text-cacau sm:size-[42px]">
              <Icon width={20} height={20} />
            </span>
            <div>
              <strong className="block text-xs leading-snug font-extrabold sm:text-[13.5px]">
                {title}
              </strong>
              <span className="block text-[10.5px] leading-snug text-muted sm:text-xs">{text}</span>
            </div>
          </div>
        ))}
      </Container>
    </section>
  );
}

function Categories() {
  const { setCategory, setQuery, navigate, categories } = useStore();

  return (
    <section className="py-14 md:py-[72px]">
      <Container>
        <SectionHead
          eyebrow={<Eyebrow>Para todos os gostos</Eyebrow>}
          title="Explore por categoria"
          action={
            <a
              className={sectionLink}
              href="#/catalogo"
              onClick={() => {
                setCategory('todos');
                setQuery('');
                navigate('catalogo');
              }}
            >
              Ver catálogo <ArrowIcon width={16} height={16} />
            </a>
          }
        />

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 lg:gap-3.5">
          {categories.map((category) => (
            <button
              type="button"
              key={category.id}
              className="group relative flex min-h-[140px] flex-col items-center gap-1 rounded-3xl border-2 border-line bg-surface px-2.5 pt-3.5 pb-3 text-ink transition duration-200 hover:-translate-y-1 hover:border-rosa hover:shadow-lift md:min-h-[158px] md:px-3 md:py-4"
              onClick={() => {
                setCategory(category.id);
                setQuery('');
                navigate('catalogo');
              }}
            >
              <CatFace tone={category.cat} size={66} className="w-[54px] md:w-[66px]" />
              <span className="text-center font-display text-sm leading-tight font-medium md:text-[14.5px]">
                {category.name}
              </span>
              <span
                className="absolute right-3 bottom-2 text-[15px] text-ouro opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden="true"
              >
                →
              </span>
            </button>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Featured() {
  const { navigate, setCategory, setQuery, products } = useStore();
  const featured = products.filter((product) => product.featured).slice(0, 8);

  return (
    <section className="border-y-2 border-dashed border-line bg-pessego/25 py-14 md:py-[72px]">
      <Container>
        <SectionHead
          eyebrow={<Eyebrow>Chegou na prateleira</Eyebrow>}
          title="Novidades e favoritos"
          description="Os itens que mais saem — e que a gente repõe toda semana."
          action={
            <a
              className={sectionLink}
              href="#/catalogo"
              onClick={() => {
                setCategory('todos');
                setQuery('');
                navigate('catalogo');
              }}
            >
              Ver tudo <ArrowIcon width={16} height={16} />
            </a>
          }
        />

        <div className="grid grid-cols-2 gap-2.5 md:gap-3 lg:grid-cols-3 xl:grid-cols-4 xl:gap-5">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function WholesaleSteps() {
  const { setMode, navigate, store } = useStore();

  const steps = [
    {
      title: 'Escolha suas peças',
      text: 'Navegue pelo catálogo e adicione ao carrinho o que você quer comprar.',
    },
    {
      title: 'A partir de 6 peças',
      text: 'Ative o modo atacado e o preço por unidade cai automaticamente.',
    },
    {
      title: 'Feche no WhatsApp',
      text: 'O carrinho vira uma mensagem pronta. A gente confirma estoque, frete e pagamento.',
    },
  ];

  return (
    <section className="bg-cacau py-13 text-creme md:py-19">
      <Container className="grid items-center gap-7 lg:grid-cols-2 lg:gap-13">
        <div className="max-w-[620px]">
          <Eyebrow tone="estrela">Para quem revende</Eyebrow>
          <h2 className="mt-2 font-display text-[26px] leading-tight text-creme md:text-[clamp(28px,3.2vw,38px)]">
            Atacado em 3 passos
          </h2>
          <p className="mt-2 max-w-[54ch] text-[15.5px] text-creme/75">
            Sem planilha, sem cadastro e sem taxa de adesão. Monte o pedido pelo site e finalize
            com a nossa equipe.
          </p>
          <div className="mt-[26px] flex flex-wrap gap-3">
            <Button
              variant="primary"
              onClick={() => {
                setMode('atacado');
                navigate('catalogo');
              }}
            >
              Ver preços de atacado
            </Button>
            <a
              className={buttonClass({ variant: 'ghostLight' })}
              href={whatsappLink(store, 'Olá, Nanami! Quero revender. Pode me explicar como funciona o atacado?')}
              target="_blank"
              rel="noreferrer"
            >
              <WhatsappIcon width={18} height={18} />
              Tirar dúvidas
            </a>
          </div>
        </div>

        <ol className="grid gap-3">
          {steps.map((step, index) => (
            <li
              className="flex items-start gap-4 rounded-[22px] bg-surface p-4 text-ink shadow-[0_14px_30px_-26px_rgba(0,0,0,0.9)] md:px-5 md:py-[18px]"
              key={step.title}
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-estrela font-display text-base font-semibold text-cacau">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="font-display text-lg">{step.title}</h3>
                <p className="mt-[3px] text-[13.5px] leading-normal text-muted">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

function InfoCard({ icon: Icon, title, children }) {
  return (
    <div className="flex items-start gap-3.5 rounded-[22px] border-2 border-line bg-surface p-4 md:px-[18px]">
      <span className="grid size-[42px] shrink-0 place-items-center rounded-full bg-pessego/65 text-cacau">
        <Icon />
      </span>
      <div>
        <h3 className="mb-[3px] font-display text-[17px]">{title}</h3>
        {children}
      </div>
    </div>
  );
}

function Hours() {
  const { store } = useStore();

  return (
    <ul className="mt-1 grid gap-1">
      {store.hours.map((entry) => (
        <li
          key={entry.days}
          className="flex justify-between gap-3 border-b border-dashed border-line pb-1 text-[13px] last:border-0 last:pb-0"
        >
          <span className="text-muted">{entry.days}</span>
          <strong className="font-extrabold">{entry.time}</strong>
        </li>
      ))}
    </ul>
  );
}

function StoreSection() {
  const { navigate, store } = useStore();
  const mapQuery = encodeURIComponent(`${store.address}, ${store.city}`);

  return (
    <section className="py-14 md:py-[72px]" id="loja">
      <Container>
        <SectionHead
          eyebrow={<Eyebrow>Onde estamos</Eyebrow>}
          title="Passa aqui na Nanami"
          description="Tem coisa nova chegando toda semana. Vem ver de perto ou chama no WhatsApp."
          action={
            <a
              className={sectionLink}
              href="#/onde-estamos"
              onClick={() => navigate('onde-estamos')}
            >
              Como chegar <ArrowIcon width={16} height={16} />
            </a>
          }
        />

        <div className="grid items-start gap-7 lg:grid-cols-[1.04fr_0.96fr] lg:gap-10">
          <div className="overflow-hidden rounded-[30px] border-2 border-line bg-pessego shadow-soft">
            <Storefront className="h-auto w-full" />
          </div>

          <div className="grid gap-3">
            <InfoCard icon={PinIcon} title="Endereço">
              <p className="text-[13.5px] leading-normal text-muted">
                {store.address}
                <br />
                {store.city}
              </p>
            </InfoCard>

            <InfoCard icon={ClockIcon} title="Horário">
              <Hours />
            </InfoCard>

            <InfoCard icon={StarIcon} title="Pagamento">
              <p className="text-[13.5px] leading-normal text-muted">
                {store.payments.join(' · ')}
              </p>
            </InfoCard>

            <div className="mt-1 flex flex-wrap gap-2.5">
              <a
                className={buttonClass()}
                href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                target="_blank"
                rel="noreferrer"
              >
                Abrir no mapa
              </a>
              <a
                className={buttonClass({ variant: 'ghost' })}
                href={whatsappLink(store)}
                target="_blank"
                rel="noreferrer"
              >
                <WhatsappIcon width={18} height={18} />
                Falar no WhatsApp
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function FinalCta() {
  const { store } = useStore();

  return (
    <section className="pb-16 md:pb-19">
      <Container className="flex flex-col items-start gap-6 rounded-[26px] border-2 border-dashed border-ouro/55 bg-pessego px-5 py-[22px] text-cacau md:flex-row md:flex-wrap md:items-center md:rounded-[32px] md:px-8 md:py-[26px] lg:flex-nowrap">
        <div className="hidden shrink-0 sm:flex" aria-hidden="true">
          <CatFace tone="creme" size={56} />
          <CatFace tone="rosa" size={56} className="-ml-[18px]" />
        </div>
        <div>
          <h2 className="font-display text-[clamp(24px,2.6vw,30px)]">Montando sua loja?</h2>
          <p className="mt-[3px] text-sm text-[#6b4b3a]">
            A gente separa as peças, monta o orçamento e envia para todo o Brasil.
          </p>
        </div>
        <a
          className={buttonClass({ variant: 'alt', className: 'max-sm:w-full md:ml-auto' })}
          href={whatsappLink(store, 'Olá, Nanami! Quero montar um pedido de atacado.')}
          target="_blank"
          rel="noreferrer"
        >
          <WhatsappIcon width={18} height={18} />
          Pedir orçamento
        </a>
      </Container>
    </section>
  );
}

export function Home() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <Categories />
      <Featured />
      <WholesaleSteps />
      <StoreSection />
      <FinalCta />
    </>
  );
}
