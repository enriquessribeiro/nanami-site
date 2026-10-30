import { useEffect, useState } from 'react';
import { api, setUnauthorizedHandler } from './api';
import { Products } from './views/Products';
import { ProductForm } from './views/ProductForm';
import { Categories } from './views/Categories';
import { Settings } from './views/Settings';
import { Login } from './views/Login';

/* ----------------------------- rota mínima ------------------------------- */
/* Hash routing em ~20 linhas: o painel tem 4 telas, não precisa de router.    */

function readRoute() {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const [section, param] = hash.split('/');
  if (section === 'produtos') return { name: param === 'novo' ? 'product-new' : param ? 'product' : 'products', id: param };
  if (section === 'categorias') return { name: 'categories' };
  if (section === 'loja') return { name: 'settings' };
  return { name: 'products' };
}

function go(path) {
  window.location.hash = path;
}

const NAV = [
  { id: 'products', label: 'Produtos', path: '/produtos' },
  { id: 'categories', label: 'Categorias', path: '/categorias' },
  { id: 'settings', label: 'Loja', path: '/loja' },
];

/* --------------------------------- app ----------------------------------- */

export function AdminApp() {
  const [admin, setAdmin] = useState(null);
  const [checking, setChecking] = useState(true);
  const [route, setRoute] = useState(readRoute);
  const [categories, setCategories] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Sessão expirada em qualquer chamada → volta para o login.
  useEffect(() => {
    setUnauthorizedHandler(() => setAdmin(null));
  }, []);

  useEffect(() => {
    const onHashChange = () => setRoute(readRoute());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    api('/auth/me')
      .then((me) => setAdmin(me))
      .catch(() => setAdmin(null))
      .finally(() => setChecking(false));
  }, []);

  // Categorias são usadas pela lista e pelo formulário de produto; recarregamos
  // sempre que algo muda (refreshKey) ou logo depois do login.
  useEffect(() => {
    if (!admin) return undefined;

    let cancelled = false;
    api('/admin/categories')
      .then(({ categories: list }) => {
        if (!cancelled) setCategories(list);
      })
      .catch(() => {
        // O erro aparece nas telas que dependem da lista; não bloqueia o resto.
      });

    return () => {
      cancelled = true;
    };
  }, [admin, refreshKey]);

  const refresh = () => setRefreshKey((key) => key + 1);

  async function handleLogout() {
    await api('/auth/logout', { method: 'POST' }).catch(() => {});
    setAdmin(null);
    go('/produtos');
  }

  if (checking) {
    return <p className="grid min-h-dvh place-items-center text-[13px] text-muted">Carregando…</p>;
  }

  if (!admin) {
    return <Login onSuccess={(me) => setAdmin(me)} />;
  }

  const activeNav = route.name === 'product' || route.name === 'product-new' ? 'products' : route.name;

  return (
    <div className="min-h-dvh">
      <header className="border-b-2 border-line bg-surface">
        <div className="mx-auto flex w-[min(1200px,calc(100%-32px))] flex-wrap items-center gap-x-6 gap-y-2 py-3">
          <span className="flex flex-col leading-none">
            <span className="font-display text-[19px] tracking-[0.16em] text-ink">NANAMI</span>
            <span className="text-[9px] font-extrabold tracking-[0.3em] text-muted uppercase">
              Painel
            </span>
          </span>

          <nav className="flex gap-1" aria-label="Seções do painel">
            {NAV.map((item) => (
              <a
                key={item.id}
                href={`#${item.path}`}
                aria-current={activeNav === item.id ? 'page' : undefined}
                className={
                  activeNav === item.id
                    ? 'rounded-full bg-cacau px-3.5 py-1.5 text-[13px] font-bold text-creme'
                    : 'rounded-full px-3.5 py-1.5 text-[13px] font-bold text-muted hover:bg-surface-soft hover:text-ink'
                }
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-[11.5px] text-muted sm:inline">{admin.email}</span>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="text-[12px] font-bold text-muted underline underline-offset-2 hover:text-ink"
            >
              Ver loja
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border-2 border-line px-3 py-1.5 text-[12px] font-extrabold text-ink hover:border-acao hover:text-acao"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-[min(1200px,calc(100%-32px))] py-6">
        {route.name === 'products' && (
          <Products
            categories={categories}
            onChanged={refresh}
            onCreate={() => go('/produtos/novo')}
            onEdit={(id) => go(`/produtos/${id}`)}
          />
        )}

        {(route.name === 'product' || route.name === 'product-new') && (
          <ProductForm
            key={route.id ?? 'novo'}
            productId={route.name === 'product' ? Number(route.id) : null}
            categories={categories}
            onDone={() => {
              refresh();
              go('/produtos');
            }}
            onCancel={() => go('/produtos')}
          />
        )}

        {route.name === 'categories' && (
          <Categories categories={categories} onChanged={refresh} />
        )}

        {route.name === 'settings' && <Settings />}
      </main>
    </div>
  );
}
