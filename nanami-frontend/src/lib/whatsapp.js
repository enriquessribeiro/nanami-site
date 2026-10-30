import { formatPrice } from './format';

/**
 * Links de WhatsApp montados a partir das configurações vindas da API — o
 * número não fica embutido no bundle, então trocar no painel já vale no site.
 */
export function cartWhatsappLink(cart, mode, store) {
  const unitOf = (item) => (mode === 'atacado' ? item.wholesaleCents : item.priceCents);

  const lines = cart.map((item) => {
    const total = unitOf(item) * item.qty;
    return `• ${item.qty}x ${item.name} — ${formatPrice(unitOf(item))} un. = ${formatPrice(total)}`;
  });

  const total = cart.reduce((sum, item) => sum + unitOf(item) * item.qty, 0);

  const message = [
    'Olá, Nanami! Vim pelo site e quero fazer um pedido:',
    '',
    ...lines,
    '',
    `Modo: ${mode === 'atacado' ? 'Atacado' : 'Varejo'}`,
    `Total estimado: ${formatPrice(total)}`,
    '',
    'Pode me ajudar a finalizar?',
  ].join('\n');

  return `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function whatsappLink(
  store,
  message = 'Olá, Nanami! Vim pelo site e quero saber mais sobre os produtos.',
) {
  return `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(message)}`;
}
