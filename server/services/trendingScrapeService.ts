import fetch from 'node-fetch'
import { storage } from '../storage'
import { InsertNewsItem, Stock } from '@shared/schema'
import { simpleBrowserService } from './simpleBrowserService'

let symbolCache: { symbols: Set<string>; nameToSymbol: Map<string, string> } | null = null

async function buildSymbolCache(): Promise<void> {
  const stocks = await storage.getStocks()
  const symbols = new Set<string>()
  const nameToSymbol = new Map<string, string>()
  for (const s of stocks) {
    symbols.add(s.symbol.toUpperCase())
    nameToSymbol.set(s.companyName.toLowerCase(), s.symbol.toUpperCase())
  }
  symbolCache = { symbols, nameToSymbol }
}

function detectSymbols(text: string): string[] {
  if (!symbolCache) return []
  const { symbols, nameToSymbol } = symbolCache
  const upper = text.toUpperCase()
  const lower = text.toLowerCase()
  const found = new Set<string>()
  const raw: string[] = []
  const plain = upper.match(/\b[A-Z]{1,5}\b/g) || []
  raw.push(...plain)
  const cash = upper.match(/\$([A-Z]{1,5})/g) || []
  for (const m of cash) raw.push(m.replace('$',''))
  const colon = upper.match(/\b(?:NYSE|NASDAQ|AMEX):([A-Z]{1,5})\b/g) || []
  for (const m of colon) raw.push(m.split(':')[1])
  for (const t of raw) {
    if (symbols.has(t) && !['A','I','AM','PM','CEO','CFO','CTO','IPO','AI','ML'].includes(t)) found.add(t)
  }
  nameToSymbol.forEach((sym, name) => { if (lower.includes(name)) found.add(sym) })
  return Array.from(found)
}

async function fetchRedditHot(sub: string, limit = 50): Promise<any[]> {
  const url = `https://www.reddit.com/r/${sub}/hot.json?limit=${limit}`
  const res = await fetch(url, { headers: { 'User-Agent': 'MarketSentinelBot/1.0 (+https://localhost)' } })
  if (!res.ok) return []
  const data: any = await res.json()
  const children = data?.data?.children || []
  return children.map((c: any) => c.data)
}

async function fetchHNFrontPage(limit = 50): Promise<any[]> {
  const url = `https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=${limit}`
  const res = await fetch(url)
  if (!res.ok) return []
  const data: any = await res.json()
  return data?.hits || []
}

async function upsertItem(title: string, body: string, url: string, publishedAt: Date): Promise<boolean> {
  const text = `${title} ${body}`
  const symbols = detectSymbols(text)
  if (symbols.length === 0) return false
  // Ensure detected stocks exist in storage (covers NYSE/AMEX not preloaded)
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
  const existing = await storage.getNewsItems(300)
  const dup = existing.find(n => n.url === url)
  if (dup) return false
  const sentiment = simpleBrowserService.analyzeSentiment(text)
  const item: InsertNewsItem = {
    title: title || 'Trending Item',
    content: body || title,
    url,
    imageUrl: null,
    source: 'Trending',
    publishedAt,
    stockSymbols: symbols,
    sentiment: sentiment.score,
    sentimentDetails: sentiment.details
  }
  await storage.createNewsItem(item)
  return true
}

async function updateTrendingNews(): Promise<{ ingested: number }> {
  if (!symbolCache) await buildSymbolCache()
  let ingested = 0
  const subs = ['stocks','investing','StockMarket','wallstreetbets','technology','biotech','news']
  for (const s of subs) {
    const posts = await fetchRedditHot(s, 40)
    for (const p of posts) {
      const inserted = await upsertItem(p.title || '', p.selftext || '', p.url_overridden_by_dest || `https://www.reddit.com${p.permalink}`, new Date((p.created_utc || Math.floor(Date.now()/1000))*1000))
      if (inserted) ingested++
    }
  }
  const hits = await fetchHNFrontPage(50)
  for (const h of hits) {
    const inserted = await upsertItem(h.title || '', h.story_text || '', h.url || `https://news.ycombinator.com/item?id=${h.objectID}`, h.created_at ? new Date(h.created_at) : new Date())
    if (inserted) ingested++
  }
  return { ingested }
}

export const trendingScrapeService = { updateTrendingNews }