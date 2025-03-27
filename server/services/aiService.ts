import fetch from 'node-fetch';
import { storage } from '../storage';
import { InsertStockAnalysis, NewsItem, Stock } from '@shared/schema';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
}

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

// Function to analyze news and generate stock analysis
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

    const recentNews = news.slice(0, 10); // Analyze up to 10 most recent news items
    
    // Prepare context for AI
    const newsContext = recentNews.map(item => {
      return `Article Title: ${item.title}\nSource: ${item.source}\nDate: ${item.publishedAt.toISOString()}\nContent: ${item.content}\nURL: ${item.url}\n`;
    }).join('\n---\n');
    
    // Prepare the prompt for AI
    const prompt = `You are a financial analyst expert specializing in stock market analysis.

STOCK INFORMATION:
Symbol: ${stock.symbol}
Company Name: ${stock.companyName}
Industry: ${stock.industry || 'Unknown'}
Sector: ${stock.sector || 'Unknown'}

RECENT NEWS ARTICLES:
${newsContext}

Based on the news articles above about ${stock.symbol} (${stock.companyName}), analyze the potential for stock price movement.

Provide your analysis in the following JSON format:
{
  "potentialRating": [a number from 1-10 rating the potential for price increase, with 10 being strongest],
  "summaryText": [a concise 2-3 sentence summary of your analysis],
  "predictedMovementDirection": [either "up", "down", or "stable"],
  "breakingNewsCount": [number of significant breaking news items or null],
  "positiveNewsCount": [number of positive news items or null],
  "negativeNewsCount": [number of negative news items or null],
  "neutralNewsCount": [number of neutral news items or null],
  "priceTargets": {
    "low": [your estimated lower price target or null],
    "high": [your estimated higher price target or null]
  },
  "evidencePoints": [an array of 3-5 key evidence points from the news],
  "shortTermOutlook": [a brief statement about short-term outlook],
  "longTermOutlook": [a brief statement about long-term outlook or null if not enough information]
}

Focus especially on unexpected breakthroughs, competitive advantages, innovative products, market position changes, and other factors that could lead to stock price increases. Be conservative and realistic in your analysis.
`;

    // Call OpenRouter API with DeepSeek model
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://stocksense.ai',
        'X-Title': 'StockSense AI',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'model': 'deepseek/deepseek-chat-v3-0324:free',
        'messages': [
          {
            'role': 'user',
            'content': prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API responded with status: ${response.status}`);
    }

    const data = await response.json() as OpenRouterResponse;
    
    // Extract the response
    const aiResponse = data.choices[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error('Empty response from AI service');
    }
    
    // Extract JSON from response (in case the AI wrapped it in markdown code blocks)
    const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/) || 
                    aiResponse.match(/```\s*([\s\S]*?)\s*```/) || 
                    [null, aiResponse];
    
    const jsonString = jsonMatch[1] || aiResponse;
    
    try {
      // Parse the JSON response
      const analysisResult: StockAnalysisResult = JSON.parse(jsonString);
      return analysisResult;
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.log('Raw AI response:', aiResponse);
      
      // Return a fallback analysis
      return {
        potentialRating: 5,
        summaryText: "Unable to automatically analyze the news. Please review the articles manually.",
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
  } catch (error) {
    console.error(`Error analyzing news for ${stock.symbol}:`, error);
    
    // Return a fallback analysis
    return {
      potentialRating: 5,
      summaryText: "Error analyzing news data. Service unavailable.",
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

// Function to update analysis for a specific stock
async function updateStockAnalysis(stock: Stock): Promise<void> {
  try {
    console.log(`Updating analysis for ${stock.symbol} (${stock.companyName})`);
    
    // Get the latest news for this stock
    const news = await storage.getNewsItemsByStockSymbol(stock.symbol);
    
    if (!news.length) {
      console.log(`No news found for ${stock.symbol}, skipping analysis`);
      return;
    }
    
    // Analyze the news
    const analysisResult = await analyzeStockNews(stock, news);
    
    // Create or update the stock analysis
    const existingAnalysis = await storage.getStockAnalysisBySymbol(stock.symbol);
    
    if (existingAnalysis) {
      // Update existing analysis
      await storage.updateStockAnalysis(existingAnalysis.id, {
        potentialRating: analysisResult.potentialRating,
        summaryText: analysisResult.summaryText,
        predictedMovementDirection: analysisResult.predictedMovementDirection,
        breakingNewsCount: analysisResult.breakingNewsCount,
        positiveNewsCount: analysisResult.positiveNewsCount,
        negativeNewsCount: analysisResult.negativeNewsCount,
        neutralNewsCount: analysisResult.neutralNewsCount,
        priceTargets: analysisResult.priceTargets,
        evidencePoints: analysisResult.evidencePoints,
        shortTermOutlook: analysisResult.shortTermOutlook,
        longTermOutlook: analysisResult.longTermOutlook,
        analysisDate: new Date()
      });
      
      console.log(`Updated analysis for ${stock.symbol} with rating ${analysisResult.potentialRating}`);
    } else {
      // Create new analysis
      const newAnalysis: InsertStockAnalysis = {
        stockId: stock.id,
        stockSymbol: stock.symbol,
        companyName: stock.companyName,
        potentialRating: analysisResult.potentialRating,
        summaryText: analysisResult.summaryText,
        predictedMovementDirection: analysisResult.predictedMovementDirection,
        breakingNewsCount: analysisResult.breakingNewsCount,
        positiveNewsCount: analysisResult.positiveNewsCount,
        negativeNewsCount: analysisResult.negativeNewsCount,
        neutralNewsCount: analysisResult.neutralNewsCount,
        priceTargets: analysisResult.priceTargets,
        evidencePoints: analysisResult.evidencePoints,
        shortTermOutlook: analysisResult.shortTermOutlook,
        longTermOutlook: analysisResult.longTermOutlook,
        analysisDate: new Date()
      };
      
      await storage.createStockAnalysis(newAnalysis);
      console.log(`Created new analysis for ${stock.symbol} with rating ${analysisResult.potentialRating}`);
    }
  } catch (error) {
    console.error(`Error updating analysis for ${stock.symbol}:`, error);
  }
}

// Function to update all stock analyses
async function updateAllStockAnalyses(): Promise<void> {
  try {
    const stocks = await storage.getStocks();
    console.log(`Updating analyses for ${stocks.length} stocks...`);
    
    for (const stock of stocks) {
      await updateStockAnalysis(stock);
    }
    
    console.log('Stock analysis update completed');
  } catch (error) {
    console.error('Error updating stock analyses:', error);
  }
}

// Export the service functions
export const aiService = {
  updateStockAnalysis,
  updateAllStockAnalyses,
  analyzeStockNews
};