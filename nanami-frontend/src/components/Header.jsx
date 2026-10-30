import { useStore } from '../context/store';
import { whatsappLink } from '../lib/whatsapp';
import { Logo } from './Logo';
import { Container } from './ui/Container';
import { IconButton } from './ui/IconButton';
import { cx } from './ui/cx';
import {
  BagIcon,
  CloseIcon,
  InstagramIcon,
  MenuIcon,
  SearchIcon,
  WhatsappIcon,
} from './Icons';

const navLink =
  'relative py-1.5 text-ink after:absolute after:inset-x-0 after:-bottom-0.5 after:h-[3px] after:origin-left after:scale-x-0 after:rounded after:bg-rosa after:transition-transform hover:after:scale-x-100';

function ModeSwitch({ compact = false }) {
  const { mode, setMode } = useStore();

  return (
    <div
      className={cx('inline-flex shrink-0 rounded-full bg-pessego/70 p-1', compact && 'text-sm')}
      role="group"
      aria-label="Tipo de compra"
    >
      {[
        ['varejo', 'Varejo'],
        ['atacado', 'Atacado'],
      ].map(([value, label]) => (
        <button
          key={value}
          type="button"
          aria-pressed={mode === value}
          onClick={() => setMode(value)}
          className={cx(
            'min-h-[34px] rounded-full px-[15px] py-1.5 font-display leading-none transition-colors',
            mode === value ? 'bg-cacau text-creme' : 'text-cacau',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function SearchForm({ className = '' }) {
  const { query, setQuery, navigate } = useStore();

  return (
    <form
      className={cx(
        'flex min-h-11 items-center gap-2 rounded-full border-2 border-line bg-surface px-[13px] py-[7px] text-muted',
        className,
      )}
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        navigate('catalogo');
      }}
    >
      <SearchIcon width={18} height={18} className="shrink-0" />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar bolsas, pelúcias, copos..."
        aria-label="Buscar produtos"
        className="w-full min-w-0 border-0 bg-transparent text-[13.5px] font-semibold text-ink outline-none placeholder:font-normal placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
      />
      {query && (
        <button
          type="button"
          className="grid place-items-center border-0 bg-transparent p-0 text-muted"
          onClick={() => setQuery('')}
          aria-label="Limpar busca"
        >
          <CloseIcon width={15} height={15} />
        </button>
      )}
    </form>
  );
}

export function Header() {
  const { navigate, cartCount, setCartOpen, menuOpen, setMenuOpen, setMode, mode, store } =
    useStore();

  const goWholesale = () => {
    setMode('atacado');
    navigate('catalogo');
  };

  return (
    <header className="sticky top-0 z-[80] border-b-2 border-line bg-bg/90 backdrop-blur-[14px]">
      <div className="bg-cacau text-creme">
        <Container className="flex min-h-9 items-center justify-between gap-4 text-[12.5px] font-bold max-sm:justify-center">
          <p className="inline-flex items-center gap-[7px] tracking-[0.02em]">
            <span className="text-[11px] text-estrela" aria-hidden="true">
              ★
            </span>
            Atacado a partir de {store?.wholesaleMin ?? 6} peças
          </p>
          <div className="flex items-center gap-[18px] max-sm:hidden">
            <a
              className="inline-flex items-center gap-1.5 opacity-90 transition-opacity hover:text-estrela hover:opacity-100"
              href={store?.instagramUrl}
              target="_blank"
              rel="noreferrer"
            >
              <InstagramIcon width={16} height={16} />
              <span>{store?.instagram}</span>
            </a>
            <a
              className="inline-flex items-center gap-1.5 opacity-90 transition-opacity hover:text-estrela hover:opacity-100"
              href={whatsappLink(store ?? { whatsapp: '' })}
              target="_blank"
              rel="noreferrer"
            >
              <WhatsappIcon width={16} height={16} />
              <span>{store?.whatsappLabel}</span>
            </a>
          </div>
        </Container>
      </div>

      <Container className="flex items-center gap-[18px] py-3 max-lg:py-2.5">
        <a
          href="#/"
          className="inline-flex shrink-0"
          aria-label="Nanami — página inicial"
          onClick={() => navigate('')}
        >
          <Logo />
        </a>

        <nav
          className="hidden items-center gap-5 text-[14.5px] font-bold lg:flex max-xl:gap-3.5 max-xl:text-[13.5px]"
          aria-label="Navegação principal"
        >
          <a href="#/" className={navLink} onClick={() => navigate('')}>
            Início
          </a>
          <a href="#/catalogo" className={navLink} onClick={() => navigate('catalogo')}>
            Catálogo
          </a>
          <button
            type="button"
            className={cx(navLink, mode === 'atacado' && 'after:scale-x-100')}
            onClick={goWholesale}
          >
            Atacado
          </button>
          <a href="#/onde-estamos" className={navLink} onClick={() => navigate('onde-estamos')}>
            Onde estamos
          </a>
        </nav>

        <SearchForm className="ml-auto hidden max-w-[200px] flex-1 lg:flex xl:max-w-[320px]" />

        <div className="hidden lg:block">
          <ModeSwitch />
        </div>

        <button
          type="button"
          className="relative inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-line bg-surface px-3.5 py-2 text-[13.5px] font-bold transition-colors hover:border-rosa"
          onClick={() => setCartOpen(true)}
          aria-label={`Abrir carrinho, ${cartCount} ${cartCount === 1 ? 'item' : 'itens'}`}
        >
          <BagIcon width={19} height={19} />
          <span className="max-xl:hidden">Carrinho</span>
          {cartCount > 0 && (
            <span className="absolute -top-[7px] -right-1.5 grid h-[21px] min-w-[21px] place-items-center rounded-full border-2 border-surface bg-acao px-1 text-[11px] font-extrabold text-white">
              {cartCount}
            </span>
          )}
        </button>

        <IconButton
          className="lg:hidden"
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </IconButton>
      </Container>

      <Container className="flex gap-2.5 pb-3 lg:hidden">
        <SearchForm className="flex-1" />
        <ModeSwitch compact />
      </Container>

      {menuOpen && (
        <div
          className="absolute inset-x-0 top-full animate-drop-in border-b-2 border-line bg-bg shadow-soft"
          id="mobile-menu"
        >
          <Container className="grid gap-0.5 pt-3 pb-[22px]">
            {[
              ['#/', 'Início', () => navigate('')],
              ['#/catalogo', 'Catálogo', () => navigate('catalogo')],
            ].map(([href, label, onClick]) => (
              <a
                key={href}
                href={href}
                onClick={onClick}
                className="border-b border-dashed border-line px-1 py-3 text-base font-bold"
              >
                {label}
              </a>
            ))}
            <button
              type="button"
              onClick={goWholesale}
              className="border-b border-dashed border-line bg-transparent px-1 py-3 text-left text-base font-bold"
            >
              Atacado
            </button>
            <a
              href="#/onde-estamos"
              onClick={() => navigate('onde-estamos')}
              className="border-b border-dashed border-line px-1 py-3 text-base font-bold"
            >
              Onde estamos
            </a>
            <a
              className="mt-3 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-acao px-[26px] py-3 text-center font-display text-[17px] font-medium leading-tight text-white"
              href={whatsappLink(store ?? { whatsapp: '' })}
              target="_blank"
              rel="noreferrer"
            >
              <WhatsappIcon width={18} height={18} />
              Falar no WhatsApp
            </a>
          </Container>
        </div>
      )}
    </header>
  );
}
