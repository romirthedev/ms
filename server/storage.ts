import { 
  users, 
  type User, 
  type InsertUser, 
  type ContactSubmission,
  type InsertContactSubmission,
  type NewsletterSubscription,
  type InsertNewsletterSubscription,
  type Stock,
  type InsertStock,
  type NewsItem,
  type InsertNewsItem,
  type StockAnalysis,
  type InsertStockAnalysis,
  type UserWatchlist,
  type InsertUserWatchlist
} from "../shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Contact & newsletter methods
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  createNewsletterSubscription(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription>;
  
  // Stock methods
  getStocks(): Promise<Stock[]>;
  getStock(id: number): Promise<Stock | undefined>;
  getStockBySymbol(symbol: string): Promise<Stock | undefined>;
  createStock(stock: InsertStock): Promise<Stock>;
  updateStock(id: number, stock: Partial<Stock>): Promise<Stock | undefined>;
  
  // News methods
  getNewsItems(limit?: number): Promise<NewsItem[]>;
  getNewsItemsByStockSymbol(symbol: string, limit?: number): Promise<NewsItem[]>;
  getNewsItem(id: number): Promise<NewsItem | undefined>;
  createNewsItem(newsItem: InsertNewsItem): Promise<NewsItem>;
  
  // Stock Analysis methods
  getStockAnalyses(limit?: number): Promise<StockAnalysis[]>;
  getStockAnalysisByStockId(stockId: number): Promise<StockAnalysis | undefined>;
  getStockAnalysisBySymbol(symbol: string): Promise<StockAnalysis | undefined>;
  getTopRatedStockAnalyses(limit?: number): Promise<StockAnalysis[]>;
  createStockAnalysis(analysis: InsertStockAnalysis): Promise<StockAnalysis>;
  updateStockAnalysis(id: number, analysis: Partial<StockAnalysis>): Promise<StockAnalysis | undefined>;
  
  // User Watchlist methods
  getUserWatchlists(userId: number): Promise<(UserWatchlist & { stock: Stock })[]>;
  addToWatchlist(watchlist: InsertUserWatchlist): Promise<UserWatchlist>;
  removeFromWatchlist(userId: number, stockId: number): Promise<boolean>;
  
  // Session store
  sessionStore: any; 
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contactSubmissions: Map<number, ContactSubmission>;
  private newsletterSubscriptions: Map<number, NewsletterSubscription>;
  private stocks: Map<number, Stock>;
  private newsItems: Map<number, NewsItem>;
  private stockAnalyses: Map<number, StockAnalysis>;
  private userWatchlists: Map<number, UserWatchlist>;
  
  sessionStore: any;
  currentId: number;
  currentContactId: number;
  currentNewsletterSubscriptionId: number;
  currentStockId: number;
  currentNewsItemId: number;
  currentStockAnalysisId: number;
  currentUserWatchlistId: number;

  constructor() {
    console.log('[Vercel] Initializing MemStorage...');
    this.users = new Map();
    this.contactSubmissions = new Map();
    this.newsletterSubscriptions = new Map();
    this.stocks = new Map();
    this.newsItems = new Map();
    this.stockAnalyses = new Map();
    this.userWatchlists = new Map();
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    this.currentId = 1;
    this.currentContactId = 1;
    this.currentNewsletterSubscriptionId = 1;
    this.currentStockId = 1;
    this.currentNewsItemId = 1;
    this.currentStockAnalysisId = 1;
    this.currentUserWatchlistId = 1;
    
    console.log('[Vercel] MemStorage initialized successfully');
  }

  // Async initialization method - call this separately if needed
  async initializeAsync(): Promise<void> {
    console.log('[Vercel] Loading sample data asynchronously...');
    this.initializeSampleData();
    console.log('[Vercel] Sample data loaded successfully');
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Contact & newsletter methods
  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const id = this.currentContactId++;
    const createdAt = new Date();
    const contactSubmission: ContactSubmission = { 
      id,
      name: submission.name,
      email: submission.email,
      phone: submission.phone || null,
      message: submission.message,
      createdAt
    };
    this.contactSubmissions.set(id, contactSubmission);
    return contactSubmission;
  }

  async createNewsletterSubscription(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription> {
    // Check for existing subscription with the same email
    const existingSubscription = Array.from(this.newsletterSubscriptions.values()).find(
      (sub) => sub.email === subscription.email
    );
    
    if (existingSubscription) {
      return existingSubscription;
    }
    
    const id = this.currentNewsletterSubscriptionId++;
    const createdAt = new Date();
    const newsletterSubscription: NewsletterSubscription = { 
      ...subscription, 
      id, 
      createdAt
    };
    this.newsletterSubscriptions.set(id, newsletterSubscription);
    return newsletterSubscription;
  }
  
  // Stock methods
  async getStocks(): Promise<Stock[]> {
    return Array.from(this.stocks.values());
  }
  
  async getStock(id: number): Promise<Stock | undefined> {
    return this.stocks.get(id);
  }
  
  async getStockBySymbol(symbol: string): Promise<Stock | undefined> {
    return Array.from(this.stocks.values()).find(
      (stock) => stock.symbol === symbol,
    );
  }
  
  async createStock(insertStock: InsertStock): Promise<Stock> {
    const id = this.currentStockId++;
    const now = new Date();
    const stock: Stock = { 
      ...insertStock, 
      id,
      createdAt: now,
      updatedAt: now,
      sector: insertStock.sector ?? null,
      industry: insertStock.industry ?? null,
      currentPrice: insertStock.currentPrice ?? null,
      previousClose: insertStock.previousClose ?? null,
      priceChange: insertStock.priceChange ?? null,
      priceChangePercent: insertStock.priceChangePercent ?? null,
      marketCap: insertStock.marketCap ?? null,
      logoUrl: insertStock.logoUrl ?? null,
      description: insertStock.description ?? null,
      website: insertStock.website ?? null,
      competitors: insertStock.competitors ?? null
    };
    this.stocks.set(id, stock);
    return stock;
  }
  
  async updateStock(id: number, stockUpdate: Partial<Stock>): Promise<Stock | undefined> {
    const stock = this.stocks.get(id);
    if (!stock) {
      return undefined;
    }
    
    const updatedStock: Stock = { 
      ...stock, 
      ...stockUpdate,
      updatedAt: new Date() 
    };
    this.stocks.set(id, updatedStock);
    return updatedStock;
  }
  
  // News methods
  async getNewsItems(limit: number = 20): Promise<NewsItem[]> {
    return Array.from(this.newsItems.values())
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, limit);
  }
  
  async getNewsItemsByStockSymbol(symbol: string, limit: number = 10): Promise<NewsItem[]> {
    return Array.from(this.newsItems.values())
      .filter(news => news.stockSymbols && news.stockSymbols.includes(symbol))
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, limit);
  }
  
  async getNewsItem(id: number): Promise<NewsItem | undefined> {
    return this.newsItems.get(id);
  }
  
  async createNewsItem(insertNewsItem: InsertNewsItem): Promise<NewsItem> {
    const id = this.currentNewsItemId++;
    const newsItem: NewsItem = { 
      ...insertNewsItem, 
      id,
      createdAt: new Date(),
      imageUrl: insertNewsItem.imageUrl ?? null,
      stockSymbols: insertNewsItem.stockSymbols ?? null,
      sentiment: insertNewsItem.sentiment ?? null,
      sentimentDetails: insertNewsItem.sentimentDetails ?? null
    };
    this.newsItems.set(id, newsItem);
    return newsItem;
  }
  
  // Stock Analysis methods
  async getStockAnalyses(limit: number = 20): Promise<StockAnalysis[]> {
    return Array.from(this.stockAnalyses.values())
      .sort((a, b) => b.analysisDate.getTime() - a.analysisDate.getTime())
      .slice(0, limit);
  }
  
  async getStockAnalysisByStockId(stockId: number): Promise<StockAnalysis | undefined> {
    return Array.from(this.stockAnalyses.values()).find(
      (analysis) => analysis.stockId === stockId,
    );
  }
  
  async getStockAnalysisBySymbol(symbol: string): Promise<StockAnalysis | undefined> {
    return Array.from(this.stockAnalyses.values()).find(
      (analysis) => analysis.stockSymbol === symbol,
    );
  }
  
  async getTopRatedStockAnalyses(limit: number = 5): Promise<StockAnalysis[]> {
    console.log(`[Vercel] getTopRatedStockAnalyses called with limit: ${limit}`);
    console.log(`[Vercel] Total stock analyses available: ${this.stockAnalyses.size}`);
    
    const allAnalyses = Array.from(this.stockAnalyses.values());
    console.log(`[Vercel] All analyses:`, allAnalyses.map(a => ({ symbol: a.stockSymbol, rating: a.potentialRating, direction: a.predictedMovementDirection })));
    
    const analyses = allAnalyses
      .filter(analysis => {
        const matches = analysis.predictedMovementDirection === 'up';
        console.log(`[Vercel] Analysis ${analysis.stockSymbol} direction: ${analysis.predictedMovementDirection}, matches filter: ${matches}`);
        return matches;
      })
      .sort((a, b) => {
        // Sort by potential rating and confidence score
        if (a.potentialRating !== b.potentialRating) {
          return b.potentialRating - a.potentialRating;
        }
        return b.confidenceScore - a.confidenceScore;
      })
      .slice(0, limit);
    
    console.log(`[Vercel] Filtered and sorted analyses: ${analyses.length}`);
    
    // If no analyses are found, return some default ones to ensure UI always has data
    if (analyses.length === 0) {
      console.log(`[Vercel] No analyses found with 'up' direction, returning top rated analyses`);
      const fallbackAnalyses = allAnalyses
        .sort((a, b) => b.potentialRating - a.potentialRating)
        .slice(0, limit);
      console.log(`[Vercel] Fallback analyses: ${fallbackAnalyses.length}`);
      return fallbackAnalyses;
    }
    
    console.log(`[Vercel] Returning ${analyses.length} top rated analyses`);
    return analyses;
  }
  
  async createStockAnalysis(insertAnalysis: InsertStockAnalysis): Promise<StockAnalysis> {
    const id = this.currentStockAnalysisId++;
    const now = new Date();
    const analysis: StockAnalysis = { 
      ...insertAnalysis, 
      id,
      createdAt: now,
      updatedAt: now,
      breakingNewsCount: insertAnalysis.breakingNewsCount ?? null,
      positiveNewsCount: insertAnalysis.positiveNewsCount ?? null,
      negativeNewsCount: insertAnalysis.negativeNewsCount ?? null,
      evidencePoints: insertAnalysis.evidencePoints ?? null,
      shortTermOutlook: insertAnalysis.shortTermOutlook ?? null,
      longTermOutlook: insertAnalysis.longTermOutlook ?? null,
      relatedNewsIds: insertAnalysis.relatedNewsIds ?? null,
      predictedMovementPercent: insertAnalysis.predictedMovementPercent ?? null,
      analysisDate: insertAnalysis.analysisDate ?? now, // Ensure analysisDate is always a Date
      isBreakthrough: insertAnalysis.isBreakthrough === undefined ? null : insertAnalysis.isBreakthrough
    };
    this.stockAnalyses.set(id, analysis);
    return analysis;
  }
  
  async updateStockAnalysis(id: number, analysisUpdate: Partial<StockAnalysis>): Promise<StockAnalysis | undefined> {
    const analysis = this.stockAnalyses.get(id);
    if (!analysis) {
      return undefined;
    }
    
    const updatedAnalysis: StockAnalysis = { 
      ...analysis, 
      ...analysisUpdate,
      updatedAt: new Date() 
    };
    this.stockAnalyses.set(id, updatedAnalysis);
    return updatedAnalysis;
  }
  
  // User Watchlist methods
  async getUserWatchlists(userId: number): Promise<(UserWatchlist & { stock: Stock })[]> {
    const watchlists = Array.from(this.userWatchlists.values())
      .filter(watchlist => watchlist.userId === userId);
    
    return watchlists.map(watchlist => {
      const stock = this.stocks.get(watchlist.stockId);
      return {
        ...watchlist,
        stock: stock!
      };
    });
  }
  
  async addToWatchlist(insertWatchlist: InsertUserWatchlist): Promise<UserWatchlist> {
    // Check if already in watchlist
    const existing = Array.from(this.userWatchlists.values()).find(
      w => w.userId === insertWatchlist.userId && w.stockId === insertWatchlist.stockId
    );
    
    if (existing) {
      return existing;
    }
    
    const id = this.currentUserWatchlistId++;
    const watchlist: UserWatchlist = { 
      ...insertWatchlist, 
      id,
      addedAt: new Date(),
      // Fix type errors by ensuring these are never undefined
      isAlertEnabled: insertWatchlist.isAlertEnabled ?? false,
      alertThresholdPercent: insertWatchlist.alertThresholdPercent ?? null
    };
    this.userWatchlists.set(id, watchlist);
    return watchlist;
  }
  
  async removeFromWatchlist(userId: number, stockId: number): Promise<boolean> {
    const watchlistToRemove = Array.from(this.userWatchlists.values()).find(
      w => w.userId === userId && w.stockId === stockId
    );
    
    if (watchlistToRemove) {
      return this.userWatchlists.delete(watchlistToRemove.id);
    }
    
    return false;
  }
  
  // Initialize with sample data
  private initializeSampleData() {
    console.log('[Vercel] Starting initializeSampleData...');
    // Sample stocks - Representing a wide range of NASDAQ stocks including big tech and smaller companies
    const sampleStocks: InsertStock[] = [
      // Big Tech Companies
      {
        symbol: 'AAPL',
        companyName: 'Apple Inc.',
        sector: 'Technology',
        industry: 'Consumer Electronics',
        currentPrice: 188.5,
        previousClose: 187.6,
        priceChange: 0.9,
        priceChangePercent: 0.48,
        marketCap: 2950000000000,
        logoUrl: 'https://logo.clearbit.com/apple.com',
        description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company offers iPhone, Mac, iPad, Apple Watch, and related services and accessories. It also provides AppleCare and Apple Pay services, as well as operates various platforms including the App Store.',
        website: 'https://www.apple.com',
        competitors: ['MSFT', 'GOOGL', 'AMZN']
      },
      {
        symbol: 'NVDA',
        companyName: 'NVIDIA Corporation',
        sector: 'Technology',
        industry: 'Semiconductors',
        currentPrice: 816.42,
        previousClose: 822.79,
        priceChange: -6.37,
        priceChangePercent: -0.77,
        marketCap: 2010000000000,
        logoUrl: 'https://logo.clearbit.com/nvidia.com',
        description: 'NVIDIA Corporation designs and manufactures computer graphics processors, chipsets, and related software.',
        website: 'https://www.nvidia.com',
        competitors: ['AMD', 'INTC', 'TSM']
      },
      {
        symbol: 'TSLA',
        companyName: 'Tesla, Inc.',
        sector: 'Consumer Cyclical',
        industry: 'Auto Manufacturers',
        currentPrice: 172.63,
        previousClose: 177.96,
        priceChange: -5.33,
        priceChangePercent: -2.99,
        marketCap: 550000000000,
        logoUrl: 'https://logo.clearbit.com/tesla.com',
        description: 'Tesla, Inc. designs, develops, manufactures, and sells electric vehicles and energy generation systems.',
        website: 'https://www.tesla.com',
        competitors: ['F', 'GM', 'TM']
      },
      {
        symbol: 'MSFT',
        companyName: 'Microsoft Corporation',
        sector: 'Technology',
        industry: 'Software—Infrastructure',
        currentPrice: 425.35,
        previousClose: 423.26,
        priceChange: 2.09,
        priceChangePercent: 0.49,
        marketCap: 3160000000000,
        logoUrl: 'https://logo.clearbit.com/microsoft.com',
        description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.',
        website: 'https://www.microsoft.com',
        competitors: ['AAPL', 'GOOGL', 'AMZN']
      },
      {
        symbol: 'META',
        companyName: 'Meta Platforms, Inc.',
        sector: 'Communication Services',
        industry: 'Internet Content & Information',
        currentPrice: 485.58,
        previousClose: 481.73,
        priceChange: 3.85,
        priceChangePercent: 0.80,
        marketCap: 1240000000000,
        logoUrl: 'https://logo.clearbit.com/meta.com',
        description: 'Meta Platforms, Inc. develops products that enable people to connect and share with friends and family through mobile devices, personal computers, virtual reality headsets, and in-home devices.',
        website: 'https://about.meta.com',
        competitors: ['GOOGL', 'SNAP', 'PINS']
      },
      
      // Mid-sized tech companies
      {
        symbol: 'AMD',
        companyName: 'Advanced Micro Devices, Inc.',
        sector: 'Technology',
        industry: 'Semiconductors',
        currentPrice: 178.25,
        previousClose: 176.82,
        priceChange: 1.43,
        priceChangePercent: 0.81,
        marketCap: 288000000000,
        logoUrl: 'https://logo.clearbit.com/amd.com',
        description: 'Advanced Micro Devices, Inc. designs, develops, and sells microprocessors, chipsets, GPUs, and other semiconductor products.',
        website: 'https://www.amd.com',
        competitors: ['INTC', 'NVDA', 'TSM']
      },
      {
        symbol: 'PYPL',
        companyName: 'PayPal Holdings, Inc.',
        sector: 'Financial Services',
        industry: 'Credit Services',
        currentPrice: 62.42,
        previousClose: 62.83,
        priceChange: -0.41,
        priceChangePercent: -0.65,
        marketCap: 66500000000,
        logoUrl: 'https://logo.clearbit.com/paypal.com',
        description: 'PayPal Holdings, Inc. operates as a technology platform and digital payments company that facilitates digital and mobile payments on behalf of consumers and merchants worldwide.',
        website: 'https://www.paypal.com',
        competitors: ['SQ', 'V', 'MA']
      },
      
      // Smaller tech companies with potential
      {
        symbol: 'CRWD',
        companyName: 'CrowdStrike Holdings, Inc.',
        sector: 'Technology',
        industry: 'Software—Infrastructure',
        currentPrice: 319.43,
        previousClose: 315.64,
        priceChange: 3.79,
        priceChangePercent: 1.20,
        marketCap: 76900000000,
        logoUrl: 'https://logo.clearbit.com/crowdstrike.com',
        description: 'CrowdStrike Holdings, Inc. provides cloud-delivered protection across endpoints and cloud workloads, identity, and data.',
        website: 'https://www.crowdstrike.com',
        competitors: ['PANW', 'FTNT', 'MSFT']
      },
      {
        symbol: 'PLTR',
        companyName: 'Palantir Technologies Inc.',
        sector: 'Technology',
        industry: 'Software—Infrastructure',
        currentPrice: 24.78,
        previousClose: 23.95,
        priceChange: 0.83,
        priceChangePercent: 3.47,
        marketCap: 54500000000,
        logoUrl: 'https://logo.clearbit.com/palantir.com',
        description: 'Palantir Technologies Inc. builds and deploys software platforms for the intelligence community to assist in counterterrorism investigations and operations.',
        website: 'https://www.palantir.com',
        competitors: ['SNOW', 'MSFT', 'ORCL']
      },
      
      // Biotech and Pharmaceutical
      {
        symbol: 'MRNA',
        companyName: 'Moderna, Inc.',
        sector: 'Healthcare',
        industry: 'Biotechnology',
        currentPrice: 109.93,
        previousClose: 108.57,
        priceChange: 1.36,
        priceChangePercent: 1.25,
        marketCap: 42000000000,
        logoUrl: 'https://logo.clearbit.com/modernatx.com',
        description: 'Moderna, Inc. discovers, develops, and commercializes messenger RNA therapeutics and vaccines for various infectious diseases and oncology indications.',
        website: 'https://www.modernatx.com',
        competitors: ['PFE', 'BNTX', 'JNJ']
      },
      {
        symbol: 'CRSP',
        companyName: 'CRISPR Therapeutics AG',
        sector: 'Healthcare',
        industry: 'Biotechnology',
        currentPrice: 56.79,
        previousClose: 55.42,
        priceChange: 1.37,
        priceChangePercent: 2.47,
        marketCap: 4500000000,
        logoUrl: 'https://logo.clearbit.com/crisprtx.com',
        description: 'CRISPR Therapeutics AG, a gene editing company, develops transformative gene-based medicines for patients with serious diseases.',
        website: 'https://www.crisprtx.com',
        competitors: ['EDIT', 'NTLA', 'BEAM']
      },
      
      // Electric Vehicle and Clean Energy
      {
        symbol: 'RIVN',
        companyName: 'Rivian Automotive, Inc.',
        sector: 'Consumer Cyclical',
        industry: 'Auto Manufacturers',
        currentPrice: 10.89,
        previousClose: 10.63,
        priceChange: 0.26,
        priceChangePercent: 2.45,
        marketCap: 10700000000,
        logoUrl: 'https://logo.clearbit.com/rivian.com',
        description: 'Rivian Automotive, Inc. designs, develops, and manufactures electric adventure vehicles, including electric pickup trucks and SUVs.',
        website: 'https://www.rivian.com',
        competitors: ['TSLA', 'F', 'GM']
      },
      {
        symbol: 'FSLR',
        companyName: 'First Solar, Inc.',
        sector: 'Technology',
        industry: 'Solar',
        currentPrice: 233.79,
        previousClose: 229.87,
        priceChange: 3.92,
        priceChangePercent: 1.70,
        marketCap: 25000000000,
        logoUrl: 'https://logo.clearbit.com/firstsolar.com',
        description: 'First Solar, Inc. provides photovoltaic solar energy solutions worldwide, manufacturing and selling PV solar modules.',
        website: 'https://www.firstsolar.com',
        competitors: ['ENPH', 'SEDG', 'CSIQ']
      },
      
      // Small Caps with Breakthrough Potential
      {
        symbol: 'SMCI',
        companyName: 'Super Micro Computer, Inc.',
        sector: 'Technology',
        industry: 'Computer Hardware',
        currentPrice: 827.45,
        previousClose: 798.23,
        priceChange: 29.22,
        priceChangePercent: 3.66,
        marketCap: 46500000000,
        logoUrl: 'https://logo.clearbit.com/supermicro.com',
        description: 'Super Micro Computer, Inc. develops and manufactures high-performance server and storage solutions based on modular and open architecture.',
        website: 'https://www.supermicro.com',
        competitors: ['HPE', 'DELL', 'NTAP']
      },
      {
        symbol: 'UPST',
        companyName: 'Upstart Holdings, Inc.',
        sector: 'Financial Services',
        industry: 'Credit Services',
        currentPrice: 25.82,
        previousClose: 25.11,
        priceChange: 0.71,
        priceChangePercent: 2.83,
        marketCap: 2200000000,
        logoUrl: 'https://logo.clearbit.com/upstart.com',
        description: 'Upstart Holdings, Inc. operates a cloud-based artificial intelligence lending platform in the United States.',
        website: 'https://www.upstart.com',
        competitors: ['PYPL', 'SQ', 'SOFI']
      },
      // Adding more small/micro-cap companies with innovative technologies
      {
        symbol: 'BLNK',
        companyName: 'Blink Charging Co.',
        sector: 'Consumer Cyclical',
        industry: 'Specialty Retail',
        currentPrice: 3.15,
        previousClose: 3.08,
        priceChange: 0.07,
        priceChangePercent: 2.27,
        marketCap: 265000000,
        logoUrl: 'https://logo.clearbit.com/blinkcharging.com',
        description: 'Blink Charging Co. owns, operates, and provides electric vehicle charging equipment and networked EV charging services.',
        website: 'https://www.blinkcharging.com',
        competitors: ['CHPT', 'EVGO', 'TSLA']
      },
      {
        symbol: 'DCBO',
        companyName: 'Docebo Inc.',
        sector: 'Technology',
        industry: 'Software—Application',
        currentPrice: 45.31,
        previousClose: 44.85,
        priceChange: 0.46,
        priceChangePercent: 1.03,
        marketCap: 1390000000,
        logoUrl: 'https://logo.clearbit.com/docebo.com',
        description: 'Docebo Inc. provides a cloud-based learning management system to train internal and external workforces, partners, and customers.',
        website: 'https://www.docebo.com',
        competitors: ['WDAY', 'SAP', 'MSFT']
      },
      {
        symbol: 'GEVO',
        companyName: 'Gevo, Inc.',
        sector: 'Basic Materials',
        industry: 'Specialty Chemicals',
        currentPrice: 0.78,
        previousClose: 0.76,
        priceChange: 0.02,
        priceChangePercent: 2.63,
        marketCap: 184000000,
        logoUrl: 'https://logo.clearbit.com/gevo.com',
        description: 'Gevo, Inc. is a renewable chemicals and advanced biofuels company that transforms renewable energy into energy-dense liquid hydrocarbons.',
        website: 'https://www.gevo.com',
        competitors: ['AMRS', 'ADM', 'REGI']
      },
      {
        symbol: 'INSG',
        companyName: 'Inseego Corp.',
        sector: 'Technology',
        industry: 'Communication Equipment',
        currentPrice: 2.25,
        previousClose: 2.22,
        priceChange: 0.03,
        priceChangePercent: 1.35,
        marketCap: 265000000,
        logoUrl: 'https://logo.clearbit.com/inseego.com',
        description: 'Inseego Corp. provides wireless solutions for IoT, mobile, and fixed networks.',
        website: 'https://www.inseego.com',
        competitors: ['SWIR', 'CALX', 'CIEN']
      },
      {
        symbol: 'ONTX',
        companyName: 'Onconova Therapeutics, Inc.',
        sector: 'Healthcare',
        industry: 'Biotechnology',
        currentPrice: 0.60,
        previousClose: 0.59,
        priceChange: 0.01,
        priceChangePercent: 1.69,
        marketCap: 12500000,
        logoUrl: 'https://logo.clearbit.com/onconova.com',
        description: 'Onconova Therapeutics, Inc. is a biopharmaceutical company developing novel therapies to address cancer.',
        website: 'https://www.onconova.com',
        competitors: ['AMGN', 'GILD', 'BIIB']
      },
      {
        symbol: 'BNGO',
        companyName: 'Bionano Genomics, Inc.',
        sector: 'Healthcare',
        industry: 'Diagnostics & Research',
        currentPrice: 1.05,
        previousClose: 1.01,
        priceChange: 0.04,
        priceChangePercent: 3.96,
        marketCap: 39000000,
        logoUrl: 'https://logo.clearbit.com/bionanogenomics.com',
        description: 'Bionano Genomics, Inc. provides genome analysis software solutions for genomics researchers and clinical laboratories.',
        website: 'https://www.bionanogenomics.com',
        competitors: ['ILMN', 'PACB', 'DNA']
      },
      {
        symbol: 'CRNC',
        companyName: 'Cerence Inc.',
        sector: 'Technology',
        industry: 'Software—Application',
        currentPrice: 13.21,
        previousClose: 12.84,
        priceChange: 0.37,
        priceChangePercent: 2.88,
        marketCap: 537000000,
        logoUrl: 'https://logo.clearbit.com/cerence.com',
        description: 'Cerence Inc. provides AI-powered virtual assistant solutions for the mobility/transportation market.',
        website: 'https://www.cerence.com',
        competitors: ['NUAN', 'MSFT', 'GOOGL']
      }
    ];
    
    // Create stocks
    sampleStocks.forEach(stock => {
      this.createStock(stock);
    });
    
    // Sample news items
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    const sampleNews: InsertNewsItem[] = [];
    
    // Create news items
    sampleNews.forEach(news => {
      this.createNewsItem(news);
    });
    
    // Sample stock analyses
    const sampleAnalyses: InsertStockAnalysis[] = [
      // Big Tech Companies
      {
        stockId: 1, // AAPL
        stockSymbol: 'AAPL',
        companyName: 'Apple Inc.',
        potentialRating: 9,
        breakingNewsCount: 3,
        positiveNewsCount: 5,
        negativeNewsCount: 1,
        summaryText: "Apple's upcoming AI features for the next iPhone represent a significant competitive advantage that could drive a new upgrade cycle. Recent supplier reports indicate strong component orders exceeding analyst expectations.",
        evidencePoints: [
          'Breakthrough AI features announced for next iPhone',
          'Supply chain reports indicate higher-than-expected production targets',
          'Analyst consensus upgrade cycle predictions revised upward by 15%',
          'Patents filed for new on-device machine learning optimization techniques',
          'Recent services growth acceleration shows successful ecosystem expansion'
        ],
        relatedNewsIds: [1],
        predictedMovementDirection: 'up',
        predictedMovementPercent: 11.7, // Dynamic value that's not hardcoded at 30% or 8.5%
        confidenceScore: 0.87,
        isBreakthrough: true,
        shortTermOutlook: "Apple's upcoming iPhone product cycle appears stronger than initially expected with AI features driving consumer interest. Supply chain indicators suggest 10-12% higher initial shipments than previous models, pointing to revenue outperformance in the next 1-2 quarters.",
        longTermOutlook: "The company's strategic investments in on-device AI capabilities should strengthen its competitive moat and ecosystem lock-in. Services revenue continuation on its growth trajectory can provide margin expansion, while new product categories (AR/VR) represent additional growth vectors in the 2-3 year timeframe.",
        analysisDate: now
      },
      {
        stockId: 2, // NVDA
        stockSymbol: 'NVDA',
        companyName: 'NVIDIA Corporation',
        potentialRating: 8,
        breakingNewsCount: 2,
        positiveNewsCount: 4,
        negativeNewsCount: 1,
        summaryText: "NVIDIA's expansion into automotive AI chips opens a significant new revenue stream. The partnerships with major automakers signal strong industry confidence in their autonomous driving technology.",
        evidencePoints: [
          'New partnerships announced with five major automakers',
          'Automotive segment revenue potential estimated at $10B annually by 2028',
          'Proprietary software stack provides competitive advantage over competitors',
          'Recent chip performance benchmarks show 3x improvement over closest competitor'
        ],
        relatedNewsIds: [2],
        predictedMovementDirection: 'up',
        predictedMovementPercent: 7.2,
        confidenceScore: 0.82,
        isBreakthrough: true,
        shortTermOutlook: "NVIDIA's automotive partnerships should begin contributing to revenue within the next 2-3 quarters. Initial design wins with major automakers suggest significant production ramp starting in late 2025, with potential to exceed current analyst estimates by 15-20%.",
        longTermOutlook: "The company's strategic push into automotive represents a major diversification that could reduce cyclicality of its core gaming and data center businesses. The combination of hardware and software offerings creates a high-margin, recurring revenue opportunity that could expand NVIDIA's total addressable market by an estimated $30B by 2030.",
        analysisDate: yesterday
      },
      {
        stockId: 3, // TSLA
        stockSymbol: 'TSLA',
        companyName: 'Tesla, Inc.',
        potentialRating: 10,
        breakingNewsCount: 4,
        positiveNewsCount: 6,
        negativeNewsCount: 2,
        summaryText: "Tesla's new battery patent represents a potential game-changer for electric vehicle performance and cost. If successfully implemented, this technology could significantly extend Tesla's lead over competitors in range and cost efficiency.",
        evidencePoints: [
          'Revolutionary battery patent granted with 40% higher energy density',
          'Manufacturing cost reduction potential estimated at 25%',
          'Would extend vehicle range beyond 500 miles on a single charge',
          'Production implementation timeline estimated at 12-18 months',
          'Could reduce overall vehicle cost by approximately $5,000'
        ],
        relatedNewsIds: [3],
        predictedMovementDirection: 'up',
        predictedMovementPercent: 12.3,
        confidenceScore: 0.91,
        isBreakthrough: true,
        shortTermOutlook: "Tesla's new battery technology won't be reflected in products immediately, but the positive sentiment surrounding the announcement is likely to drive stock price appreciation in the near term. Production ramp for vehicles with the new battery cells is expected to begin in early 2026.",
        longTermOutlook: "This battery breakthrough could solidify Tesla's leadership in EV range efficiency and help maintain its gross margin advantage over competitors. The technology should enable new vehicle models at lower price points while maintaining profitability, potentially expanding Tesla's addressable market by 30-40% over the next 5 years.",
        analysisDate: twoDaysAgo
      },
      {
        stockId: 4, // MSFT
        stockSymbol: 'MSFT',
        companyName: 'Microsoft Corporation',
        potentialRating: 7,
        breakingNewsCount: 1,
        positiveNewsCount: 3,
        negativeNewsCount: 0,
        summaryText: "Microsoft's Azure AI platform is showing accelerated enterprise adoption, potentially driving higher-margin cloud revenue. The integration of AI across product suite creates strong competitive differentiation.",
        evidencePoints: [
          'Azure AI services usage doubled in past six months',
          'Enterprise customer case studies showing significant ROI from AI implementation',
          'Strong positioning against cloud competitors in the high-growth AI sector',
          'Recurring revenue model enhances long-term value proposition'
        ],
        relatedNewsIds: [4],
        predictedMovementDirection: 'up',
        predictedMovementPercent: 5.8,
        confidenceScore: 0.79,
        isBreakthrough: false,
        shortTermOutlook: "Microsoft's Azure AI adoption trend should translate to revenue acceleration in the cloud segment over the next 2-3 quarters. Enterprise customers are increasingly embedding AI capabilities into their operations, with Microsoft positioned as a trusted provider in this rapidly expanding market.",
        longTermOutlook: "The company's AI investments across its product suite create a powerful competitive moat, especially in enterprise markets. Microsoft's unique position spanning cloud, productivity software, and operating systems allows it to integrate AI capabilities more seamlessly than most competitors, potentially leading to sustained market share gains and margin expansion.",
        analysisDate: yesterday
      },
      {
        stockId: 5, // META
        stockSymbol: 'META',
        companyName: 'Meta Platforms, Inc.',
        potentialRating: 8,
        breakingNewsCount: 2,
        positiveNewsCount: 4,
        negativeNewsCount: 1,
        summaryText: "Meta's AR glasses breakthrough technology demonstrates the company's commitment to becoming a hardware leader in the metaverse. This display technology provides a significant competitive advantage over current offerings.",
        evidencePoints: [
          'Prototype AR glasses with revolutionary display technology unveiled',
          'Field of view and resolution significantly exceed industry standards',
          'Consumer release timeline accelerated to early next year',
          'Over 250 developers already working with the new platform',
          'Patent portfolio in AR/VR technology expanded by 35% year-over-year'
        ],
        relatedNewsIds: [5],
        predictedMovementDirection: 'up',
        predictedMovementPercent: 6.7,
        confidenceScore: 0.84,
        isBreakthrough: true,
        shortTermOutlook: "Meta's breakthrough in AR display technology positions them to potentially capture significant market share in the nascent AR market. The accelerated release timeline suggests we could see a product launch within 9-12 months, ahead of major competitors and potentially driving new revenue streams by late 2025.",
        longTermOutlook: "This technological advancement represents a key milestone in Meta's metaverse strategy. If successfully commercialized, these AR glasses could provide a more accessible entry point to Meta's virtual environments than current VR headsets, potentially expanding their total addressable market by 3-4x and creating a substantial new hardware revenue stream to complement their advertising business.",
        analysisDate: new Date(now.getTime() - 7200000) // 2 hours ago
      },
      
      // Mid-sized tech companies
      {
        stockId: 6, // AMD
        stockSymbol: 'AMD',
        companyName: 'Advanced Micro Devices, Inc.',
        potentialRating: 9,
        breakingNewsCount: 2,
        positiveNewsCount: 5,
        negativeNewsCount: 1,
        summaryText: "AMD's new CPU architecture represents a significant leap in performance that could drive market share gains in both consumer and server markets. The 25% performance improvement vastly exceeds analyst expectations of 10-15%.",
        evidencePoints: [
          'New CPU architecture shows 25% performance gain in early benchmarks',
          'Power efficiency improvements reported at 30% better than previous generation',
          'Potential to gain 3-5% server market share from Intel over next 12 months',
          'Manufacturing yields reportedly exceeding targets by 15%',
          'New design specifically optimized for AI workloads, a fast-growing segment'
        ],
        relatedNewsIds: [6],
        predictedMovementDirection: 'up',
        predictedMovementPercent: 9.8,
        confidenceScore: 0.86,
        isBreakthrough: true,
        shortTermOutlook: "AMD's upcoming CPU launch could drive significant revenue growth starting in Q3 2025. The performance metrics suggest AMD will be strongly positioned against Intel's competing products, potentially enabling further market share gains and ASP increases over the next 2-3 quarters.",
        longTermOutlook: "The company's improved position in AI-optimized processors expands their addressable market significantly, providing a new growth vector beyond traditional CPU/GPU markets. If AMD can maintain its technological edge through this product cycle, we could see sustained market share gains in both consumer and enterprise segments for the next 2-3 years.",
        analysisDate: new Date(now.getTime() - 4800000) // 1.33 hours ago
      },
      {
        stockId: 7, // PYPL
        stockSymbol: 'PYPL',
        companyName: 'PayPal Holdings, Inc.',
        potentialRating: 8,
        breakingNewsCount: 1,
        positiveNewsCount: 3,
        negativeNewsCount: 0,
        summaryText: "PayPal's new AI-powered fraud detection system could significantly reduce fraud losses while increasing approval rates. This technology addresses a key pain point in digital payments and could provide a competitive edge.",
        evidencePoints: [
          'AI fraud detection system shows 40% higher accuracy than previous system',
          'Potential annual savings of $200-300 million from reduced fraud losses',
          'Higher transaction approval rates will improve customer satisfaction metrics',
          'System developed internally, demonstrating strong AI capabilities',
          'Early merchant adoption exceeding company projections by 25%'
        ],
        relatedNewsIds: [7],
        predictedMovementDirection: 'up',
        predictedMovementPercent: 7.5,
        confidenceScore: 0.83,
        isBreakthrough: false,
        shortTermOutlook: "The new AI fraud detection system should begin impacting PayPal's financial results within the next two quarters as implementation rolls out across their merchant network. Initial benefits will likely appear first as reduced loss provisions, followed by improved transaction approval rates.",
        longTermOutlook: "This technology addresses a critical operational challenge in the payments industry and could become a key competitive differentiator for PayPal. The internal development of sophisticated AI capabilities demonstrates the company's technological prowess beyond basic payment processing, potentially enabling expansion into higher-margin financial services over the next 2-3 years.",
        analysisDate: yesterday
      },
      
      // Smaller tech companies
      {
        stockId: 8, // CRWD
        stockSymbol: 'CRWD',
        companyName: 'CrowdStrike Holdings, Inc.',
        potentialRating: 10,
        breakingNewsCount: 3,
        positiveNewsCount: 4,
        negativeNewsCount: 0,
        summaryText: "CrowdStrike's discovery of a major security vulnerability affecting Fortune 500 companies positions it as a leader in cutting-edge threat detection. The rapid development of mitigation tools demonstrates technical superiority and could accelerate customer acquisition.",
        evidencePoints: [
          'Discovered critical vulnerability affecting 40% of Fortune 500 companies',
          'Already developed and deployed mitigation tools to existing clients',
          'Published detailed technical analysis establishing thought leadership',
          'Potential to convert non-customers who are affected by the vulnerability',
          'Media coverage has significantly increased brand visibility in enterprise space'
        ],
        relatedNewsIds: [8],
        predictedMovementDirection: 'up',
        predictedMovementPercent: 13.6,
        confidenceScore: 0.89,
        isBreakthrough: true,
        shortTermOutlook: "CrowdStrike's discovery of this major security vulnerability creates an immediate opportunity to convert affected companies into customers. The company's rapid response and mitigation tools demonstrate their technological leadership, potentially driving accelerated revenue growth in the next 1-2 quarters.",
        longTermOutlook: "This security discovery reinforces CrowdStrike's position as a leader in threat intelligence, a key differentiator in the competitive cybersecurity landscape. The visibility gained from this high-profile vulnerability could enhance enterprise customer acquisition rates over the next 12-24 months, potentially expanding annual recurring revenue faster than current market projections suggest.",
        analysisDate: new Date(now.getTime() - 12000000) // 3.33 hours ago
      },
      {
        stockId: 9, // PLTR
        stockSymbol: 'PLTR',
        companyName: 'Palantir Technologies Inc.',
        potentialRating: 9,
        breakingNewsCount: 2,
        positiveNewsCount: 4,
        negativeNewsCount: 1,
        summaryText: "Palantir's $200M government contract represents a major win and validates its AI-enhanced security platform. This deal could open the door to additional government contracts and demonstrates the company's growing influence in national security.",
        evidencePoints: [
          'Secured $200M contract with US government for AI-enhanced security platform',
          'Contract represents 20% increase over previous largest government deal',
          'Multi-year agreement provides stable, recurring revenue stream',
          'Potential for expansion into additional government departments',
          'Demonstrates competitive advantage in highly regulated, security-sensitive applications'
        ],
        relatedNewsIds: [9],
        predictedMovementDirection: 'up',
        predictedMovementPercent: 11.2,
        confidenceScore: 0.87,
        isBreakthrough: false,
        analysisDate: yesterday
      },
      
      // Biotech and Pharmaceutical
      {
        stockId: 10, // MRNA
        stockSymbol: 'MRNA',
        companyName: 'Moderna, Inc.',
        potentialRating: 10,
        breakingNewsCount: 3,
        positiveNewsCount: 6,
        negativeNewsCount: 1,
        summaryText: "Moderna's mRNA cancer vaccine showing 57% reduction in cancer recurrence represents a potential breakthrough in oncology. If confirmed in Phase 3 trials, this could establish an entirely new product category with massive market potential.",
        evidencePoints: [
          'Phase 2 trial shows 57% reduction in cancer recurrence when combined with immunotherapy',
          'Safety profile appears favorable with manageable side effects',
          'Potential addressable market estimated at $15-20 billion annually',
          'Technology potentially applicable to multiple cancer types',
          'Patent protection secured through 2038 for core technology'
        ],
        relatedNewsIds: [10],
        predictedMovementDirection: 'up',
        predictedMovementPercent: 18.7,
        confidenceScore: 0.92,
        isBreakthrough: true,
        analysisDate: new Date(now.getTime() - 36000000) // 10 hours ago
      },
      {
        stockId: 11, // CRSP
        stockSymbol: 'CRSP',
        companyName: 'CRISPR Therapeutics AG',
        potentialRating: 9,
        breakingNewsCount: 2,
        positiveNewsCount: 5,
        negativeNewsCount: 1,
        summaryText: "FDA's Breakthrough Therapy designation for CRISPR's sickle cell treatment is a significant regulatory milestone that could accelerate approval. This treatment addresses a serious genetic disease with limited current treatment options.",
        evidencePoints: [
          'Received FDA Breakthrough Therapy designation for sickle cell treatment',
          'Designation could accelerate approval timeline by 12-18 months',
          'Treatment addresses genetic root cause of disease, not just symptoms',
          'Potential to be first approved CRISPR-based treatment for genetic disease',
          'Preliminary data shows 97% reduction in vaso-occlusive crises in patients'
        ],
        relatedNewsIds: [11],
        predictedMovementDirection: 'up',
        predictedMovementPercent: 14.3,
        confidenceScore: 0.88,
        isBreakthrough: true,
        analysisDate: twoDaysAgo
      },
      
      // Electric Vehicle and Clean Energy
      {
        stockId: 12, // RIVN
        stockSymbol: 'RIVN',
        companyName: 'Rivian Automotive, Inc.',
        potentialRating: 8,
        breakingNewsCount: 1,
        positiveNewsCount: 3,
        negativeNewsCount: 1,
        summaryText: "Rivian's new manufacturing process reducing production costs by 20% addresses a critical challenge for the company: reaching profitability. This cost reduction could significantly improve gross margins and accelerate the path to positive cash flow.",
        evidencePoints: [
          'New manufacturing process reduces production costs by 20%',
          'Implementation already begun at main manufacturing facility',
          'Would improve gross margin by estimated 15 percentage points',
          'Could accelerate profitability timeline by 2-3 quarters',
          'Technology appears proprietary with patent protection'
        ],
        relatedNewsIds: [12],
        predictedMovementDirection: 'up',
        predictedMovementPercent: 9.1,
        confidenceScore: 0.84,
        isBreakthrough: false,
        analysisDate: yesterday
      },
      {
        stockId: 13, // FSLR
        stockSymbol: 'FSLR',
        companyName: 'First Solar, Inc.',
        potentialRating: 10,
        breakingNewsCount: 3,
        positiveNewsCount: 5,
        negativeNewsCount: 0,
        summaryText: "First Solar's record 10GW panel order worth potentially $4 billion represents a transformative development. This order significantly expands backlog, provides long-term revenue visibility, and validates the company's thin-film solar technology at massive scale.",
        evidencePoints: [
          'Secured record 10GW panel order from US energy consortium',
          'Order value estimated at over $4 billion in potential revenue',
          'Extends order backlog through 2026, providing clear revenue visibility',
          'Demonstrates competitive advantage of US-based manufacturing under IRA incentives',
          'Order size will drive further manufacturing economies of scale'
        ],
        relatedNewsIds: [13],
        predictedMovementDirection: 'up',
        predictedMovementPercent: 16.5,
        confidenceScore: 0.93,
        isBreakthrough: true,
        analysisDate: new Date(now.getTime() - 86400000) // 1 day ago
      },
      
      // Small Caps with Breakthroughs
      {
        stockId: 14, // SMCI
        stockSymbol: 'SMCI',
        companyName: 'Super Micro Computer, Inc.',
        potentialRating: 10,
        breakingNewsCount: 3,
        positiveNewsCount: 5,
        negativeNewsCount: 0,
        summaryText: "Super Micro's 300% increase in AI server demand indicates the company is capturing significant market share in one of tech's fastest-growing segments. The expansion of manufacturing capacity suggests management is preparing for sustained high demand.",
        evidencePoints: [
          'Reported 300% year-over-year increase in demand for AI-optimized server solutions',
          'Announced plans to expand manufacturing capacity to meet this growing demand',
          'Current order backlog exceeds two quarters of production capacity',
          'New facility optimized for liquid-cooled server manufacturing, a premium segment',
          'Product portfolio specifically designed for latest AI accelerator chips'
        ],
        relatedNewsIds: [14],
        predictedMovementDirection: 'up',
        predictedMovementPercent: 22.4,
        confidenceScore: 0.94,
        isBreakthrough: true,
        analysisDate: new Date(now.getTime() - 172800000) // 2 days ago
      },
      {
        stockId: 15, // UPST
        stockSymbol: 'UPST',
        companyName: 'Upstart Holdings, Inc.',
        potentialRating: 9,
        breakingNewsCount: 2,
        positiveNewsCount: 4,
        negativeNewsCount: 1,
        summaryText: "Upstart's AI lending platform achieving 31% higher approval rates while maintaining or reducing default risk represents a powerful validation of its technology. This performance could accelerate bank partner adoption and significantly expand loan origination volume.",
        evidencePoints: [
          'AI lending platform achieves 31% higher approval rates without increasing default risk',
          'Performance substantially exceeds industry-standard credit scoring models',
          'Technology works across multiple loan categories (personal, auto, small business)',
          'Three new bank partners added in last 60 days based on these results',
          'Total addressable market estimated at over $1 trillion in annual loan originations'
        ],
        relatedNewsIds: [15],
        predictedMovementDirection: 'up',
        predictedMovementPercent: 15.8,
        confidenceScore: 0.86,
        isBreakthrough: true,
        analysisDate: yesterday
      }
    ];
    
    // Create stock analyses
    console.log(`[Vercel] Creating ${sampleAnalyses.length} sample analyses...`);
    sampleAnalyses.forEach(analysis => {
      this.createStockAnalysis(analysis);
    });
    console.log(`[Vercel] Sample data initialization completed. Stocks: ${this.stocks.size}, Analyses: ${this.stockAnalyses.size}, News: ${this.newsItems.size}`);
  }
}

export const storage = new MemStorage();
