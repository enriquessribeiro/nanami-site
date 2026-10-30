/**
 * Fundo em gradiente usado nas mídias de produto (cards, galeria, carrinho e
 * destaques da home). As cores vêm do catálogo, então ficam como estilo
 * inline — não há como o Tailwind gerar uma classe para valor dinâmico.
 */
export function mediaGradient(colors = ['#fff6ec', '#f5a3b5']) {
  return { backgroundImage: `linear-gradient(150deg, ${colors[0]}, ${colors[1]})` };
}
