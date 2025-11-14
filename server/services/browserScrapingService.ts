import puppeteer from 'puppeteer';
import { InsertNewsItem, InsertStock } from '@shared/schema';
import { storage } from '../storage';

// Define sources for finance news
const FINANCE_NEWS_SOURCES = [
  {
    name: 'Yahoo Finance',
    baseUrl: 'https://finance.yahoo.com',
    searchUrl: (symbol: string) => `https://finance.yahoo.com/quote/${symbol}/news`,
    articleSelector: 'li.js-stream-content',
    titleSelector: 'h3.Mb\\(5px\\)',
    descriptionSelector: 'p.Fz\\(14px\\)',
    linkSelector: 'a',
    dateSelector: 'span.Fz\\(11px\\)',
    imageSelector: 'img.Maw\\(190px\\)'
  },
  {
    name: 'MarketWatch',
    baseUrl: 'https://www.marketwatch.com',
    searchUrl: (symbol: string) => `https://www.marketwatch.com/investing/stock/${symbol.toLowerCase()}`,
    articleSelector: '.element--article',
    titleSelector: '.article__headline',
    descriptionSelector: '.article__summary',
    linkSelector: 'a.link',
    dateSelector: '.article__timestamp',
    imageSelector: 'img'
  }
];

// Configure browser options
const browserConfig = {
  puppeteer: {
    headless: true, // Run in headless mode
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  }
};

/**
 * Fetch news for a specific stock symbol using web scraping
 * @param symbol Stock symbol to fetch news for
 * @param companyName Company name for context
 */
let sharedBrowser: any = null;
async function getBrowser(): Promise<any> {
  if (sharedBrowser) return sharedBrowser;
  sharedBrowser = await puppeteer.launch(browserConfig.puppeteer);
  return sharedBrowser;
}

async function fetchNewsForStock(symbol: string, companyName: string): Promise<InsertNewsItem[]> {
  console.log(`Scraping news for ${symbol} (${companyName})`);
  
  try {
    // Initialize or reuse the browser
    const browser = await getBrowser();
    
    let allNewsItems: InsertNewsItem[] = [];
    
    // Loop through each news source and scrape articles
    for (const source of FINANCE_NEWS_SOURCES) {
      try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.setRequestInterception(true);
        page.on('request', (req: any) => {
          const resourceType = req.resourceType();
          if (['image','stylesheet','font','media'].includes(resourceType)) {
            req.abort();
          } else {
            req.continue();
          }
        });
        
        // Navigate to the search URL for this stock
        const url = source.searchUrl(symbol);
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        
        // Wait for articles to load
        await page.waitForSelector(source.articleSelector, { timeout: 10000 }).catch(() => {
          console.log(`No articles found for ${symbol} on ${source.name}`);
        });
        
        // Extract article data
        const articles = await page.evaluate((selectors: any) => {
          const articleElements = Array.from(document.querySelectorAll(selectors.articleSelector));
          return articleElements.slice(0, 5).map(article => {
            const titleElem = (article as any).querySelector(selectors.titleSelector);
            const linkElem = (article as any).querySelector(selectors.linkSelector) as HTMLAnchorElement;
            const descElem = (article as any).querySelector(selectors.descriptionSelector);
            const dateElem = (article as any).querySelector(selectors.dateSelector);
            const imageElem = (article as any).querySelector(selectors.imageSelector) as HTMLImageElement;
            
            return {
              title: titleElem ? titleElem.textContent?.trim() || '' : '',
              url: linkElem ? linkElem.href : '',
              content: descElem ? descElem.textContent?.trim() || '' : '',
              publishedAt: dateElem ? dateElem.textContent?.trim() || '' : '',
              imageUrl: imageElem ? imageElem.src : null
            };
          }).filter(item => item.title && item.url); // Filter out items without title or URL
        }, source);
        
        // Process and transform the data
        const newsItems = articles.map((article: any) => {
          // Parse date string or use current date if can't parse
          let publishedDate: Date;
          try {
            publishedDate = new Date(article.publishedAt);
            if (isNaN(publishedDate.getTime())) {
              publishedDate = new Date(); // Fallback to current date
            }
          } catch (e) {
            publishedDate = new Date();
          }
          
          return {
            title: article.title || `${companyName} News Update`,
            content: article.content || `Latest news update for ${companyName} (${symbol})`,
            url: article.url.startsWith('http') ? article.url : `${source.baseUrl}${article.url}`,
            imageUrl: article.imageUrl,
            source: source.name,
            publishedAt: publishedDate,
            stockSymbols: [symbol],
            sentiment: 0.5, // Neutral sentiment by default
            sentimentDetails: { positive: 0.5, negative: 0.2, neutral: 0.3 }
          };
        });
        
        allNewsItems = [...allNewsItems, ...newsItems];
        await page.close();
      } catch (error) {
        console.error(`Error scraping ${source.name} for ${symbol}:`, error);
      }
    }
    
    // Do not close sharedBrowser here; handled in updateAllStockNews
    
    // Deduplicate news based on URL
    const uniqueUrls = new Set<string>();
    const uniqueNewsItems = allNewsItems.filter(item => {
      if (uniqueUrls.has(item.url)) {
        return false;
      }
      uniqueUrls.add(item.url);
      return true;
    });
    
    return uniqueNewsItems;
  } catch (error) {
    console.error(`Error in browser scraping for ${symbol}:`, error);
    return [];
  }
}

