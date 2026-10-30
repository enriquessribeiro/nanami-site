import { useEffect, useState } from 'react';
import { api } from '../api';
import { Alert, AdminButton, Card, Field, Input } from '../ui';

/** Editor de horários: linhas de "dias" + "horário". */
function HoursEditor({ hours, onChange }) {
  const update = (index, field, value) => {
    const next = hours.map((entry, position) =>
      position === index ? { ...entry, [field]: value } : entry,
    );
    onChange(next);
  };

  return (
    <div className="grid gap-2">
      {hours.map((entry, index) => (
        <div key={index} className="flex gap-2">
          <Input
            aria-label={`Dias do horário ${index + 1}`}
            value={entry.days}
            onChange={(event) => update(index, 'days', event.target.value)}
            placeholder="Segunda a sexta"
          />
          <Input
            aria-label={`Horário ${index + 1}`}
            value={entry.time}
            onChange={(event) => update(index, 'time', event.target.value)}
            placeholder="9h às 18h"
            className="max-w-[160px]"
          />
          <AdminButton
            variant="danger"
            aria-label={`Remover horário ${index + 1}`}
            onClick={() => onChange(hours.filter((_, position) => position !== index))}
          >
            ×
          </AdminButton>
        </div>
      ))}

      <AdminButton
        variant="soft"
        className="mt-1 self-start"
        onClick={() => onChange([...hours, { days: '', time: '' }])}
      >
        + Adicionar horário
      </AdminButton>
    </div>
  );
}

