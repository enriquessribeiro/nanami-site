export const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

/**
 * Preços circulam como centavos inteiros da API até aqui, e só viram string
 * formatada na hora de exibir. Nenhum float de dinheiro no meio do caminho.
 */
export function formatPrice(cents) {
  return brl.format((Number(cents) || 0) / 100);
}

export function unitLabel(mode) {
  return mode === 'atacado' ? 'un. no atacado' : 'unidade';
}
