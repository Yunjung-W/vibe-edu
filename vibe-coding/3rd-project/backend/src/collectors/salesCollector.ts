import axios from 'axios';
import * as cheerio from 'cheerio';
import { SalesRecord } from '../types';
import { readFallback } from '../storage/jsonStore';
import { withRetry } from '../utils/retry';
import logger from '../utils/logger';

const WIKIPEDIA_URL =
  'https://en.wikipedia.org/wiki/List_of_manufacturers_by_motor_vehicle_production';

async function scrapeWikipedia(): Promise<SalesRecord[]> {
  const { data: html } = await axios.get(WIKIPEDIA_URL, {
    timeout: 10000,
    headers: { 'User-Agent': 'AutoDashboard/1.0 (educational project)' },
  });
  const $ = cheerio.load(html);
  const records: SalesRecord[] = [];

  // Parse the production table - best-effort scraping
  $('table.wikitable').first().find('tr').each((i, row) => {
    if (i === 0) return; // skip header
    const cells = $(row).find('td');
    if (cells.length < 3) return;

    const manufacturer = $(cells[0]).text().trim();
    const companies = ['Toyota', 'Volkswagen', 'Hyundai', 'General Motors', 'Stellantis'];
    const companyMap: Record<string, string> = {
      Toyota: 'Toyota',
      Volkswagen: 'VW',
      Hyundai: 'Hyundai',
      'General Motors': 'GM',
      Stellantis: 'Stellantis',
    };

    const matched = companies.find((c) => manufacturer.includes(c));
    if (!matched) return;

    const yearText = $(cells[1]).text().replace(/,/g, '').trim();
    const salesText = $(cells[2]).text().replace(/,/g, '').trim();
    const year = parseInt(yearText);
    const totalSales = parseInt(salesText);

    if (isNaN(year) || isNaN(totalSales)) return;

    // Distribute across regions using known approximate splits
    const regionSplits: Record<string, Record<string, number>> = {
      Toyota: { americas: 0.22, europe: 0.09, asia_pacific: 0.62, mea: 0.07 },
      VW: { americas: 0.15, europe: 0.42, asia_pacific: 0.36, mea: 0.07 },
      Hyundai: { americas: 0.26, europe: 0.17, asia_pacific: 0.42, mea: 0.15 },
      GM: { americas: 0.60, europe: 0.04, asia_pacific: 0.29, mea: 0.07 },
      Stellantis: { americas: 0.38, europe: 0.44, asia_pacific: 0.08, mea: 0.10 },
    };
    const company = companyMap[matched];
    const splits = regionSplits[company] || regionSplits['Toyota'];
    const quarterlyFactor = [0.23, 0.26, 0.25, 0.26];

    (['americas', 'europe', 'asia_pacific', 'mea'] as const).forEach((region) => {
      const regionTotal = Math.round(totalSales * splits[region]);
      (['Q1', 'Q2', 'Q3', 'Q4'] as const).forEach((quarter, qi) => {
        records.push({
          company,
          year,
          quarter,
          region,
          sales: Math.round(regionTotal * quarterlyFactor[qi]),
          yoy_change: 0,
        });
      });
    });
  });

  return records;
}

export async function collectSalesData(): Promise<{ records: SalesRecord[]; source: 'live' | 'fallback' }> {
  const start = Date.now();
  try {
    logger.info('[salesCollector] Starting Wikipedia scrape...');
    const records = await withRetry(scrapeWikipedia, 3, 1000, 'wikipedia-sales');
    if (records.length === 0) throw new Error('No records parsed from Wikipedia');
    logger.info(`[salesCollector] Live data collected: ${records.length} records in ${Date.now() - start}ms`);
    return { records, source: 'live' };
  } catch (err) {
    logger.warn(`[salesCollector] Live collection failed, using fallback. Error: ${err}`);
    const fallback = await readFallback<SalesRecord[]>('sales-data.json');
    logger.info(`[salesCollector] Fallback loaded: ${fallback.length} records`);
    return { records: fallback, source: 'fallback' };
  }
}
