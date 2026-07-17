require('dotenv').config();
const Sentry = require('@sentry/node');

// Initialize Sentry before any other middleware or route import
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV || 'development'
  });
  console.log('[Sentry] Server initialized successfully.');
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const { errorHandler } = require('./middleware/error.middleware');

const authRoutes = require('./routes/auth.routes');
const ebookRoutes = require('./routes/ebook.routes');
const chapterRoutes = require('./routes/chapter.routes');
const aiRoutes = require('./routes/ai.routes');
const exportRoutes = require('./routes/export.routes');
const marketingRoutes = require('./routes/marketing.routes');
const playgroundRoutes = require('./routes/playground.routes');
const adminRoutes = require('./routes/admin.routes');
const paymentRoutes = require('./routes/payment.routes');
const accountRoutes = require('./routes/account.routes');

const app = express();

if (process.env.SENTRY_DSN) {
  // Sentry v7 requestHandler setup
  app.use(Sentry.Handlers?.requestHandler ? Sentry.Handlers.requestHandler() : (req, res, next) => next());
}

// Trust proxy (required for express-rate-limit behind reverse proxies like Vercel)
app.set('trust proxy', 1);

// Security and utility middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({
  verify: (req, res, buf) => {
    if (req.originalUrl && req.originalUrl.startsWith('/api/webhooks/payment')) {
      req.rawBody = buf.toString();
    }
  }
}));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Create upload directories if they don't exist (dev only)
if (process.env.NODE_ENV !== 'production') {
  const dirs = ['uploads/images', 'uploads/pdfs', 'uploads/audios', 'uploads/exports'];
  dirs.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
}

// Static files
// Vercel Serverless doesn't need to serve local /uploads anymore since we use Supabase
// app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ebooks', ebookRoutes);
app.use('/api/books', ebookRoutes); // Alias for compatibility
app.use('/api/chapters', chapterRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/playground', playgroundRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/subscription', paymentRoutes);
app.use('/api/credits', paymentRoutes);
app.use('/api/webhooks/payment', paymentRoutes);
app.use('/api/account', accountRoutes);

if (process.env.SENTRY_DSN) {
  // Sentry v7 errorHandler setup
  app.use(Sentry.Handlers?.errorHandler ? Sentry.Handlers.errorHandler() : (err, req, res, next) => next(err));
}

// Error Handler
app.use(errorHandler);

// Only listen if not running in Vercel (Vercel sets VERCEL=1 or similar env vars, but exporting app is standard)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel Serverless Functions
module.exports = app;
