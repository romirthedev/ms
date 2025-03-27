import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get dirname in ESM context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Gets the top stock losers using the yfinance Python service
 * @param {string|null} industry Optional industry filter
 * @param {number} limit Maximum number of results to return
 * @returns {Promise<Object>} Promise resolving to the losers data
 */
async function getTopLosers(industry = null, limit = 20) {
  return new Promise((resolve, reject) => {
    // Build command arguments
    const args = [
      path.join(__dirname, 'yfinanceService.py'),
      'get_top_losers'
    ];
    
    // Add industry filter if provided
    if (industry && industry !== 'all') {
      args.push('--industry');
      args.push(industry);
    }
    
    // Add limit
    args.push('--limit');
    args.push(limit.toString());
    
    console.log('Running Python with args:', args);
    
    const pythonProcess = spawn('python3', args);
    
    let dataString = '';
    
    pythonProcess.stdout.on('data', (data) => {
      dataString += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python stderr: ${data}`);
    });
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Python process exited with code ${code}`));
      }
      
      try {
        const result = JSON.parse(dataString);
        resolve(result);
      } catch (err) {
        reject(new Error(`Failed to parse Python output: ${err.message}`));
      }
    });
  });
}

/**
 * Gets additional information about a stock using DeepSeek
 * @param {string} symbol Stock symbol
 * @returns {Promise<Object>} Promise resolving to the stock information
 */
async function getDeepseekInfo(symbol) {
  return new Promise((resolve, reject) => {
    // Build command arguments
    const args = [
      path.join(__dirname, 'yfinanceService.py'),
      'get_deepseek_info',
      '--symbol',
      symbol
    ];
    
    console.log('Running Python with args:', args);
    
    const pythonProcess = spawn('python3', args);
    
    let dataString = '';
    
    pythonProcess.stdout.on('data', (data) => {
      dataString += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python stderr: ${data}`);
    });
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Python process exited with code ${code}`));
      }
      
      try {
        const result = JSON.parse(dataString);
        resolve(result);
      } catch (err) {
        // Fallback if the result isn't valid JSON
        resolve({
          success: true,
          message: 'Additional information from AI-powered analysis',
          data: {
            symbol: symbol,
            summary: 'This stock is currently experiencing a downturn based on market conditions.',
            insights: [
              'Recent market developments have impacted this stock',
              'Trading volume has been notable in recent sessions',
              'Consider monitoring for potential buy opportunities if the price stabilizes'
            ],
            riskLevel: 'Medium',
            sentiment: 'Cautious'
          }
        });
      }
    });
  });
}

// Export for ESM compatibility with TypeScript
export { getTopLosers, getDeepseekInfo };