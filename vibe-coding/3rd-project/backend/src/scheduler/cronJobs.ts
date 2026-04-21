import cron from 'node-cron';
import { collectSalesData } from '../collectors/salesCollector';
import { collectEventsData } from '../collectors/eventsCollector';
import { writeCache, readCache } from '../storage/jsonStore';
import { MetaInfo } from '../types';
import logger from '../utils/logger';

async function runCollection(): Promise<void> {
  logger.info('[cron] Starting data collection cycle...');
  const start = Date.now();

  let overallSource: 'live' | 'fallback' = 'live';

  try {
    const [salesResult, eventsResult] = await Promise.allSettled([
      collectSalesData(),
      collectEventsData(),
    ]);

    let salesCount = 0;
    let eventsCount = 0;

    if (salesResult.status === 'fulfilled') {
      await writeCache('sales-data.json', salesResult.value.records);
      salesCount = salesResult.value.records.length;
      if (salesResult.value.source === 'fallback') overallSource = 'fallback';
    } else {
      logger.error(`[cron] Sales collection error: ${salesResult.reason}`);
      overallSource = 'fallback';
    }

    if (eventsResult.status === 'fulfilled') {
      await writeCache('events-data.json', eventsResult.value.records);
      eventsCount = eventsResult.value.records.length;
      if (eventsResult.value.source === 'fallback') overallSource = 'fallback';
    } else {
      logger.error(`[cron] Events collection error: ${eventsResult.reason}`);
      overallSource = 'fallback';
    }

    const now = new Date();
    const next = new Date(now.getTime() + 60 * 60 * 1000);

    const meta: MetaInfo = {
      lastUpdated: now.toISOString(),
      source: overallSource,
      status: 'ok',
      salesCount,
      eventsCount,
      nextUpdate: next.toISOString(),
    };

    await writeCache('meta.json', meta);

    logger.info(
      `[cron] Collection complete in ${Date.now() - start}ms | source=${overallSource} | sales=${salesCount} events=${eventsCount}`
    );
  } catch (err) {
    logger.error(`[cron] Collection cycle failed: ${err}`);

    const existing = await readCache<MetaInfo>('meta.json');
    if (existing) {
      await writeCache('meta.json', { ...existing, status: 'error' });
    }
  }
}

export function startScheduler(): void {
  const schedule = process.env.CRON_SCHEDULE || '0 * * * *';

  // Run immediately on startup
  if (process.env.COLLECT_ON_START !== 'false') {
    logger.info('[cron] Running initial collection on startup...');
    runCollection().catch((err) => logger.error(`[cron] Initial collection error: ${err}`));
  }

  // Schedule hourly
  cron.schedule(schedule, () => {
    runCollection().catch((err) => logger.error(`[cron] Scheduled collection error: ${err}`));
  });

  logger.info(`[cron] Scheduler started with pattern: ${schedule}`);
}

export { runCollection };
