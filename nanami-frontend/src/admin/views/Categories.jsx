import { useEffect, useState } from 'react';
import { api } from '../api';
import { Alert, AdminButton, Badge, Card, Field, Input, Select } from '../ui';

const TONES = [
  { value: 'rosa', label: 'Rosa' },
  { value: 'creme', label: 'Creme' },
  { value: 'azul', label: 'Azul' },
  { value: 'verde', label: 'Verde' },
  { value: 'laranja', label: 'Laranja' },
  { value: 'lilas', label: 'Lilás' },
  { value: 'amarelo', label: 'Amarelo' },
];

const emptyForm = { id: '', name: '', emoji: '', tone: 'rosa' };

export function Categories({ categories, onChanged }) {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!success) return undefined;
    const timer = window.setTimeout(() => setSuccess(''), 2500);
    return () => window.clearTimeout(timer);
  }, [success]);

  function reset() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEdit(category) {
    setEditingId(category.id);
    setForm({ id: category.id, name: category.name, emoji: category.emoji, tone: category.tone });
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (editingId) {
        await api(`/admin/categories/${editingId}`, {
          method: 'PUT',
          body: { name: form.name, emoji: form.emoji, tone: form.tone },
        });
        setSuccess('Categoria atualizada.');
      } else {
        await api('/admin/categories', {
          method: 'POST',
          body: { ...form, id: form.id || undefined },
        });
        setSuccess('Categoria criada.');
      }

      reset();
      onChanged();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category) {
    const confirmed = window.confirm(
      category.productCount > 0
        ? `"${category.name}" tem ${category.productCount} produto(s). Mova-os antes de excluir.`
        : `Excluir a categoria "${category.name}"?`,
    );
    if (!confirmed || category.productCount > 0) return;

    try {
      await api(`/admin/categories/${category.id}`, { method: 'DELETE' });
      setSuccess('Categoria excluída.');
      if (editingId === category.id) reset();
      onChanged();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr] lg:items-start">
      <Card title="Categorias" description="A ordem daqui é a ordem do menu na loja.">
        <ul className="flex flex-col divide-y divide-line">
          {categories.map((category) => (
            <li key={category.id} className="flex items-center gap-3 py-2.5">
              <span className="emoji grid size-9 shrink-0 place-items-center rounded-full bg-surface-soft text-lg ring-1 ring-line ring-inset">
                {category.emoji || '•'}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-extrabold text-ink">{category.name}</p>
                <p className="truncate text-[11.5px] text-muted">/{category.id}</p>
              </div>
              <Badge>{category.productCount} prod.</Badge>
              <AdminButton variant="outline" onClick={() => startEdit(category)}>
                Editar
              </AdminButton>
              <AdminButton variant="danger" onClick={() => handleDelete(category)}>
                Excluir
              </AdminButton>
            </li>
          ))}
        </ul>
      </Card>

      <Card title={editingId ? 'Editar categoria' : 'Nova categoria'}>
        <form onSubmit={handleSubmit} className="grid gap-3">
          <Field
            label="Nome"
            htmlFor="category-name"
            hint={editingId ? 'O identificador não muda depois de criado.' : undefined}
          >
            <Input
              id="category-name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
              maxLength={80}
            />
          </Field>

          {!editingId && (
            <Field
              label="Identificador (opcional)"
              htmlFor="category-id"
              hint="Slug usado em URLs e no banco. Gerado a partir do nome se vazio."
            >
              <Input
                id="category-id"
                value={form.id}
                onChange={(event) => setForm({ ...form, id: event.target.value })}
                placeholder="acessorios"
                maxLength={60}
              />
            </Field>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Emoji" htmlFor="category-emoji">
              <Input
                id="category-emoji"
                value={form.emoji}
                onChange={(event) => setForm({ ...form, emoji: event.target.value })}
                maxLength={8}
                placeholder="🎀"
              />
            </Field>

            <Field label="Tom da ilustração" htmlFor="category-tone">
              <Select
                id="category-tone"
                value={form.tone}
                onChange={(event) => setForm({ ...form, tone: event.target.value })}
              >
                {TONES.map((tone) => (
                  <option key={tone.value} value={tone.value}>
                    {tone.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          {error && <Alert tone="error">{error}</Alert>}
          {success && <Alert tone="success">{success}</Alert>}

          <div className="flex gap-2">
            <AdminButton type="submit" disabled={saving}>
              {saving ? 'Salvando…' : editingId ? 'Salvar alterações' : 'Criar categoria'}
            </AdminButton>
            {editingId && (
              <AdminButton variant="outline" onClick={reset}>
                Cancelar
              </AdminButton>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
