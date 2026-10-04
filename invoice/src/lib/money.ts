export const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR', 'SGD', 'AED'] as const;

export function formatMoney(cents: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);
}

export function toCents(value: number | string) {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

export type LineInput = { description: string; quantity: number; unitPriceCents: number };
export type DiscountType = 'PERCENT' | 'AMOUNT';

export function computeTotals(input: {
  items: LineInput[];
  discountType: DiscountType;
  discountValue: number; // percent, or cents when AMOUNT
  taxRate: number; // percent
}) {
  const items = input.items.map((i) => ({ ...i, amountCents: Math.round(i.quantity * i.unitPriceCents) }));
  const subtotalCents = items.reduce((s, i) => s + i.amountCents, 0);
  const rawDiscount =
    input.discountType === 'PERCENT'
      ? Math.round((subtotalCents * input.discountValue) / 100)
      : Math.round(input.discountValue);
  const discountCents = Math.min(Math.max(rawDiscount, 0), subtotalCents);
  const taxCents = Math.round(((subtotalCents - discountCents) * input.taxRate) / 100);
  const totalCents = subtotalCents - discountCents + taxCents;
  return { items, subtotalCents, discountCents, taxCents, totalCents };
}

export function formatDate(d: Date | string | null | undefined) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}
