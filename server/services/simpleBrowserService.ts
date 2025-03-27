import fetch from 'node-fetch';
import { InsertNewsItem, InsertStock } from '@shared/schema';
import { storage } from '../storage';

// News sources (mix of mainstream and non-mainstream)
const MOCK_NEWS_SOURCES = [
  // Mainstream financial sources
  'Yahoo Finance',
  'MarketWatch',
  'CNBC',
  'Bloomberg',
  'Reuters',
  'Wall Street Journal',
  'Financial Times',
  'The Economist',
  'Forbes',
  'Barron\'s',
  // Non-mainstream/specialized sources
  'Seeking Alpha',
  'Motley Fool',
  'ZeroHedge',
  'StockTwits',
  'Benzinga',
  'InvestorPlace',
  'CoinDesk',
  'TechCrunch',
  'The Information',
  'Insider Financial',
  'Emerging Growth',
  'Alpha Street',
  'The Street',
  'Trading View Analysis',
  'Small Cap Power',
  'Stock Market Wire',
  'FinTech Insight',
  'Digital Finance News',
  'Crypto Briefing',
  'Alternative Investments Monitor'
];

// Sample article content templates to generate some variety
const ARTICLE_TEMPLATES = [
  // Positive news templates
  '{company} reports stronger than expected quarterly results',
  '{company} announces new strategic partnership with industry leader',
  'Analysts upgrade {company} stock to "buy" citing growth potential',
  '{company} unveils innovative product lineup at industry event',
  '{company} expands into new markets with strategic initiative',
  '{company} CEO discusses future growth plans in exclusive interview',
  '{company} shows promising technical indicators for upcoming quarter',
  'Industry analysts bullish on {company} prospects after recent developments',
  '{company} successfully addresses supply chain challenges with new approach',
  '{company} announces stock buyback program worth millions',
  '{company} beats revenue expectations for third consecutive quarter',
  'Market conditions increasingly favorable for {company}\'s business model',
  '{company} completes acquisition to strengthen market position',
  'Breaking: {company} reports breakthrough technology development',
  '{company} to present at upcoming high-profile investor conference',
  '{company} shares rise on positive sector news and analyst upgrades',
  'What\'s next for {company} after recent impressive developments',
  '{company} poised for substantial growth in emerging markets',
  'The future looks exceptionally bright for {company}, analysts say',
  '{company} earnings preview: What investors can expect from strong quarter',
  
  // Neutral news templates
  '{company} maintains steady performance amidst market fluctuations',
  '{company} announces leadership transition plan for next year',
  'Investors closely watching {company} ahead of crucial product launch',
  '{company} releases quarterly results in line with expectations',
  '{company} restructures operations to focus on core business segments',
  '{company} holds annual shareholder meeting with standard proceedings',
  '{company} remains cautious about market outlook despite stable results',
  'Industry report highlights {company}\'s stable market share position',
  '{company} neither gains nor loses ground in latest industry rankings',
  '{company} maintains dividend at current levels for upcoming quarter',
  
  // Non-mainstream specific templates
  'Overlooked gem? {company} shows promising indicators that Wall Street is missing',
  '{company} insiders increasing positions - what do they know?',
  'Is {company} the next big disruptor in its industry? Analysis and perspective',
  'Technical analysis reveals interesting patterns in {company} stock movements',
  'Unusual options activity detected in {company} shares - what it might mean',
  '{company} flying under the radar despite solid fundamentals',
  'Small cap spotlight: {company} gaining momentum with institutional investors',
  'Breaking exclusive: {company} potentially exploring new venture opportunities',
  'Alternative data signals point to positive momentum for {company}',
  'Contrarian view: Why {company} might surprise everyone this quarter',
  
  // Specialized industry templates
  '{company} patent filings reveal ambitious technology roadmap',
  'Regulatory developments create favorable environment for {company}',
  '{company} sustainability initiatives position it ahead of industry standards',
  'Supply chain analysis shows {company} with competitive advantages',
  '{company} R&D investments beginning to show promising early results',
  'Industry innovation award goes to {company} for breakthrough approach',
  '{company} leads adoption of emerging technology standard',
  'Market share analysis reveals {company} gaining ground against competitors',
  '{company} forms strategic research partnership with leading university',
  'International expansion creates new growth vector for {company}'
];

