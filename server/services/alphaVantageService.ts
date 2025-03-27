import axios from 'axios';
import { storage } from '../storage';
import type { Stock, InsertStock } from '@shared/schema';

// Use environment variable for API key
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

// Types for Alpha Vantage API response structures
interface AlphaVantageQuoteResponse {
  'Global Quote': {
    '01. symbol': string;
    '02. open': string;
    '03. high': string;
    '04. low': string;
    '05. price': string;
    '06. volume': string;
    '07. latest trading day': string;
    '08. previous close': string;
    '09. change': string;
    '10. change percent': string;
  };
}

interface AlphaVantageOverviewResponse {
  Symbol: string;
  Name: string;
  Description: string;
  Sector: string;
  Industry: string;
  MarketCapitalization: string;
  PERatio: string;
  DividendYield: string;
  EPS: string;
  Beta: string;
  FiftyTwoWeekHigh: string;
  FiftyTwoWeekLow: string;
  AnalystTargetPrice: string;
}

interface AlphaVantageSearchResponse {
  bestMatches: Array<{
    '1. symbol': string;
    '2. name': string;
    '3. type': string;
    '4. region': string;
    '5. marketOpen': string;
    '6. marketClose': string;
    '7. timezone': string;
    '8. currency': string;
    '9. matchScore': string;
  }>;
}

/**
 * Get real-time stock quote from Alpha Vantage
 */
async function getStockQuote(symbol: string): Promise<AlphaVantageQuoteResponse | null> {
  try {
    if (!ALPHA_VANTAGE_API_KEY) {
      console.warn('Alpha Vantage API key not found. Using simulated stock data.');
      return null;
    }

    const response = await axios.get<AlphaVantageQuoteResponse>(BASE_URL, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: symbol,
        apikey: ALPHA_VANTAGE_API_KEY
      }
    });

    // Alpha Vantage sometimes returns an empty object or error message
    if (!response.data || !response.data['Global Quote'] || Object.keys(response.data['Global Quote']).length === 0) {
      console.warn(`No quote data returned from Alpha Vantage for symbol ${symbol}`);
      return null;
    }

    return response.data;
  } catch (error) {
    console.error(`Error fetching stock quote for ${symbol}:`, error);
    return null;
  }
}

/**
 * Get company overview from Alpha Vantage
 */
async function getCompanyOverview(symbol: string): Promise<AlphaVantageOverviewResponse | null> {
  try {
    if (!ALPHA_VANTAGE_API_KEY) {
      console.warn('Alpha Vantage API key not found. Using simulated company data.');
      return null;
    }

    const response = await axios.get<AlphaVantageOverviewResponse>(BASE_URL, {
      params: {
        function: 'OVERVIEW',
        symbol: symbol,
        apikey: ALPHA_VANTAGE_API_KEY
      }
    });

    // Validate response
    if (!response.data || !response.data.Symbol) {
      console.warn(`No company overview data returned from Alpha Vantage for symbol ${symbol}`);
      return null;
    }

    return response.data;
  } catch (error) {
    console.error(`Error fetching company overview for ${symbol}:`, error);
    return null;
  }
}

/**
 * Search for stocks by keywords or company name
 */
async function searchStocks(keywords: string): Promise<AlphaVantageSearchResponse | null> {
  try {
    if (!ALPHA_VANTAGE_API_KEY) {
      console.warn('Alpha Vantage API key not found. Unable to search for stocks.');
      return null;
    }

    const response = await axios.get<AlphaVantageSearchResponse>(BASE_URL, {
      params: {
        function: 'SYMBOL_SEARCH',
        keywords: keywords,
        apikey: ALPHA_VANTAGE_API_KEY
      }
    });

    // Validate response
    if (!response.data || !response.data.bestMatches) {
      console.warn(`No search results returned from Alpha Vantage for keywords "${keywords}"`);
      return null;
    }

    return response.data;
  } catch (error) {
    console.error(`Error searching stocks with keywords "${keywords}":`, error);
    return null;
  }
}

/**
 * Update stock prices with real data from Alpha Vantage
 */
