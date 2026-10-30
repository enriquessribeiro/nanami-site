import { useStore } from '../context/store';
import { PawIcon } from './Icons';

export function Toast() {
  const { toast, setCartOpen, cartOpen } = useStore();
  if (!toast || cartOpen) return null;

  return (
    <div
      className="fixed bottom-4 left-1/2 z-[200] flex w-[calc(100%-32px)] -translate-x-1/2 animate-rise items-center gap-2.5 rounded-full bg-cacau px-4 py-[11px] text-creme shadow-[0_18px_40px_-18px_rgba(0,0,0,0.65)] sm:bottom-[26px] sm:w-auto"
      role="status"
      key={toast.id}
    >
      <span
        className="grid size-[30px] shrink-0 place-items-center rounded-full bg-estrela text-cacau"
        aria-hidden="true"
      >
        <PawIcon width={18} height={18} />
      </span>
      <span className="text-[12.5px] leading-snug font-bold">{toast.message}</span>
      {toast.action === 'cart' && (
        <button
          type="button"
          className="shrink-0 border-0 bg-transparent p-0 text-xs font-extrabold text-estrela underline underline-offset-2"
          onClick={() => {
            setCartOpen(true);
          }}
        >
          Ver carrinho
        </button>
      )}
    </div>
  );
}
