import { useStore } from '../context/store';
import { whatsappLink } from '../lib/whatsapp';
import { Logo } from './Logo';
import { Container } from './ui/Container';
import { ClockIcon, InstagramIcon, PinIcon, WhatsappIcon } from './Icons';

const columnLink =
  'inline-flex w-fit items-center gap-[7px] text-[13.5px] leading-normal text-creme/80 hover:text-estrela';

export function Footer() {
  const { navigate, setMode, setCategory, setQuery, store } = useStore();

  const goCatalog = () => {
    setCategory('todos');
    setQuery('');
    navigate('catalogo');
  };

  return (
    <footer className="bg-cacau pt-11 text-creme md:pt-15">
      <Container className="grid grid-cols-1 gap-6 pb-11 sm:grid-cols-2 sm:gap-7 lg:grid-cols-[1.6fr_1fr_1fr_1.2fr] lg:gap-9">
        <div>
          <Logo light />
          <p className="mt-3.5 max-w-[34ch] text-[13.5px] leading-relaxed text-creme/70">
            Achadinhos para você e para revender. Varejo e atacado na mesma loja, com atendimento
            pelo WhatsApp.
          </p>
          <div className="mt-4 flex gap-[9px]">
            <a
              href={store.instagramUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram da Nanami"
              className="grid size-[38px] place-items-center rounded-full border border-creme/30 text-creme transition-colors hover:bg-creme hover:text-cacau"
            >
              <InstagramIcon />
            </a>
            <a
              href={whatsappLink(store)}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp da Nanami"
              className="grid size-[38px] place-items-center rounded-full border border-creme/30 text-creme transition-colors hover:bg-creme hover:text-cacau"
            >
              <WhatsappIcon />
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <h3 className="mb-1 font-display text-[17px] text-creme">Comprar</h3>
          <a
            href="#/catalogo"
            className={columnLink}
            onClick={() => {
              setMode('varejo');
              goCatalog();
            }}
          >
            Varejo
          </a>
          <a
            href="#/catalogo"
            className={columnLink}
            onClick={() => {
              setMode('atacado');
              goCatalog();
            }}
          >
            Atacado
          </a>
          <a href="#/catalogo" className={columnLink} onClick={goCatalog}>
            Novidades
          </a>
          <a href="#/onde-estamos" className={columnLink} onClick={() => navigate('onde-estamos')}>
            Onde estamos
          </a>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <h3 className="mb-1 font-display text-[17px] text-creme">Atendimento</h3>
          <a href={whatsappLink(store)} target="_blank" rel="noreferrer" className={columnLink}>
            <WhatsappIcon width={16} height={16} /> {store.whatsappLabel}
          </a>
          <a href={`mailto:${store.email}`} className={columnLink}>
            {store.email}
          </a>
          <span className="text-[12.5px] text-creme/55">Trocas em até 7 dias</span>
          <span className="text-[12.5px] text-creme/55">{store.freeShippingNote}</span>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <h3 className="mb-1 font-display text-[17px] text-creme">A loja</h3>
          <span className="flex items-start gap-[7px] text-[13.5px] leading-normal text-creme/80">
            <PinIcon width={16} height={16} className="mt-[3px] shrink-0" />
            <span>
              {store.address}
              <br />
              {store.city}
            </span>
          </span>
          <span className="flex items-start gap-[7px] text-[13.5px] leading-normal text-creme/80">
            <ClockIcon width={16} height={16} className="mt-[3px] shrink-0" />
            <span>
              {store.hours.slice(0, 2).map((entry) => (
                <span key={entry.days} className="block">
                  {entry.days.replace('Segunda a sexta', 'Seg a sex')}, {entry.time}
                </span>
              ))}
            </span>
          </span>
        </div>
      </Container>

      <Container className="flex flex-wrap items-center justify-between gap-3.5 border-t border-creme/20 py-[18px] pb-[26px] text-xs text-creme/60">
        <p>© {new Date().getFullYear()} Nanami Atacado &amp; Varejo. Todos os direitos reservados.</p>
        <ul className="flex flex-wrap gap-1.5" aria-label="Formas de pagamento">
          {store.payments.map((payment) => (
            <li
              key={payment}
              className="rounded-full bg-creme/12 px-[9px] py-[3px] text-[11px] font-bold text-creme/80"
            >
              {payment}
            </li>
          ))}
        </ul>
        <p>Feito com carinho ♡</p>
      </Container>
    </footer>
  );
}
