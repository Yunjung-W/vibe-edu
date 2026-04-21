import fs from 'fs/promises';
import path from 'path';
import logger from '../utils/logger';

const DATA_DIR = path.join(__dirname, '../../data');
const CACHE_DIR = path.join(DATA_DIR, 'cache');
const FALLBACK_DIR = path.join(DATA_DIR, 'fallback');

export async function readCache<T>(filename: string): Promise<T | null> {
  const filePath = path.join(CACHE_DIR, filename);
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function writeCache<T>(filename: string, data: T): Promise<void> {
  const filePath = path.join(CACHE_DIR, filename);
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    logger.info(`[store] Written cache: ${filename}`);
  } catch (err) {
    logger.error(`[store] Failed to write cache ${filename}: ${err}`);
    throw err;
  }
}

export async function readFallback<T>(filename: string): Promise<T> {
  const filePath = path.join(FALLBACK_DIR, filename);
  const raw = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

export async function ensureCacheDirs(): Promise<void> {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.mkdir(FALLBACK_DIR, { recursive: true });
}
