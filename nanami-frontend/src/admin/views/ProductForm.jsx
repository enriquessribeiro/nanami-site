import { useEffect, useState } from 'react';
import { api } from '../api';
import {
  Alert,
  AdminButton,
  Card,
  Checkbox,
  Field,
  Input,
  Select,
  Textarea,
} from '../ui';
import { centsToPriceInput, parsePriceToCents } from '../money';

const emptyProduct = {
  name: '',
  slug: '',
  categoryId: '',
  description: '',
  details: [],
  tags: [],
  colors: ['#FDE3EA', '#F7C3D0'],
  priceCents: 0,
  wholesaleCents: 0,
  minWholesale: 6,
  featured: false,
  active: true,
};

function toFormState(product) {
  if (!product) return emptyProduct;
  return {
    ...product,
    priceInput: centsToPriceInput(product.priceCents),
    wholesaleInput: centsToPriceInput(product.wholesaleCents),
    detailsText: (product.details ?? []).join('\n'),
    tagsText: (product.tags ?? []).join(', '),
  };
}

export function ProductForm({ productId, categories, onDone, onCancel }) {
  const [form, setForm] = useState(() =>
    productId ? null : toFormState(emptyProduct),
  );
  const [error, setError] = useState('');
  const [issues, setIssues] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState('');

  // Carrega a edição uma vez por id. O formulário guarda uma cópia local para
  // não escrever no objeto vindo da API.
  useEffect(() => {
    if (!productId) return undefined;

    let cancelled = false;
    api(`/admin/products/${productId}`)
      .then(({ product }) => {
        if (!cancelled) setForm(toFormState(product));
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError.message);
      });

    return () => {
      cancelled = true;
    };
  }, [productId]);

  const categoryOptions = categories;

  if (!form) {
    return error ? <Alert tone="error">{error}</Alert> : <p className="text-muted">Carregando…</p>;
  }

  const set = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setIssues((current) => ({ ...current, [field]: undefined }));
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const priceCents = parsePriceToCents(form.priceInput);
    const wholesaleCents = parsePriceToCents(form.wholesaleInput);

    const localIssues = {};
    if (priceCents === null) localIssues.priceInput = 'Informe o preço em reais (ex.: 89,90).';
    if (wholesaleCents === null) {
      localIssues.wholesaleInput = 'Informe o preço de atacado (ex.: 69,90).';
    }

    if (Object.keys(localIssues).length > 0) {
      setIssues(localIssues);
      return;
    }

    const payload = {
      name: form.name,
      slug: form.slug,
      categoryId: form.categoryId,
      description: form.description,
      // Uma linha por detalhe; vírgula separa tags. Texto puro, sem HTML.
      details: form.detailsText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      tags: form.tagsText
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      colors: form.colors,
      priceCents,
      wholesaleCents,
      minWholesale: Number(form.minWholesale) || 1,
      featured: form.featured,
      active: form.active,
    };

    setSaving(true);
    try {
      if (productId) {
        await api(`/admin/products/${productId}`, { method: 'PUT', body: payload });
      } else {
        await api('/admin/products', { method: 'POST', body: payload });
      }
      onDone();
    } catch (requestError) {
      setError(requestError.message);
      const map = {};
      for (const issue of requestError.issues ?? []) {
        // O backend fala em priceCents; o form mostra priceInput.
        const field = issue.field === 'priceCents' ? 'priceInput' : issue.field;
        const target = field === 'wholesaleCents' ? 'wholesaleInput' : field;
        map[target] = issue.message;
      }
      setIssues(map);
    } finally {
      setSaving(false);
    }
  }

  async function handleImageChange(event) {
    const file = event.target.files?.[0];
    event.target.value = ''; // permite escolher o mesmo arquivo de novo
    if (!file || !productId) return;

    setImageError('');
    setUploading(true);

    try {
      const body = new FormData();
      body.append('image', file);
      const { product } = await api(`/admin/products/${productId}/image`, { method: 'POST', body });
      setForm((current) => ({ ...current, image: product.image }));
    } catch (requestError) {
      setImageError(requestError.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleImageRemove() {
    if (!productId) return;
    setImageError('');
    setUploading(true);

    try {
      const { product } = await api(`/admin/products/${productId}/image`, { method: 'DELETE' });
      setForm((current) => ({ ...current, image: product.image }));
    } catch (requestError) {
      setImageError(requestError.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-[24px]">{productId ? 'Editar produto' : 'Novo produto'}</h1>
        <div className="flex gap-2">
          <AdminButton variant="outline" onClick={onCancel}>
            Voltar
          </AdminButton>
          <AdminButton type="submit" disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar'}
          </AdminButton>
        </div>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-4">
          <Card title="Informações">
            <div className="grid gap-3">
              <Field label="Nome" htmlFor="product-name" error={issues.name}>
                <Input
                  id="product-name"
                  value={form.name}
                  onChange={(event) => set('name', event.target.value)}
                  required
                  maxLength={120}
                  invalid={Boolean(issues.name)}
                />
              </Field>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Categoria" htmlFor="product-category" error={issues.categoryId}>
                  <Select
                    id="product-category"
                    value={form.categoryId}
                    onChange={(event) => set('categoryId', event.target.value)}
                    required
                    invalid={Boolean(issues.categoryId)}
                  >
                    <option value="">Selecione…</option>
                    {categoryOptions.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field
                  label="Slug (URL)"
                  htmlFor="product-slug"
                  hint="Deixe vazio para gerar a partir do nome."
                  error={issues.slug}
                >
                  <Input
                    id="product-slug"
                    value={form.slug}
                    onChange={(event) => set('slug', event.target.value)}
                    placeholder="laco-cetim-rosa"
                    maxLength={80}
                    invalid={Boolean(issues.slug)}
                  />
                </Field>
              </div>

              <Field label="Descrição" htmlFor="product-description" error={issues.description}>
                <Textarea
                  id="product-description"
                  value={form.description}
                  onChange={(event) => set('description', event.target.value)}
                  maxLength={2000}
                  invalid={Boolean(issues.description)}
                />
              </Field>

              <Field
                label="Detalhes"
                htmlFor="product-details"
                hint="Um item por linha. Aparece na ficha do produto."
              >
                <Textarea
                  id="product-details"
                  value={form.detailsText}
                  onChange={(event) => set('detailsText', event.target.value)}
                  rows={4}
                />
              </Field>

              <Field
                label="Tags"
                htmlFor="product-tags"
                hint="Separe por vírgula. Ex.: novo, fofo, mais vendido."
              >
                <Input
                  id="product-tags"
                  value={form.tagsText}
                  onChange={(event) => set('tagsText', event.target.value)}
                  placeholder="novo, fofo"
                />
              </Field>
            </div>
          </Card>

          <Card title="Preços">
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Varejo (R$)" htmlFor="product-price" error={issues.priceInput}>
                <Input
                  id="product-price"
                  inputMode="decimal"
                  value={form.priceInput}
                  onChange={(event) => set('priceInput', event.target.value)}
                  placeholder="89,90"
                  required
                  invalid={Boolean(issues.priceInput)}
                />
              </Field>

              <Field label="Atacado (R$)" htmlFor="product-wholesale" error={issues.wholesaleInput}>
                <Input
                  id="product-wholesale"
                  inputMode="decimal"
                  value={form.wholesaleInput}
                  onChange={(event) => set('wholesaleInput', event.target.value)}
                  placeholder="69,90"
                  required
                  invalid={Boolean(issues.wholesaleInput)}
                />
              </Field>

              <Field label="Mínimo atacado" htmlFor="product-min" error={issues.minWholesale}>
                <Input
                  id="product-min"
                  type="number"
                  min={1}
                  max={999}
                  value={form.minWholesale}
                  onChange={(event) => set('minWholesale', event.target.value)}
                  invalid={Boolean(issues.minWholesale)}
                />
              </Field>
            </div>
            <p className="mt-2 text-[11.5px] text-muted">
              Valores são convertidos para centavos na API — nada de ponto flutuante no banco.
            </p>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card title="Foto do produto">
            <div className="flex flex-col gap-3">
              {form.image ? (
                <img
                  src={`/api/media/${form.image}`}
                  alt={`Foto de ${form.name || 'produto'}`}
                  className="aspect-square w-full rounded-xl border-2 border-line object-cover"
                />
              ) : (
                <div
                  className="grid aspect-square w-full place-items-center rounded-xl border-2 border-dashed border-line text-center text-[12px] text-muted"
                  style={{
                    backgroundImage: `linear-gradient(150deg, ${form.colors[0]}, ${form.colors[1]})`,
                  }}
                >
                  <span className="rounded-full bg-surface/80 px-3 py-1">
                    Sem foto — o site usa a ilustração
                  </span>
                </div>
              )}

              {productId ? (
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-pessego/60 px-4 py-2 font-display text-[14px] font-medium text-cacau transition hover:bg-pessego">
                    {uploading ? 'Enviando…' : form.image ? 'Trocar foto' : 'Enviar foto'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={handleImageChange}
                      disabled={uploading}
                    />
                  </label>

                  {form.image && (
                    <AdminButton variant="danger" onClick={handleImageRemove} disabled={uploading}>
                      Remover
                    </AdminButton>
                  )}
                </div>
              ) : (
                <p className="text-[11.5px] text-muted">
                  Salve o produto primeiro para poder enviar a foto.
                </p>
              )}

              <p className="text-[11.5px] text-muted">
                JPEG, PNG ou WebP até 5 MB. A imagem é reconvertida para WebP (máx. 1600px) e os
                metadados são descartados.
              </p>

              {imageError && <Alert tone="error">{imageError}</Alert>}
            </div>
          </Card>

          <Card title="Vitrine">
            <div className="grid gap-2.5">
              <Checkbox
                label="Ativo na loja"
                description="Desmarcado, o produto some do site sem perder os dados."
                checked={form.active}
                onChange={(event) => set('active', event.target.checked)}
              />
              <Checkbox
                label="Destaque na home"
                description="Aparece em “Novidades e favoritos”."
                checked={form.featured}
                onChange={(event) => set('featured', event.target.checked)}
              />
            </div>
          </Card>

          <Card title="Cores do card">
            <p className="mb-3 text-[11.5px] text-muted">
              Gradiente usado quando o produto ainda não tem foto.
            </p>
            <div className="grid gap-3">
              {[0, 1].map((index) => (
                <Field key={index} label={index === 0 ? 'Início' : 'Fim'} htmlFor={`color-${index}`}>
                  <div className="flex items-center gap-2">
                    <input
                      id={`color-${index}`}
                      type="color"
                      className="size-10 shrink-0 rounded-lg border-2 border-line bg-surface p-1"
                      value={form.colors[index]}
                      onChange={(event) => {
                        const next = [...form.colors];
                        next[index] = event.target.value.toUpperCase();
                        set('colors', next);
                      }}
                    />
                    <Input
                      value={form.colors[index]}
                      onChange={(event) => {
                        const next = [...form.colors];
                        next[index] = event.target.value;
                        set('colors', next);
                      }}
                      maxLength={7}
                      className="font-mono text-[12.5px]"
                    />
                  </div>
                </Field>
              ))}
            </div>
            <div
              className="mt-3 h-16 rounded-xl ring-1 ring-line ring-inset"
              style={{
                backgroundImage: `linear-gradient(150deg, ${form.colors[0]}, ${form.colors[1]})`,
              }}
              aria-hidden="true"
            />
          </Card>
        </div>
      </div>
    </form>
  );
}
