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
app.use(express.json());
app.use(morgan('dev'));

app.get('/api', (_req, res) => {
  res.json({
    service: 'HEXCloud API',
    routes: {
      auth: '/api/auth',
      vps: '/api/vps',
      cloudpc: '/api/cloudpc',
      billing: '/api/billing',
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
