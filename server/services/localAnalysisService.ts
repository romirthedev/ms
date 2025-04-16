import { InsertStockAnalysis, NewsItem, Stock as BaseStock } from '@shared/schema';

// Extend the Stock type to include analysis
interface Stock extends BaseStock {
  analysis?: {
    rating: number;
    summary: string;
    confidence: number;
    movement: 'up' | 'down' | 'stable';
    shortTerm: string;
  };
}
import { storage } from '../storage';

// Interface for analysis results
interface StockAnalysisResult {
  potentialRating: number; // 1-10 rating
  summaryText: string;
  predictedMovementDirection: 'up' | 'down' | 'stable';
  breakingNewsCount: number | null;
  positiveNewsCount: number | null;
  negativeNewsCount: number | null;
  neutralNewsCount: number | null;
  priceTargets: {
    low: number | null;
    high: number | null;
  };
  evidencePoints: string[] | null;
  shortTermOutlook: string | null;
  longTermOutlook: string | null;
}

// Function to analyze news using local algorithm and generate stock analysis
async function analyzeStockNews(stock: Stock, news: NewsItem[]): Promise<StockAnalysisResult> {
  try {
    if (!news.length) {
      return {
        potentialRating: 5,
        summaryText: "Insufficient news data for analysis",
        predictedMovementDirection: "stable",
        breakingNewsCount: 0,
        positiveNewsCount: 0,
        negativeNewsCount: 0,
        neutralNewsCount: 0,
        priceTargets: { low: null, high: null },
        evidencePoints: [],
        shortTermOutlook: "Neutral due to lack of news coverage",
        longTermOutlook: null
      };
    }

    // Count news by sentiment 
    let positiveNews = 0;
    let negativeNews = 0;
    let neutralNews = 0;
    let totalSentiment = 0;
    
    // Key phrases that indicate breaking news
    const breakingNewsKeywords = [
      'breakthrough', 'announces', 'reveals', 'launches', 'partners',
      'secures', 'wins', 'major', 'breaking', 'exclusive', 'just in',
      'merger', 'acquisition', 'fda approval', 'clinical trial',
      'patent', 'earnings beat', 'exceeds expectations'
    ];
    
    // Extract evidence points from news (titles)
    const evidencePoints: string[] = [];
    const titleWords = new Set<string>();
    
    // Process each news item
    for (const item of news) {
      // Analyze sentiment
      if (item.sentiment !== null) {
        if (item.sentiment > 0.6) {
          positiveNews++;
        } else if (item.sentiment < 0.4) {
          negativeNews++;
        } else {
          neutralNews++;
        }
        totalSentiment += item.sentiment;
      } else {
        neutralNews++;
        totalSentiment += 0.5; // Default neutral sentiment
      }
      
      // Extract potential evidence points from titles (remove duplicates)
      const title = item.title.toLowerCase();
      const words = title.split(/\s+/);
      let isUnique = false;
      
      for (const word of words) {
        if (word.length > 4 && !titleWords.has(word)) {
          titleWords.add(word);
          isUnique = true;
        }
      }
      
      if (isUnique && evidencePoints.length < 5) {
        evidencePoints.push(item.title);
      }
    }
    
    // Count breaking news items
    const breakingNewsCount = news.filter(item => {
      const text = (item.title + ' ' + item.content).toLowerCase();
      return breakingNewsKeywords.some(keyword => text.includes(keyword.toLowerCase()));
    }).length;
    
    // Calculate average sentiment
    const avgSentiment = totalSentiment / news.length;
    
    // Determine movement direction
    let movementDirection: 'up' | 'down' | 'stable' = 'stable';
    if (avgSentiment > 0.6) {
      movementDirection = 'up';
    } else if (avgSentiment < 0.4) {
      movementDirection = 'down';
    }
    
    // Calculate potential rating (1-10)
    // Base on: sentiment, breaking news count, and news volume
    let potentialRating = 5; // Start neutral
    
    // Adjust based on sentiment (±3)
    potentialRating += (avgSentiment - 0.5) * 6;
    
    // Adjust based on breaking news (±1.5)
    potentialRating += (breakingNewsCount / news.length) * 3;
    
    // Adjust based on positive vs negative ratio (±1.5)
    if (positiveNews + negativeNews > 0) {
      const posRatio = positiveNews / (positiveNews + negativeNews);
      potentialRating += (posRatio - 0.5) * 3;
    }
    
    // Clamp to 1-10 range
    potentialRating = Math.max(1, Math.min(10, potentialRating));
    potentialRating = Math.round(potentialRating * 10) / 10; // Round to 1 decimal
    
    // Generate price targets (if stock has price data)
    let lowTarget = null;
    let highTarget = null;
    
    if (stock.currentPrice !== null) {
      // Simple price targets based on current price and sentiment
      const baseChange = potentialRating >= 7 ? 0.15 : potentialRating >= 5 ? 0.08 : 0.05;
      const adjustedChange = baseChange * (potentialRating / 5);
      
      if (movementDirection === 'up') {
        highTarget = Math.round((stock.currentPrice * (1 + adjustedChange)) * 100) / 100;
        lowTarget = Math.round((stock.currentPrice * (1 + adjustedChange / 3)) * 100) / 100;
      } else if (movementDirection === 'down') {
        lowTarget = Math.round((stock.currentPrice * (1 - adjustedChange)) * 100) / 100;
        highTarget = Math.round((stock.currentPrice * (1 - adjustedChange / 3)) * 100) / 100;
      } else {
        // Stable
        highTarget = Math.round((stock.currentPrice * 1.05) * 100) / 100;
        lowTarget = Math.round((stock.currentPrice * 0.95) * 100) / 100;
      }
    }
    
    // Generate summary text
    let summaryText = `Analysis based on ${news.length} recent news items for ${stock.companyName}. `;
    
    if (potentialRating >= 7) {
      summaryText += `Highly positive sentiment suggests strong growth potential. `;
    } else if (potentialRating >= 5.5) {
      summaryText += `Moderately positive sentiment indicates potential for growth. `;
    } else if (potentialRating >= 4.5) {
      summaryText += `Neutral sentiment suggests stable performance. `;
    } else if (potentialRating >= 3) {
      summaryText += `Slightly negative sentiment indicates possible challenges ahead. `;
    } else {
      summaryText += `Negative sentiment suggests caution is warranted. `;
    }
    
    if (breakingNewsCount > 0) {
      summaryText += `Found ${breakingNewsCount} potentially significant news items.`;
    }
    
    // Generate outlooks
    let shortTermOutlook = "";
    if (movementDirection === 'up') {
      shortTermOutlook = `Short-term outlook appears positive with ${positiveNews} favorable news items recently.`;
    } else if (movementDirection === 'down') {
      shortTermOutlook = `Short-term caution advised with ${negativeNews} concerning news items recently.`;
    } else {
      shortTermOutlook = `Short-term outlook appears stable with mixed or neutral news coverage.`;
    }
    
    let longTermOutlook = null;
    if (news.length >= 5) {
      if (potentialRating >= 7) {
        longTermOutlook = "Long-term growth prospects appear strong based on current developments.";
      } else if (potentialRating >= 5) {
        longTermOutlook = "Long-term outlook is cautiously positive, monitor for continued momentum.";
      } else if (potentialRating >= 4) {
        longTermOutlook = "Long-term outlook is neutral, requiring further developments to determine direction.";
      } else {
        longTermOutlook = "Long-term challenges may persist, watch for signs of strategy adjustment.";
      }
    }
    
    return {
      potentialRating,
      summaryText,
      predictedMovementDirection: movementDirection,
      breakingNewsCount,
      positiveNewsCount: positiveNews,
      negativeNewsCount: negativeNews,
      neutralNewsCount: neutralNews,
      priceTargets: {
        low: lowTarget,
        high: highTarget
      },
      evidencePoints: evidencePoints.length > 0 ? evidencePoints : null,
      shortTermOutlook,
      longTermOutlook
    };
  } catch (error) {
    console.error(`Error analyzing stock news for ${stock.symbol}:`, error);
    
    // Return a fallback analysis
    return {
      potentialRating: 5,
      summaryText: "Analysis unavailable due to technical issues. Please try again later.",
      predictedMovementDirection: "stable",
      breakingNewsCount: null,
      positiveNewsCount: null,
      negativeNewsCount: null,
      neutralNewsCount: null,
      priceTargets: { low: null, high: null },
      evidencePoints: null,
      shortTermOutlook: null,
      longTermOutlook: null
    };
  }
}

