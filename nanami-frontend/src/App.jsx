import { StoreProvider } from './context/StoreContext';
import { useStore } from './context/store';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { Toast } from './components/Toast';
import { CatFace, Logo } from './components/Logo';
import { Button } from './components/ui/Button';
import { Container } from './components/ui/Container';
import { Home } from './views/Home';
import { Catalog } from './views/Catalog';
import { ProductPage } from './views/Product';
import { StorePage } from './views/Store';

function CurrentView() {
  const { route } = useStore();

  if (route.page === 'catalogo') return <Catalog />;
  if (route.page === 'produto') return <ProductPage key={route.slug} />;
  if (route.page === 'onde-estamos') return <StorePage />;
  return <Home />;
}

/** Estado de boot: o catálogo vem da API, então a loja espera a primeira carga. */
function BootScreen() {
  const { catalogStatus, reloadCatalog } = useStore();

  if (catalogStatus === 'error') {
    return (
      <Container className="flex min-h-dvh flex-col items-center justify-center gap-3 text-center">
        <CatFace tone="azul" size={104} />
        <h1 className="font-display text-[26px]">Deu um nó no laço</h1>
        <p className="max-w-[42ch] text-[14.5px] text-muted">
          Não conseguimos carregar o catálogo agora. Confira sua conexão e tente de novo.
        </p>
        <Button className="mt-2" onClick={reloadCatalog}>
          Tentar de novo
        </Button>
      </Container>
    );
  }

  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center gap-3"
      role="status"
      aria-live="polite"
    >
      <Logo />
      <p className="animate-pulse text-[13px] font-bold text-muted">Carregando o catálogo…</p>
    </div>
  );
}

function Shell() {
  const { catalogStatus } = useStore();

  if (catalogStatus !== 'ready') return <BootScreen />;

  return (
    <>
      <a
        className="sr-only rounded-full bg-cacau px-4 py-2 text-sm font-bold text-creme focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[300]"
        href="#conteudo"
        onClick={(event) => {
          event.preventDefault();
          const content = document.getElementById('conteudo');
          content?.focus();
          content?.scrollIntoView();
        }}
      >
        Ir para o conteúdo
      </a>
      <Header />
      <main id="conteudo" tabIndex={-1}>
        <CurrentView />
      </main>
      <Footer />
      <CartDrawer />
      <Toast />
    </>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
