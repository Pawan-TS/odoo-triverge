const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend server is running!',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// API routes
app.get('/api/v1/health', (req, res) => {
  res.json({ 
    success: true,
    data: {
      status: 'healthy',
      service: 'Shiv Accounts Backend',
      version: '1.0.0',
      port: PORT
    }
  });
});

// Default route
app.get('/', (req, res) => {
  res.json({
    message: 'Shiv Accounts Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api/v1/health'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend Server running on port ${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Health: http://localhost:${PORT}/api/v1/health`);
});

module.exports = app;
