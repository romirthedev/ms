import fetch from 'node-fetch'
import * as cheerio from 'cheerio'
import { storage } from '../storage'
import { InsertNewsItem } from '@shared/schema'
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
  const set = new Set<string>()
  const matches = upper.match(/\b[A-Z]{1,5}\b/g) || []
  for (const t of matches) {
    if (symbols.has(t) && !['A','I','AM','PM','CEO','CFO','CTO','IPO','AI','ML'].includes(t)) set.add(t)
  }
  nameToSymbol.forEach((sym, name) => { if (lower.includes(name)) set.add(sym) })
  return Array.from(set)
}

async function fetchRss(): Promise<{ title: string; link: string; pubDate?: Date }[]> {
  const url = 'https://www.esa.int/rssfeed/Press_releases'
  const res = await fetch(url)
  if (!res.ok) return []
  const xml = await res.text()
  const $ = cheerio.load(xml, { xmlMode: true })
  const items: { title: string; link: string; pubDate?: Date }[] = []
  $('item').each((_idx: number, el: any) => {
    const title = $(el).find('title').first().text().trim()
    const link = $(el).find('link').first().text().trim()
    const pub = $(el).find('pubDate').first().text().trim()
    const pubDate = pub ? new Date(pub) : undefined
    if (title && link) items.push({ title, link, pubDate })
  })
  return items
}

async function upsert(item: { title: string; link: string; pubDate?: Date }): Promise<boolean> {
  const text = item.title
  const symbols = detectSymbols(text)
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
  const sentiment = simpleBrowserService.analyzeSentiment(text)
  const news: InsertNewsItem = {
    title: item.title,
    content: item.title,
    url: item.link,
    imageUrl: null,
    source: 'ESA',
    publishedAt: item.pubDate || new Date(),
    stockSymbols: symbols,
    sentiment: sentiment.score,
    sentimentDetails: sentiment.details
  }
  await storage.createNewsItem(news)
  return true
}

async function updateEsa(): Promise<{ ingested: number }> {
  if (!symbolCache) await buildSymbolCache()
  let ingested = 0
  const feed = await fetchRss()
  for (const it of feed) {
    const inserted = await upsert(it)
    if (inserted) ingested++
  }
  return { ingested }
}

export const esaService = { updateEsa }