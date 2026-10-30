import { cx } from '../components/ui/cx';

/* Peças de formulário do painel. São pequenas e explícitas: cada uma resolve
   um detalhe de acessibilidade (label ligada ao campo, mensagem de erro) que se
   repetiria em todas as telas. */

const control =
  'w-full rounded-xl border-2 border-line bg-surface px-3 py-2 text-[14px] text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-acao disabled:opacity-60';

export function Field({ label, hint, error, children, className, htmlFor }) {
  return (
    <div className={cx('flex flex-col gap-1', className)}>
      {label && (
        <label htmlFor={htmlFor} className="text-[12.5px] font-extrabold text-ink">
          {label}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-[11.5px] text-muted">{hint}</p>}
      {error && (
        <p className="text-[11.5px] font-bold text-acao" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({ className, invalid, ...props }) {
  return <input className={cx(control, invalid && 'border-acao', className)} {...props} />;
}

export function Textarea({ className, invalid, ...props }) {
  return (
    <textarea
      className={cx(control, 'min-h-24 resize-y leading-relaxed', invalid && 'border-acao', className)}
      {...props}
    />
  );
}

export function Select({ className, invalid, children, ...props }) {
  return (
    <select className={cx(control, invalid && 'border-acao', className)} {...props}>
      {children}
    </select>
  );
}

export function Checkbox({ label, description, className, ...props }) {
  return (
    <label
      className={cx(
        'flex cursor-pointer items-start gap-2.5 rounded-xl border-2 border-line bg-surface px-3 py-2.5',
        className,
      )}
    >
      <input type="checkbox" className="mt-0.5 size-4 accent-[#e8607f]" {...props} />
      <span>
        <span className="block text-[13px] font-extrabold text-ink">{label}</span>
        {description && <span className="block text-[11.5px] text-muted">{description}</span>}
      </span>
    </label>
  );
}

const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-full border-0 px-4 py-2 font-display text-[14px] font-medium leading-tight transition disabled:cursor-not-allowed disabled:opacity-60';

const buttonVariants = {
  primary: 'bg-acao text-white hover:brightness-95',
  soft: 'bg-pessego/60 text-cacau hover:bg-pessego',
  outline: 'bg-transparent text-ink ring-2 ring-line ring-inset hover:ring-cacau/40',
  danger: 'bg-transparent text-acao ring-2 ring-acao/40 ring-inset hover:bg-acao/10',
};

export function AdminButton({ variant = 'primary', className, type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={cx(buttonBase, buttonVariants[variant], className)}
      {...props}
    />
  );
}

export function Card({ title, description, actions, children, className }) {
  return (
    <section className={cx('rounded-2xl border-2 border-line bg-surface', className)}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
          <div>
            {title && <h2 className="font-display text-[17px] text-ink">{title}</h2>}
            {description && <p className="text-[12.5px] text-muted">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function Badge({ tone = 'neutral', children }) {
  const tones = {
    neutral: 'bg-surface-soft text-muted ring-1 ring-line ring-inset',
    on: 'bg-[#dff3e4] text-[#22633a]',
    off: 'bg-[#f6e3e7] text-[#8d2f44]',
    featured: 'bg-estrela/40 text-cacau',
  };

  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full px-2 py-[2px] text-[11px] font-extrabold whitespace-nowrap',
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function Alert({ tone = 'error', children, className }) {
  const tones = {
    error: 'border-acao/40 bg-acao/8 text-[#8d2f44]',
    success: 'border-[#8bbd9b] bg-[#eaf6ee] text-[#22633a]',
    info: 'border-line bg-surface-soft text-muted',
  };

  return (
    <div
      className={cx('rounded-xl border-2 px-3 py-2 text-[13px]', tones[tone], className)}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      {children}
    </div>
  );
}
