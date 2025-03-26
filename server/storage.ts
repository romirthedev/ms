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
} from "@shared/schema";
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
    
    // Initialize with some sample data
    this.initializeSampleData();
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
      updatedAt: now
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
      createdAt: new Date()
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
    return Array.from(this.stockAnalyses.values())
      .filter(analysis => analysis.predictedMovementDirection === 'up')
      .sort((a, b) => {
        // Sort by potential rating and confidence score
        if (a.potentialRating !== b.potentialRating) {
          return b.potentialRating - a.potentialRating;
        }
        return b.confidenceScore - a.confidenceScore;
      })
      .slice(0, limit);
  }
  
  async createStockAnalysis(insertAnalysis: InsertStockAnalysis): Promise<StockAnalysis> {
    const id = this.currentStockAnalysisId++;
    const now = new Date();
    const analysis: StockAnalysis = { 
      ...insertAnalysis, 
      id,
      createdAt: now,
      updatedAt: now
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
      addedAt: new Date()
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
    // Sample stocks
    const sampleStocks: InsertStock[] = [
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
        description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
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
    
    const sampleNews: InsertNewsItem[] = [
      {
        title: 'Apple Announces Breakthrough AI Features for Next iPhone',
        content: 'Apple today unveiled a suite of groundbreaking AI features that will be integrated into the next generation iPhone, expected to launch this fall. The new features leverage on-device machine learning to enhance photography, voice recognition, and battery optimization.',
        url: 'https://example.com/apple-ai-features',
        imageUrl: 'https://example.com/apple-ai.jpg',
        source: 'Tech Insider',
        publishedAt: new Date(now.getTime() - 3600000), // 1 hour ago
        stockSymbols: ['AAPL'],
        sentiment: 0.85,
        sentimentDetails: { positive: 0.85, negative: 0.05, neutral: 0.1 }
      },
      {
        title: 'NVIDIA Partners with Leading Automakers on Autonomous Driving Technology',
        content: 'NVIDIA announced partnerships with five major automakers to supply its next-generation autonomous driving chips and software. This significant expansion in the automotive sector could provide a new growth avenue for the chip maker.',
        url: 'https://example.com/nvidia-automakers',
        imageUrl: 'https://example.com/nvidia-auto.jpg',
        source: 'Market Watch',
        publishedAt: yesterday,
        stockSymbols: ['NVDA', 'TSLA'],
        sentiment: 0.78,
        sentimentDetails: { positive: 0.78, negative: 0.07, neutral: 0.15 }
      },
      {
        title: 'Tesla Secures Patent for Revolutionary Battery Technology',
        content: 'Tesla has been granted a patent for a new battery cell design that could potentially increase energy density by 40% while reducing manufacturing costs. Industry experts suggest this breakthrough could significantly extend vehicle range and accelerate electric vehicle adoption.',
        url: 'https://example.com/tesla-battery-patent',
        imageUrl: 'https://example.com/tesla-battery.jpg',
        source: 'EV Journal',
        publishedAt: twoDaysAgo,
        stockSymbols: ['TSLA'],
        sentiment: 0.92,
        sentimentDetails: { positive: 0.92, negative: 0.02, neutral: 0.06 }
      },
      {
        title: 'Microsoft Azure AI Platform Shows Strong Growth in Enterprise Adoption',
        content: 'Microsoft reported that its Azure AI services are experiencing rapid adoption among enterprise customers, with usage doubling over the past six months. The company\'s strategic focus on integrating AI capabilities across its product suite is starting to show significant revenue impact.',
        url: 'https://example.com/microsoft-azure-ai',
        imageUrl: 'https://example.com/microsoft-azure.jpg',
        source: 'Business Tech',
        publishedAt: yesterday,
        stockSymbols: ['MSFT'],
        sentiment: 0.82,
        sentimentDetails: { positive: 0.82, negative: 0.03, neutral: 0.15 }
      },
      {
        title: 'Meta\'s New AR Glasses Prototype Demonstrates Breakthrough Display Technology',
        content: 'Meta Platforms unveiled a prototype of its next-generation AR glasses featuring a revolutionary display technology that offers wider field of view and higher resolution than competing products. This development could position Meta as a leader in the emerging AR market.',
        url: 'https://example.com/meta-ar-glasses',
        imageUrl: 'https://example.com/meta-glasses.jpg',
        source: 'VR World',
        publishedAt: new Date(now.getTime() - 7200000), // 2 hours ago
        stockSymbols: ['META'],
        sentiment: 0.88,
        sentimentDetails: { positive: 0.88, negative: 0.04, neutral: 0.08 }
      }
    ];
    
    // Create news items
    sampleNews.forEach(news => {
      this.createNewsItem(news);
    });
    
    // Sample stock analyses
    const sampleAnalyses: InsertStockAnalysis[] = [
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
          'Patents filed for new on-device machine learning optimization techniques'
        ],
        relatedNewsIds: [1],
        predictedMovementDirection: 'up',
        predictedMovementPercent: 8.5,
        confidenceScore: 0.87,
        isBreakthrough: true,
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
        isBreakthrough: false,
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
        analysisDate: new Date(now.getTime() - 7200000) // 2 hours ago
      }
    ];
    
    // Create stock analyses
    sampleAnalyses.forEach(analysis => {
      this.createStockAnalysis(analysis);
    });
  }
}

export const storage = new MemStorage();
