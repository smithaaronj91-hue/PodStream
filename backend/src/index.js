import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Security imports
import {
    securityHeaders,
    generalLimiter,
    sanitizeInput,
    requestLimits,
    securityLogger,
    secureErrorHandler,
} from './middleware/security.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// SECURITY MIDDLEWARE (applied first)
// ============================================
app.use(securityHeaders);           // Helmet security headers
app.use(generalLimiter);            // Rate limiting
app.use(securityLogger);            // Log suspicious activity
app.use(sanitizeInput);             // Sanitize all inputs

// ============================================
// STANDARD MIDDLEWARE
// ============================================
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json(requestLimits.json));
app.use(express.urlencoded(requestLimits.urlencoded));

// Import routes
import categoryRoutes from './routes/categories.js';
import podcastRoutes from './routes/podcasts.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import subscriptionRoutes from './routes/subscriptions.js';
import feedRoutes from './routes/feed.js';
import processRoutes from './routes/process.js';
import voiceRoutes from './routes/voice.js';

// Routes
app.use('/api/categories', categoryRoutes);
app.use('/api/podcasts', podcastRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/process', processRoutes);
app.use('/api/voice', voiceRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Secure error handler (hides internal errors in production)
app.use(secureErrorHandler);

app.listen(PORT, () => {
    console.log(`🎙️ PodStream server running on http://localhost:${PORT}`);
    console.log(`🔒 Security middleware enabled`);
});