// Update the analysis for a specific stock
async function updateStockAnalysis(stock: Stock): Promise<void> {
  try {
    console.log(`Updating analysis for ${stock.symbol} (${stock.companyName})`);
    
    // Get recent news for this stock
    const news = await storage.getNewsItemsByStockSymbol(stock.symbol, 20);
    
    if (news.length === 0) {
      console.log(`No news found for ${stock.symbol}, skipping analysis`);
      return;
    }
    
    // Analyze the news
    const analysisResult = await analyzeStockNews(stock, news);
    
    // Check if analysis already exists
    const existingAnalysis = await storage.getStockAnalysisByStockId(stock.id);
    
    const now = new Date();
    
    if (existingAnalysis) {
      // Update existing analysis
      await storage.updateStockAnalysis(existingAnalysis.id, {
        potentialRating: analysisResult.potentialRating,
        summaryText: analysisResult.summaryText,
        predictedMovementDirection: analysisResult.predictedMovementDirection,
        predictedMovementPercent: analysisResult.priceTargets.high ? 
          Math.abs((analysisResult.priceTargets.high - (stock.currentPrice || 0)) / (stock.currentPrice || 1) * 100) : null,
        confidenceScore: 0.7, // Fixed confidence since we're using local algorithm
        breakingNewsCount: analysisResult.breakingNewsCount,
        positiveNewsCount: analysisResult.positiveNewsCount,
        negativeNewsCount: analysisResult.negativeNewsCount,
        isBreakthrough: analysisResult.breakingNewsCount ? analysisResult.breakingNewsCount > 2 : false,
        analysisDate: now
      });
    } else {
      // Create new analysis
      const newAnalysis: InsertStockAnalysis = {
        stockId: stock.id,
        stockSymbol: stock.symbol,
        companyName: stock.companyName,
        potentialRating: analysisResult.potentialRating,
        summaryText: analysisResult.summaryText,
        predictedMovementDirection: analysisResult.predictedMovementDirection,
        predictedMovementPercent: analysisResult.priceTargets.high ? 
          Math.abs((analysisResult.priceTargets.high - (stock.currentPrice || 0)) / (stock.currentPrice || 1) * 100) : null,
        confidenceScore: 0.7, // Fixed confidence since we're using local algorithm
        breakingNewsCount: analysisResult.breakingNewsCount,
        positiveNewsCount: analysisResult.positiveNewsCount,
        negativeNewsCount: analysisResult.negativeNewsCount,
        isBreakthrough: analysisResult.breakingNewsCount ? analysisResult.breakingNewsCount > 2 : false,
        analysisDate: now
      };
      
      await storage.createStockAnalysis(newAnalysis);
    }
    
    console.log(`Updated analysis for ${stock.symbol} with rating ${analysisResult.potentialRating}`);
  } catch (error) {
    console.error(`Error updating analysis for ${stock.symbol}:`, error);
  }
}

