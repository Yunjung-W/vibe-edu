import { Router, Request, Response } from 'express';
import { readCache } from '../storage/jsonStore';
import { MetaInfo } from '../types';
import { runCollection } from '../scheduler/cronJobs';
import logger from '../utils/logger';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const meta = await readCache<MetaInfo>('meta.json');
    if (!meta) {
      return res.json({
        lastUpdated: null,
        source: 'fallback',
        status: 'collecting',
        salesCount: 0,
        eventsCount: 0,
      });
    }
    res.json(meta);
  } catch (err) {
    logger.error(`[/api/meta] Error: ${err}`);
    res.status(500).json({ error: 'Failed to load meta info' });
  }
});

// POST /api/refresh — manual trigger (dev only)
router.post('/refresh', async (_req: Request, res: Response) => {
  try {
    logger.info('[/api/refresh] Manual refresh triggered');
    res.json({ message: 'Collection started' });
    // Run async after response sent
    runCollection().catch((err) => logger.error(`[/api/refresh] Error: ${err}`));
  } catch (err) {
    logger.error(`[/api/refresh] Error: ${err}`);
    res.status(500).json({ error: 'Failed to trigger refresh' });
  }
});

export default router;
