import { buttonClass } from './buttonClass';

export function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  className,
  type = 'button',
  ...props
}) {
  return <button type={type} className={buttonClass({ variant, size, block, className })} {...props} />;
}
