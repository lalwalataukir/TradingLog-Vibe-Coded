export function formatCurrency(value: number, currency: 'INR' | 'USD' = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    currency,
    currencyDisplay: 'symbol',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value);
}

export function formatCompactCurrency(value: number, currency: 'INR' | 'USD' = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    currency,
    currencyDisplay: 'symbol',
    maximumFractionDigits: 1,
    notation: 'compact',
    style: 'currency',
  }).format(value);
}

export function formatPercentage(value: number) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}
