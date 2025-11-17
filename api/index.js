import express from 'express';
import serverless from 'serverless-http';

const app = express();
app.use(express.json());

app.get('/analyses/top', (req, res) => {
  console.log('hit /analyses/top');
  return res.json({
    success: true,
    data: [],
    message: 'Simple handler working - need to integrate full storage'
  });
});

app.get('/api/analyses/top', (req, res) => {
  console.log('hit /api/analyses/top');
  return res.json({
    success: true,
    data: [],
    message: 'Simple handler working - need to integrate full storage'
  });
});

app.get('/health', (req, res) => {
  return res.json({ success: true, message: 'API is running' });
});

export default serverless(app);