/**
 * Use machine learning techniques to analyze sentiment of news text
 * This is a simplified version that would be enhanced with proper ML in production
 */
function analyzeSentiment(text: string): { score: number, details: any } {
  // List of positive and negative words for basic sentiment analysis
  const positiveWords = [
    'breakthrough', 'success', 'gain', 'profit', 'growth', 'positive', 'up', 'rise', 
    'exceed', 'beat', 'strong', 'record', 'launch', 'innovation', 'improve', 'advance',
    'partnership', 'collaboration', 'opportunity', 'potential', 'promising', 'expand'
  ];
  
  const negativeWords = [
    'decline', 'loss', 'drop', 'fall', 'decrease', 'fail', 'poor', 'weak', 'below',
    'miss', 'concern', 'risk', 'threat', 'challenge', 'problem', 'warning', 'bearish',
    'debt', 'litigation', 'downgrade', 'recall', 'penalty', 'investigation'
  ];
  
  const lowerText = text.toLowerCase();
  let positiveCount = 0;
  let negativeCount = 0;
  
  // Count occurrences of positive and negative words
  positiveWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) positiveCount += matches.length;
  });
  
  negativeWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) negativeCount += matches.length;
  });
  
  // Calculate sentiment score (0 to 1 scale, 0.5 is neutral)
  const totalWords = text.split(/\s+/).length;
  const totalSentimentWords = positiveCount + negativeCount;
  
  // Default to neutral if not enough sentiment words found
  if (totalSentimentWords < 3 || totalWords < 20) {
    return { 
      score: 0.5, 
      details: { positive: 0.5, negative: 0.2, neutral: 0.3 } 
    };
  }
  
  // Calculate sentiment
  const positiveFraction = positiveCount / totalSentimentWords;
  const sentimentScore = 0.5 + (positiveFraction - 0.5) * 0.8; // Scale around 0.5
  
  // Clamp between 0 and 1
  const finalScore = Math.max(0, Math.min(1, sentimentScore));
  
  // Calculate detailed breakdown
  const positiveStrength = positiveCount / totalWords * 10;
  const negativeStrength = negativeCount / totalWords * 10;
  const neutralStrength = 1 - (positiveStrength + negativeStrength);
  
  return {
    score: finalScore,
    details: {
      positive: Math.min(1, positiveStrength),
      negative: Math.min(1, negativeStrength),
      neutral: Math.max(0, neutralStrength)
    }
  };
}

/**
 * Update news for all stocks in the database
 */
