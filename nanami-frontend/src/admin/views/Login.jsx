import { useState } from 'react';
import { api } from '../api';
import { Alert, AdminButton, Field, Input } from '../ui';

export function Login({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSending(true);

    try {
      const { email: adminEmail } = await api('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      onSuccess({ email: adminEmail });
    } catch (requestError) {
      // Mensagem do servidor é genérica de propósito; não diferenciamos
      // "email não existe" de "senha errada" nem aqui.
      setError(requestError.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-[400px]">
        <div className="mb-6 text-center">
          <p className="font-display text-[26px] tracking-[0.14em] text-ink">NANAMI</p>
          <p className="text-[10px] font-extrabold tracking-[0.32em] text-muted uppercase">
            Painel da loja
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-3xl border-2 border-line bg-surface p-6 shadow-soft"
        >
          <h1 className="font-display text-[22px]">Entrar</h1>

          <Field label="Email" htmlFor="login-email">
            <Input
              id="login-email"
              type="email"
              name="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Field>

          <Field label="Senha" htmlFor="login-password">
            <Input
              id="login-password"
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Field>

          {error && <Alert tone="error">{error}</Alert>}

          <AdminButton type="submit" disabled={sending} className="mt-1">
            {sending ? 'Entrando…' : 'Entrar'}
          </AdminButton>
        </form>

        <p className="mt-4 text-center text-[11.5px] text-muted">
          Acesso restrito. Sessão de 12 horas, renovada a cada uso.
        </p>
      </div>
    </div>
  );
}
