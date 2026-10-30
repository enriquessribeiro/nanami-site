import { cx } from './cx';

export function Container({ as: Tag = 'div', className, ...props }) {
  return (
    <Tag
      className={cx(
        'mx-auto w-[min(1180px,calc(100%-32px))] sm:w-[min(1180px,calc(100%-36px))] md:w-[min(1180px,calc(100%-48px))]',
        className,
      )}
      {...props}
    />
  );
}
