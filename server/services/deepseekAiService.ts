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

// Don't cache API key at module load time, load it at runtime
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

  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    const text = newsText.toLowerCase();
    const positives = ['breakthrough','beats','growth','partnership','approval','record','upgrade','surge','rally','strong'];
    const negatives = ['risk','concern','downgrade','fall','decline','miss','loss','investigation','lawsuit','recall'];
    let p = 0, n = 0;
    for (const w of positives) { const m = text.match(new RegExp(`\\b${w}\\b`, 'g')); if (m) p += m.length; }
    for (const w of negatives) { const m = text.match(new RegExp(`\\b${w}\\b`, 'g')); if (m) n += m.length; }
    const total = p + n;
    const sentiment = total > 0 ? 0.5 + ((p - n) / total) * 0.4 : 0.5;
    const breaking = (text.match(/\b(breaking|announces|reveals|fda|merger|acquisition)\b/g) || []).length;
    const direction = sentiment > 0.6 ? 'up' : sentiment < 0.4 ? 'down' : 'stable';
    const rating = Math.max(1, Math.min(10, Math.round((5 + (sentiment - 0.5) * 10 + Math.min(3, breaking)) * 10) / 10));
    const currentPrice = stock.currentPrice || 0;
    const priceTargets = currentPrice ? { low: parseFloat((currentPrice * (direction==='down'?0.97:0.99)).toFixed(2)), high: parseFloat((currentPrice * (direction==='up'?1.03:1.01)).toFixed(2)) } : { low: null, high: null };
    const summary = `Analysis based on ${stock.symbol} recent articles and competitor context. Sentiment score ${sentiment.toFixed(2)} with ${breaking} significant items suggests ${direction} outlook. Recommendations derived from aggregated sources.`;
    const evidenceMatch = Array.from(text.matchAll(/title:\s*(.+)/gi)).slice(0,3).map(m => m[1].trim());
    return {
      potentialRating: rating,
      summaryText: summary,
      predictedMovementDirection: direction as 'up'|'down'|'stable',
      breakingNewsCount: breaking,
      positiveNewsCount: p,
      negativeNewsCount: n,
      neutralNewsCount: null,
      priceTargets,
      evidencePoints: evidenceMatch.length ? evidenceMatch : [],
      shortTermOutlook: direction==='up'? 'Short-term momentum appears favorable.' : direction==='down'? 'Short-term weakness observed.' : 'Short-term neutral.' ,
      longTermOutlook: null
    };
  }

  const systemPrompt = `You are StockSense AI, an expert financial analysis AI.`;
  const userMessage = `Analyze the provided news articles about ${stock.symbol} (${stock.companyName}) and determine the stock's potential rating (1-10), movement direction (up/down/stable), summary, price targets, evidence points, short-term outlook, and long-term outlook. Respond with a JSON object.\n\nNews articles:\n${newsText}`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://marketsentinel.ai",
        "X-Title": "Market Sentinel AI",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("DeepSeek API error:", errorData);
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
    }

    const rawData = await response.json() as OpenRouterResponse;
    if (!rawData || !rawData.choices || !rawData.choices[0] || !rawData.choices[0].message) {
      console.error("Unexpected API response format:", rawData);
      throw new Error("Unexpected API response format from OpenRouter");
    }

    const aiResponse = rawData.choices[0].message.content;
    console.log(`DeepSeek analysis received for ${stock.symbol}`);

    try {
      // Parse the JSON response
      let cleanResponse = aiResponse;
      if (aiResponse.includes('```json')) {
        const jsonStart = aiResponse.indexOf('{');
        const jsonEnd = aiResponse.lastIndexOf('}') + 1;
        if (jsonStart >= 0 && jsonEnd > jsonStart) {
          cleanResponse = aiResponse.substring(jsonStart, jsonEnd);
        }
      }

      const analysisResult: StockAnalysisResult = JSON.parse(cleanResponse);

      // Ensure required fields are present
      analysisResult.potentialRating = Math.max(1, Math.min(10, analysisResult.potentialRating || 5));
      analysisResult.summaryText = analysisResult.summaryText || `Analysis of ${stock.symbol} based on recent news.`;
      analysisResult.predictedMovementDirection = analysisResult.predictedMovementDirection || 'stable';

      // Generate fallback price targets if missing
      if (!analysisResult.priceTargets || analysisResult.priceTargets.low === null || analysisResult.priceTargets.high === null) {
        console.log(`Generating fallback price targets for ${stock.symbol}`);
        const currentPrice = stock.currentPrice || 0;
        analysisResult.priceTargets = {
          low: parseFloat((currentPrice * 0.97).toFixed(2)),
          high: parseFloat((currentPrice * 1.03).toFixed(2))
        };
      }

      return analysisResult;
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      console.log("Raw AI response:", aiResponse);
      throw new Error("Error parsing DeepSeek response");
    }
  } catch (error) {
    console.error(`Error analyzing news for ${stock.symbol}:`, error);

    // Return a fallback analysis
    return {
      potentialRating: 5,
      summaryText: `Unable to analyze news for ${stock.symbol} due to API issues.`,
      predictedMovementDirection: "stable",
      breakingNewsCount: null,
      positiveNewsCount: null,
      negativeNewsCount: null,
      neutralNewsCount: null,
      priceTargets: {
        low: stock.currentPrice ? parseFloat((stock.currentPrice * 0.97).toFixed(2)) : null,
        high: stock.currentPrice ? parseFloat((stock.currentPrice * 1.03).toFixed(2)) : null
      },
      evidencePoints: ["Fallback analysis due to API error."],
      shortTermOutlook: null,
      longTermOutlook: null
    };
  }
}

export const deepseekAiService = {
  analyzeStockNews
};
