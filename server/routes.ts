import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { 
  contactSchema, 
  newsletterSchema, 
  insertStockSchema,
  insertNewsItemSchema,
  insertStockAnalysisSchema,
  insertUserWatchlistSchema,
  Stock
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { newsService } from "./services/newsService";
import { browserScrapingService } from "./services/browserScrapingService";
import { simpleBrowserService } from "./services/simpleBrowserService"; 
import { redditService } from "./services/redditService";
import { localAnalysisService } from "./services/localAnalysisService";
import { newsAggregationService } from "./services/newsAggregationService";
import { alphaVantageService } from "./services/alphaVantageService";
import { googleNewsScrapingService } from "./services/googleNewsScrapingService";
import { deepseekAiService } from "./services/deepseekAiService";
import { getTopLosers, getDeepseekInfo } from "./services/yfinanceAdapter";
import { hnService } from "./services/hnService";
import { trendingScrapeService } from "./services/trendingScrapeService";
import { techmemeService } from "./services/techmemeService";
import { lobstersService } from "./services/lobstersService";
import { techcrunchService } from "./services/techcrunchService";
import { cnbcService } from "./services/cnbcService";
import { reutersService } from "./services/reutersService";
import { googleNewsRssService, googleNewsOnDemand } from "./services/googleNewsRssService";
import { fiercebiotechService } from "./services/fiercebiotechService";
import { nasaService } from "./services/nasaService";
import { esaService } from "./services/esaService";
import { spacenewsService } from "./services/spacenewsService";
import { eetimesService } from "./services/eetimesService";
import { semiengineeringService } from "./services/semiengineeringService";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

// Lazy load storage to avoid initialization issues in serverless environments
let storageInstance: any = null;

async function getStorage(loadSampleData = false) {
  if (!storageInstance) {
    console.log('[Vercel] Lazy loading storage instance...');
    try {
      console.log('[Vercel] Attempting to import storage module...');
      const storageModule = await import("./storage");
      console.log('[Vercel] Storage module imported:', typeof storageModule);
      console.log('[Vercel] Storage module keys:', Object.keys(storageModule));
      
      if (!storageModule.storage) {
        throw new Error('Storage module does not export a storage instance');
      }
      
      storageInstance = storageModule.storage;
      console.log('[Vercel] Storage instance assigned:', typeof storageInstance);
      
      // Optionally load sample data asynchronously
      if (loadSampleData && storageInstance.initializeAsync) {
        console.log('[Vercel] Loading sample data...');
        await storageInstance.initializeAsync();
      }
      
      console.log('[Vercel] Storage instance loaded successfully');
    } catch (error) {
      console.error('[Vercel] Failed to load storage:', error);
      console.error('[Vercel] Error stack:', error.stack);
      throw error;
    }
  }
  return storageInstance;
}

// Setup data refresh interval (30 seconds)
let updateInterval: NodeJS.Timeout;

function startDataUpdateInterval() {
  if (updateInterval) {
    clearInterval(updateInterval);
  }
  
  // Initial update
  performDataUpdate();
  
  // Setup interval for every 30 seconds
  updateInterval = setInterval(performDataUpdate, 30000);
  console.log("Data update interval started: every 30 seconds");
}

async function performDataUpdate() {
  try {
    console.log("Performing scheduled data update...");
    
    // Ensure NASDAQ stocks are loaded
    await simpleBrowserService.loadNasdaqStocks();
    
    // Ingest real news via NewsAPI sparingly to avoid rate limits
    try {
      const currentTime = new Date();
      if (currentTime.getMinutes() % 30 === 0) {
        await newsService.updateAllStockNews();
      }
    } catch (e) {
      console.error("Error updating NewsAPI articles:", e);
    }

    // Scrape finance sites by ticker using headless browser (throttled)
    try {
      const currentTime = new Date();
      if (currentTime.getMinutes() % 10 === 0) {
        await browserScrapingService.updateAllStockNews();
      }
    } catch (e) {
      console.error("Error updating scraped articles:", e);
    }
    
    // Ingest real-time posts from Reddit
    try {
      const result = await redditService.updateRecentPosts();
      console.log(`Reddit ingestion added ~${result.ingested} items`);
    } catch (e) {
      console.error("Error updating Reddit posts:", e);
    }
    // Ingest Hacker News discussions
    try {
      const hn = await hnService.updateRecentStories();
      console.log(`Hacker News ingestion added ~${hn.ingested} items`);
    } catch (e) {
      console.error("Error updating HN stories:", e);
    }

    // Ingest trending items across Reddit hot and HN front page
    try {
      const tr = await trendingScrapeService.updateTrendingNews();
      console.log(`Trending ingestion added ~${tr.ingested} items`);
    } catch (e) {
      console.error("Error updating trending news:", e);
    }

    // Ingest Techmeme RSS (early tech signals)
    try {
      const tm = await techmemeService.updateTechmeme();
      console.log(`Techmeme ingestion added ~${tm.ingested} items`);
    } catch (e) {
      console.error("Error updating Techmeme feed:", e);
    }

    // Ingest Lobsters RSS (developer news)
    try {
      const lb = await lobstersService.updateLobsters();
      console.log(`Lobsters ingestion added ~${lb.ingested} items`);
    } catch (e) {
      console.error("Error updating Lobsters feed:", e);
    }

    // Ingest TechCrunch RSS
    try {
      const tc = await techcrunchService.updateTechcrunch();
      console.log(`TechCrunch ingestion added ~${tc.ingested} items`);
    } catch (e) {
      console.error("Error updating TechCrunch feed:", e);
    }

    // Ingest CNBC Top News RSS
    try {
      const cb = await cnbcService.updateCnbc();
      console.log(`CNBC ingestion added ~${cb.ingested} items`);
    } catch (e) {
      console.error("Error updating CNBC feed:", e);
    }

    // Ingest Reuters Markets RSS
    try {
      const rt = await reutersService.updateReuters();
      console.log(`Reuters ingestion added ~${rt.ingested} items`);
    } catch (e) {
      console.error("Error updating Reuters feed:", e);
    }

    try {
      const gn = await googleNewsRssService.updateGoogleNews();
      console.log(`Google News RSS ingestion added ~${gn.ingested} items`);
    } catch (e) {
      console.error("Error updating Google News RSS feed:", e);
    }

    try {
      const fb = await fiercebiotechService.updateFiercebiotech();
      console.log(`FierceBiotech ingestion added ~${fb.ingested} items`);
    } catch (e) {
      console.error("Error updating FierceBiotech feed:", e);
    }

    try {
      const ns = await nasaService.updateNasa();
      console.log(`NASA ingestion added ~${ns.ingested} items`);
    } catch (e) {
      console.error("Error updating NASA feed:", e);
    }

    try {
      const es = await esaService.updateEsa();
      console.log(`ESA ingestion added ~${es.ingested} items`);
    } catch (e) {
      console.error("Error updating ESA feed:", e);
    }

    try {
      const sn = await spacenewsService.updateSpacenews();
      console.log(`SpaceNews ingestion added ~${sn.ingested} items`);
    } catch (e) {
      console.error("Error updating SpaceNews feed:", e);
    }

    try {
      const et = await eetimesService.updateEetimes();
      console.log(`EE Times ingestion added ~${et.ingested} items`);
    } catch (e) {
      console.error("Error updating EE Times feed:", e);
    }

    try {
      const se = await semiengineeringService.updateSemiengineering();
      console.log(`SemiEngineering ingestion added ~${se.ingested} items`);
    } catch (e) {
      console.error("Error updating SemiEngineering feed:", e);
    }
    
    // Update stock prices using Alpha Vantage for real-time data
    // This happens less frequently due to API rate limits (every 3 cycles)
    const currentTime = new Date();
    if (currentTime.getMinutes() % 3 === 0) {
      console.log("Updating real-time stock prices from Alpha Vantage...");
      try {
        await alphaVantageService.updateStockPrices();
      } catch (priceError) {
        console.error("Error updating real-time prices:", priceError);
      }
    }
    
    // Generate analyses from recent breaking news across categories
    try {
      const ag = await newsAggregationService.generateAnalysesFromRecentNews();
      console.log(`Aggregated analyses created/updated: ~${ag.analyzed}`);
    } catch (e) {
      console.error("Error generating aggregated analyses:", e);
    }
    
    console.log("Scheduled data update completed");
  } catch (error) {
    console.error("Error during scheduled data update:", error);
  }
}

// Helper function to convert rating to recommendation
function getRatingRecommendation(rating: number): string {
  if (rating >= 9) return "Strong Buy";
  if (rating >= 7) return "Buy";
  if (rating >= 5) return "Hold";
  if (rating >= 3) return "Sell";
  return "Strong Sell";
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Start the periodic data updates (skip on Vercel serverless)
  if (!process.env.VERCEL) {
    startDataUpdateInterval();
  }

  // API routes for form submissions
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = contactSchema.parse(req.body);
      const storage = await getStorage();
      const contactSubmission = await storage.createContactSubmission(validatedData);
      return res.status(200).json({ success: true, data: contactSubmission });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          success: false, 
          message: validationError.message 
        });
      }
      return res.status(500).json({ 
        success: false, 
        message: "Failed to submit contact form" 
      });
    }
  });

  app.post("/api/newsletter", async (req, res) => {
    try {
      const validatedData = newsletterSchema.parse(req.body);
      const storage = await getStorage();
      const newsletterSubscription = await storage.createNewsletterSubscription(validatedData);
      return res.status(200).json({ success: true, data: newsletterSubscription });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          success: false, 
          message: validationError.message 
        });
      }
      return res.status(500).json({ 
        success: false, 
        message: "Failed to subscribe to newsletter" 
      });
    }
  });
  
  // Stock Analysis API routes
  
  // Get all stocks
  app.get("/api/stocks", async (req, res) => {
    try {
      const storage = await getStorage();
      const stocks = await storage.getStocks();
      return res.status(200).json({ success: true, data: stocks });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Failed to fetch stocks" });
    }
  });
  
  // Get biggest losers sorted by price change percent (negative values)
  // NOTE: This must come BEFORE the /api/stocks/:symbol route!
  app.get("/api/stocks/biggest-losers", async (req, res) => {
    console.log("Received request to /api/stocks/biggest-losers");
    try {
      // Using the new YFinance data for the Biggest Losers page
      try {
        console.log("Fetching real-time losers data using simple yfinance service...");
        const industry = req.query.industry as string | undefined;
        
        console.log(`Industry filter: ${industry || 'none'}`);
        
        // Use our simple service directly
        console.log("About to run the yfinance service...");
        const yfinanceResult: any = await getTopLosers(industry || null, 50);
        console.log("Python script result:", JSON.stringify(yfinanceResult).substring(0, 100) + '...');
        
        if (yfinanceResult && yfinanceResult.success && yfinanceResult.data) {
          console.log(`Got ${yfinanceResult.data.length} stocks from yfinance service`);
          
          // Get unique list of industries for filtering from the yfinance data
          const industriesSet = new Set<string>();
          yfinanceResult.data.forEach((stock: {industry?: string}) => {
            if (stock.industry) {
              industriesSet.add(stock.industry);
            }
          });
          const industries = yfinanceResult.industries || Array.from(industriesSet);
          
          return res.status(200).json({ 
            success: true, 
            data: yfinanceResult.data,
            industries: industries,
            source: "yfinance"
          });
        } else {
          console.log("YFinance result was not successful:", yfinanceResult);
        }
      } catch (yfinanceError) {
        console.error("Error using yfinance, falling back to database:", yfinanceError);
      }
      
      // Fallback to database if yfinance fails
      const industry = req.query.industry as string | undefined;
      let stocks = await storage.getStocks();
      
      // Check if we have any stocks
      if (!stocks || stocks.length === 0) {
        return res.status(200).json({ 
          success: true, 
          data: [],
          industries: [],
          message: "No stock data available",
          source: "database"
        });
      }
      
      // Filter by industry if specified
      if (industry && industry !== 'all') {
        stocks = stocks.filter(stock => stock.industry === industry);
      }
      
      // Sort by price change (ascending = biggest losers first)
      stocks = stocks.sort((a, b) => 
        (a.priceChangePercent || 0) - (b.priceChangePercent || 0)
      );
      
      // Return only losers (negative price change)
      const losers = stocks.filter(stock => 
        (stock.priceChangePercent || 0) < 0
      );
      
      // Get unique list of industries for filtering
      const industriesSet = new Set<string>();
      stocks.forEach(stock => {
        if (stock.industry) {
          industriesSet.add(stock.industry);
        }
      });
      const industries = Array.from(industriesSet);
      
      // Return at most 50 results
      const results = losers.slice(0, 50);
      
      return res.status(200).json({ 
        success: true, 
        data: results,
        industries: industries,
        source: "database"
      });
    } catch (error) {
      console.error("Error in /api/stocks/biggest-losers endpoint:", error);
      return res.status(500).json({ success: false, message: 'Failed to fetch biggest losers' });
    }
  });
  
  // Get single stock by symbol
  app.get("/api/stocks/:symbol", async (req, res) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      
      // Try to get real-time data from YFinance first
      try {
        const result = await getDeepseekInfo(symbol) as { 
          success: boolean; 
          data?: { 
            symbol: string;
            name: string;
            currentPrice: number;
            previousClose: number;
            priceChange: number;
            priceChangePercent: number;
            industry: string;
            sector: string;
            marketCap: number;
            news: any[];
            [key: string]: any;
          };
          message?: string;
        };
        
        if (result && result.success && result.data) {
          return res.status(200).json({ 
            success: true, 
            data: result.data,
            source: "yfinance"
          });
        }
      } catch (yfinanceError) {
        console.error("Error getting YFinance data:", yfinanceError);
      }
      
      // Fallback to database if YFinance fails
      const stock = await storage.getStockBySymbol(symbol);
      if (!stock) {
        return res.status(404).json({ success: false, message: "Stock not found" });
      }
      return res.status(200).json({ 
        success: true, 
        data: stock,
        source: "database"
      });
    } catch (error) {
      console.error("Error fetching stock details:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch stock" });
    }
  });
  
  // Get all news items (most recent first)
  app.get("/api/news", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const news = await storage.getNewsItems(limit);
      return res.status(200).json({ success: true, data: news });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Failed to fetch news" });
    }
  });
  
  // Get news items for a specific stock
  app.get("/api/news/stock/:symbol", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 25;
      const windowHours = req.query.windowHours ? parseInt(req.query.windowHours as string) : 48;
      const symbol = req.params.symbol.toUpperCase();
      let news = await storage.getNewsItemsByStockSymbol(symbol, limit);

      if (news.length < limit) {
        const stock = await storage.getStockBySymbol(symbol);
        const recent = await storage.getNewsItems(500);
        const companyName = (stock?.companyName || '').toLowerCase();
        const exists = new Set(news.map(n => n.id));
        for (const n of recent) {
          if (exists.has(n.id)) continue;
          const text = `${n.title} ${n.content}`;
          const upper = text.toUpperCase();
          const lower = text.toLowerCase();
          const hasTicker = upper.includes(symbol);
          const hasName = companyName && lower.includes(companyName);
          if (hasTicker || hasName) {
            news.push(n);
            if (news.length >= limit) break;
          }
        }
        news = news.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()).slice(0, limit);
        if (news.length < limit && stock) {
          await googleNewsOnDemand.updateForSymbol(symbol, stock.companyName, 10);
          const refreshed = await storage.getNewsItemsByStockSymbol(symbol, limit);
          if (refreshed.length > news.length) news = refreshed;
        }
      }

      const cutoff = Date.now() - windowHours * 60 * 60 * 1000;
      const relevant = news.filter(n => {
        const text = `${n.title} ${n.content}`;
        const upper = text.toUpperCase();
        const recent = n.publishedAt.getTime() >= cutoff;
        const hasTicker = upper.includes(symbol);
        const tagged = Array.isArray((n as any).stockSymbols) && (n as any).stockSymbols.includes(symbol);
        return recent && (hasTicker || tagged);
      });
      const nonGoogle = relevant.filter(n => n.source !== 'Google News RSS');
      const google = relevant.filter(n => n.source === 'Google News RSS');
      const combined = [...nonGoogle, ...google].slice(0, limit);

      return res.status(200).json({ success: true, data: combined });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Failed to fetch stock news" });
    }
  });
  
  // Get all stock analyses (most recent first)
  app.get("/api/analyses", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const analyses = await storage.getStockAnalyses(limit);
      return res.status(200).json({ success: true, data: analyses });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Failed to fetch analyses" });
    }
  });
  
  // Get stock analysis for a specific stock
  app.get("/api/analyses/stock/:symbol", async (req, res) => {
    try {
      const analysis = await storage.getStockAnalysisBySymbol(req.params.symbol);
      if (!analysis) {
        return res.status(404).json({ success: false, message: "Analysis not found" });
      }
      return res.status(200).json({ success: true, data: analysis });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Failed to fetch analysis" });
    }
  });

  // Get top-rated stock analyses
  app.get("/api/analyses/top", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      console.log(`[Vercel] Fetching top ${limit} stock picks with real AI analysis...`);
      
      // Get the storage instance
      const storage = await getStorage();
      
      // Get the top picks with highest potential rating
      console.log(`[Vercel] Calling storage.getTopRatedStockAnalyses with limit ${limit}`);
      let topAnalyses;
      try {
        topAnalyses = await storage.getTopRatedStockAnalyses(limit);
        console.log(`[Vercel] Found ${topAnalyses.length} top-rated stock analyses`);
      } catch (methodError) {
        console.error(`[Vercel] Error calling getTopRatedStockAnalyses:`, methodError);
        console.error(`[Vercel] Method error stack:`, methodError.stack);
        throw methodError;
      }
      
      // Transform the data to include more stock information
      console.log(`[Vercel] Transforming data for ${topAnalyses.length} analyses`);
      const analyses = await Promise.all(topAnalyses.map(async (analysis) => {
        console.log(`[Vercel] Processing analysis for ${analysis.stockSymbol}`);
        
        // Get the corresponding stock info
        const stock = await storage.getStockBySymbol(analysis.stockSymbol);
        console.log(`[Vercel] Retrieved stock data for ${analysis.stockSymbol}:`, stock ? 'found' : 'not found');
        
        // Fetch the latest news for this stock for evidence sources
        const latestNews = await storage.getNewsItemsByStockSymbol(analysis.stockSymbol, 3);
        console.log(`[Vercel] Retrieved ${latestNews.length} news items for ${analysis.stockSymbol}`);
        
        return {
          ...analysis,
          currentPrice: stock?.currentPrice,
          previousClose: stock?.previousClose,
          priceChange: stock?.priceChange,
          priceChangePercent: stock?.priceChangePercent,
          sector: stock?.sector,
          industry: stock?.industry,
          relatedNews: latestNews.map(news => ({
            id: news.id,
            title: news.title,
            source: news.source,
            publishedAt: news.publishedAt
          })),
          recommendation: getRatingRecommendation(analysis.potentialRating)
        };
      }));
      
      console.log(`[Vercel] Returning ${analyses.length} top picks with real AI analysis`);
      return res.status(200).json({ success: true, data: analyses });
    } catch (error) {
      console.error("[Vercel] Error fetching top analyses:", error);
      console.error("[Vercel] Error stack:", error.stack);
      return res.status(500).json({ success: false, message: "Failed to fetch top analyses", error: error.message });
    }
  });
  
  // Create a new stock (for testing purposes)
  app.post("/api/stocks", async (req, res) => {
    try {
      const validatedData = insertStockSchema.parse(req.body);
      const stock = await storage.createStock(validatedData);
      return res.status(201).json({ success: true, data: stock });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ success: false, message: validationError.message });
      }
      return res.status(500).json({ success: false, message: "Failed to create stock" });
    }
  });

  // Create a new news item (for testing purposes)
  app.post("/api/news", async (req, res) => {
    try {
      const validatedData = insertNewsItemSchema.parse(req.body);
      const newsItem = await storage.createNewsItem(validatedData);
      return res.status(201).json({ success: true, data: newsItem });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ success: false, message: validationError.message });
      }
      return res.status(500).json({ success: false, message: "Failed to create news item" });
    }
  });

  // Create a new stock analysis (for testing purposes)
  app.post("/api/analyses", async (req, res) => {
    try {
      const validatedData = insertStockAnalysisSchema.parse(req.body);
      const analysis = await storage.createStockAnalysis(validatedData);
      return res.status(201).json({ success: true, data: analysis });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ success: false, message: validationError.message });
      }
      return res.status(500).json({ success: false, message: "Failed to create analysis" });
    }
  });

  const server = createServer(app);

  return server;
}
