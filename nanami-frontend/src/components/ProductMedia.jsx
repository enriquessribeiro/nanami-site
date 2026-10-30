import { ProductArt } from './ProductArt';
import { cx } from './ui/cx';

/**
 * Mídia do produto: foto enviada pelo admin quando existe, senão a ilustração
 * SVG gerada a partir da categoria. Manter isso num componente evita repetir a
 * mesma condição em card, galeria, carrinho e destaques da home.
 */
export function ProductMedia({
  product,
  artClassName = '',
  imageClassName = 'size-full object-cover',
  className,
  ...imageProps
}) {
  if (product.image) {
    return (
      <img
        src={`/api/media/${product.image}`}
        alt={product.name}
        loading="lazy"
        decoding="async"
        className={cx(imageClassName, className)}
        {...imageProps}
      />
    );
  }

  return (
    <ProductArt
      category={product.category}
      variant={product.id}
      colors={product.colors}
      className={cx(artClassName, className)}
    />
  );
}