async function updateStockPrices(): Promise<void> {
  try {
    if (!ALPHA_VANTAGE_API_KEY) {
      console.warn('Alpha Vantage API key not found. Skipping real-time price updates.');
      return;
    }

    console.log('Updating stock prices from Alpha Vantage...');
    
    // Get all stocks from storage
    const stocks = await storage.getStocks();
    
    // Alpha Vantage free tier has a limit of 5 API calls per minute
    // We'll update a small batch of stocks each time
    const batchSize = 5;
    const startIndex = Math.floor(Math.random() * Math.max(stocks.length - batchSize, 0));
    const stockBatch = stocks.slice(startIndex, startIndex + batchSize);
    
    console.log(`Updating prices for ${stockBatch.length} stocks starting at index ${startIndex}`);
    
    for (const stock of stockBatch) {
      const quoteData = await getStockQuote(stock.symbol);
      
      if (quoteData && quoteData['Global Quote']) {
        const quote = quoteData['Global Quote'];
        const currentPrice = parseFloat(quote['05. price']);
        const previousClose = parseFloat(quote['08. previous close']);
        const priceChange = parseFloat(quote['09. change']);
        const priceChangePercent = parseFloat(quote['10. change percent'].replace('%', ''));
        
        // Update stock with real data
        await storage.updateStock(stock.id, {
          currentPrice,
          previousClose,
          priceChange,
          priceChangePercent,
          updatedAt: new Date()
        });
        
        console.log(`Updated real-time price for ${stock.symbol}: $${currentPrice.toFixed(2)}`);
      } else {
        console.log(`Skipping price update for ${stock.symbol} (no data available)`);
      }
      
      // Add delay to avoid hitting API rate limits
      await new Promise(resolve => setTimeout(resolve, 12000)); // 12 seconds between requests
    }
    
    console.log('Stock price update completed');
  } catch (error) {
    console.error('Error updating stock prices:', error);
  }
}

/**
 * Add new stock from Alpha Vantage data
 */
async function addNewStock(symbol: string): Promise<Stock | null> {
  try {
    if (!ALPHA_VANTAGE_API_KEY) {
      console.warn('Alpha Vantage API key not found. Unable to add new stock with real data.');
      return null;
    }
    
    // Check if stock already exists
    const existingStock = await storage.getStockBySymbol(symbol);
    if (existingStock) {
      return existingStock;
    }
    
    // Get company overview
    const overviewData = await getCompanyOverview(symbol);
    
    // Get quote data
    const quoteData = await getStockQuote(symbol);
    
    if (!overviewData || !quoteData) {
      console.error(`Failed to add stock ${symbol}: missing data`);
      return null;
    }
    
    const currentPrice = parseFloat(quoteData['Global Quote']['05. price']);
    const previousClose = parseFloat(quoteData['Global Quote']['08. previous close']);
    const priceChange = parseFloat(quoteData['Global Quote']['09. change']);
    const priceChangePercent = parseFloat(quoteData['Global Quote']['10. change percent'].replace('%', ''));
    const marketCap = parseInt(overviewData.MarketCapitalization || '0');
    
    // Create new stock with real data
    const newStock: InsertStock = {
      symbol: overviewData.Symbol,
      companyName: overviewData.Name,
      sector: overviewData.Sector || null,
      industry: overviewData.Industry || null,
      currentPrice,
      previousClose,
      priceChange,
      priceChangePercent,
      marketCap,
      logoUrl: `https://logo.clearbit.com/${overviewData.Name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      description: overviewData.Description || `${overviewData.Name} is a company in the ${overviewData.Industry} industry.`,
      website: `https://${overviewData.Name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      competitors: []
    };
    
    const stock = await storage.createStock(newStock);
    console.log(`Added new stock ${symbol} with real data`);
    
    return stock;
  } catch (error) {
    console.error(`Error adding new stock ${symbol}:`, error);
    return null;
  }
}

export const alphaVantageService = {
  getStockQuote,
  getCompanyOverview,
  searchStocks,
  updateStockPrices,
  addNewStock
};