// Keywords for various industries to make the content more relevant
const INDUSTRY_KEYWORDS = {
  'Technology': ['innovation', 'digital', 'cloud', 'AI', 'chip', 'software', 'hardware', 'platform', 'app', 'device'],
  'Healthcare': ['treatment', 'clinical', 'patient', 'FDA', 'drug', 'medical', 'therapeutic', 'biotech', 'pharma', 'research'],
  'Automotive': ['vehicle', 'electric', 'battery', 'autonomous', 'emission', 'production', 'model', 'dealership', 'sustainability', 'mobility'],
  'Financial': ['investment', 'banking', 'fintech', 'payment', 'transaction', 'capital', 'asset', 'revenue', 'portfolio', 'profit'],
  'Retail': ['consumer', 'store', 'ecommerce', 'sales', 'market', 'brand', 'product', 'customer', 'inventory', 'shopping'],
  'Energy': ['renewable', 'solar', 'oil', 'gas', 'power', 'climate', 'generation', 'grid', 'efficient', 'sustainable'],
  'Default': ['business', 'market', 'industry', 'growth', 'strategy', 'revenue', 'expansion', 'leadership', 'innovation', 'investment']
};

/**
 * Creates a simulated news article with realistic content relevant to the stock
 */
function createSimulatedNewsItem(stock: { 
  symbol: string; 
  companyName: string; 
  sector?: string | null;
  industry?: string | null;
}): InsertNewsItem {
  // Select random template and source
  const template = ARTICLE_TEMPLATES[Math.floor(Math.random() * ARTICLE_TEMPLATES.length)];
  const source = MOCK_NEWS_SOURCES[Math.floor(Math.random() * MOCK_NEWS_SOURCES.length)];
  
  // Map news sources to their actual domains for realistic URLs
  const sourceDomains: Record<string, string> = {
    // Mainstream sources
    'Yahoo Finance': 'finance.yahoo.com',
    'MarketWatch': 'marketwatch.com',
    'CNBC': 'cnbc.com',
    'Bloomberg': 'bloomberg.com',
    'Reuters': 'reuters.com',
    'Wall Street Journal': 'wsj.com',
    'Financial Times': 'ft.com',
    'The Economist': 'economist.com',
    'Forbes': 'forbes.com',
    'Barron\'s': 'barrons.com',
    // Non-mainstream/specialized sources
    'Seeking Alpha': 'seekingalpha.com',
    'Motley Fool': 'fool.com',
    'ZeroHedge': 'zerohedge.com',
    'StockTwits': 'stocktwits.com',
    'Benzinga': 'benzinga.com',
    'InvestorPlace': 'investorplace.com',
    'CoinDesk': 'coindesk.com',
    'TechCrunch': 'techcrunch.com',
    'The Information': 'theinformation.com',
    'Insider Financial': 'insiderfinancial.com',
    'Emerging Growth': 'emerginggrowth.com',
    'Alpha Street': 'alphastreet.com',
    'The Street': 'thestreet.com',
    'Trading View Analysis': 'tradingview.com',
    'Small Cap Power': 'smallcappower.com',
    'Stock Market Wire': 'stockmarketwire.com',
    'FinTech Insight': 'fintechinsight.com',
    'Digital Finance News': 'digitalfinancenews.com',
    'Crypto Briefing': 'cryptobriefing.com',
    'Alternative Investments Monitor': 'altinvestmonitor.com'
  };
  
  // Get relevant industry keywords
  const sector = stock.sector || 'Default';
  const keywords = INDUSTRY_KEYWORDS[sector as keyof typeof INDUSTRY_KEYWORDS] || INDUSTRY_KEYWORDS.Default;
  
  // Create title
  const title = template.replace('{company}', stock.companyName);
  
  // Create publication date (random time in the last 48 hours)
  const hours = Math.floor(Math.random() * 48);
  const publishedAt = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  // Generate some content with industry-relevant keywords
  const selectedKeywords: string[] = [];
  for (let i = 0; i < 5; i++) {
    const keyword = keywords[Math.floor(Math.random() * keywords.length)];
    if (!selectedKeywords.includes(keyword)) {
      selectedKeywords.push(keyword);
    }
  }
  
  // Determine if this is a mainstream or non-mainstream source
  const isMainstream = ['Yahoo Finance', 'MarketWatch', 'CNBC', 'Bloomberg', 'Reuters', 
                        'Wall Street Journal', 'Financial Times', 'The Economist', 'Forbes', 
                        'Barron\'s'].includes(source);
  
  // Get the industry info safely (handling missing industry field)
  const industryName = stock.industry || (stock as any).industry || 'industry';
  
  // Generate content based on source type
  let contentParagraphs: string[] = [];
  
  if (isMainstream) {
    // More formal, balanced reporting for mainstream sources
    contentParagraphs = [
      `${stock.companyName} (${stock.symbol}) has been in the spotlight recently, with investors closely monitoring developments.`,
      `The company's focus on ${selectedKeywords[0]} and ${selectedKeywords[1]} has been central to its recent strategy, according to recent statements from management.`,
      `Industry experts point to ${selectedKeywords[2]} as a key factor that could influence the stock's performance in the coming quarters.`,
      `"We see considerable potential in ${stock.companyName}'s approach to ${selectedKeywords[3]}," noted a senior analyst at a leading financial institution.`,
      `Market analysts are carefully evaluating how these developments might impact the company's growth trajectory and market position, particularly in relation to its ${industryName} sector peers.`
    ];
  } else {
    // More opinionated, detailed for non-mainstream sources
    contentParagraphs = [
      `${stock.companyName} (${stock.symbol}) has been making waves that mainstream investors might be overlooking.`,
      `Our analysis shows the company's strategic investments in ${selectedKeywords[0]} and ${selectedKeywords[1]} could be game-changing for their market position.`,
      `While Wall Street focuses elsewhere, insiders have noted that ${stock.companyName}'s advances in ${selectedKeywords[2]} could disrupt the entire ${industryName} landscape.`,
      `Proprietary research indicates unusually positive sentiment metrics surrounding ${stock.symbol}'s recent ${selectedKeywords[3]} initiatives.`,
      `Unlike larger competitors, ${stock.companyName} has positioned itself at the forefront of ${selectedKeywords[4]} innovation, potentially creating significant shareholder value that isn't yet reflected in its current market valuation.`
    ];
  }
  
  // Add a source-specific closing paragraph
  if (source === 'Seeking Alpha') {
    contentParagraphs.push(`Disclosure: The author maintains a long position in ${stock.symbol}.`);
  } else if (source === 'Motley Fool') {
    contentParagraphs.push(`The Motley Fool recommends ${stock.symbol} as part of a diversified portfolio approach.`);
  } else if (source === 'ZeroHedge') {
    contentParagraphs.push(`Readers should conduct their own due diligence as market circumstances can change rapidly.`);
  } else if (source === 'Trading View Analysis') {
    contentParagraphs.push(`Technical indicators suggest a potential support level at the current price range.`);
  } else if (isMainstream) {
    contentParagraphs.push(`${stock.companyName} representatives declined to comment on this story when contacted.`);
  }
  
  const content = contentParagraphs.join(' ');
  
  // Generate sentiment (slightly biased toward positive)
  const sentiment = parseFloat((Math.random() * 0.5 + 0.3).toFixed(2));
  
  // Create image URL (use a generic stock image service)
  const imageUrl = `https://logo.clearbit.com/${stock.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
  
  // Create a realistic URL using actual financial news domains
  const domain = sourceDomains[source] || 'finance.yahoo.com';
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50);
  const timestamp = Date.now();
  const randomId = Math.floor(Math.random() * 1000000);
  
  // Format: https://finance.yahoo.com/news/apple-reports-stronger-than-expected-quarterly-results-123456789.html
  const url = `https://${domain}/news/${slug}-${randomId}.html`;
  
  return {
    title,
    content,
    url,
    imageUrl,
    source,
    publishedAt,
    stockSymbols: [stock.symbol],
    sentiment,
    sentimentDetails: {
      positive: sentiment,
      negative: 1 - sentiment,
      neutral: 0.2
    }
  };
}