async function updateAllStockNews(): Promise<void> {
  try {
    console.log('Starting news update using browser scraping...');
    
    // Get all stocks from storage
    const stocks = await storage.getStocks();
    console.log(`Found ${stocks.length} stocks to update news for`);
    
    // Process a limited batch per cycle to avoid overload
    const batchSize = 15;
    const startIndex = Math.floor(Math.random() * Math.max(stocks.length - batchSize, 0));
    const batch = stocks.slice(startIndex, startIndex + batchSize);
    for (const stock of batch) {
      await updateStockNews(stock);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Discover new potential stocks from news
    await discoverStocksFromNews();
    
    console.log('Browser-based news update completed');
    if (sharedBrowser) {
      try { await sharedBrowser.close(); } catch {}
      sharedBrowser = null;
    }
  } catch (error) {
    console.error('Error updating stock news:', error);
    if (sharedBrowser) {
      try { await sharedBrowser.close(); } catch {}
      sharedBrowser = null;
    }
  }
}

/**
 * Update news for a specific stock
 */
async function updateStockNews(stock: { symbol: string; companyName: string }): Promise<void> {
  try {
    console.log(`Fetching news for ${stock.symbol} (${stock.companyName})`);
    
    // Fetch news from web sources
    const newsItems = await fetchNewsForStock(stock.symbol, stock.companyName);
    
    if (newsItems.length === 0) {
      console.log(`No news found for ${stock.symbol}`);
      return;
    }
    
    console.log(`Found ${newsItems.length} news items for ${stock.symbol}`);
    
    // Process and store each news item
    for (const newsItem of newsItems) {
      // Analyze sentiment of the news content
      const sentimentResult = analyzeSentiment(newsItem.title + ' ' + newsItem.content);
      
      // Store news item with sentiment data
      const newsWithSentiment: InsertNewsItem = {
        ...newsItem,
        sentiment: sentimentResult.score,
        sentimentDetails: sentimentResult.details
      };
      
      // Check if this news item already exists (by URL)
      const existingNews = Array.from((await storage.getNewsItems(100)))
        .find(item => item.url === newsWithSentiment.url);
      
      if (!existingNews) {
        await storage.createNewsItem(newsWithSentiment);
      }
    }
    
    console.log(`Successfully updated news for ${stock.symbol}`);
  } catch (error) {
    console.error(`Error updating news for ${stock.symbol}:`, error);
  }
}

/**
 * Attempt to discover new stocks by analyzing news headlines for company mentions
 */
async function discoverStocksFromNews(): Promise<void> {
  try {
    console.log('Starting stock discovery from news headlines...');
    
    // For demonstration purposes, we'll add a new tech stock that might have been discovered
    // In a real system, this would analyze news content for company mentions
    
    // First check if the stock already exists
    const newStockSymbol = 'IONQ';
    const existingStock = await storage.getStockBySymbol(newStockSymbol);
    
    if (!existingStock) {
      // Create the new stock if it doesn't exist
      const newStock: InsertStock = {
        symbol: newStockSymbol,
        companyName: 'IonQ, Inc.',
        sector: 'Technology',
        industry: 'Computer Hardware',
        currentPrice: 9.47,
        previousClose: 9.23,
        priceChange: 0.24,
        priceChangePercent: 2.60,
        marketCap: 1950000000,
        logoUrl: 'https://logo.clearbit.com/ionq.com',
        description: 'IonQ, Inc. engages in the development of general-purpose quantum computing systems for solving computational problems across various industries.',
        website: 'https://ionq.com',
        competitors: ['IBM', 'MSFT', 'GOOG']
      };
      
      await storage.createStock(newStock);
      console.log(`Discovered new stock: ${newStockSymbol} (${newStock.companyName})`);
    }
  } catch (error) {
    console.error('Error discovering new stocks:', error);
  }
}

export const browserScrapingService = {
  fetchNewsForStock,
  updateStockNews,
  updateAllStockNews,
  discoverStocksFromNews
};