// Update analyses for all stocks
async function updateAllStockAnalyses(): Promise<void> {
  try {
    console.log('Starting stock analysis update...');
    
    // Get all stocks
    const stocks = await storage.getStocks();
    console.log(`Found ${stocks.length} stocks to analyze`);
    
    // Update analysis for each stock
    for (const stock of stocks) {
      await updateStockAnalysis(stock);
    }
    
    console.log('Stock analysis update completed');
  } catch (error) {
    console.error('Error updating stock analyses:', error);
  }
}

// Get top picks based on comprehensive analysis
async function getTopPicks(limit: number = 5): Promise<Stock[]> {
  try {
    const analyses = await storage.getTopRatedStockAnalyses(limit * 2);
    const topPicks: Stock[] = [];

    // Filter and sort for best picks with more lenient criteria
    for (const analysis of analyses) {
      const stock = await storage.getStockBySymbol(analysis.stockSymbol);
      if (stock && 
          analysis.potentialRating >= 6) { // Lowered from 7
        topPicks.push({
          ...stock,
          analysis: {
            rating: analysis.potentialRating,
            summary: analysis.summaryText || "Analysis in progress",
            confidence: analysis.confidenceScore || 0.5,
            movement: (analysis.predictedMovementDirection as 'up' | 'down' | 'stable') || "stable",
            shortTerm: "Monitoring market conditions"
          }
        });
      }
      
      if (topPicks.length >= limit) break;
    }

    // If we still don't have enough picks, add some default ones
    if (topPicks.length === 0) {
      const defaultStocks = await storage.getStocks();
      for (const stock of defaultStocks.slice(0, limit)) {
        topPicks.push({
          ...stock,
          analysis: {
            rating: 5,
            summary: "Default analysis pending",
            confidence: 0.5,
            movement: "stable",
            shortTerm: "Awaiting market data"
          }
        });
      }
    }

    return topPicks;
  } catch (error) {
    console.error('Error getting top picks:', error);
    return [];
  }
}

export const localAnalysisService = {
  analyzeStockNews,
  updateStockAnalysis,
  updateAllStockAnalyses,
  getTopPicks 
};