import fetch from 'node-fetch'
import { storage } from '../storage'
import { InsertNewsItem, Stock } from '@shared/schema'
import { simpleBrowserService } from './simpleBrowserService'

const SUBREDDITS = [
  'stocks',
  'investing',
  'StockMarket',
  'wallstreetbets',
  'finance',
  'business',
  'markets',
  'economy',
  'technology',
  'biotech',
  'worldnews',
  'news'
]

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

function extractStockSymbolsFromText(text: string): string[] {
  if (!symbolCache) return []
  const { symbols, nameToSymbol } = symbolCache
  const found = new Set<string>()
  const upper = text.toUpperCase()

  const rawMatches: string[] = []
  const plain = upper.match(/\b[A-Z]{1,5}\b/g) || []
  rawMatches.push(...plain)
  const cash = upper.match(/\$([A-Z]{1,5})/g) || []
  for (const m of cash) rawMatches.push(m.replace('$', ''))
  const colon = upper.match(/\b(?:NYSE|NASDAQ|AMEX):([A-Z]{1,5})\b/g) || []
  for (const m of colon) rawMatches.push(m.split(':')[1])

  for (const t of rawMatches) {
    if (symbols.has(t) && !['A','I','AM','PM','CEO','CFO','CTO','IPO','AI','ML'].includes(t)) {
      found.add(t)
    }
  }

  const lower = text.toLowerCase()
  nameToSymbol.forEach((sym, name) => { if (lower.includes(name)) found.add(sym) })
  return Array.from(found)
}

async function fetchSubredditNew(subreddit: string, limit = 25): Promise<any[]> {
  const url = `https://www.reddit.com/r/${subreddit}/new.json?limit=${limit}`
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'MarketSentinelBot/1.0 (+https://localhost)'
    }
  })
  if (!res.ok) return []
  const data: any = await res.json()
  const children = data?.data?.children || []
  return children.map((c: any) => c.data)
}

async function fetchRedditSearch(query: string, limit = 20): Promise<any[]> {
  const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=new&limit=${limit}&type=link`
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'MarketSentinelBot/1.0 (+https://localhost)'
    }
  })
  if (!res.ok) return []
  const data: any = await res.json()
  const children = data?.data?.children || []
  return children.map((c: any) => c.data)
}

async function upsertNewsFromPost(post: any): Promise<boolean> {
  const title = post.title || ''
  const body = post.selftext || ''
  const contentText = `${title} ${body}`.trim()
  const postUrl = post.url_overridden_by_dest || `https://www.reddit.com${post.permalink}`
  const publishedAt = new Date((post.created_utc || Math.floor(Date.now() / 1000)) * 1000)
  const sentimentResult = simpleBrowserService.analyzeSentiment(contentText)
  const symbols = extractStockSymbolsFromText(contentText)

  if (symbols.length === 0) return false
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
  const duplicate = existing.find(n => n.url === postUrl)
  if (duplicate) return false

  const item: InsertNewsItem = {
    title: title || 'Reddit Post',
    content: body || title,
    url: postUrl,
    imageUrl: null,
    source: 'Reddit',
    publishedAt,
    stockSymbols: symbols,
    sentiment: sentimentResult.score,
    sentimentDetails: sentimentResult.details
  }
  await storage.createNewsItem(item)
  return true
}

async function updateRecentPosts(): Promise<{ ingested: number }> {
  if (!symbolCache) await buildSymbolCache()
  let ingested = 0
  // Pull recent posts from target subreddits
  for (const sub of SUBREDDITS) {
    try {
      const posts = await fetchSubredditNew(sub, 25)
      for (const p of posts) {
        const inserted = await upsertNewsFromPost(p)
        if (inserted) ingested++
      }
    } catch {}
  }
  // Also search by top symbols and company names to capture mentions
  try {
    const stocks: Stock[] = await storage.getStocks()
    for (const s of stocks.slice(0, 40)) {
      const queries = [s.symbol, s.companyName]
      for (const q of queries) {
        const hits = await fetchRedditSearch(q, 15)
        for (const h of hits) {
          const inserted = await upsertNewsFromPost(h)
          if (inserted) ingested++
        }
      }
    }
  } catch {}
  return { ingested }
}

export const redditService = {
  updateRecentPosts
}

