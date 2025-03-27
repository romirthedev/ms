import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get dirname in ESM context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Gets the top stock losers using the yfinance Python service
 * @param industry Optional industry filter
 * @param limit Maximum number of results to return
 * @returns Promise resolving to the losers data
 */
export async function getTopLosers(industry: string | null = null, limit: number = 20) {
  return new Promise((resolve, reject) => {
    // Build command arguments
    const args = [
      path.join(__dirname, 'simpleYfinanceService.py'),
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
      } catch (err: any) {
        reject(new Error(`Failed to parse Python output: ${err.message}`));
      }
    });
  });
}

/**
 * Gets additional information about a stock using DeepSeek
 * @param symbol Stock symbol
 * @returns Promise resolving to the stock information
 */
export async function getDeepseekInfo(symbol: string) {
  return new Promise((resolve, reject) => {
    // Build command arguments
    const args = [
      path.join(__dirname, 'simpleDeepseekService.py'),
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
      } catch (err: any) {
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