export function Settings() {
  const [settings, setSettings] = useState(null);
  const [paymentsText, setPaymentsText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [issues, setIssues] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api('/admin/settings')
      .then(({ settings: loaded }) => {
        setSettings(loaded);
        setPaymentsText(loaded.payments.join(', '));
      })
      .catch((requestError) => setError(requestError.message));
  }, []);

  useEffect(() => {
    if (!success) return undefined;
    const timer = window.setTimeout(() => setSuccess(''), 2500);
    return () => window.clearTimeout(timer);
  }, [success]);

  if (!settings) {
    return error ? <Alert tone="error">{error}</Alert> : <p className="text-muted">Carregando…</p>;
  }

  const set = (field, value) => {
    setSettings((current) => ({ ...current, [field]: value }));
    setIssues((current) => ({ ...current, [field]: undefined }));
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    const payload = {
      name: settings.name,
      tagline: settings.tagline,
      whatsapp: settings.whatsapp,
      whatsappLabel: settings.whatsappLabel,
      instagram: settings.instagram,
      instagramUrl: settings.instagramUrl,
      email: settings.email,
      address: settings.address,
      city: settings.city,
      hours: settings.hours.filter((entry) => entry.days.trim() && entry.time.trim()),
      payments: paymentsText
        .split(',')
        .map((payment) => payment.trim())
        .filter(Boolean),
      wholesaleMin: Number(settings.wholesaleMin) || 1,
      freeShippingNote: settings.freeShippingNote,
    };

    try {
      const { settings: saved } = await api('/admin/settings', { method: 'PUT', body: payload });
      setSettings(saved);
      setPaymentsText(saved.payments.join(', '));
      setSuccess('Configurações salvas.');
    } catch (requestError) {
      setError(requestError.message);
      const map = {};
      for (const issue of requestError.issues ?? []) map[issue.field] = issue.message;
      setIssues(map);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-[24px]">Loja</h1>
          <p className="text-[12.5px] text-muted">
            Esses dados alimentam o rodapé, a página “Onde estamos” e o link do WhatsApp.
          </p>
        </div>
        <AdminButton type="submit" disabled={saving}>
          {saving ? 'Salvando…' : 'Salvar'}
        </AdminButton>
      </div>

      {error && <Alert tone="error">{error}</Alert>}
      {success && <Alert tone="success">{success}</Alert>}

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <Card title="Identidade">
          <div className="grid gap-3">
            <Field label="Nome da loja" htmlFor="settings-name" error={issues.name}>
              <Input
                id="settings-name"
                value={settings.name}
                onChange={(event) => set('name', event.target.value)}
                required
              />
            </Field>
            <Field label="Assinatura" htmlFor="settings-tagline" error={issues.tagline}>
              <Input
                id="settings-tagline"
                value={settings.tagline}
                onChange={(event) => set('tagline', event.target.value)}
                required
              />
            </Field>
            <Field label="Email de contato" htmlFor="settings-email" error={issues.email}>
              <Input
                id="settings-email"
                type="email"
                value={settings.email}
                onChange={(event) => set('email', event.target.value)}
                required
              />
            </Field>
            <Field
              label="Mínimo de atacado (peças)"
              htmlFor="settings-min"
              error={issues.wholesaleMin}
            >
              <Input
                id="settings-min"
                type="number"
                min={1}
                max={999}
                value={settings.wholesaleMin}
                onChange={(event) => set('wholesaleMin', event.target.value)}
              />
            </Field>
          </div>
        </Card>

        <Card title="Contato">
          <div className="grid gap-3">
            <Field
              label="WhatsApp (só dígitos, com DDI)"
              htmlFor="settings-whatsapp"
              hint="Ex.: 5511999999999"
              error={issues.whatsapp}
            >
              <Input
                id="settings-whatsapp"
                inputMode="numeric"
                value={settings.whatsapp}
                onChange={(event) => set('whatsapp', event.target.value)}
                required
              />
            </Field>
            <Field
              label="WhatsApp exibido"
              htmlFor="settings-whatsapp-label"
              error={issues.whatsappLabel}
            >
              <Input
                id="settings-whatsapp-label"
                value={settings.whatsappLabel}
                onChange={(event) => set('whatsappLabel', event.target.value)}
                required
              />
            </Field>
            <Field label="Instagram (arroba)" htmlFor="settings-instagram" error={issues.instagram}>
              <Input
                id="settings-instagram"
                value={settings.instagram}
                onChange={(event) => set('instagram', event.target.value)}
                required
              />
            </Field>
            <Field
              label="Link do Instagram"
              htmlFor="settings-instagram-url"
              error={issues.instagramUrl}
            >
              <Input
                id="settings-instagram-url"
                type="url"
                value={settings.instagramUrl}
                onChange={(event) => set('instagramUrl', event.target.value)}
                required
              />
            </Field>
          </div>
        </Card>

        <Card title="Endereço e horários">
          <div className="grid gap-3">
            <Field label="Endereço" htmlFor="settings-address" error={issues.address}>
              <Input
                id="settings-address"
                value={settings.address}
                onChange={(event) => set('address', event.target.value)}
                required
              />
            </Field>
            <Field label="Cidade / UF" htmlFor="settings-city" error={issues.city}>
              <Input
                id="settings-city"
                value={settings.city}
                onChange={(event) => set('city', event.target.value)}
                required
              />
            </Field>
            <Field label="Horários">
              <HoursEditor hours={settings.hours} onChange={(value) => set('hours', value)} />
            </Field>
          </div>
        </Card>

        <Card title="Pagamento e envio">
          <div className="grid gap-3">
            <Field
              label="Formas de pagamento"
              htmlFor="settings-payments"
              hint="Separe por vírgula. Ex.: Pix, Crédito, Débito, Dinheiro."
            >
              <Input
                id="settings-payments"
                value={paymentsText}
                onChange={(event) => setPaymentsText(event.target.value)}
              />
            </Field>
            <Field
              label="Nota de envio"
              htmlFor="settings-shipping"
              error={issues.freeShippingNote}
            >
              <Input
                id="settings-shipping"
                value={settings.freeShippingNote}
                onChange={(event) => set('freeShippingNote', event.target.value)}
              />
            </Field>
          </div>
        </Card>
      </div>
    </form>
  );
}
