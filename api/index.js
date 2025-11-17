// Simple JavaScript entry point for Vercel
import express from 'express';
import serverless from 'serverless-http';

console.log('[Vercel] Starting simple JavaScript handler...');

const app = express();
app.use(express.json());

// Simple test route
app.get('/api/analyses/top', (req, res) => {
  console.log('[Vercel] Simple handler - analyses/top endpoint hit');
  return res.json({ 
    success: true, 
    data: [], 
    message: 'Simple handler working - need to integrate full storage' 
  });
});

// Health check
app.get('/api/health', (req, res) => {
  console.log('[Vercel] Health check endpoint hit');
  return res.json({ success: true, message: 'API is running' });
});

// Export as serverless function
export default serverless(app);