require('dotenv').config();
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

const app = express();

// Security and utility middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
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
app.use('/api/chapters', chapterRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/export', exportRoutes);

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
