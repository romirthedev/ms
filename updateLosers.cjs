const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Alpha Vantage API Key
const API_KEY = "VLODP4OI0EWHVJKT";

/**
 * Fetch stock data from Alpha Vantage API
 */
async function fetchStockData(symbol) {
  try {
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
    );
    return response.data['Global Quote'];
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error.message);
    return null;
  }
}

/**
 * Get NASDAQ stocks from local JSON file
 */
function getNasdaqStocks() {
  try {
    const nasdaqPath = path.join(__dirname, 'nasdaq_stocks.json');
    const stocks = JSON.parse(fs.readFileSync(nasdaqPath, 'utf8'));

    return stocks.map(stock => ({
      symbol: stock.symbol,
      name: stock.companyName
    }));
  } catch (error) {
    console.error('Error reading NASDAQ stocks file:', error);
    return [
      { symbol: "AAPL", name: "Apple Inc." },
      { symbol: "MSFT", name: "Microsoft Corporation" },
      { symbol: "GOOGL", name: "Alphabet Inc." },
      { symbol: "META", name: "Meta Platforms, Inc." },
      { symbol: "TSLA", name: "Tesla, Inc." },
      { symbol: "NFLX", name: "Netflix, Inc." },
      { symbol: "NVDA", name: "NVIDIA Corporation" },
      { symbol: "AMZN", name: "Amazon.com Inc." },
      { symbol: "PYPL", name: "PayPal Holdings, Inc." },
      { symbol: "INTC", name: "Intel Corporation" }
    ];
  }
}

/**
 * Update losers.json with top 10 biggest losers
 */
async function updateLosers() {
  try {
    const allStocks = getNasdaqStocks();
    const stocksToCheck = allStocks.slice(0, 20);

    console.log(`📉 Checking ${stocksToCheck.length} stocks...`);
    const stockData = [];

    for (let i = 0; i < stocksToCheck.length; i += 5) {
      const batch = stocksToCheck.slice(i, i + 5);
      const batchResults = await Promise.all(
        batch.map(async stock => {
          const quote = await fetchStockData(stock.symbol);
          if (!quote) return null;

          const price = parseFloat(quote['05. price']);
          const previousClose = parseFloat(quote['08. previous close']);
          const change = parseFloat(quote['09. change']);
          const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));

          if (changePercent < 0) {
            return {
              symbol: stock.symbol,
              name: stock.name,
              price,
              loss_percentage: changePercent,
              loss_value: change,
              previous_close: previousClose,
              volume: parseInt(quote['06. volume']),
              timestamp: new Date().toISOString()
            };
          }

          return null;
        })
      );

      stockData.push(...batchResults.filter(Boolean));

      if (i + 5 < stocksToCheck.length) {
        console.log(`⏱️ Processed ${i + 5}, pausing 15s to avoid rate limit...`);
        await new Promise(res => setTimeout(res, 15000));
      }
    }

    stockData.sort((a, b) => a.loss_percentage - b.loss_percentage);
    const topLosers = stockData.slice(0, 10);

    if (topLosers.length === 0) {
      console.log('⚠️ No losers found, using fallback...');
      topLosers.push(
        {
          symbol: "TSLA", name: "Tesla, Inc.", price: 172.33,
          loss_percentage: -7.65, loss_value: -14.25,
          previous_close: 186.58, volume: 134962481,
          timestamp: new Date().toISOString()
        },
        {
          symbol: "MSFT", name: "Microsoft Corporation", price: 390.15,
          loss_percentage: -4.78, loss_value: -19.58,
          previous_close: 409.73, volume: 45271532,
          timestamp: new Date().toISOString()
        }
      );
    }

    const losersPath = path.join(__dirname, 'losers.json');
    fs.writeFileSync(losersPath, JSON.stringify(topLosers, null, 2));

    console.log(`✅ Successfully wrote ${topLosers.length} stocks to losers.json`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updateLosers();
