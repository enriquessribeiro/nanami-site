import { useEffect, useState } from 'react';
import { api } from '../api';
import { Alert, AdminButton, Badge, Input, Select } from '../ui';
import { centsToPriceInput } from '../money';

/** Lista com busca no servidor, filtros de categoria/status e acesso ao form. */
export function Products({ categories, onEdit, onCreate, onChanged }) {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Debounce curto: digitar não dispara uma requisição por tecla.
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (category) params.set('category', category);
      if (status !== 'all') params.set('status', status);

      setLoading(true);
      api(`/admin/products?${params}`)
        .then(({ products: list }) => {
          setProducts(list);
          setError('');
        })
        .catch((requestError) => setError(requestError.message))
        .finally(() => setLoading(false));
    }, 250);

    return () => window.clearTimeout(timer);
  }, [query, category, status, onChanged]);

  async function handleDelete(product) {
    const confirmed = window.confirm(
      `Excluir "${product.name}"? Essa ação não pode ser desfeita.`,
    );
    if (!confirmed) return;

    try {
      await api(`/admin/products/${product.id}`, { method: 'DELETE' });
      onChanged();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-2 md:grid-cols-[1fr_auto_auto_auto] md:items-center">
        <div>
          <label className="sr-only" htmlFor="products-search">
            Buscar produto
          </label>
          <Input
            id="products-search"
            type="search"
            placeholder="Buscar por nome ou slug…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <label className="sr-only" htmlFor="products-category">
          Filtrar por categoria
        </label>
        <Select
          id="products-category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option value="">Todas as categorias</option>
          {categories.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </Select>

        <label className="sr-only" htmlFor="products-status">
          Filtrar por status
        </label>
        <Select
          id="products-status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="all">Todos</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </Select>

        <AdminButton onClick={onCreate} className="justify-self-start md:justify-self-end">
          + Novo produto
        </AdminButton>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <div className="overflow-x-auto rounded-2xl border-2 border-line bg-surface">
        <table className="w-full min-w-[820px] border-collapse text-left text-[13.5px]">
          <thead>
            <tr className="border-b-2 border-line text-[11.5px] font-extrabold tracking-[0.06em] text-muted uppercase">
              <th className="px-3 py-2.5">Produto</th>
              <th className="px-3 py-2.5">Categoria</th>
              <th className="px-3 py-2.5 text-right">Varejo</th>
              <th className="px-3 py-2.5 text-right">Atacado</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-line/70 last:border-0">
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="size-9 shrink-0 rounded-lg ring-1 ring-line ring-inset"
                      style={{
                        backgroundImage: `linear-gradient(150deg, ${product.colors[0] ?? '#eee'}, ${product.colors[1] ?? '#ddd'})`,
                      }}
                      aria-hidden="true"
                    />
                    <span className="min-w-0">
                      <a
                        href={`#/produtos/${product.id}`}
                        onClick={() => onEdit(product.id)}
                        className="block truncate font-bold text-ink hover:text-acao hover:underline"
                      >
                        {product.name}
                      </a>
                      <span className="block truncate text-[11.5px] text-muted">/{product.slug}</span>
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-muted">
                  {categories.find((item) => item.id === product.categoryId)?.name ?? product.categoryId}
                </td>
                <td className="px-3 py-2.5 text-right whitespace-nowrap tabular-nums">
                  R$ {centsToPriceInput(product.priceCents)}
                </td>
                <td className="px-3 py-2.5 text-right whitespace-nowrap tabular-nums">
                  R$ {centsToPriceInput(product.wholesaleCents)}
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex flex-wrap gap-1">
                    <Badge tone={product.active ? 'on' : 'off'}>
                      {product.active ? 'ativo' : 'inativo'}
                    </Badge>
                    {product.featured && <Badge tone="featured">destaque</Badge>}
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex justify-end gap-1.5">
                    <AdminButton variant="outline" onClick={() => onEdit(product.id)}>
                      Editar
                    </AdminButton>
                    <AdminButton variant="danger" onClick={() => handleDelete(product)}>
                      Excluir
                    </AdminButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && products.length === 0 && (
          <p className="px-4 py-8 text-center text-[13px] text-muted">
            Nenhum produto encontrado com esses filtros.
          </p>
        )}
        {loading && <p className="px-4 py-6 text-center text-[13px] text-muted">Carregando…</p>}
      </div>

      <p className="text-[11.5px] text-muted">
        {products.length} {products.length === 1 ? 'produto' : 'produtos'} nesta lista. Produtos
        inativos continuam no banco, mas não aparecem na loja.
      </p>
    </div>
  );
}
