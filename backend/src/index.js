import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import ordersRoutes from './routes/orders.js';
import techniciansRoutes from './routes/technicians.js';
import claimsRoutes from './routes/claims.js';
import analyticsRoutes from './routes/analytics.js';
import uploadRoutes from './routes/upload.js';
import notificationsRoutes from './routes/notifications.js';
import { initTelegramBot } from './bot/telegram.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    // Allow any vercel.app domain
    if (origin.endsWith('.vercel.app') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(null, true); // Allow all for now
  },
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/technicians', techniciansRoutes);
app.use('/api/claims', claimsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize Telegram Bot
try {
  initTelegramBot();
  console.log('📱 Telegram Bot initialized');
} catch (error) {
  console.log('⚠️  Telegram Bot initialization skipped:', error.message);
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Smart Dispatcher Backend running on port ${PORT}`);
});

export default app;
