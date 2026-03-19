import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const USER_AGENT = 'Mozilla/5.0';
const sourceDir = process.env.SYMBOL_SOURCES_DIR ?? '';

const sourceFiles = {
  nseEquity: {
    filename: 'EQUITY_L.csv',
    headers: {
      accept: 'text/csv,*/*',
      referer: 'https://www.nseindia.com/',
      'user-agent': USER_AGENT,
    },
    url: 'https://nsearchives.nseindia.com/content/equities/EQUITY_L.csv',
  },
  nseSme: {
    filename: 'SME_EQUITY_L.csv',
    headers: {
      accept: 'text/csv,*/*',
      referer: 'https://www.nseindia.com/',
      'user-agent': USER_AGENT,
    },
    url: 'https://nsearchives.nseindia.com/emerge/corporates/content/SME_EQUITY_L.csv',
  },
  nseEtf: {
    filename: 'eq_etfseclist.csv',
    headers: {
      accept: 'text/csv,*/*',
      referer: 'https://www.nseindia.com/',
      'user-agent': USER_AGENT,
    },
    url: 'https://nsearchives.nseindia.com/content/equities/eq_etfseclist.csv',
  },
  nseFo: {
    filename: 'nse_fo_underlyings.html',
    headers: {
      accept: 'text/html,*/*',
      referer: 'https://www.nseindia.com/',
      'user-agent': USER_AGENT,
    },
    url: 'https://www.nseindia.com/static/products-services/equity-derivatives-list-underlyings-information',
  },
  nasdaqListed: {
    filename: 'nasdaqlisted.txt',
    headers: {
      'user-agent': USER_AGENT,
    },
    url: 'https://www.nasdaqtrader.com/dynamic/SymDir/nasdaqlisted.txt',
  },
  nasdaqOther: {
    filename: 'otherlisted.txt',
    headers: {
      'user-agent': USER_AGENT,
    },
    url: 'https://www.nasdaqtrader.com/dynamic/SymDir/otherlisted.txt',
  },
};

const outputPath = path.resolve('lib', 'symbol-universe.json');

async function main() {
  const rawSources = Object.fromEntries(
    await Promise.all(
      Object.entries(sourceFiles).map(async ([key, source]) => [key, await getSourceContent(source)])
    )
  );

  const universe = buildUniverse(rawSources);
  await fs.writeFile(outputPath, JSON.stringify(universe, null, 2));
  console.log(`Wrote ${universe.length} symbols to ${outputPath}`);
}

async function getSourceContent(source) {
  if (sourceDir) {
    const filePath = path.join(sourceDir, source.filename);
    try {
      return await fs.readFile(filePath, 'utf8');
    } catch {
      // Fall through to network fetch when the local cache does not exist.
    }
  }

  const response = await fetch(source.url, { headers: source.headers });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${source.url}: ${response.status}`);
  }
  return await response.text();
}

function buildUniverse(rawSources) {
  const rows = [
    ...parseCsvRows(rawSources.nseEquity)
      .filter((row) => row.SYMBOL)
      .map((row) => ({
        market: 'indian_equity',
        name: row['NAME OF COMPANY'],
        symbol: row.SYMBOL,
      })),
    ...parseCsvRows(rawSources.nseSme)
      .filter((row) => row.SYMBOL)
      .map((row) => ({
        market: 'indian_equity',
        name: row.NAME_OF_COMPANY,
        symbol: row.SYMBOL,
      })),
    ...parseCsvRows(rawSources.nseEtf)
      .filter((row) => row.Symbol)
      .map((row) => ({
        market: 'indian_equity',
        name: row.SecurityName || row.Underlying || row.Symbol,
        symbol: row.Symbol,
      })),
    ...parseFoHtml(rawSources.nseFo).map((row) => ({
      market: 'indian_fo',
      name: row.name,
      symbol: row.symbol,
    })),
    ...parsePipeRows(rawSources.nasdaqListed)
      .filter((row) => row.Symbol && row['Test Issue'] === 'N')
      .map((row) => ({
        market: 'us_equity',
        name: row['Security Name'],
        symbol: row.Symbol,
      })),
    ...parsePipeRows(rawSources.nasdaqOther)
      .filter((row) => row['ACT Symbol'] && row['Test Issue'] === 'N')
      .map((row) => ({
        market: 'us_equity',
        name: row['Security Name'],
        symbol: row['ACT Symbol'],
      })),
  ];

  const deduped = new Map();
  for (const row of rows) {
    const symbol = row.symbol?.trim().toUpperCase();
    const name = decodeHtml(row.name?.trim() || symbol);
    const market = row.market;

    if (!symbol) continue;

    const key = `${market}:${symbol}`;
    if (!deduped.has(key)) {
      deduped.set(key, { market, name, symbol });
    }
  }

  return Array.from(deduped.values()).sort((left, right) => {
    if (left.market !== right.market) {
      return left.market.localeCompare(right.market);
    }
    return left.symbol.localeCompare(right.symbol);
  });
}

function parseCsvRows(text) {
  const lines = text.replace(/^\uFEFF/, '').trim().split(/\r?\n/);
  const headers = parseDelimitedLine(lines.shift() ?? '', ',');

  return lines
    .map((line) => parseDelimitedLine(line, ','))
    .filter((row) => row.length > 1)
    .map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])));
}

function parsePipeRows(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = (lines.shift() ?? '').split('|');

  return lines
    .filter((line) => line && !line.startsWith('File Creation Time'))
    .map((line) => line.split('|'))
    .filter((values) => values.length >= headers.length - 1)
    .map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])));
}

function parseFoHtml(text) {
  const matches = text.matchAll(/\/get-quotes\/derivatives\?symbol=([^"#]+)#info-underlyingQuote"[^>]*>([^<]+)<\/a>/g);
  const rows = [];

  for (const match of matches) {
    rows.push({
      name: decodeHtml(match[2]),
      symbol: decodeURIComponent(match[1]).trim().toUpperCase(),
    });
  }

  return rows;
}

function parseDelimitedLine(line, delimiter) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      const nextChar = line[index + 1];
      if (inQuotes && nextChar === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === delimiter && !inQuotes) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function decodeHtml(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&#039;', "'")
    .replaceAll('&quot;', '"')
    .replaceAll('&nbsp;', ' ');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
