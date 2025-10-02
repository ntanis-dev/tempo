import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase, testConnection, initializeAdmin } from './database.js';
import apiRoutes from './routes/api.js';
import dashboardRoutes from './routes/dashboard.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '../..');

const app = express();
const PORT = process.env.PORT || 3001;
const isDevelopment = process.env.NODE_ENV === 'development';

// Trust proxy - required when behind nginx/reverse proxy
app.set('trust proxy', 1);

// Middleware Setup (ORDER MATTERS!)

// 1. Security headers (but allow embedding for dashboard)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// 2. CORS - Allow all in development, specific origins in production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman)
    if (!origin) return callback(null, true);

    if (isDevelopment) {
      // In development, allow all origins
      callback(null, true);
    } else {
      // In production, check against allowed origins
      const allowedOrigins = [
        'http://localhost:3001',
        'http://localhost:5173',
        'https://tempo.ntanis.dev'
      ];

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// 3. Compression for all responses
app.use(compression());

// 4. Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Request logging in development
if (isDevelopment) {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// 6. Rate limiting for API routes only
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !req.path.startsWith('/api/')
});

app.use(apiLimiter);

// Routes Setup

// API Routes (with /api prefix)
app.use('/api', apiRoutes);

// Dashboard Routes
app.use('/dashboard', dashboardRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Static Files Serving

// Serve frontend app (must be after API routes)
const distPath = path.join(ROOT_DIR, 'frontend', 'dist');
const publicPath = path.join(ROOT_DIR, 'frontend', 'public');

// Check if dist folder exists (production build)
import fs from 'fs';
if (fs.existsSync(distPath)) {
  // Serve built React app
  app.use(express.static(distPath));

  // Catch-all route for React Router
  app.get('*', (req, res) => {
    // Don't catch API or dashboard routes
    if (req.path.startsWith('/api') || req.path.startsWith('/dashboard')) {
      return res.status(404).json({ error: 'Not found' });
    }

    // Only serve index.html for root path, everything else is 404
    if (req.path === '/') {
      return res.sendFile(path.join(distPath, 'index.html'));
    }

    // Return 404 for unknown paths
    res.status(404)
      .set('Cache-Control', 'no-cache, no-store, must-revalidate')
      .set('Pragma', 'no-cache')
      .set('Expires', '0')
      .sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // No build available
  app.get('/', (req, res) => {
    res.json({
      message: 'Tempo Backend Server',
      frontend: 'Not built. Run: npm run build',
      dashboard: '/dashboard',
      api: '/api',
      health: '/health'
    });
  });
}

// Error Handling

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);

  // CORS error
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS policy violation' });
  }

  res.status(500).json({
    error: 'Internal server error',
    message: isDevelopment ? err.message : undefined
  });
});

// Server Startup
async function startServer() {
  console.log('🚀 Starting Tempo Server...');

  // Initialize database
  const dbInitialized = await initializeDatabase();
  if (!dbInitialized) {
    console.error('❌ Failed to initialize database. Exiting...');
    process.exit(1);
  }

  // Test connection
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error('❌ Failed to connect to database. Exiting...');
    process.exit(1);
  }

  // Initialize admin user
  await initializeAdmin();

  // Start server
  app.listen(PORT, '0.0.0.0', () => {
    console.log('\n✅ Server started successfully!\n');
    console.log(`🏃 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Server URL: http://localhost:${PORT}`);

    if (fs.existsSync(distPath)) {
      console.log(`🏋️  Tempo App: http://localhost:${PORT}`);
    } else {
      console.log(`⚠️  Frontend not built - run: cd frontend && npm run build`);
    }

    console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
    console.log(`🔌 API Endpoint: http://localhost:${PORT}/api`);
    console.log(`💚 Health Check: http://localhost:${PORT}/health\n`);
  });
}

// Start the server
startServer().catch(err => {
  console.error('💥 Failed to start server:', err);
  process.exit(1);
});