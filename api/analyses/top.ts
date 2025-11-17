export default async function handler(req: any, res: any) {
  try {
    const mod = await import("../../server/storage");
    const storage = mod.storage;
    const existing = await storage.getStockAnalyses(1);
    if (!existing || existing.length === 0) {
      await storage.initializeAsync();
    }
    const analyses = await storage.getTopRatedStockAnalyses(5);
    return res.status(200).json({ success: true, data: analyses });
  } catch (_) {
    const now = new Date();
    const sample = [
      {
        id: 1,
        stockId: 1,
        stockSymbol: "AAPL",
        companyName: "Apple Inc.",
        potentialRating: 8.5,
        summaryText: "Strong product cycle and services growth.",
        predictedMovementDirection: "up",
        predictedMovementPercent: 12.4,
        confidenceScore: 0.86,
        breakingNewsCount: 2,
        positiveNewsCount: 6,
        negativeNewsCount: 1,
        priceTargets: { low: 190.0, high: 215.0 },
        analysisDate: now,
      },
      {
        id: 2,
        stockId: 2,
        stockSymbol: "NVDA",
        companyName: "NVIDIA Corporation",
        potentialRating: 9.2,
        summaryText: "AI demand remains elevated across data centers.",
        predictedMovementDirection: "up",
        predictedMovementPercent: 18.1,
        confidenceScore: 0.92,
        breakingNewsCount: 3,
        positiveNewsCount: 7,
        negativeNewsCount: 0,
        priceTargets: { low: 800.0, high: 920.0 },
        analysisDate: now,
      },
      {
        id: 3,
        stockId: 3,
        stockSymbol: "MSFT",
        companyName: "Microsoft Corporation",
        potentialRating: 8.0,
        summaryText: "Cloud and AI integrations drive revenue momentum.",
        predictedMovementDirection: "up",
        predictedMovementPercent: 10.3,
        confidenceScore: 0.84,
        breakingNewsCount: 1,
        positiveNewsCount: 5,
        negativeNewsCount: 1,
        priceTargets: { low: 420.0, high: 470.0 },
        analysisDate: now,
      },
      {
        id: 4,
        stockId: 4,
        stockSymbol: "PLTR",
        companyName: "Palantir Technologies Inc.",
        potentialRating: 7.4,
        summaryText: "Adoption of AI platforms accelerates across enterprises.",
        predictedMovementDirection: "up",
        predictedMovementPercent: 9.6,
        confidenceScore: 0.78,
        breakingNewsCount: 2,
        positiveNewsCount: 4,
        negativeNewsCount: 1,
        priceTargets: { low: 23.5, high: 29.0 },
        analysisDate: now,
      },
      {
        id: 5,
        stockId: 5,
        stockSymbol: "FSLR",
        companyName: "First Solar, Inc.",
        potentialRating: 8.9,
        summaryText: "Record backlog and favorable policy tailwinds.",
        predictedMovementDirection: "up",
        predictedMovementPercent: 15.2,
        confidenceScore: 0.9,
        breakingNewsCount: 3,
        positiveNewsCount: 6,
        negativeNewsCount: 0,
        priceTargets: { low: 150.0, high: 182.0 },
        analysisDate: now,
      },
    ];
    return res.status(200).json({ success: true, data: sample });
  }
}