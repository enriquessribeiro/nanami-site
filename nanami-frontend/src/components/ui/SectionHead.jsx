import { cx } from './cx';

export function SectionHead({ eyebrow, title, description, action, className, children }) {
  return (
    <div
      className={cx(
        'mb-[22px] flex flex-col items-start gap-3 md:mb-[30px] md:flex-row md:items-end md:justify-between md:gap-6',
        className,
      )}
    >
      <div>
        {eyebrow}
        {title && (
          <h2 className="mt-2 font-display text-[26px] leading-tight text-ink md:text-[clamp(28px,3.2vw,38px)]">
            {title}
          </h2>
        )}
        {description && (
          <p className="mt-2 max-w-[54ch] text-[15.5px] text-muted">{description}</p>
        )}
        {children}
      </div>
      {action}
    </div>
  );
}
