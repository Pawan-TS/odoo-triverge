const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const config = require('./config/env');
const logger = require('./config/logger');
const { connectDB } = require('./config/db');
const routes = require('./routes');
const { errorHandler } = require('./middleware/error.middleware');
const { auditMiddleware } = require('./middleware/audit.middleware');

class App {
  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  initializeMiddlewares() {
    // Security middleware
    this.app.use(helmet());
    
    // CORS configuration
    this.app.use(cors({
      origin: config.frontendUrl,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Org-Id']
    }));

    // Rate limiting - Temporarily increased for development
    const limiter = rateLimit({
      windowMs: config.rateLimitWindowMs,
      max: 1000, // Increased from config.rateLimitMax to 1000 for development
      message: {
        error: 'Too many requests from this IP, please try again later',
        statusCode: 429
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    
    // Only apply rate limiting in production
    if (process.env.NODE_ENV === 'production') {
      this.app.use('/api/', limiter);
      console.log('🛡️ Rate limiting enabled for production');
    } else {
      console.log('🛡️ Rate limiting disabled for development');
    }

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Compression
    this.app.use(compression());

    // Logging
    if (config.nodeEnv !== 'test') {
      this.app.use(morgan('combined', {
        stream: { write: message => logger.info(message.trim()) }
      }));
    }

    // Audit middleware for important routes
    this.app.use('/api/v1', auditMiddleware);
  }

  initializeRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0'
      });
    });

    // API routes
    this.app.use('/api/v1', routes);

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Route not found',
        statusCode: 404,
        path: req.originalUrl,
        method: req.method
      });
    });
  }

  initializeErrorHandling() {
    this.app.use(errorHandler);
  }

  async start() {
    try {
      // Connect to database
      await connectDB();
      logger.info('Database connected successfully');

      const PORT = config.port;
      this.server = this.app.listen(PORT, () => {
        logger.info(`🚀 Server running on port ${PORT}`);
        logger.info(`📚 Environment: ${config.nodeEnv}`);
        logger.info(`🔗 API Base URL: http://localhost:${PORT}/api/v1`);
      });

      // Graceful shutdown
      process.on('SIGTERM', this.gracefulShutdown.bind(this));
      process.on('SIGINT', this.gracefulShutdown.bind(this));

    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  async gracefulShutdown(signal) {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);
    
    if (this.server) {
      this.server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    }
  }
}

module.exports = App;