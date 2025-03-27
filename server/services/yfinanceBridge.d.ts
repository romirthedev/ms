// Type definitions for yfinanceBridge.js

/**
 * Gets the top stock losers using the yfinance Python service
 * @param industry Optional industry filter
 * @param limit Maximum number of results to return
 * @returns Promise resolving to the losers data
 */
export function getTopLosers(industry?: string | null, limit?: number): Promise<{
  success: boolean;
  data?: any[];
  message?: string;
  error?: string;
  industries?: string[];
}>;

/**
 * Gets additional information about a stock using DeepSeek
 * @param symbol Stock symbol
 * @returns Promise resolving to the stock information
 */
export function getDeepseekInfo(symbol: string): Promise<{
  success: boolean;
  message: string;
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
    peRatio: number;
    beta: number;
    summary: string;
    news: {
      title: string;
      url: string;
      publishedAt: string;
      source: string;
    }[];
    volatility: number;
    fiftyTwoWeekLow: number;
    fiftyTwoWeekHigh: number;
    insights: string[];
    riskLevel: string;
    sentiment: string;
  };
  error?: string;
}>;