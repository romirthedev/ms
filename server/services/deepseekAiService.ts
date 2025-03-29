import fetch from 'node-fetch';
import { Stock } from '@shared/schema';

// Define response structure from OpenRouter
interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// Extended stock interface for response from yfinance
interface ExtendedStock extends Stock {
  // Additional properties that may be present
  weekLow?: number;
  weekHigh?: number;
  '52WeekLow'?: number;
  '52WeekHigh'?: number;
}

/**
 * DeepSeek AI service for stock analysis
 * Uses OpenRouter to access the DeepSeek API
 */

const OPENROUTER_API_KEY = process.env.XAI_API_KEY;
const DEEPSEEK_MODEL = "deepseek/deepseek-chat-v3-0324:free";

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

/**
 * Analyze stock news using DeepSeek AI via OpenRouter
 * @param stock Stock object containing symbol and company information
 * @param newsText Consolidated news text from Google News
 * @returns Analysis result with rating, movement prediction, and insights
 */
async function analyzeStockNews(stock: ExtendedStock, newsText: string): Promise<StockAnalysisResult> {
  console.log(`Analyzing news for ${stock.symbol} with DeepSeek AI...`);
  
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key is not configured. Please set XAI_API_KEY in environment variables.');
  }
  
  // Create system prompt for the AI
  const systemPrompt = `
You are StockSense AI, an expert financial analysis AI. 
Analyze the provided news articles about ${stock.symbol} (${stock.companyName}) to determine the stock's potential.
Based ONLY on the news articles provided and current stock information, provide:

1. A numerical rating from 1-10 indicating the stock's growth potential (1 = very low, 10 = very high)
2. A concise summary (1-2 sentences)
3. A predicted price movement direction (up, down, or stable)
4. Evidence points from the news articles supporting your analysis
5. Short and long-term outlook based on news sentiment

Respond with valid JSON only, in this exact format:
{
  "potentialRating": number,
  "summaryText": "concise summary",
  "predictedMovementDirection": "up|down|stable",
  "breakingNewsCount": number or null,
  "positiveNewsCount": number,
  "negativeNewsCount": number,
  "neutralNewsCount": number,
  "priceTargets": {
    "low": number or null,
    "high": number or null
  },
  "evidencePoints": ["point 1", "point 2", "point 3"],
  "shortTermOutlook": "short term analysis",
  "longTermOutlook": "long term analysis"
}
`;

  // Add current stock price information to the user message
  const userMessage = `
Current stock information for ${stock.symbol} (${stock.companyName}):
Current Price: $${stock.currentPrice || 'Unknown'}
Price Change: ${stock.priceChange || 0} (${stock.priceChangePercent || 0}%)
Industry: ${stock.industry || 'Unknown'}
Sector: ${stock.sector || 'Unknown'}
52 Week Range: $${stock.weekLow || 'Unknown'} - $${stock.weekHigh || 'Unknown'}

${newsText}

Based on the news articles and current stock data above, provide your analysis in the exact JSON format specified in your instructions.
`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://stocksense.ai",
        "X-Title": "StockSense AI",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": DEEPSEEK_MODEL,
        "messages": [
          {
            "role": "system",
            "content": systemPrompt
          },
          {
            "role": "user",
            "content": userMessage
          }
        ],
        "response_format": { "type": "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("DeepSeek API error:", errorData);
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
    }

    // Handle the response and extract the content
    const rawData: any = await response.json();
    if (!rawData || !rawData.choices || !rawData.choices[0] || !rawData.choices[0].message) {
      throw new Error("Unexpected API response format from OpenRouter");
    }
    
    const aiResponse = rawData.choices[0].message.content;
    
    console.log(`DeepSeek analysis received for ${stock.symbol}`);
    
    // Parse the JSON response
    try {
      const analysisResult: StockAnalysisResult = JSON.parse(aiResponse);
      
      // Ensure we have valid values for required fields
      analysisResult.potentialRating = Math.max(1, Math.min(10, analysisResult.potentialRating || 5));
      analysisResult.summaryText = analysisResult.summaryText || `Analysis of ${stock.symbol} based on recent news.`;
      analysisResult.predictedMovementDirection = analysisResult.predictedMovementDirection || 'stable';
      
      return analysisResult;
    } catch (error) {
      console.error("Error parsing DeepSeek response:", error);
      console.error("Raw response:", aiResponse);
      
      // Return a fallback result
      return {
        potentialRating: 5,
        summaryText: `Analysis of ${stock.symbol} based on recent news.`,
        predictedMovementDirection: 'stable',
        breakingNewsCount: null,
        positiveNewsCount: null,
        negativeNewsCount: null,
        neutralNewsCount: null,
        priceTargets: {
          low: null,
          high: null
        },
        evidencePoints: [`Unable to analyze news for ${stock.symbol} due to API response format error.`],
        shortTermOutlook: null,
        longTermOutlook: null
      };
    }
  } catch (error) {
    console.error("Error calling DeepSeek API:", error);
    throw error;
  }
}

export const deepseekAiService = {
  analyzeStockNews
};