require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const memeRoutes = require('./routes/memeRoutes');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
    if (!origin || origin === allowedOrigin) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));


// Request logging
app.use(morgan('dev'));

// Body parsing
app.use(express.json({ limit: process.env.UPLOAD_LIMIT }));
app.use(express.urlencoded({ extended: true }));

// ✅ Serve static files (uploads) with CORS headers
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res) => {
      const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    }
  })
);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Meme Generator API',
    endpoints: {
      memes: '/api/memes',
      health: '/api/health',
      uploads: '/uploads/:filename'
    }
  });
});

// Routes
app.use('/api/memes', memeRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Handle Multer "File too large" error nicely
  if (err.name === 'MulterError' && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Max size exceeded.' });
  }

  res.status(500).json({ 
    error: 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
