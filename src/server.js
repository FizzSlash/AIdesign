import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    message: 'AI Email Designer API is running!'
  });
});

// Welcome route
app.get('/', (req, res) => {
  res.json({
    name: 'AI Email Designer API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      docs: '/api/docs'
    }
  });
});

// Demo API endpoint
app.post('/api/v1/emails/generate', (req, res) => {
  const { campaignBrief } = req.body;
  
  res.json({
    message: 'Email generation started',
    brief: campaignBrief,
    status: 'This is a demo - full AI generation requires OpenAI API key setup'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 AI Email Designer API');
  console.log(`📍 Server running at http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log('\n✅ Server is ready! Press Ctrl+C to stop.\n');
});

