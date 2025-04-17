import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  Newspaper, 
  ArrowDownIcon, 
  SearchIcon, 
  ExternalLink, 
  Info, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  BarChart4, 
  Activity, 
  Brain, 
  Target, 
  ThumbsUp, 
  ThumbsDown 
} from 'lucide-react';
import { Stock } from '@shared/schema';

interface YFinanceStock {
  symbol: string;
  companyName: string;
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  industry: string;
  sector: string;
  marketCap: number;
  exchange: string;
  volume: number;
  averageVolume: number;
  '52WeekLow': number;
  '52WeekHigh': number;
  news?: {
    title: string;
    url: string;
    publishedAt: string;
    source: string;
  }[];
}

interface GoogleNewsArticle {
  title: string;
  source: string;
  url: string;
  snippet?: string;
  publishedTime?: string;
}

interface DeepSeekData {
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
}

interface AIAnalysisResult {
  potentialRating: number;
  summaryText: string;
  predictedMovementDirection: 'up' | 'down' | 'stable';
  breakingNewsCount?: number | null;
  positiveNewsCount?: number | null;
  negativeNewsCount?: number | null;
  neutralNewsCount?: number | null;
  priceTargets?: {
    low: number | null;
    high: number | null;
  };
  evidencePoints?: string[] | null;
  shortTermOutlook?: string | null;
  longTermOutlook?: string | null;
  stock?: {
    symbol: string;
    companyName: string;
    currentPrice: number;
    priceChange: number;
    priceChangePercent: number;
  };
  newsCount?: number;
  newsArticles?: GoogleNewsArticle[];
  source?: string;
  analysisMethod?: string;
  analysisDate?: string;
}