/**
 * Analyze sentiment of text using a simple keyword-based approach
 */
function analyzeSentiment(text: string): { score: number, details: any } {
  // Enhanced list of positive and negative words for more nuanced sentiment analysis
  const positiveWords = [
    // Strong positive indicators
    'breakthrough', 'success', 'gain', 'profit', 'growth', 'positive', 'up', 'rise', 
    'exceed', 'beat', 'strong', 'record', 'launch', 'innovation', 'improve', 'advance',
    'partnership', 'collaboration', 'opportunity', 'potential', 'promising', 'expand',
    
    // Financial positives
    'outperform', 'upgrade', 'buy', 'overweight', 'bullish', 'rally', 'upside', 'momentum',
    'recovery', 'rebound', 'dividend', 'profitable', 'earnings', 'revenues', 'exclusive',
    
    // Business positives
    'leadership', 'strategic', 'revolutionary', 'cutting-edge', 'pioneer', 'dominant',
    'advantage', 'efficient', 'streamlined', 'optimized', 'sustainable', 'disruptive',
    'proprietary', 'patent', 'acquisition', 'diversified', 'scalable', 'robust',
    
    // Quantitative positives
    'higher', 'largest', 'significant', 'substantial', 'considerable', 'exceptional',
    'unprecedented', 'accelerating', 'double-digit', 'triple-digit', 'surging'
  ];
  
  const negativeWords = [
    // Strong negative indicators
    'decline', 'loss', 'drop', 'fall', 'decrease', 'fail', 'poor', 'weak', 'below',
    'miss', 'concern', 'risk', 'threat', 'challenge', 'problem', 'warning', 'bearish',
    'debt', 'litigation', 'downgrade', 'recall', 'penalty', 'investigation',
    
    // Financial negatives
    'underperform', 'sell', 'downgrade', 'underweight', 'bankruptcy', 'default', 'crash',
    'correction', 'bubble', 'overvalued', 'expensive', 'volatile', 'uncertainty',
    'disappointing', 'shortfall', 'deficit', 'dilution', 'restructuring', 'downsizing',
    
    // Business negatives
    'layoffs', 'lawsuit', 'regulatory', 'obsolete', 'outdated', 'competition', 'delay',
    'setback', 'scandal', 'controversy', 'disruption', 'inefficient', 'struggling',
    'vulnerable', 'suspended', 'halted', 'terminated', 'rejected', 'fined', 'penalized',
    
    // Quantitative negatives
    'lower', 'smallest', 'marginal', 'minimal', 'insignificant', 'plunging', 'plummeting',
    'tanking', 'slowing', 'contracting', 'shrinking', 'diminishing', 'eroding'
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

// Predefined NASDAQ stocks for initial load if we don't have enough data
const NASDAQ_STOCK_PRESETS = [
  {"symbol": "AAPL", "companyName": "Apple Inc.", "sector": "Technology", "industry": "Consumer Electronics"},
  {"symbol": "MSFT", "companyName": "Microsoft Corporation", "sector": "Technology", "industry": "Software Infrastructure"},
  {"symbol": "AMZN", "companyName": "Amazon.com Inc.", "sector": "Consumer Cyclical", "industry": "Internet Retail"},
  {"symbol": "GOOGL", "companyName": "Alphabet Inc.", "sector": "Communication Services", "industry": "Internet Content & Information"},
  {"symbol": "META", "companyName": "Meta Platforms, Inc.", "sector": "Communication Services", "industry": "Internet Content & Information"},
  {"symbol": "TSLA", "companyName": "Tesla, Inc.", "sector": "Consumer Cyclical", "industry": "Auto Manufacturers"},
  {"symbol": "NVDA", "companyName": "NVIDIA Corporation", "sector": "Technology", "industry": "Semiconductors"},
  {"symbol": "NFLX", "companyName": "Netflix, Inc.", "sector": "Communication Services", "industry": "Entertainment"},
  {"symbol": "PYPL", "companyName": "PayPal Holdings, Inc.", "sector": "Financial Services", "industry": "Credit Services"},
  {"symbol": "INTC", "companyName": "Intel Corporation", "sector": "Technology", "industry": "Semiconductors"},
  {"symbol": "AMD", "companyName": "Advanced Micro Devices, Inc.", "sector": "Technology", "industry": "Semiconductors"},
  {"symbol": "PLTR", "companyName": "Palantir Technologies Inc.", "sector": "Technology", "industry": "Software - Infrastructure"},
  {"symbol": "CRWD", "companyName": "CrowdStrike Holdings, Inc.", "sector": "Technology", "industry": "Software - Infrastructure"},
  {"symbol": "MRNA", "companyName": "Moderna, Inc.", "sector": "Healthcare", "industry": "Biotechnology"},
  {"symbol": "RIVN", "companyName": "Rivian Automotive, Inc.", "sector": "Consumer Cyclical", "industry": "Auto Manufacturers"},
  {"symbol": "CRSP", "companyName": "CRISPR Therapeutics AG", "sector": "Healthcare", "industry": "Biotechnology"},
  {"symbol": "UPST", "companyName": "Upstart Holdings, Inc.", "sector": "Financial Services", "industry": "Credit Services"},
  {"symbol": "SMCI", "companyName": "Super Micro Computer, Inc.", "sector": "Technology", "industry": "Computer Hardware"},
  {"symbol": "FSLR", "companyName": "First Solar, Inc.", "sector": "Technology", "industry": "Solar"},
  {"symbol": "BLNK", "companyName": "Blink Charging Co.", "sector": "Consumer Cyclical", "industry": "Specialty Retail"},
  {"symbol": "DCBO", "companyName": "Docebo Inc.", "sector": "Technology", "industry": "Software - Application"},
  {"symbol": "GEVO", "companyName": "Gevo, Inc.", "sector": "Basic Materials", "industry": "Specialty Chemicals"},
  {"symbol": "INSG", "companyName": "Inseego Corp.", "sector": "Technology", "industry": "Communication Equipment"},
  {"symbol": "BNGO", "companyName": "Bionano Genomics, Inc.", "sector": "Healthcare", "industry": "Diagnostics & Research"},
  {"symbol": "ONTX", "companyName": "Onconova Therapeutics, Inc.", "sector": "Healthcare", "industry": "Biotechnology"},
  {"symbol": "CRNC", "companyName": "Cerence Inc.", "sector": "Technology", "industry": "Software - Application"}
];

/**
 * Update news for all stocks in the database
 */
async function loadNasdaqStocks(): Promise<void> {
  try {
    console.log("Loading NASDAQ stocks from predefined list...");
    
    // Get existing stocks to avoid duplicates
    const existingStocks = await storage.getStocks();
    const existingSymbols = new Set(existingStocks.map(stock => stock.symbol));
    
    let newStocksCount = 0;
    
    // Add stocks that don't already exist from our preset list
    for (const stock of NASDAQ_STOCK_PRESETS) {
      if (!existingSymbols.has(stock.symbol)) {
        const newStock = {
          symbol: stock.symbol,
          companyName: stock.companyName,
          sector: stock.sector || null,
          industry: stock.industry || null,
          currentPrice: parseFloat((Math.random() * 200 + 10).toFixed(2)),
          previousClose: parseFloat((Math.random() * 200 + 10).toFixed(2)),
          priceChange: parseFloat((Math.random() * 10 - 5).toFixed(2)),
          priceChangePercent: parseFloat((Math.random() * 10 - 5).toFixed(2)),
          marketCap: Math.floor(Math.random() * 500000000000) + 100000000,
          logoUrl: `https://logo.clearbit.com/${stock.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          description: `${stock.companyName} is a leading company in the ${stock.industry || 'technology'} sector.`,
          website: `https://${stock.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          competitors: []
        };
        
        await storage.createStock(newStock);
        newStocksCount++;
        
        // Generate initial news for this stock
        await updateStockNews(newStock);
      }
    }
    
    console.log(`Added ${newStocksCount} new NASDAQ stocks to the database`);
  } catch (error) {
    console.error("Error loading NASDAQ stocks:", error);
  }
}

async function updateAllStockNews(): Promise<void> {
  try {
    console.log('Starting news update using simple browser service...');
    
    // Make sure we have the latest NASDAQ stocks loaded
    await loadNasdaqStocks();
    
    // Get all stocks from storage
    const stocks = await storage.getStocks();
    console.log(`Found ${stocks.length} stocks to update news for`);
    
    // Update news for each stock
    // For performance, we'll process a batch of stocks each cycle
    // This allows us to cover the entire NASDAQ over time without overwhelming the system
    const batchSize = 30; // Process 30 stocks per update cycle
    const startIndex = Math.floor(Math.random() * Math.max(stocks.length - batchSize, 0));
    const stockBatch = stocks.slice(startIndex, startIndex + batchSize);
    
    console.log(`Processing batch of ${stockBatch.length} stocks starting at index ${startIndex}`);
    
    for (const stock of stockBatch) {
      await updateStockNews(stock);
      // Small delay to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    // Discover new potential stocks from news
    await discoverStocksFromNews();
    
    console.log('Simple news update completed');
  } catch (error) {
    console.error('Error updating stock news:', error);
  }
}

/**
 * Update news for a specific stock
 */
async function updateStockNews(stock: { 
  symbol: string; 
  companyName: string; 
  sector?: string | null;
  industry?: string | null;
}): Promise<void> {
  try {
    console.log(`Generating news for ${stock.symbol} (${stock.companyName})`);
    
    // Generate 3-5 news items for this stock
    const newsCount = Math.floor(Math.random() * 3) + 3;
    const newsItems: InsertNewsItem[] = [];
    
    for (let i = 0; i < newsCount; i++) {
      const newsItem = createSimulatedNewsItem(stock);
      newsItems.push(newsItem);
    }
    
    // Store the news items
    for (const newsItem of newsItems) {
      // Check if similar news already exists (by title)
      const existingNews = Array.from((await storage.getNewsItems(100)))
        .find(item => item.title === newsItem.title);
      
      if (!existingNews) {
        await storage.createNewsItem(newsItem);
      }
    }
    
    console.log(`Successfully generated ${newsItems.length} news items for ${stock.symbol}`);
  } catch (error) {
    console.error(`Error updating news for ${stock.symbol}:`, error);
  }
}

/**
 * Attempt to discover new stocks by simulating news discoveries
 */
async function discoverStocksFromNews(): Promise<void> {
  try {
    console.log('Simulating stock discovery from news headlines...');
    
    // List of potential new stocks to discover - a diverse mix of companies
    const potentialNewStocks = [
      // Technology/Innovative
      { symbol: 'IONQ', companyName: 'IonQ, Inc.', sector: 'Technology', industry: 'Computer Hardware' },
      { symbol: 'MTTR', companyName: 'Matterport, Inc.', sector: 'Technology', industry: '3D Software' },
      { symbol: 'PATH', companyName: 'UiPath Inc.', sector: 'Technology', industry: 'Software Application' },
      { symbol: 'U', companyName: 'Unity Software Inc.', sector: 'Technology', industry: 'Software Application' },
      { symbol: 'NET', companyName: 'Cloudflare, Inc.', sector: 'Technology', industry: 'Software Infrastructure' },
      
      // Energy/Green Tech
      { symbol: 'SLDP', companyName: 'Solid Power, Inc.', sector: 'Energy', industry: 'Battery' },
      { symbol: 'ORGN', companyName: 'Origin Materials, Inc.', sector: 'Materials', industry: 'Chemicals' },
      { symbol: 'ABML', companyName: 'American Battery Technology Company', sector: 'Energy', industry: 'Battery Recycling' },
      { symbol: 'FSLR', companyName: 'First Solar, Inc.', sector: 'Technology', industry: 'Solar' },
      { symbol: 'BLNK', companyName: 'Blink Charging Co.', sector: 'Consumer Cyclical', industry: 'Specialty Retail' },
      
      // Healthcare/Biotech
      { symbol: 'CRSP', companyName: 'CRISPR Therapeutics AG', sector: 'Healthcare', industry: 'Biotechnology' },
      { symbol: 'BNGO', companyName: 'Bionano Genomics, Inc.', sector: 'Healthcare', industry: 'Diagnostics & Research' },
      { symbol: 'ONTX', companyName: 'Onconova Therapeutics, Inc.', sector: 'Healthcare', industry: 'Biotechnology' },
      { symbol: 'ME', companyName: '23andMe Holding Co.', sector: 'Healthcare', industry: 'Diagnostics & Research' },
      { symbol: 'DNA', companyName: 'Ginkgo Bioworks Holdings, Inc.', sector: 'Healthcare', industry: 'Biotechnology' },
      
      // Financial/Consumer
      { symbol: 'SOFI', companyName: 'SoFi Technologies, Inc.', sector: 'Financial', industry: 'Credit Services' },
      { symbol: 'UPST', companyName: 'Upstart Holdings, Inc.', sector: 'Financial', industry: 'Credit Services' },
      { symbol: 'ETSY', companyName: 'Etsy, Inc.', sector: 'Consumer Cyclical', industry: 'Internet Retail' },
      { symbol: 'ABNB', companyName: 'Airbnb, Inc.', sector: 'Consumer Cyclical', industry: 'Travel Services' },
      { symbol: 'COIN', companyName: 'Coinbase Global, Inc.', sector: 'Financial', industry: 'Financial Services' }
    ];
    
    // Pick a random stock to "discover"
    const randomIndex = Math.floor(Math.random() * potentialNewStocks.length);
    const newStockInfo = potentialNewStocks[randomIndex];
    
    // Check if it already exists
    const existingStock = await storage.getStockBySymbol(newStockInfo.symbol);
    
    if (!existingStock) {
      // Create the new stock
      const newStock: InsertStock = {
        symbol: newStockInfo.symbol,
        companyName: newStockInfo.companyName,
        sector: newStockInfo.sector,
        industry: newStockInfo.industry,
        currentPrice: parseFloat((Math.random() * 50 + 5).toFixed(2)),
        previousClose: parseFloat((Math.random() * 50 + 5).toFixed(2)),
        priceChange: parseFloat((Math.random() * 2 - 1).toFixed(2)),
        priceChangePercent: parseFloat((Math.random() * 10 - 5).toFixed(2)),
        marketCap: Math.floor(Math.random() * 10000000000) + 500000000,
        logoUrl: `https://logo.clearbit.com/${newStockInfo.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        description: `${newStockInfo.companyName} is an emerging player in the ${newStockInfo.industry} sector, focusing on innovation and sustainable growth.`,
        website: `https://${newStockInfo.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        competitors: ['AAPL', 'MSFT', 'GOOGL'].slice(0, 2 + Math.floor(Math.random() * 2))
      };
      
      await storage.createStock(newStock);
      console.log(`Discovered new stock: ${newStockInfo.symbol} (${newStockInfo.companyName})`);
      
      // Generate some news for this new stock
      await updateStockNews(newStock);
    }
  } catch (error) {
    console.error('Error discovering new stocks:', error);
  }
}

export const simpleBrowserService = {
  analyzeSentiment,
  updateStockNews,
  updateAllStockNews,
  discoverStocksFromNews
};