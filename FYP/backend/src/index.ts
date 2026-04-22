import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

import { config } from './config/env';
import { requireAuth } from './middleware/auth';
import authRoutes from './routes/auth';
import analysisRoutes from './routes/analysis';
import trainingRoutes from './routes/training';
import dashboardRoutes from './routes/dashboard';
import evaluationRoutes from './routes/evaluation';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'] }));
app.use(express.json({ limit: '2mb' }));

// Public routes (no auth required)
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', environment: config.nodeEnv });
});

// Protected routes (all require Firebase token)
app.use('/api/analyze', requireAuth, analysisRoutes);
app.use('/api/training', requireAuth, trainingRoutes);
app.use('/api/dashboard', requireAuth, dashboardRoutes);
app.use('/api/evaluation', requireAuth, evaluationRoutes);

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: config.nodeEnv === 'development' ? err.message : undefined,
    });
});

const PORT = config.port;

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT} [${config.nodeEnv}]`);
    if (config.useMockMode) {
        console.log('⚠️  Running in MOCK MODE (no LLM API keys — using MockAdapter)');
    }
});
