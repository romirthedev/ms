import { localAnalysisService } from './localAnalysisService';
import { storage } from '../storage';
import { StockAnalysisResult } from './localAnalysisService'; // Import the type

// Mock the storage module
jest.mock('../storage', () => ({
  getTopRatedStockAnalyses: jest.fn(),
  getStockBySymbol: jest.fn(),
  getStocks: jest.fn(),
}));

describe('getTopPicks', () => {
  beforeEach(() => {
    // Type the mocked function explicitly
    (storage.getTopRatedStockAnalyses as jest.MockedFunction<() => Promise<StockAnalysisResult[]>>).mockResolvedValue([
      {
        id: 1,
        stockId: 101,
        stockSymbol: 'AAPL',
        companyName: 'Apple Inc.',
        potentialRating: 8,
        breakingNewsCount: null,
        positiveNewsCount: null,
        negativeNewsCount: null,
        confidenceScore: 0.9,
        summaryText: 'Strong growth potential',
        predictedMovementDirection: 'up',
        evidencePoints: [],
        relatedNewsIds: null,
        predictedMovementPercent: null,
        isBreakthrough: false,
        shortTermOutlook: 'Positive short-term outlook', // Matches the type
        analysisDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    (storage.getStockBySymbol as jest.MockedFunction<typeof storage.getStockBySymbol>).mockImplementation(async (symbol) => ({
      id: 1,
      stockId: 101,
      symbol,
      companyName: `${symbol} Inc.`,
      createdAt: new Date(),
      updatedAt: new Date(),
      sector: null,
      industry: null,
      currentPrice: 150,
      previousClose: null,
      marketCap: null,
      competitors: null,
      priceChange: null,
      priceChangePercent: null,
      logoUrl: null,
      description: null,
      website: null,
    }));
  });

  it('should return the correct number of top picks', async () => {
    const result = await localAnalysisService.getTopPicks(2);

    // Ensure the array has elements before accessing them
    expect(result).toHaveLength(1);

    // Safely access elements with non-null assertion
    expect(result[0]!.analysis!.rating).toBeGreaterThanOrEqual(8); // Sorted by rating
  });

  it('should handle fallback recommendations if analyses are insufficient', async () => {
    (storage.getTopRatedStockAnalyses as jest.MockedFunction<() => Promise<StockAnalysisResult[]>>).mockResolvedValue([]);
    (storage.getStocks as jest.MockedFunction<typeof storage.getStocks>).mockResolvedValue([
      {
        id: 1,
        symbol: 'GOOG',
        companyName: 'Google',
        createdAt: new Date(),
        updatedAt: new Date(),
        sector: null,
        industry: null,
        currentPrice: 200,
        previousClose: null,
        marketCap: null,
        competitors: null,
        priceChange: null,
        priceChangePercent: null,
        logoUrl: null,
        description: null,
        website: null,
      },
    ]);

    const result = await localAnalysisService.getTopPicks(2);

    // Ensure the array has elements before accessing them
    expect(result).toHaveLength(1);

    // Safely access elements with non-null assertion
    expect(result[0]!.analysis!.summary).toBe('Default analysis pending');
  });
});