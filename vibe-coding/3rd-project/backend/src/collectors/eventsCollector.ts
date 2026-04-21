import axios from 'axios';
import * as cheerio from 'cheerio';
import { EventRecord } from '../types';
import { readFallback } from '../storage/jsonStore';
import { withRetry } from '../utils/retry';
import logger from '../utils/logger';

// Automotive-relevant Wikipedia articles to check for recent events
const WIKIPEDIA_ARTICLES = [
  'https://en.wikipedia.org/wiki/Automotive_industry_crisis_of_2008%E2%80%932010',
  'https://en.wikipedia.org/wiki/2021_global_chip_shortage',
];

async function scrapeWikipediaEvents(): Promise<EventRecord[]> {
  const events: EventRecord[] = [];

  for (const url of WIKIPEDIA_ARTICLES) {
    try {
      const { data: html } = await axios.get(url, {
        timeout: 8000,
        headers: { 'User-Agent': 'AutoDashboard/1.0 (educational project)' },
      });
      const $ = cheerio.load(html);
      const title = $('h1#firstHeading').text().trim();
      if (title) {
        logger.debug(`[eventsCollector] Scraped: ${title}`);
      }
    } catch (err) {
      logger.debug(`[eventsCollector] Failed to scrape ${url}: ${err}`);
    }
  }

  return events; // Real parsing would require more structured extraction
}

export async function collectEventsData(): Promise<{ records: EventRecord[]; source: 'live' | 'fallback' }> {
  const start = Date.now();
  try {
    logger.info('[eventsCollector] Attempting live event collection...');
    const records = await withRetry(scrapeWikipediaEvents, 3, 1000, 'wikipedia-events');

    if (records.length === 0) {
      throw new Error('No events parsed from live sources — using fallback');
    }

    logger.info(`[eventsCollector] Live events: ${records.length} in ${Date.now() - start}ms`);
    return { records, source: 'live' };
  } catch (err) {
    logger.warn(`[eventsCollector] Live collection failed, using fallback. Error: ${err}`);
    const fallback = await readFallback<EventRecord[]>('events-data.json');
    logger.info(`[eventsCollector] Fallback loaded: ${fallback.length} events`);
    return { records: fallback, source: 'fallback' };
  }
}
