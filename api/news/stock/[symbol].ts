export default async function handler(req: any, res: any) {
  try {
    const { storage } = await import("../../../server/storage");
    const symbol = String(req.query?.symbol || req.params?.symbol || '').toUpperCase();
    const limit = req.query?.limit ? parseInt(String(req.query.limit)) : 25;
    const windowHours = req.query?.windowHours ? parseInt(String(req.query.windowHours)) : 24;

    let stocks = await storage.getStocks();
    if (!stocks || stocks.length === 0) {
      await storage.initializeAsync();
      const sb = await import("../../../server/services/simpleBrowserService");
      await sb.simpleBrowserService.loadNasdaqStocks();
      stocks = await storage.getStocks();
    }

    await Promise.allSettled([
      import("../../../server/services/googleNewsRssService").then(m => m.googleNewsRssService.updateGoogleNews()),
      import("../../../server/services/trendingScrapeService").then(m => m.trendingScrapeService.updateTrendingNews()),
      import("../../../server/services/techmemeService").then(m => m.techmemeService.updateTechmeme()),
      import("../../../server/services/reutersService").then(m => m.reutersService.updateReuters()),
      import("../../../server/services/techcrunchService").then(m => m.techcrunchService.updateTechcrunch())
    ]);

    let news = await storage.getNewsItemsByStockSymbol(symbol, limit);
    if (news.length < limit) {
      const stock = await storage.getStockBySymbol(symbol);
      const recent = await storage.getNewsItems(500);
      const companyName = (stock?.companyName || '').toLowerCase();
      const exists = new Set(news.map((n: any) => n.id));
      for (const n of recent) {
        if (exists.has((n as any).id)) continue;
        const text = `${(n as any).title} ${(n as any).content}`;
        const upper = text.toUpperCase();
        const lower = text.toLowerCase();
        const hasTicker = upper.includes(symbol);
        const hasName = companyName && lower.includes(companyName);
        if (hasTicker || hasName) {
          news.push(n as any);
          if (news.length >= limit) break;
        }
      }
      news = news.sort((a: any, b: any) => new Date((b as any).publishedAt).getTime() - new Date((a as any).publishedAt).getTime()).slice(0, limit);
      if (news.length < limit && stock) {
        await import("../../../server/services/googleNewsRssService").then(m => m.googleNewsOnDemand.updateForSymbol(symbol, stock.companyName, 10));
        const refreshed = await storage.getNewsItemsByStockSymbol(symbol, limit);
        if (refreshed.length > news.length) news = refreshed as any[];
      }
    }

    const cutoff = Date.now() - windowHours * 60 * 60 * 1000;
    const relevant = news.filter((n: any) => {
      const text = `${(n as any).title} ${(n as any).content}`;
      const upper = text.toUpperCase();
      const recent = new Date((n as any).publishedAt).getTime() >= cutoff;
      const hasTicker = upper.includes(symbol);
      const tagged = Array.isArray((n as any).stockSymbols) && (n as any).stockSymbols.includes(symbol);
      return recent && (hasTicker || tagged);
    });
    const nonGoogle = relevant.filter((n: any) => (n as any).source !== 'Google News RSS');
    const google = relevant.filter((n: any) => (n as any).source === 'Google News RSS');
    const combined = [...nonGoogle, ...google].slice(0, limit);

    return res.status(200).json({ success: true, data: combined });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch stock news', error: error?.message });
  }
}