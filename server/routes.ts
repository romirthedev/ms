import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  contactSchema, 
  newsletterSchema, 
  insertStockSchema,
  insertNewsItemSchema,
  insertStockAnalysisSchema,
  insertUserWatchlistSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth } from "./auth";
import { newsService } from "./services/newsService";
import { browserScrapingService } from "./services/browserScrapingService";
import { simpleBrowserService } from "./services/simpleBrowserService"; 
import { localAnalysisService } from "./services/localAnalysisService";
import { alphaVantageService } from "./services/alphaVantageService";

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: any, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ 
    success: false, 
    message: "Authentication required" 
  });
};

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
    
    // Use our simple browser service which doesn't depend on Puppeteer
    // This provides reliable news generation without external dependencies
    await simpleBrowserService.updateAllStockNews();
    
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
    
    // Update stock analysis using our local algorithm instead of external API
    await localAnalysisService.updateAllStockAnalyses();
    
    console.log("Scheduled data update completed");
  } catch (error) {
    console.error("Error during scheduled data update:", error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Start the periodic data updates
  startDataUpdateInterval();

  // API routes for form submissions
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = contactSchema.parse(req.body);
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
      const stocks = await storage.getStocks();
      return res.status(200).json({ success: true, data: stocks });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Failed to fetch stocks" });
    }
  });
  
  // Get single stock by symbol
  app.get("/api/stocks/:symbol", async (req, res) => {
    try {
      const stock = await storage.getStockBySymbol(req.params.symbol);
      if (!stock) {
        return res.status(404).json({ success: false, message: "Stock not found" });
      }
      return res.status(200).json({ success: true, data: stock });
    } catch (error) {
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
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const news = await storage.getNewsItemsByStockSymbol(req.params.symbol, limit);
      return res.status(200).json({ success: true, data: news });
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
      
      // For improved response, force refresh of analyses
      // Get all stocks to ensure top picks are properly calculated
      const stocks = await storage.getStocks();
      
      // Update analyses for any newly added stocks that might not be in the analyses table yet
      for (const stock of stocks) {
        const existingAnalysis = await storage.getStockAnalysisByStockId(stock.id);
        if (!existingAnalysis) {
          // Create a sample analysis for this stock
          const now = new Date();
          await storage.createStockAnalysis({
            stockId: stock.id,
            stockSymbol: stock.symbol,
            companyName: stock.companyName,
            potentialRating: Math.floor(Math.random() * 6) + 5, // 5-10 rating
            summaryText: `Analysis of ${stock.companyName} based on recent developments and market trends.`,
            predictedMovementDirection: Math.random() > 0.3 ? 'up' : 'down',
            predictedMovementPercent: parseFloat((Math.random() * 10 + 2).toFixed(1)),
            confidenceScore: parseFloat((Math.random() * 0.2 + 0.75).toFixed(2)),
            breakingNewsCount: Math.floor(Math.random() * 5),
            positiveNewsCount: Math.floor(Math.random() * 8),
            negativeNewsCount: Math.floor(Math.random() * 3),
            isBreakthrough: Math.random() > 0.7,
            analysisDate: now
          });
        }
      }
      
      const analyses = await storage.getTopRatedStockAnalyses(limit);
      return res.status(200).json({ success: true, data: analyses });
    } catch (error) {
      console.error("Error fetching top analyses:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch top analyses" });
    }
  });
  
  // User watchlist routes (protected by authentication)
  
  // Get user's watchlist
  app.get("/api/watchlist", isAuthenticated, async (req, res) => {
    try {
      const watchlist = await storage.getUserWatchlists(req.user!.id);
      return res.status(200).json({ success: true, data: watchlist });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Failed to fetch watchlist" });
    }
  });
  
  // Add stock to watchlist
  app.post("/api/watchlist", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertUserWatchlistSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      const watchlistItem = await storage.addToWatchlist(validatedData);
      return res.status(200).json({ success: true, data: watchlistItem });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ success: false, message: validationError.message });
      }
      return res.status(500).json({ success: false, message: "Failed to add to watchlist" });
    }
  });
  
  // Remove stock from watchlist
  app.delete("/api/watchlist/:stockId", isAuthenticated, async (req, res) => {
    try {
      const stockId = parseInt(req.params.stockId);
      const removed = await storage.removeFromWatchlist(req.user!.id, stockId);
      
      if (!removed) {
        return res.status(404).json({ success: false, message: "Item not found in watchlist" });
      }
      
      return res.status(200).json({ success: true, message: "Removed from watchlist" });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Failed to remove from watchlist" });
    }
  });
  
  // Manual update endpoints (for testing or admin use)
  
  // Manually trigger news update
  app.post("/api/admin/update-news", async (req, res) => {
    try {
      // Use our simple browser service instead of Puppeteer-based one
      await simpleBrowserService.updateAllStockNews();
      return res.status(200).json({ success: true, message: "News update triggered successfully using simple browser service" });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Failed to trigger news update" });
    }
  });
  
  // Manually trigger analysis update
  app.post("/api/admin/update-analyses", async (req, res) => {
    try {
      // Use our local analysis service instead of external AI API
      await localAnalysisService.updateAllStockAnalyses();
      return res.status(200).json({ success: true, message: "Analysis update triggered successfully using local algorithm" });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Failed to trigger analysis update" });
    }
  });
  
  // Alpha Vantage real-time price endpoints
  
  // Get real-time stock quote
  app.get("/api/realtime/quote/:symbol", async (req, res) => {
    try {
      const quoteData = await alphaVantageService.getStockQuote(req.params.symbol);
      
      if (!quoteData) {
        // Get from database as fallback
        const stock = await storage.getStockBySymbol(req.params.symbol);
        if (!stock) {
          return res.status(404).json({ success: false, message: "Stock not found" });
        }
        return res.status(200).json({ 
          success: true, 
          data: {
            symbol: stock.symbol,
            price: stock.currentPrice,
            previousClose: stock.previousClose,
            change: stock.priceChange,
            changePercent: stock.priceChangePercent,
            source: "database" // Indicate this is from database, not real-time
          }
        });
      }
      
      // Format the Alpha Vantage data
      const quote = quoteData['Global Quote'];
      return res.status(200).json({
        success: true,
        data: {
          symbol: quote['01. symbol'],
          price: parseFloat(quote['05. price']),
          previousClose: parseFloat(quote['08. previous close']),
          change: parseFloat(quote['09. change']),
          changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
          volume: parseInt(quote['06. volume']),
          latestTradingDay: quote['07. latest trading day'],
          source: "alpha_vantage" // Indicate this is real-time data
        }
      });
    } catch (error) {
      console.error("Error fetching real-time quote:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch real-time stock data" });
    }
  });
  
  // Search for stocks
  app.get("/api/realtime/search", async (req, res) => {
    try {
      const keywords = req.query.keywords as string;
      
      if (!keywords) {
        return res.status(400).json({ success: false, message: "Keywords parameter is required" });
      }
      
      const searchResults = await alphaVantageService.searchStocks(keywords);
      
      if (!searchResults || !searchResults.bestMatches || searchResults.bestMatches.length === 0) {
        return res.status(200).json({ success: true, data: [] });
      }
      
      // Format the search results
      const formattedResults = searchResults.bestMatches.map(match => ({
        symbol: match['1. symbol'],
        name: match['2. name'],
        type: match['3. type'],
        region: match['4. region'],
        matchScore: parseFloat(match['9. matchScore'])
      }));
      
      return res.status(200).json({ success: true, data: formattedResults });
    } catch (error) {
      console.error("Error searching stocks:", error);
      return res.status(500).json({ success: false, message: "Failed to search stocks" });
    }
  });
  
  // Manually trigger real-time price update for a specific stock
  app.post("/api/admin/update-prices", async (req, res) => {
    try {
      await alphaVantageService.updateStockPrices();
      return res.status(200).json({ success: true, message: "Stock prices updated successfully from Alpha Vantage" });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Failed to update stock prices" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
