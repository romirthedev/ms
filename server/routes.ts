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
import { aiService } from "./services/aiService";

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
    
    // Update news for all stocks
    await newsService.updateAllStockNews();
    
    // Update AI analysis for all stocks
    await aiService.updateAllStockAnalyses();
    
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
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const analyses = await storage.getTopRatedStockAnalyses(limit);
      return res.status(200).json({ success: true, data: analyses });
    } catch (error) {
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
      await newsService.updateAllStockNews();
      return res.status(200).json({ success: true, message: "News update triggered successfully" });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Failed to trigger news update" });
    }
  });
  
  // Manually trigger analysis update
  app.post("/api/admin/update-analyses", async (req, res) => {
    try {
      await aiService.updateAllStockAnalyses();
      return res.status(200).json({ success: true, message: "Analysis update triggered successfully" });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Failed to trigger analysis update" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
