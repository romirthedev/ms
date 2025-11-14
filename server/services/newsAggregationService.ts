import { storage } from '../storage'
import { InsertStockAnalysis, NewsItem, Stock } from '@shared/schema'
import { simpleBrowserService } from './simpleBrowserService'
import { localAnalysisService } from './localAnalysisService'

type Category = 'tech' | 'pharma' | 'space' | 'electronics' | 'general'

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

function classifyCategory(text: string): Category {
  const t = text.toLowerCase()
  const tech = ['ai','chip','semiconductor','cloud','software','cyber','security','gpu','nvme','data center','startup','saas']
  const pharma = ['fda','trial','phase','biotech','drug','therapy','approval','vaccine','clinical']
  const space = ['space','nasa','spacex','satellite','launch','orbital','rocket']
  const electronics = ['electronics','component','sensor','display','battery','ev','lithium','manufacturing']
  if (tech.some(k => t.includes(k))) return 'tech'
  if (pharma.some(k => t.includes(k))) return 'pharma'
  if (space.some(k => t.includes(k))) return 'space'
  if (electronics.some(k => t.includes(k))) return 'electronics'
  return 'general'
}

function scoreItem(item: NewsItem): number {
  const now = Date.now()
  const ageMs = Math.max(1, now - item.publishedAt.getTime())
  const ageHours = ageMs / (1000 * 60 * 60)
  const recency = Math.max(0, Math.min(1, Math.exp(-ageHours / 6)))
  const text = (item.title + ' ' + item.content).toLowerCase()
  const breakingKeys = ['breaking','announces','reveals','acquisition','merger','fda','approval','launch']
  const breaking = breakingKeys.some(k => text.includes(k)) ? 1 : 0
  const sourceWeights: Record<string, number> = {
    'Reuters': 0.8, 'CNBC': 0.7, 'TechCrunch': 0.6, 'Techmeme': 0.6, 'Hacker News': 0.5, 'Reddit': 0.5, 'MarketWatch': 0.6, 'Yahoo Finance': 0.6
  }
  const sourceWeight = sourceWeights[item.source] ?? 0.5
  return 0.5 * recency + 0.3 * breaking + 0.2 * sourceWeight
}

async function generateAnalysesFromRecentNews(): Promise<{ analyzed: number }> {
  if (!symbolCache) await buildSymbolCache()
  const recent = await storage.getNewsItems(400)
  const grouped: Map<Category, Map<string, NewsItem[]>> = new Map()
  for (const n of recent) {
    const cat = classifyCategory(n.title + ' ' + n.content)
    if (!grouped.has(cat)) grouped.set(cat, new Map())
    let symbols = n.stockSymbols && n.stockSymbols.length ? n.stockSymbols : detectSymbols(n.title + ' ' + n.content)
    if (symbols.length === 0) {
      symbols = await getCandidateSymbolsForCategory(cat, 5)
    }
    for (const sym of symbols) {
      const m = grouped.get(cat)!
      if (!m.has(sym)) m.set(sym, [])
      m.get(sym)!.push(n)
    }
  }
  let analyzed = 0
  for (const entryCat of Array.from(grouped.entries())) {
    const cat = entryCat[0]
    const map = entryCat[1]
    const mappedEntries = Array.from(map.entries()) as Array<[string, NewsItem[]]>
    const scored = mappedEntries.map((pair: [string, NewsItem[]]) => {
      const sym = pair[0]
      const items = pair[1]
      const score = items.reduce((s: number, it: NewsItem) => s + scoreItem(it), 0)
      const sortedItems = items.sort((a: NewsItem, b: NewsItem) => b.publishedAt.getTime() - a.publishedAt.getTime()).slice(0, 10)
      return { sym, items: sortedItems, score }
    }).sort((a: { sym: string; items: NewsItem[]; score: number }, b: { sym: string; items: NewsItem[]; score: number }) => b.score - a.score).slice(0, 5)
    for (const entry of scored as Array<{ sym: string; items: NewsItem[]; score: number }>) {
      const stock = await storage.getStockBySymbol(entry.sym)
      if (!stock) continue
      const analysis = await localAnalysisService.analyzeStockNews(stock as Stock, entry.items as NewsItem[])
      const existing = await storage.getStockAnalysisBySymbol(entry.sym)
      if (existing) {
        await storage.updateStockAnalysis(existing.id, {
          potentialRating: analysis.potentialRating,
          summaryText: analysis.summaryText,
          predictedMovementDirection: analysis.predictedMovementDirection,
          breakingNewsCount: analysis.breakingNewsCount,
          positiveNewsCount: analysis.positiveNewsCount,
          negativeNewsCount: analysis.negativeNewsCount,
          evidencePoints: analysis.evidencePoints,
          shortTermOutlook: analysis.shortTermOutlook,
          longTermOutlook: analysis.longTermOutlook,
          analysisDate: new Date()
        })
      } else {
        const newAnalysis: InsertStockAnalysis = {
          stockId: (stock as Stock).id,
          stockSymbol: entry.sym,
          companyName: (stock as Stock).companyName,
          potentialRating: analysis.potentialRating,
          summaryText: analysis.summaryText,
          predictedMovementDirection: analysis.predictedMovementDirection,
          breakingNewsCount: analysis.breakingNewsCount,
          positiveNewsCount: analysis.positiveNewsCount,
          negativeNewsCount: analysis.negativeNewsCount,
          evidencePoints: analysis.evidencePoints ?? [],
          shortTermOutlook: analysis.shortTermOutlook,
          longTermOutlook: analysis.longTermOutlook,
          predictedMovementPercent: null,
          confidenceScore: 0.7,
          isBreakthrough: (analysis.breakingNewsCount ?? 0) > 2,
          relatedNewsIds: (entry.items as NewsItem[]).map((i: NewsItem) => i.id),
          analysisDate: new Date()
        }
        await storage.createStockAnalysis(newAnalysis)
      }
      analyzed++
    }
  }
  return { analyzed }
}

export const newsAggregationService = { generateAnalysesFromRecentNews }
async function getCandidateSymbolsForCategory(cat: Category, limit: number = 10): Promise<string[]> {
  const stocks = await storage.getStocks()
  const match = (s: any) => {
    const sector = (s.sector || '').toLowerCase()
    const industry = (s.industry || '').toLowerCase()
    if (cat === 'tech') return sector.includes('technology') || industry.includes('semiconductor') || industry.includes('software') || industry.includes('computer')
    if (cat === 'pharma') return sector.includes('health') || industry.includes('biotech') || industry.includes('pharma') || industry.includes('diagnostics')
    if (cat === 'space') return industry.includes('aerospace') || sector.includes('industrials') || industry.includes('defense') || industry.includes('satellite')
    if (cat === 'electronics') return industry.includes('electronics') || industry.includes('semiconductor') || industry.includes('hardware')
    return false
  }
  const candidates = stocks.filter(match).sort((a: any, b: any) => (b.marketCap || 0) - (a.marketCap || 0)).slice(0, limit)
  return candidates.map(c => c.symbol)
}