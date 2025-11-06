// Simple Express server to test the API without database
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    message: '🎉 AI Email Designer API is running!'
  });
});

// Mock register endpoint
app.post('/api/v1/auth/register', (req, res) => {
  const { email, password } = req.body;
  res.json({
    message: 'Registration successful!',
    user: {
      id: '123',
      email: email,
      createdAt: new Date().toISOString()
    },
    token: 'mock-jwt-token-for-testing',
    note: 'This is a test response - add database to persist users'
  });
});

// Mock email generation endpoint
app.post('/api/v1/emails/generate', (req, res) => {
  const { campaignBrief } = req.body;
  res.json({
    message: 'Email generation started',
    jobId: 'test-job-' + Date.now(),
    note: 'Add OpenAI API key and database to generate real emails',
    yourBrief: campaignBrief
  });
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ========================================');
  console.log('   AI Email Designer - Simple Test Server');
  console.log('========================================');
  console.log('');
  console.log(`✅ Server running at: http://localhost:${PORT}`);
  console.log('');
  console.log('📝 Try these commands:');
  console.log('');
  console.log('  Health check:');
  console.log(`  curl http://localhost:${PORT}/health`);
  console.log('');
  console.log('  Register user:');
  console.log(`  curl -X POST http://localhost:${PORT}/api/v1/auth/register -H "Content-Type: application/json" -d "{\\"email\\":\\"test@test.com\\",\\"password\\":\\"test123\\"}"  `);
  console.log('');
  console.log('⚠️  This is a SIMPLE version for testing.');
  console.log('   To enable full features, you need:');
  console.log('   1. PostgreSQL database');
  console.log('   2. OpenAI API key in .env file');
  console.log('');
  console.log('Press Ctrl+C to stop');
  console.log('');
});

