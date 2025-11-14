import fetch from 'node-fetch'
import { storage } from '../storage'
import { InsertNewsItem } from '@shared/schema'

async function fetchHNStories(query: string): Promise<any[]> {
  const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=20`
  const res = await fetch(url)
  if (!res.ok) return []
  const data: any = await res.json()
  return data?.hits || []
}

function detectSymbols(text: string): string[] {
  const upper = text.toUpperCase()
  const matches = upper.match(/\b[A-Z]{1,5}\b/g) || []
  const set = new Set<string>()
  for (const t of matches) {
    if (!['A','I','AM','PM','CEO','CFO','CTO','IPO','AI','ML'].includes(t)) set.add(t)
  }
  return Array.from(set)
}

async function updateRecentStories(): Promise<{ ingested: number }> {
  const stocks = await storage.getStocks()
  let ingested = 0
  for (const s of stocks.slice(0, 50)) {
    const hits = await fetchHNStories(`${s.symbol} ${s.companyName}`)
    for (const h of hits) {
      const title = h.title || ''
      const url = h.url || `https://news.ycombinator.com/item?id=${h.objectID}`
      const publishedAt = h.created_at ? new Date(h.created_at) : new Date()
      const symbols = Array.from(new Set([s.symbol, ...detectSymbols(title)]))
      for (const sym of symbols) {
        const exists = await storage.getStockBySymbol(sym)
        if (!exists) {
          await storage.createStock({
            symbol: sym,
            companyName: sym,
            sector: null,
            industry: null,
            currentPrice: null,
            previousClose: null,
            priceChange: null,
            priceChangePercent: null,
            marketCap: null,
            logoUrl: null,
            description: `${sym} (auto-discovered)`,
            website: null,
            competitors: []
          })
        }
      }
      const existing = await storage.getNewsItems(200)
      const dup = existing.find(n => n.url === url)
      if (dup) continue
      const item: InsertNewsItem = {
        title,
        content: h.story_text || title,
        url,
        imageUrl: null,
        source: 'Hacker News',
        publishedAt,
        stockSymbols: symbols,
        sentiment: 0.5,
        sentimentDetails: { method: 'hn' }
      }
      await storage.createNewsItem(item)
      ingested++
    }
  }
  return { ingested }
}

export const hnService = { updateRecentStories }

