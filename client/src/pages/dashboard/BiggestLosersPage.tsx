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
import { Newspaper, ArrowDownIcon, SearchIcon, ExternalLink, Info, AlertTriangle, TrendingDown, TrendingUp, BarChart4, Activity } from 'lucide-react';
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

export default function BiggestLosersPage() {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedStock, setExpandedStock] = useState<string | null>(null);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [deepSeekData, setDeepSeekData] = useState<DeepSeekData | null>(null);
  const [loadingDeepSeek, setLoadingDeepSeek] = useState(false);

  // Fetch biggest losers data
  const { data, isLoading, error } = useQuery<{ 
    success: boolean; 
    data: YFinanceStock[] | Stock[];
    industries: string[];
    source: string;
  }>({
    queryKey: ['/api/stocks/losers', selectedIndustry],
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
  
  // Function to close the DeepSeek modal
  const closeDeepSeekModal = () => {
    setSelectedStock(null);
    setDeepSeekData(null);
  };

  // Check if we have YFinance data
  const isYFinanceData = data?.source === 'yfinance';
  
  // Filter losers by search term
  const filteredLosers = data?.data.filter(stock => 
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
    stock.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Biggest Losers</h1>
          <p className="text-muted-foreground">Stocks with the largest negative price movements</p>
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
              onValueChange={setSelectedIndustry}
            >
              <SelectTrigger id="industry-filter">
                <SelectValue placeholder="Filter by Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Industries</SelectItem>
                  {data?.industries.map(industry => (
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
                            (${(stock.priceChange || 0).toFixed(2)})
                          </span>
                        </div>
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
                              getDeepseekInfo(stock.symbol);
                            }}
                            className="flex items-center"
                          >
                            <Activity className="h-4 w-4 mr-2" />
                            AI Analysis
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
                              getDeepseekInfo(stock.symbol);
                            }}
                            className="flex items-center"
                          >
                            <Activity className="h-4 w-4 mr-2" />
                            AI Analysis
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

      {/* DeepSeek AI Analysis Modal */}
      <Dialog open={selectedStock !== null} onOpenChange={(open) => !open && closeDeepSeekModal()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {loadingDeepSeek ? (
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