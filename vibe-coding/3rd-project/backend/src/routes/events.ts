import { Router, Request, Response } from 'express';
import { readCache, readFallback } from '../storage/jsonStore';
import { EventRecord, EventsFilter, MetaInfo } from '../types';
import logger from '../utils/logger';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const filters = req.query as EventsFilter;

  try {
    let records = await readCache<EventRecord[]>('events-data.json');
    let source: 'live' | 'fallback' = 'live';
    let lastUpdated = new Date().toISOString();

    if (!records || records.length === 0) {
      records = await readFallback<EventRecord[]>('events-data.json');
      source = 'fallback';
    }

    const meta = await readCache<MetaInfo>('meta.json');
    if (meta) {
      lastUpdated = meta.lastUpdated;
      source = meta.source;
    }

    let filtered = records;

    if (filters.from) {
      filtered = filtered.filter((r) => r.date >= filters.from!);
    }

    if (filters.to) {
      filtered = filtered.filter((r) => r.date <= filters.to!);
    }

    if (filters.category) {
      const cats = filters.category.split(',');
      filtered = filtered.filter((r) => cats.includes(r.category));
    }

    if (filters.severity) {
      const severities = filters.severity.split(',');
      filtered = filtered.filter((r) => severities.includes(r.severity));
    }

    // Sort by date ascending
    filtered.sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      data: filtered,
      meta: { lastUpdated, source, count: filtered.length },
    });
  } catch (err) {
    logger.error(`[/api/events] Error: ${err}`);
    res.status(500).json({ error: 'Failed to load events data' });
  }
});

export default router;
