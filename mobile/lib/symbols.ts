import type { Market } from '@/lib/types';

export interface SymbolOption {
  market: Market;
  name: string;
  symbol: string;
}

const symbolUniverse = require('./symbol-universe.json') as SymbolOption[];

export function getSymbolMatches(query: string, market: Market, limit = 12) {
  const normalizedQuery = query.trim().toUpperCase();
  const candidates = symbolUniverse.filter((option) => option.market === market);

  if (!normalizedQuery) {
    return candidates.slice(0, limit);
  }

  const startsWithSymbol = [];
  const startsWithName = [];
  const contains = [];

  for (const option of candidates) {
    const symbol = option.symbol.toUpperCase();
    const name = option.name.toUpperCase();

    if (symbol.startsWith(normalizedQuery)) {
      startsWithSymbol.push(option);
      continue;
    }

    if (name.startsWith(normalizedQuery)) {
      startsWithName.push(option);
      continue;
    }

    if (symbol.includes(normalizedQuery) || name.includes(normalizedQuery)) {
      contains.push(option);
    }
  }

  return [...startsWithSymbol, ...startsWithName, ...contains].slice(0, limit);
}

export function getSymbolPlaceholder(market: Market) {
  switch (market) {
    case 'indian_equity':
      return 'Search NSE symbols';
    case 'indian_fo':
      return 'Search F&O underlyings';
    case 'us_equity':
      return 'Search US symbols';
    case 'commodity':
      return 'Search commodity symbols';
    case 'crypto':
      return 'Search crypto symbols';
  }
}
