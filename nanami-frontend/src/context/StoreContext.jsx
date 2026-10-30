import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StoreContext } from './store';

const MODE_KEY = 'nanami:mode';
const CART_KEY = 'nanami:cart';

function readStoredMode() {
  try {
    return window.localStorage.getItem(MODE_KEY) === 'atacado' ? 'atacado' : 'varejo';
  } catch {
    return 'varejo';
  }
}

function readStoredCart() {
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Busca o catálogo público. Fica fora do componente para o efeito só tocar em
 * estado dentro dos callbacks assíncronos. */
async function requestCatalog() {
  const response = await fetch('/api/catalog', { credentials: 'same-origin' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

function parseHash() {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const [page, slug] = hash.split('/');

  if (page === 'catalogo') return { page: 'catalogo' };
  if (page === 'produto' && slug) return { page: 'produto', slug };
  if (page === 'onde-estamos') return { page: 'onde-estamos' };
  return { page: 'home' };
}

/**
 * Reconcilia o carrinho salvo no navegador com o catálogo atual:
 * - item que saiu do catálogo (ou foi desativado) é descartado;
 * - preços, nome, cores e mínimo são atualizados com os valores do servidor,
 *   para o pedido no WhatsApp nunca carregar preço velho;
 * - quantidade respeita o mínimo do modo atual.
 */
function reconcileCart(stored, products, mode) {
  const byId = new Map(products.map((product) => [product.id, product]));

  return stored.flatMap((item) => {
    const current = byId.get(item.id);
    if (!current) return [];

    const min = mode === 'atacado' ? current.minWholesale : 1;
    return [
      {
        ...current,
        qty: Math.min(99, Math.max(Number(item.qty) || 1, min)),
      },
    ];
  });
}

export function StoreProvider({ children }) {
  const [mode, setModeState] = useState(readStoredMode);
  const [cart, setCart] = useState(readStoredCart);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [route, setRoute] = useState(parseHash);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('todos');

  const [catalog, setCatalog] = useState({ store: null, categories: [], products: [] });
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');
  // Garante que a reconciliação do carrinho acontece uma vez por carga de
  // catálogo, e não a cada mudança de modo.
  const reconciled = useRef(false);

  const applyCatalog = useCallback((data) => {
    setCatalog({
      store: data.store,
      categories: data.categories ?? [],
      products: data.products ?? [],
    });
    reconciled.current = false;
    setStatus('ready');
    setError('');
  }, []);

  const failCatalog = useCallback(() => {
    setStatus('error');
    setError('Não foi possível carregar o catálogo agora.');
  }, []);

  useEffect(() => {
    let cancelled = false;

    requestCatalog()
      .then((data) => {
        if (!cancelled) applyCatalog(data);
      })
      .catch(() => {
        if (!cancelled) failCatalog();
      });

    return () => {
      cancelled = true;
    };
  }, [applyCatalog, failCatalog]);

  // Retry explícito (botão do estado de erro): volta ao loading e tenta de novo.
  const reloadCatalog = useCallback(() => {
    setStatus('loading');
    setError('');
    requestCatalog().then(applyCatalog).catch(failCatalog);
  }, [applyCatalog, failCatalog]);

  useEffect(() => {
    if (status !== 'ready' || reconciled.current) return;
    reconciled.current = true;

    setCart((items) => {
      const next = reconcileCart(items, catalog.products, mode);
      // Evita re-render/re-gravação quando nada mudou de fato.
      return JSON.stringify(next) === JSON.stringify(items) ? items : next;
    });
  }, [status, catalog.products, mode]);

  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseHash());
      setMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'auto' });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(MODE_KEY, mode);
    } catch {
      /* modo privado sem storage: segue só em memória */
    }
  }, [mode]);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      /* idem */
    }
  }, [cart]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    const locked = cartOpen || menuOpen;
    document.body.classList.toggle('is-locked', locked);
    return () => document.body.classList.remove('is-locked');
  }, [cartOpen, menuOpen]);

  useEffect(() => {
    if (!cartOpen && !menuOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setCartOpen(false);
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [cartOpen, menuOpen]);

  const navigate = useCallback((path = '') => {
    if (!path) {
      window.location.hash = '';
      return;
    }
    window.location.hash = `/${path}`;
  }, []);

  const showToast = useCallback((message, action) => {
    setToast({ message, action, id: Date.now() });
  }, []);

  const getProduct = useCallback(
    (slug) => catalog.products.find((product) => product.slug === slug),
    [catalog.products],
  );

  const getCategory = useCallback(
    (id) => catalog.categories.find((categoryItem) => categoryItem.id === id),
    [catalog.categories],
  );

  const setMode = useCallback(
    (next) => {
      setModeState(next);
      if (next === 'atacado') {
        setCart((items) =>
          items.map((item) => ({
            ...item,
            qty: Math.max(item.qty, item.minWholesale ?? 6),
          })),
        );
        showToast('Preços de atacado ativos — mínimo de 6 peças por item.');
      } else {
        showToast('Preços de varejo ativos — compre 1 ou mais.');
      }
    },
    [showToast],
  );

  const addToCart = useCallback(
    (product, quantity = 1) => {
      const min = mode === 'atacado' ? product.minWholesale : 1;
      const qty = Math.max(quantity, min);

      setCart((items) => {
        const existing = items.find((item) => item.id === product.id);
        if (existing) {
          return items.map((item) =>
            item.id === product.id ? { ...item, qty: Math.min(99, item.qty + qty) } : item,
          );
        }
        return [...items, { ...product, qty }];
      });

      showToast(`${product.name} adicionado ao carrinho.`, 'cart');
    },
    [mode, showToast],
  );

  const setQty = useCallback(
    (id, nextQty) => {
      setCart((items) =>
        items.map((item) => {
          if (item.id !== id) return item;
          const min = mode === 'atacado' ? item.minWholesale : 1;
          return { ...item, qty: Math.min(99, Math.max(nextQty, min)) };
        }),
      );
    },
    [mode],
  );

  const removeFromCart = useCallback((id) => {
    setCart((items) => items.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      cart,
      cartCount,
      cartOpen,
      setCartOpen,
      menuOpen,
      setMenuOpen,
      addToCart,
      setQty,
      removeFromCart,
      clearCart,
      toast,
      showToast,
      route,
      navigate,
      query,
      setQuery,
      category,
      setCategory,
      store: catalog.store,
      categories: catalog.categories,
      products: catalog.products,
      getProduct,
      getCategory,
      catalogStatus: status,
      catalogError: error,
      reloadCatalog,
    }),
    [
      mode,
      setMode,
      cart,
      cartCount,
      cartOpen,
      menuOpen,
      addToCart,
      setQty,
      removeFromCart,
      clearCart,
      toast,
      showToast,
      route,
      navigate,
      query,
      category,
      catalog,
      getProduct,
      getCategory,
      status,
      error,
      reloadCatalog,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
