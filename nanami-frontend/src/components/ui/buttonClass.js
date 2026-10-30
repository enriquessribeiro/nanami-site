import { cx } from './cx';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full border-0 font-display font-medium leading-tight text-center transition duration-150 active:translate-y-px active:scale-[0.99]';

const sizes = {
  md: 'min-h-12 px-[26px] py-3 text-[17px]',
  sm: 'min-h-10 px-4 py-[9px] text-[15px]',
};

const variants = {
  primary: 'bg-acao text-white hover:brightness-95',
  alt: 'bg-cacau text-creme hover:brightness-95',
  ghost:
    'bg-transparent text-ink ring-2 ring-cacau ring-inset hover:bg-cacau/8 dark:ring-line dark:hover:bg-creme/8',
  // Para fundos escuros: as cores ficam definidas aqui, e não por override no
  // className, porque utilitários conflitantes dependem da ordem do CSS.
  ghostLight:
    'bg-transparent text-creme ring-2 ring-creme/55 ring-inset hover:bg-creme/12',
};

/**
 * Gera as classes de botão. Fica separado do componente para reaproveitar em
 * links (`<a className={buttonClass()} />`) sem duplicar a lista de utilitários.
 */
export function buttonClass({ variant = 'primary', size = 'md', block = false, className } = {}) {
  return cx(base, sizes[size], variants[variant], block && 'w-full', className);
}
