import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { isOriginAllowed } from './utils/corsOrigins';

import authRoutes from './routes/authRoutes';
import vpsRoutes from './routes/vpsRoutes';
import cloudPcRoutes from './routes/cloudPcRoutes';
import billingRoutes from './routes/billingRoutes';
import adminRoutes from './routes/adminRoutes';
import trialRoutes from './routes/trialRoutes';
import v2AuthRoutes from './routes/v2/authRoutes';
import v2TrialRoutes from './routes/v2/trialRoutes';
import v2AdminRoutes from './routes/v2/adminRoutes';
import v2WebhookRoutes from './routes/v2/webhookRoutes';
import { errorHandler } from './middlewares/errorMiddleware';

dotenv.config();

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) callback(null, true);
      else callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.get('/api', (_req, res) => {
  res.json({
    service: 'HEXCloud API',
    routes: {
      auth: '/api/auth',
      vps: '/api/vps',
      cloudpc: '/api/cloudpc',
      billing: '/api/billing',
      trial: '/api/trial',
      v2: '/api/v2',
      admin: '/api/admin',
    },
    health: '/health',
  });
});

// Core Routes
app.use('/api/auth', authRoutes);
app.use('/api/vps', vpsRoutes);
app.use('/api/cloudpc', cloudPcRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/trial', trialRoutes);
app.use('/api/v2/auth', v2AuthRoutes);
app.use('/api/v2/trial', v2TrialRoutes);
app.use('/api/v2/admin', v2AdminRoutes);
app.use('/api/v2/webhooks', v2WebhookRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (_req, res) => {
  res.json({
    service: 'HEXCloud API',
    status: 'running',
    health: '/health',
    api: '/api',
  });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Error handling middleware
app.use(errorHandler);

export default app;
