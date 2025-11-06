// Vercel serverless function - JavaScript version for compatibility
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'healthy', 
    message: 'AI Email Designer API',
    timestamp: new Date().toISOString() 
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString() 
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    environment: process.env.NODE_ENV || 'unknown'
  });
});

// Mock auth endpoint for testing
app.post('/api/v1/auth/register', (req, res) => {
  res.json({
    message: 'Registration endpoint working',
    note: 'Full TypeScript routes will be added next',
    receivedData: req.body
  });
});

// Export for Vercel
module.exports = app;

