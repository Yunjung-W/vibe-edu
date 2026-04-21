import { Router, Request, Response } from 'express';
import { readCache, readFallback } from '../storage/jsonStore';
import { SalesRecord, SalesFilter, MetaInfo } from '../types';
import logger from '../utils/logger';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const filters = req.query as SalesFilter;

  try {
    let records = await readCache<SalesRecord[]>('sales-data.json');
    let source: 'live' | 'fallback' = 'live';
    let lastUpdated = new Date().toISOString();

    if (!records || records.length === 0) {
      records = await readFallback<SalesRecord[]>('sales-data.json');
      source = 'fallback';
    }

    const meta = await readCache<MetaInfo>('meta.json');
    if (meta) {
      lastUpdated = meta.lastUpdated;
      source = meta.source;
    }

    // Apply filters
    let filtered = records;

    if (filters.year) {
      const years = filters.year.split(',').map(Number);
      filtered = filtered.filter((r) => years.includes(r.year));
    }

    if (filters.region) {
      const regions = filters.region.split(',');
      filtered = filtered.filter((r) => regions.includes(r.region));
    }

    if (filters.company) {
      const companies = filters.company.split(',');
      filtered = filtered.filter((r) => companies.includes(r.company));
    }

    if (filters.quarter) {
      const quarters = filters.quarter.split(',');
      filtered = filtered.filter((r) => quarters.includes(r.quarter));
    }

    res.json({
      data: filtered,
      meta: { lastUpdated, source, count: filtered.length },
    });
  } catch (err) {
    logger.error(`[/api/sales] Error: ${err}`);
    res.status(500).json({ error: 'Failed to load sales data' });
  }
});

export default router;
