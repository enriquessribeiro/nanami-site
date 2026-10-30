import { cx } from './cx';

export function Eyebrow({ as: Tag = 'span', tone = 'acao', className, children, ...props }) {
  return (
    <Tag
      className={cx(
        'inline-flex items-center gap-[7px] font-body text-xs leading-snug font-extrabold tracking-[0.14em] uppercase',
        tone === 'estrela' ? 'text-estrela' : 'text-acao',
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
