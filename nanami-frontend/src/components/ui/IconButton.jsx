import { cx } from './cx';

export function IconButton({ className, type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={cx(
        'grid size-11 shrink-0 place-items-center rounded-full border-2 border-line bg-surface text-ink transition-colors hover:border-acao hover:text-acao',
        className,
      )}
      {...props}
    />
  );
}
