import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import salesRouter from './routes/sales';
import eventsRouter from './routes/events';
import metaRouter from './routes/meta';
import { startScheduler } from './scheduler/cronJobs';
import { ensureCacheDirs } from './storage/jsonStore';
import logger from './utils/logger';

const app = express();
const PORT = parseInt(process.env.PORT || '4000', 10);

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:4173',
  ],
  methods: ['GET', 'POST'],
  credentials: true,
}));
app.use(express.json());

// Request logging
app.use((req, _res, next) => {
  logger.debug(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/sales', salesRouter);
app.use('/api/events', eventsRouter);
app.use('/api/meta', metaRouter);
app.post('/api/refresh', metaRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

async function bootstrap(): Promise<void> {
  await ensureCacheDirs();
  app.listen(PORT, () => {
    logger.info(`🚀 Backend server running on http://localhost:${PORT}`);
    logger.info(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  });
  startScheduler();
}

bootstrap().catch((err) => {
  logger.error(`Failed to start server: ${err}`);
  process.exit(1);
});
