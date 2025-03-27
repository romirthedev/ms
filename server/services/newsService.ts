import fetch from 'node-fetch';
import { storage } from '../storage';
import { InsertNewsItem, InsertStock, Stock } from '@shared/schema';

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_URL = 'https://newsapi.org/v2';

interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: Array<{
    source: {
      id: string | null;
      name: string;
    };
    author: string | null;
    title: string;
    description: string;
    url: string;
    urlToImage: string | null;
    publishedAt: string;
    content: string;
  }>;
}

// Function to fetch news for a stock
async function fetchNewsForStock(symbol: string, companyName: string): Promise<NewsAPIResponse> {
  const query = encodeURIComponent(`${symbol} OR ${companyName} stock market`);
  const response = await fetch(
    `${NEWS_API_URL}/everything?q=${query}&sortBy=publishedAt&language=en&pageSize=10&apiKey=${NEWS_API_KEY}`
  );
  
  if (!response.ok) {
    throw new Error(`News API responded with status: ${response.status}`);
  }
  
  return response.json() as Promise<NewsAPIResponse>;
}

// Function to discover new stocks from news
async function discoverStocksFromNews(): Promise<void> {
  try {
    // Search for news about emerging or trending stocks
    const queries = [
      'emerging stocks', 
      'trending stocks', 
      'breakthrough stocks',
      'small cap stocks',
      'promising startups',
      'new technology companies',
      'biotech breakthrough',
      'green energy innovations'
    ];
    
    const randomQuery = queries[Math.floor(Math.random() * queries.length)];
    const response = await fetch(
      `${NEWS_API_URL}/everything?q=${encodeURIComponent(randomQuery)}&sortBy=publishedAt&language=en&pageSize=15&apiKey=${NEWS_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`News API responded with status: ${response.status}`);
    }
    
    const data = await response.json() as NewsAPIResponse;
    
    // Extract potential stock symbols using regex (typical format is 1-5 uppercase letters)
    const symbolRegex = /\b[A-Z]{1,5}\b/g;
    const stockMentions = new Map<string, { count: number, name: string | null }>();
    
    for (const article of data.articles) {
      const content = `${article.title} ${article.description} ${article.content}`;
      const matches = content.match(symbolRegex) || [];
      
      for (const symbol of matches) {
        // Skip common English words in all caps
        if (['A', 'I', 'AM', 'PM', 'CEO', 'CFO', 'CTO', 'IPO', 'AI', 'ML'].includes(symbol)) {
          continue;
        }
        
        const current = stockMentions.get(symbol) || { count: 0, name: null };
        current.count += 1;
        
        // Try to extract company name near the symbol
        if (!current.name) {
          // Look for "CompanyName (SYMBOL)" pattern
          const nameRegex = new RegExp(`([\\w\\s]+)\\s*\\(${symbol}\\)`, 'i');
          const nameMatch = content.match(nameRegex);
          if (nameMatch && nameMatch[1]) {
            current.name = nameMatch[1].trim();
          }
        }
        
        stockMentions.set(symbol, current);
      }
    }
    
    // Filter for symbols mentioned multiple times
    const potentialStocks = Array.from(stockMentions.entries())
      .filter(([_, data]) => data.count > 1)
      .map(([symbol, data]) => ({ 
        symbol, 
        companyName: data.name || `Unknown Company (${symbol})`,
        mentionCount: data.count 
      }));
    
    // Add new stocks to storage
    for (const stock of potentialStocks) {
      const existingStock = await storage.getStockBySymbol(stock.symbol);
      
      if (!existingStock) {
        const newStock: InsertStock = {
          symbol: stock.symbol,
          companyName: stock.companyName,
          currentPrice: null,
          previousClose: null,
          priceChange: null,
          volume: null,
          marketCap: null,
          peRatio: null,
          dividendYield: null,
          sector: null,
          industry: null,
          competitors: null,
        };
        
        await storage.createStock(newStock);
        console.log(`Created new stock: ${stock.symbol} - ${stock.companyName}`);
      }
    }
  } catch (error) {
    console.error('Error discovering new stocks:', error);
  }
}

// Function to update news for all stocks
async function updateAllStockNews(): Promise<void> {
  try {
    const stocks = await storage.getStocks();
    console.log(`Updating news for ${stocks.length} stocks...`);
    
    for (const stock of stocks) {
      await updateStockNews(stock);
    }
    
    // Also discover new stocks from news
    await discoverStocksFromNews();
    
    console.log('News update completed');
  } catch (error) {
    console.error('Error updating stock news:', error);
  }
}

// Function to update news for a specific stock
async function updateStockNews(stock: Stock): Promise<void> {
  try {
    console.log(`Fetching news for ${stock.symbol} (${stock.companyName})`);
    const newsData = await fetchNewsForStock(stock.symbol, stock.companyName);
    
    if (newsData.status !== 'ok' || !newsData.articles.length) {
      console.log(`No news found for ${stock.symbol}`);
      return;
    }
    
    // Process each article
    for (const article of newsData.articles) {
      // Check if article already exists by URL
      const existingArticles = await storage.getNewsItemsByStockSymbol(stock.symbol);
      const alreadyExists = existingArticles.some(item => item.url === article.url);
      
      if (alreadyExists) {
        continue;
      }
      
      // Simple sentiment analysis (this would be replaced by AI analysis)
      const content = `${article.title} ${article.description} ${article.content || ''}`;
      let sentiment = 0;
      
      // Calculate a simple sentiment score
      const positiveWords = ['breakthrough', 'growth', 'profit', 'success', 'positive', 'soaring', 'rise', 'up', 'innovation', 'improving'];
      const negativeWords = ['risk', 'concern', 'loss', 'problem', 'negative', 'fall', 'down', 'drop', 'decline', 'struggle'];
      
      for (const word of positiveWords) {
        if (content.toLowerCase().includes(word)) sentiment += 0.1;
      }
      
      for (const word of negativeWords) {
        if (content.toLowerCase().includes(word)) sentiment -= 0.1;
      }
      
      // Clamp to range of -1 to 1
      sentiment = Math.max(-1, Math.min(1, sentiment));
      
      // Create news item
      const newsItem: InsertNewsItem = {
        title: article.title,
        content: article.description || article.content || 'No content available',
        url: article.url,
        source: article.source.name,
        publishedAt: new Date(article.publishedAt),
        stockSymbols: [stock.symbol],
        imageUrl: article.urlToImage,
        sentiment,
        sentimentDetails: { method: 'basic-keyword-analysis' }
      };
      
      await storage.createNewsItem(newsItem);
      console.log(`Added news item: ${article.title} for ${stock.symbol}`);
    }
  } catch (error) {
    console.error(`Error updating news for ${stock.symbol}:`, error);
  }
}

// Export the service functions
export const newsService = {
  updateAllStockNews,
  updateStockNews,
  discoverStocksFromNews
};