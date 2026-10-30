import { cx } from './cx';

const tones = {
  pessego: 'bg-pessego text-ink',
  estrela: 'bg-estrela text-cacau',
  rosa: 'bg-rosa text-cacau',
  creme: 'bg-creme text-cacau ring-1 ring-cacau/20 ring-inset',
};

export function Tag({ tone = 'pessego', className, children, ...props }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-full px-[11px] py-1 font-display text-xs leading-tight whitespace-nowrap',
        tones[tone] ?? tones.pessego,
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
