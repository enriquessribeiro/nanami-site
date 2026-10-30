/** "89,90" ⇄ 8990. Aceita ponto ou vírgula e no máximo 2 casas. */
export function parsePriceToCents(value) {
  const clean = String(value ?? '').trim();
  if (!clean) return null;

  const normalized = clean.replace(/\./g, '').replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;

  return Math.round(Number(normalized) * 100);
}

export function centsToPriceInput(cents) {
  if (!Number.isInteger(cents)) return '';
  return (cents / 100).toFixed(2).replace('.', ',');
}
