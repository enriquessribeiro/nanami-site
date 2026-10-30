import { useStore } from '../context/store';
import { whatsappLink } from '../lib/whatsapp';
import { Storefront } from '../components/Storefront';
import { CatFace } from '../components/Logo';
import { buttonClass } from '../components/ui/buttonClass';
import { Container } from '../components/ui/Container';
import { Eyebrow } from '../components/ui/Eyebrow';
import { Tag } from '../components/ui/Tag';
import { ArrowIcon, ClockIcon, PinIcon, StarIcon, WhatsappIcon } from '../components/Icons';

function InfoCard({ icon: Icon, title, children }) {
  return (
    <div className="flex items-start gap-3.5 rounded-[22px] border-2 border-line bg-surface p-4 md:px-[18px]">
      <span className="grid size-[42px] shrink-0 place-items-center rounded-full bg-pessego/65 text-cacau">
        <Icon />
      </span>
      <div className="min-w-0">
        <h2 className="mb-[3px] font-display text-[18px]">{title}</h2>
        {children}
      </div>
    </div>
  );
}

function Hours({ hours }) {
  return (
    <ul className="mt-1 grid gap-1">
      {hours.map((entry) => (
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

export function StorePage() {
  const { navigate, store } = useStore();
  const mapQuery = encodeURIComponent(`${store.address}, ${store.city}`);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  return (
    <div className="py-5 pb-16 md:pt-7 md:pb-21">
      <Container>
        <nav
          className="flex flex-wrap items-center gap-[7px] text-[12.5px] text-muted"
          aria-label="Você está aqui"
        >
          <a href="#/" className="hover:text-acao" onClick={() => navigate('')}>
            Início
          </a>
          <span className="opacity-50" aria-hidden="true">
            /
          </span>
          <span className="text-ink">Onde estamos</span>
        </nav>

        <header className="mt-[22px] mb-[22px] flex flex-col items-start gap-4 md:mb-[30px] lg:flex-row lg:items-end lg:justify-between lg:gap-7">
          <div>
            <Eyebrow>Vem nos visitar</Eyebrow>
            <h1 className="mt-2 font-display text-[clamp(34px,4.6vw,54px)] leading-tight">
              Onde está a Nanami
            </h1>
            <p className="mt-2.5 max-w-[62ch] text-[15.5px] text-muted">
              Estamos no coração do centro, com prateleiras cheias de novidades. Se preferir, chama
              no WhatsApp que a gente mostra o que chegou.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2.5 rounded-full border-2 border-line bg-surface py-1.5 pr-4 pl-1.5">
            <CatFace tone="laranja" size={78} className="w-[62px]" />
            <span className="max-w-[110px] text-xs leading-tight font-bold text-muted">
              aberto de seg a sáb
            </span>
          </div>
        </header>

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
              <a
                className="mt-1.5 inline-flex items-center gap-1 text-[13px] font-extrabold text-acao underline-offset-2 hover:underline"
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
              >
                Abrir no Google Maps <ArrowIcon width={15} height={15} />
              </a>
            </InfoCard>

            <InfoCard icon={ClockIcon} title="Horário de funcionamento">
              <Hours hours={store.hours} />
            </InfoCard>

            <InfoCard icon={StarIcon} title="Formas de pagamento">
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {store.payments.map((payment) => (
                  <li key={payment}>
                    <Tag tone="creme">{payment}</Tag>
                  </li>
                ))}
              </ul>
            </InfoCard>

            <a
              className={buttonClass({ block: true })}
              href={whatsappLink(store, 'Olá, Nanami! Quero saber como chegar na loja.')}
              target="_blank"
              rel="noreferrer"
            >
              <WhatsappIcon width={18} height={18} />
              Falar no WhatsApp
            </a>
          </div>
        </div>

        <div
          className="map-card relative mt-8 min-h-[300px] overflow-hidden rounded-[30px] border-2 border-line md:min-h-[360px]"
          aria-label="Mapa ilustrativo da região da loja"
        >
          <div className="map-lines absolute inset-0 opacity-80" aria-hidden="true" />
          <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-[22px] bg-surface px-5 py-4 text-center shadow-soft">
            <CatFace tone="rosa" size={54} />
            <strong className="mt-1 font-display text-lg">Nanami</strong>
            <span className="text-xs text-muted">{store.address}</span>
          </div>
          <a
            className={buttonClass({ size: 'sm', className: 'absolute right-4 bottom-4' })}
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
          >
            Traçar rota
          </a>
        </div>
      </Container>
    </div>
  );
}