export default function BiggestLosersPage() {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedStock, setExpandedStock] = useState<string | null>(null);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [deepSeekData, setDeepSeekData] = useState<DeepSeekData | null>(null);
  const [loadingDeepSeek, setLoadingDeepSeek] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [loadingAiAnalysis, setLoadingAiAnalysis] = useState(false);
  const [allIndustries, setAllIndustries] = useState<string[]>([]);

  // Fetch biggest losers data
  const { data, isLoading, error } = useQuery<{ 
    success: boolean; 
    data: YFinanceStock[] | Stock[];
    industries: string[];
    source: string;
  }>({
    queryKey: ['/api/stocks/biggest-losers', selectedIndustry],
    queryFn: async () => {
      // First, fetch all industries if we don't have them yet
      if (allIndustries.length === 0) {
        try {
          const allIndustriesResponse = await fetch('/api/stocks/biggest-losers');
          const allIndustriesData = await allIndustriesResponse.json();
          if (allIndustriesData.success && allIndustriesData.industries) {
            setAllIndustries(allIndustriesData.industries);
          }
        } catch (error) {
          console.error('Error fetching all industries:', error);
        }
      }

      // Then fetch filtered data if needed
      const url = selectedIndustry === 'all' 
        ? '/api/stocks/biggest-losers' 
        : `/api/stocks/biggest-losers?industry=${encodeURIComponent(selectedIndustry)}`;
      
      console.log('Fetching with URL:', url);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      return response.json();
    },
    staleTime: 60000, // 1 minute
  });
  
  // Get individual stock details from DeepSeek
  const getDeepseekInfo = async (symbol: string) => {
    setLoadingDeepSeek(true);
    setSelectedStock(symbol);
    try {
      const response = await fetch(`/api/deepseek/${symbol}`);
      const responseData = await response.json();
      
      if (responseData.success && responseData.data) {
        setDeepSeekData(responseData.data);
      } else {
        console.error('DeepSeek API error:', responseData.message);
        setDeepSeekData(null);
      }
    } catch (error) {
      console.error('Error fetching DeepSeek data:', error);
      setDeepSeekData(null);
    } finally {
      setLoadingDeepSeek(false);
    }
  };

  // Function to toggle expanded state for a stock
  const toggleExpandStock = (stockSymbol: string) => {
    if (expandedStock === stockSymbol) {
      setExpandedStock(null);
    } else {
      setExpandedStock(stockSymbol);
    }
  };
  
  // Get Google News + DeepSeek AI Analysis for a stock
  const getAiAnalysis = async (symbol: string) => {
    setLoadingAiAnalysis(true);
    setSelectedStock(symbol);
    setAiAnalysisResult(null);
    
    try {
      const response = await fetch(`/api/analyses/ai/${symbol}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        console.log('AI Analysis result:', data.data);
        setAiAnalysisResult(data.data);
      } else {
        console.error('AI Analysis error:', data.message || 'Unknown error');
        setAiAnalysisResult(null);
      }
    } catch (error) {
      console.error('Error fetching AI analysis:', error);
      setAiAnalysisResult(null);
    } finally {
      setLoadingAiAnalysis(false);
    }
  };
  
  // Function to close the DeepSeek modal
  const closeDeepSeekModal = () => {
    setSelectedStock(null);
    setDeepSeekData(null);
    setAiAnalysisResult(null);
  };

  // Check if we have YFinance data
  const isYFinanceData = data?.source === 'yfinance';
  
  // Filter losers by search term
  const filteredLosers = React.useMemo(() => {
    console.log('Filtering losers by search term:', searchTerm);
    if (!data?.data) return [];
    
    if (!searchTerm.trim()) return data.data;
    
    const term = searchTerm.toLowerCase().trim();
    return data.data.filter(stock => 
      stock.symbol.toLowerCase().includes(term) || 
      stock.companyName.toLowerCase().includes(term)
    );
  }, [data?.data, searchTerm]);

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Biggest Daily Losers</h1>
          <p className="text-muted-foreground">
            Stocks with the largest daily percentage losses
            {selectedIndustry !== 'all' && ` - Filtered by ${selectedIndustry}`}
            {searchTerm && ` - Search: "${searchTerm}"`}
            {filteredLosers.length > 0 && ` (${filteredLosers.length} results)`}
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="w-full sm:w-60">
            <Label htmlFor="search" className="sr-only">Search</Label>
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by symbol or name..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="w-full sm:w-60">
            <Label htmlFor="industry-filter" className="sr-only">Filter by Industry</Label>
            <Select 
              value={selectedIndustry} 
              onValueChange={(value) => {
                console.log('Selected industry:', value);
                setSelectedIndustry(value);
              }}
            >
              <SelectTrigger id="industry-filter">
                <SelectValue placeholder="Filter by Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Industries</SelectItem>
                  {(allIndustries.length > 0 ? allIndustries : data?.industries || []).map(industry => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error loading data. Please try again later.</p>
          </CardContent>
        </Card>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No results */}
      {!isLoading && filteredLosers.length === 0 && (
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[200px]">
            <p className="text-xl text-muted-foreground">No stocks matching your criteria found</p>
            {searchTerm && (
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your search or filters
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results grid */}
      {!isLoading && filteredLosers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLosers.map((stock, index) => {
            // Check if this is a YFinance stock
            const isYStock = isYFinanceData && 'news' in stock;
            const stockNews = isYStock ? (stock as YFinanceStock).news || [] : [];
            const stockId = 'id' in stock ? stock.id : index;
            
            return (
              <div key={stockId} className="flex flex-col">
                <Card className="overflow-hidden h-full flex-1">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {stock.symbol}
                          <Badge variant="outline" className="ml-2">
                            {stock.sector || 'N/A'}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="line-clamp-1">{stock.companyName}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Current Price</p>
                        <p className="text-xl font-semibold">${(stock.currentPrice || 0).toFixed(2)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          {isYStock ? '52-Week High' : 'Previous Close'}
                        </p>
                        <p className="text-xl font-semibold">
                          ${isYStock 
                            ? ((stock as YFinanceStock)['52WeekHigh'] || 0).toFixed(2)
                            : ((stock as Stock).previousClose || 0).toFixed(2)
                          }
                        </p>
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center">
                          <ArrowDownIcon className="h-5 w-5 text-destructive mr-1" />
                          <span className="text-lg font-bold text-destructive">
                            {(stock.priceChangePercent || 0).toFixed(2)}%
                          </span>
                          <span className="text-sm text-muted-foreground ml-2">
                            Today (${(stock.priceChange || 0).toFixed(2)})
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">Daily change from previous close</p>
                        <p className="text-sm text-muted-foreground mt-1">{stock.industry || 'N/A'}</p>
                      </div>
                    </div>
                    
                    {isYStock && (
                      <div className="mt-4">
                        {stockNews.length > 0 ? (
                          <Tabs defaultValue="news">
                            <TabsList className="grid w-full grid-cols-2">
                              <TabsTrigger value="news">
                                <Newspaper className="h-4 w-4 mr-1" />
                                News
                              </TabsTrigger>
                              <TabsTrigger value="details">
                                <Info className="h-4 w-4 mr-1" />
                                Details
                              </TabsTrigger>
                            </TabsList>
                            <TabsContent value="news" className="mt-2">
                              <div className="space-y-3 max-h-40 overflow-y-auto">
                                {stockNews.map((news, idx) => (
                                  <div key={idx} className="border-b pb-2 last:border-0 last:pb-0">
                                    <a 
                                      href={news.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm font-medium hover:text-primary flex items-start"
                                    >
                                      <span className="flex-1 line-clamp-2">{news.title}</span>
                                      <ExternalLink className="h-3 w-3 ml-1 mt-1 flex-shrink-0" />
                                    </a>
                                    <div className="flex justify-between items-center mt-1">
                                      <span className="text-xs text-muted-foreground">
                                        {news.source}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {new Date(news.publishedAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </TabsContent>
                            <TabsContent value="details" className="mt-2">
                              <div className="space-y-2 text-sm">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <p className="text-muted-foreground">Exchange</p>
                                    <p className="font-medium">{(stock as YFinanceStock).exchange}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Volume</p>
                                    <p className="font-medium">{(stock as YFinanceStock).volume.toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Market Cap</p>
                                    <p className="font-medium">${((stock as YFinanceStock).marketCap / 1000000000).toFixed(2)}B</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">52-Week Low</p>
                                    <p className="font-medium">${((stock as YFinanceStock)['52WeekLow']).toFixed(2)}</p>
                                  </div>
                                </div>
                              </div>
                            </TabsContent>
                          </Tabs>
                        ) : (
                          <div className="mt-3 text-sm text-center text-muted-foreground">
                            No recent news available
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0 flex flex-col gap-2">
                    {/* Action buttons */}
                    <div className="w-full grid grid-cols-2 gap-2">
                      {isYStock ? (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              getAiAnalysis(stock.symbol);
                            }}
                            className="flex items-center"
                          >
                            <Brain className="h-4 w-4 mr-2" />
                            News Analysis
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            asChild
                          >
                            <a 
                              href={`https://finance.yahoo.com/quote/${stock.symbol}`} 
                              target="_blank" 
                              rel="noreferrer noopener"
                              className="flex items-center"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Yahoo Finance
                            </a>
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={(e) => {
                              e.preventDefault();
                              getAiAnalysis(stock.symbol);
                            }}
                            className="flex items-center"
                          >
                            <Brain className="h-4 w-4 mr-2" />
                            News Analysis
                          </Button>
                          <Link href={`/dashboard/stock/${stock.symbol}`}>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full flex items-center"
                            >
                              <Info className="h-4 w-4 mr-2" />
                              Details
                            </Button>
                          </Link>
                        </>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {/* Google News + DeepSeek AI Analysis Modal */}
      <Dialog open={selectedStock !== null} onOpenChange={(open) => !open && closeDeepSeekModal()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {loadingAiAnalysis ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Skeleton className="h-16 w-16 rounded-full" />
              <p className="mt-4 text-muted-foreground">Loading Google News and AI analysis...</p>
              <p className="text-xs text-muted-foreground mt-2">This may take a few seconds</p>
            </div>
          ) : aiAnalysisResult ? (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                      {aiAnalysisResult.stock?.symbol}
                      <span className="text-lg font-normal ml-2">{aiAnalysisResult.stock?.companyName}</span>
                      <Badge 
                        variant={
                          aiAnalysisResult.predictedMovementDirection === 'up' 
                            ? 'default' 
                            : aiAnalysisResult.predictedMovementDirection === 'down' 
                              ? 'destructive' 
                              : 'outline'
                        } 
                        className="ml-2"
                      >
                        {aiAnalysisResult.predictedMovementDirection === 'up' 
                          ? 'Positive' 
                          : aiAnalysisResult.predictedMovementDirection === 'down' 
                            ? 'Negative' 
                            : 'Neutral'}
                      </Badge>
                    </DialogTitle>
                    <DialogDescription className="mt-1">
                      AI-powered news analysis from {aiAnalysisResult.source || 'Google News'} using {aiAnalysisResult.analysisMethod || 'DeepSeek AI'}
                    </DialogDescription>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end">
                      {(aiAnalysisResult.stock?.priceChangePercent || 0) < 0 ? (
                        <TrendingDown className="h-5 w-5 text-destructive mr-1" />
                      ) : (
                        <TrendingUp className="h-5 w-5 text-green-500 mr-1" />
                      )}
                      <span className={`text-lg font-bold ${(aiAnalysisResult.stock?.priceChangePercent || 0) < 0 ? 'text-destructive' : 'text-green-500'}`}>
                        {(aiAnalysisResult.stock?.priceChangePercent || 0).toFixed(2)}%
                      </span>
                      <span className="text-xs ml-1 text-muted-foreground">(daily)</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ${(aiAnalysisResult.stock?.currentPrice || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </DialogHeader>

              <div className="mt-6 space-y-6">
                {/* Potential Rating */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">Investment Potential</h3>
                    <span className="text-xl font-bold">{aiAnalysisResult.potentialRating}/10</span>
                  </div>
                  <Progress 
                    value={aiAnalysisResult.potentialRating * 10} 
                    className={`h-2 ${
                      aiAnalysisResult.potentialRating >= 7 
                        ? 'bg-green-500' 
                        : aiAnalysisResult.potentialRating >= 4 
                          ? 'bg-amber-500' 
                          : 'bg-destructive'
                    }`}
                  />
                  <p className="text-sm mt-3">{aiAnalysisResult.summaryText}</p>
                </div>

                <Separator />

                {/* News Sentiment Analysis */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">News Sentiment Analysis</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {aiAnalysisResult.positiveNewsCount !== null && aiAnalysisResult.positiveNewsCount !== undefined && (
                      <div className="flex flex-col items-center p-3 bg-muted/50 rounded-md">
                        <ThumbsUp className="h-6 w-6 text-green-500 mb-1" />
                        <span className="text-lg font-bold">{aiAnalysisResult.positiveNewsCount}</span>
                        <span className="text-xs text-muted-foreground">Positive</span>
                      </div>
                    )}
                    
                    {aiAnalysisResult.negativeNewsCount !== null && aiAnalysisResult.negativeNewsCount !== undefined && (
                      <div className="flex flex-col items-center p-3 bg-muted/50 rounded-md">
                        <ThumbsDown className="h-6 w-6 text-destructive mb-1" />
                        <span className="text-lg font-bold">{aiAnalysisResult.negativeNewsCount}</span>
                        <span className="text-xs text-muted-foreground">Negative</span>
                      </div>
                    )}
                    
                    {aiAnalysisResult.neutralNewsCount !== null && aiAnalysisResult.neutralNewsCount !== undefined && (
                      <div className="flex flex-col items-center p-3 bg-muted/50 rounded-md">
                        <Info className="h-6 w-6 text-muted-foreground mb-1" />
                        <span className="text-lg font-bold">{aiAnalysisResult.neutralNewsCount}</span>
                        <span className="text-xs text-muted-foreground">Neutral</span>
                      </div>
                    )}
                    
                    {aiAnalysisResult.breakingNewsCount !== null && aiAnalysisResult.breakingNewsCount !== undefined && (
                      <div className="flex flex-col items-center p-3 bg-muted/50 rounded-md">
                        <AlertTriangle className="h-6 w-6 text-amber-500 mb-1" />
                        <span className="text-lg font-bold">{aiAnalysisResult.breakingNewsCount}</span>
                        <span className="text-xs text-muted-foreground">Breaking</span>
                      </div>
                    )}
                  </div>

                  {aiAnalysisResult.predictedMovementDirection && (
                    <div className="flex items-center mb-3 bg-muted/30 p-3 rounded-md">
                      {aiAnalysisResult.predictedMovementDirection === 'up' ? (
                        <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                      ) : aiAnalysisResult.predictedMovementDirection === 'down' ? (
                        <TrendingDown className="h-5 w-5 text-destructive mr-2" />
                      ) : (
                        <Activity className="h-5 w-5 text-muted-foreground mr-2" />
                      )}
                      <div>
                        <span className="font-medium">Predicted movement:</span>{' '}
                        <span className={
                          aiAnalysisResult.predictedMovementDirection === 'up' 
                            ? 'text-green-500 font-semibold' 
                            : aiAnalysisResult.predictedMovementDirection === 'down' 
                              ? 'text-destructive font-semibold' 
                              : ''
                        }>
                          {aiAnalysisResult.predictedMovementDirection.charAt(0).toUpperCase() + aiAnalysisResult.predictedMovementDirection.slice(1)}
                        </span>
                      </div>
                    </div>
                  )}

                  {aiAnalysisResult.priceTargets && (aiAnalysisResult.priceTargets.low || aiAnalysisResult.priceTargets.high) && (
                    <div className="mb-3 bg-muted/30 p-3 rounded-md">
                      <span className="font-medium">Price targets:</span>
                      <div className="flex gap-4 mt-1">
                        {aiAnalysisResult.priceTargets.low !== null && (
                          <div>
                            <span className="text-xs text-muted-foreground">Low</span>
                            <p className="font-medium">${aiAnalysisResult.priceTargets.low?.toFixed(2)}</p>
                          </div>
                        )}
                        {aiAnalysisResult.priceTargets.high !== null && (
                          <div>
                            <span className="text-xs text-muted-foreground">High</span>
                            <p className="font-medium">${aiAnalysisResult.priceTargets.high?.toFixed(2)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Supporting Evidence */}
                {aiAnalysisResult.evidencePoints && aiAnalysisResult.evidencePoints.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Key Evidence Points</h3>
                      <div className="space-y-2">
                        {aiAnalysisResult.evidencePoints.map((point, idx) => (
                          <div key={idx} className="p-3 bg-muted/50 rounded-md text-sm">
                            {point}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Outlook */}
                {(aiAnalysisResult.shortTermOutlook || aiAnalysisResult.longTermOutlook) && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {aiAnalysisResult.shortTermOutlook && (
                        <div>
                          <h3 className="text-md font-semibold mb-2">Short-Term Outlook</h3>
                          <p className="text-sm">{aiAnalysisResult.shortTermOutlook}</p>
                        </div>
                      )}
                      {aiAnalysisResult.longTermOutlook && (
                        <div>
                          <h3 className="text-md font-semibold mb-2">Long-Term Outlook</h3>
                          <p className="text-sm">{aiAnalysisResult.longTermOutlook}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* News Articles */}
                {aiAnalysisResult.newsArticles && aiAnalysisResult.newsArticles.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold flex items-center mb-3">
                        <Newspaper className="h-5 w-5 mr-2" />
                        Recent News ({aiAnalysisResult.newsCount || aiAnalysisResult.newsArticles.length})
                      </h3>
                      <div className="space-y-3">
                        {aiAnalysisResult.newsArticles.map((news, idx) => (
                          <div key={idx} className="pb-3 border-b last:border-0 last:pb-0">
                            <a 
                              href={news.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium hover:text-primary flex items-start"
                            >
                              <span className="flex-1">{news.title}</span>
                              <ExternalLink className="h-4 w-4 ml-2 flex-shrink-0" />
                            </a>
                            {news.snippet && (
                              <p className="text-sm text-muted-foreground mt-1">{news.snippet}</p>
                            )}
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-xs text-muted-foreground">
                                {news.source}
                              </span>
                              {news.publishedTime && (
                                <span className="text-xs text-muted-foreground">
                                  {news.publishedTime}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={closeDeepSeekModal}>
                  Close
                </Button>
                <Button asChild>
                  <a 
                    href={`https://finance.yahoo.com/quote/${aiAnalysisResult.stock?.symbol}`} 
                    target="_blank" 
                    rel="noreferrer noopener"
                    className="flex items-center"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on Yahoo Finance
                  </a>
                </Button>
              </DialogFooter>
            </>
          ) : loadingDeepSeek ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Skeleton className="h-16 w-16 rounded-full" />
              <p className="mt-4 text-muted-foreground">Loading AI analysis...</p>
            </div>
          ) : !deepSeekData ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="h-16 w-16 text-destructive" />
              <p className="mt-4 text-muted-foreground">Could not load analysis data for {selectedStock}</p>
              <Button className="mt-6" variant="outline" onClick={closeDeepSeekModal}>
                Close
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                      {deepSeekData.symbol}
                      <span className="text-lg font-normal ml-2">{deepSeekData.name}</span>
                      <Badge variant={deepSeekData.sentiment === 'Bullish' ? 'default' : deepSeekData.sentiment === 'Bearish' ? 'destructive' : 'outline'} className="ml-2">
                        {deepSeekData.sentiment}
                      </Badge>
                    </DialogTitle>
                    <DialogDescription className="mt-1">
                      {deepSeekData.sector} • {deepSeekData.industry}
                    </DialogDescription>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end">
                      {deepSeekData.priceChangePercent < 0 ? (
                        <TrendingDown className="h-5 w-5 text-destructive mr-1" />
                      ) : (
                        <TrendingUp className="h-5 w-5 text-green-500 mr-1" />
                      )}
                      <span className={`text-lg font-bold ${deepSeekData.priceChangePercent < 0 ? 'text-destructive' : 'text-green-500'}`}>
                        {deepSeekData.priceChangePercent.toFixed(2)}%
                      </span>
                      <span className="text-xs ml-1 text-muted-foreground">(daily)</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ${deepSeekData.currentPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
              </DialogHeader>

              <div className="mt-4 space-y-6">
                {/* Summary section */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Company Summary</h3>
                  <p className="text-sm text-muted-foreground">
                    {deepSeekData.summary}
                  </p>
                </div>

                <Separator />

                {/* AI Insights section */}
                <div>
                  <h3 className="text-lg font-semibold flex items-center mb-3">
                    <Activity className="h-5 w-5 mr-2" />
                    AI-Powered Insights
                  </h3>
                  <div className="grid gap-2">
                    {deepSeekData.insights.map((insight, idx) => (
                      <div key={idx} className="p-3 bg-muted/50 rounded-md text-sm">
                        {insight}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <Badge variant="outline" className="px-3 py-1">
                      <span className="font-semibold mr-1">Risk:</span> {deepSeekData.riskLevel}
                    </Badge>
                    {deepSeekData.volatility && (
                      <Badge variant="outline" className="px-3 py-1">
                        <span className="font-semibold mr-1">Volatility:</span> {deepSeekData.volatility.toFixed(2)}%
                      </Badge>
                    )}
                    {deepSeekData.beta && (
                      <Badge variant="outline" className="px-3 py-1">
                        <span className="font-semibold mr-1">Beta:</span> {deepSeekData.beta.toFixed(2)}
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Stock details section */}
                <div>
                  <h3 className="text-lg font-semibold flex items-center mb-3">
                    <BarChart4 className="h-5 w-5 mr-2" />
                    Key Metrics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Market Cap</p>
                      <p className="font-medium">${(deepSeekData.marketCap / 1000000000).toFixed(2)}B</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">52-Week Range</p>
                      <p className="font-medium">${deepSeekData.fiftyTwoWeekLow?.toFixed(2)} - ${deepSeekData.fiftyTwoWeekHigh?.toFixed(2)}</p>
                    </div>
                    {deepSeekData.peRatio && (
                      <div>
                        <p className="text-sm text-muted-foreground">P/E Ratio</p>
                        <p className="font-medium">{deepSeekData.peRatio.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* News section */}
                {deepSeekData.news && deepSeekData.news.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold flex items-center mb-3">
                        <Newspaper className="h-5 w-5 mr-2" />
                        Recent News
                      </h3>
                      <div className="space-y-3">
                        {deepSeekData.news.map((news, idx) => (
                          <div key={idx} className="pb-3 border-b last:border-0 last:pb-0">
                            <a 
                              href={news.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium hover:text-primary flex items-start"
                            >
                              <span className="flex-1">{news.title}</span>
                              <ExternalLink className="h-4 w-4 ml-2 flex-shrink-0" />
                            </a>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-xs text-muted-foreground">
                                {news.source}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(news.publishedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={closeDeepSeekModal}>
                  Close
                </Button>
                <Button asChild>
                  <a 
                    href={`https://finance.yahoo.com/quote/${deepSeekData.symbol}`} 
                    target="_blank" 
                    rel="noreferrer noopener"
                    className="flex items-center"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on Yahoo Finance
                  </a>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}