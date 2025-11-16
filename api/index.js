// Simple JavaScript entry point for Vercel
const express = require('express');

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

// Use serverless-http if available
try {
  const serverless = require('serverless-http');
  console.log('[Vercel] serverless-http available, wrapping app');
  module.exports = serverless(app);
} catch (error) {
  console.error('[Vercel] serverless-http not available, using fallback');
  // Fallback for local development
  module.exports = app;
}