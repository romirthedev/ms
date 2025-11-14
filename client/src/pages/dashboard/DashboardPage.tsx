import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Stock, StockAnalysis as BaseStockAnalysis, NewsItem } from '@shared/schema';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, 
  TrendingUp, 
  ArrowUpRight,
  ArrowDown,
  BarChart3, 
  Search, 
  Newspaper, 
  Plus, 
  Eye,
  Star,
  RefreshCw,
  ExternalLink,
  TrendingDown,
  Brain,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Target
} from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

// Extended StockAnalysis interface to include additional properties needed
interface StockAnalysis extends BaseStockAnalysis {
  currentPrice?: number;
  priceChangePercent?: number;
  recommendation?: string;
  industry?: string;
  sector?: string;
  priceTargets?: {
    low: number | null;
    high: number | null;
  };
}

// Interface for AI Analysis Result
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
  newsArticles?: any[];
  source?: string;
  analysisMethod?: string;
  analysisDate?: string;
}

// Component to display news sources for a stock
const StockNewsSources: React.FC<{ stockSymbol: string }> = ({ stockSymbol }) => {
  const [limit, setLimit] = useState(25);
  const { data, isLoading } = useQuery<{ success: boolean; data: NewsItem[] }>({
    queryKey: [`/api/news/stock/${stockSymbol}?limit=${limit}&windowHours=24`],
    enabled: !!stockSymbol,
  });

  // Query for getting AI analysis for this stock to show sentiment
  const { data: analysisData } = useQuery<{ success: boolean; data: AIAnalysisResult }>({
    queryKey: [`/api/analyses/ai/${stockSymbol}`],
    enabled: !!stockSymbol,
  });

  // Local formatDate function to prevent reference errors
  const formatNewsDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch (e) {
      return 'Recent';
    }
  };

  // Helper function to get a working URL for each news item
  const getWorkingUrl = (newsItem: NewsItem) => {
    // Check if URL exists and starts with http
    if (newsItem.url && (newsItem.url.startsWith('http://') || newsItem.url.startsWith('https://'))) {
      return newsItem.url;
    }
    
    // If title exists, search Google for it
    if (newsItem.title) {
      return `https://www.google.com/search?q=${encodeURIComponent(newsItem.title)}`;
    }
    
    // Fallback - search for news about this stock
    return `https://www.google.com/search?q=${stockSymbol}+stock+news`;
  };

  // Helper to get real source websites based on source name
  const getRealSourceWebsite = (sourceName: string) => {
    const sourceMap: {[key: string]: string} = {
      'Tech Insider': 'https://www.businessinsider.com/tech',
      'Market Watch': 'https://www.marketwatch.com',
      'EV Journal': 'https://www.evjournal.com',
      'Business Tech': 'https://www.businesstech.com',
      'VR World': 'https://vrworld.com',
      'Processor Review': 'https://www.tomshardware.com',
      'Fintech Daily': 'https://fintechnews.org',
      'Cyber Security Today': 'https://www.cybersecuritydive.com',
      'Government Technology': 'https://www.govtech.com',
      'Biotech Review': 'https://www.biopharmadive.com',
      'Medical Innovation': 'https://www.medicaldevice-network.com',
      'EV Manufacturing Today': 'https://www.manufacturing.net',
      'Renewable Energy Report': 'https://www.renewableenergyworld.com',
      'Server Technology Today': 'https://www.datacenterknowledge.com',
      'Fintech Innovation': 'https://fintechnews.org',
      'Yahoo Finance': 'https://finance.yahoo.com',
      'CNBC': 'https://www.cnbc.com',
      'Bloomberg': 'https://www.bloomberg.com',
      'Reuters': 'https://www.reuters.com',
      'Techmeme': 'https://techmeme.com',
      'Lobsters': 'https://lobste.rs',
      'TechCrunch': 'https://techcrunch.com',
      'Google News RSS': 'https://news.google.com',
      'Hacker News': 'https://news.ycombinator.com',
      'Reddit': 'https://www.reddit.com',
      'Trending': 'https://www.reddit.com/r/stocks',
      'Forbes': 'https://www.forbes.com',
      'The Wall Street Journal': 'https://www.wsj.com',
      'Financial Times': 'https://www.ft.com',
      'Investor\'s Business Daily': 'https://www.investors.com'
    };
    
    return sourceMap[sourceName] || 'https://www.google.com/search?q='+encodeURIComponent(sourceName);
  };

  // Get sentiment info from the AI analysis
  const getSentimentBadge = (newsTitle: string) => {
    if (!analysisData?.data?.evidencePoints) return null;
    
    // Check if this news title matches any evidence point
    const isEvidence = analysisData.data.evidencePoints.some(
      evidence => newsTitle.includes(evidence) || evidence.includes(newsTitle)
    );
    
    if (isEvidence) {
      const direction = analysisData.data.predictedMovementDirection;
      return (
        <Badge className={
          direction === 'up' ? 'bg-green-100 text-green-800' : 
          direction === 'down' ? 'bg-red-100 text-red-800' : 
          'bg-amber-100 text-amber-800'
        }>
          {direction === 'up' ? 'Bullish' : direction === 'down' ? 'Bearish' : 'Neutral'}
        </Badge>
      );
    }
    
    return null;
  };

  // Show real-time sentiment score
  const getNewsImpact = (newsItem: NewsItem) => {
    if (!newsItem.sentiment) return null;
    
    const sentiment = parseFloat(newsItem.sentiment.toString());
    let impactClass = 'text-amber-500';
    let impactLabel = 'Neutral';
    
    if (sentiment > 0.6) {
      impactClass = 'text-green-600';
      impactLabel = 'Positive';
    } else if (sentiment < 0.4) {
      impactClass = 'text-red-600';
      impactLabel = 'Negative';
    }
    
    return (
      <span className={`text-xs font-medium ${impactClass}`}>{impactLabel}</span>
    );
  };

  if (isLoading) return <div className="col-span-3 text-center py-2">Loading news sources...</div>;
  
  // If no data, provide real-world fallbacks based on the stock symbol
  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <a 
          href={`https://finance.yahoo.com/quote/${stockSymbol}/news`}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-2 border rounded hover:bg-gray-100 transition-colors"
        >
          <div className="text-sm font-medium mb-1 line-clamp-2">Yahoo Finance News for {stockSymbol}</div>
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Yahoo Finance</span>
            <span>Real-time updates</span>
          </div>
        </a>
        <a 
          href={`https://www.marketwatch.com/investing/stock/${stockSymbol.toLowerCase()}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-2 border rounded hover:bg-gray-100 transition-colors"
        >
          <div className="text-sm font-medium mb-1 line-clamp-2">MarketWatch coverage of {stockSymbol}</div>
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>MarketWatch</span>
            <span>Financial analysis</span>
          </div>
        </a>
        <a 
          href={`https://seekingalpha.com/symbol/${stockSymbol}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-2 border rounded hover:bg-gray-100 transition-colors"
        >
          <div className="text-sm font-medium mb-1 line-clamp-2">Seeking Alpha insights for {stockSymbol}</div>
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Seeking Alpha</span>
            <span>Expert analysis</span>
          </div>
        </a>
      </div>
    );
  }
  
  // Return the actual data with fallback URLs if needed
  return (
    <div className="space-y-2">
      {/* Display rating if we have AI analysis data */}
      {analysisData?.data && (
        <div className="mb-4 p-2 bg-gray-50 rounded-lg border">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-sm font-medium">AI Rating</span>
              <div className="flex items-center gap-1">
                <span className="font-bold">{analysisData.data.potentialRating.toFixed(1)}/10</span>
                <Badge className={
                  analysisData.data.potentialRating >= 7 ? 'bg-green-100 text-green-800' : 
                  analysisData.data.potentialRating >= 5 ? 'bg-amber-100 text-amber-800' :
                  'bg-red-100 text-red-800'
                }>
                  {analysisData.data.potentialRating >= 7 ? 'Strong Buy' : 
                   analysisData.data.potentialRating >= 5 ? 'Hold' : 'Sell'}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <span className="text-sm font-medium block">Predicted Movement</span>
                <span className={`text-sm font-bold ${
                  analysisData.data.predictedMovementDirection === 'up' ? 'text-green-600' :
                  analysisData.data.predictedMovementDirection === 'down' ? 'text-red-600' : 
                  'text-amber-600'
                }`}>
                  {analysisData.data.predictedMovementDirection === 'up' ? '↑ Upward' :
                   analysisData.data.predictedMovementDirection === 'down' ? '↓ Downward' : 
                   '→ Stable'}
                </span>
              </div>
              {analysisData.data.predictedMovementDirection === 'up' ? 
                <TrendingUp className="h-5 w-5 text-green-600" /> :
                analysisData.data.predictedMovementDirection === 'down' ? 
                <TrendingDown className="h-5 w-5 text-red-600" /> :
                <Target className="h-5 w-5 text-amber-600" />
              }
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {data.data.map((news: NewsItem, idx: number) => {
          const url = getWorkingUrl(news);
          const sourceUrl = getRealSourceWebsite(news.source);
          
          return (
            <a 
              key={idx} 
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-2 border rounded hover:bg-gray-100 transition-colors"
            >
              <div className="flex justify-between items-start mb-1">
                <div className="text-sm font-medium line-clamp-2 pr-2">{news.title}</div>
                {getSentimentBadge(news.title)}
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <a href={sourceUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                    <span className="hover:underline text-blue-600">{news.source}</span>
                  </a>
                  {getNewsImpact(news)}
                </div>
                <span>{formatNewsDate(news.publishedAt.toString())}</span>
              </div>
            </a>
          );
        })}
      </div>
      <div className="mt-2 flex justify-center">
        <Button variant="outline" size="sm" onClick={() => setLimit(limit + 25)}>Load more</Button>
      </div>
      {analysisData?.data?.priceTargets && (
        <div className="mt-4 p-2 bg-gray-50 rounded-lg border">
          <div className="text-sm font-medium mb-1">Price Targets</div>
          <div className="flex items-center gap-4">
            {analysisData.data.priceTargets.low !== null && (
              <div className="flex items-center gap-1">
                <span className="text-xs">Low:</span>
                <span className="font-bold">${analysisData.data.priceTargets.low.toFixed(2)}</span>
              </div>
            )}
            {analysisData.data.priceTargets.high !== null && (
              <div className="flex items-center gap-1">
                <span className="text-xs">High:</span>
                <span className="font-bold">${analysisData.data.priceTargets.high.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Skeleton component for loading state
const Skeleton = ({ className }: { className?: string }) => {
  return <div className={`animate-pulse bg-muted rounded ${className}`}></div>;
};

// Component for displaying AI News Analysis
const AINewsAnalysis: React.FC<{ stockSymbol: string }> = ({ stockSymbol }) => {
  const { data, isLoading, error } = useQuery<{ success: boolean; data: AIAnalysisResult }>({
    queryKey: [`/api/analyses/ai/${stockSymbol}`],
    enabled: !!stockSymbol,
  });

  if (isLoading) return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain size={20} />
          <span>AI News Analysis</span>
        </CardTitle>
        <CardDescription>Loading analysis...</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[400px]" />
          <Skeleton className="h-4 w-[350px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
      </CardContent>
    </Card>
  );

  if (error || !data?.success || !data?.data) return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle size={20} />
          <span>Analysis Unavailable</span>
        </CardTitle>
        <CardDescription>
          Unable to load AI analysis for this stock.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          The AI analysis service is currently unavailable. Please try again later.
        </p>
      </CardContent>
    </Card>
  );

  const analysis = data.data;
  
  // Helper function to determine color based on direction
  const getDirectionColor = (direction: string) => {
    if (direction === 'up') return 'text-green-500';
    if (direction === 'down') return 'text-red-500';
    return 'text-amber-500'; // stable
  };

  // Helper function to determine icon based on direction
  const getDirectionIcon = (direction: string) => {
    if (direction === 'up') return <TrendingUp className="text-green-500" />;
    if (direction === 'down') return <TrendingDown className="text-red-500" />;
    return <Target className="text-amber-500" />; // stable
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain size={20} />
          <span>AI News Analysis</span>
        </CardTitle>
        <CardDescription>
          Analysis based on {analysis.newsCount || 0} news articles using {analysis.analysisMethod || 'AI'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Rating and prediction */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
            <div className="space-y-2">
              <p className="text-lg font-semibold">{analysis.summaryText}</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Predicted Movement:</span>
                <span className={`flex items-center gap-1 ${getDirectionColor(analysis.predictedMovementDirection)}`}>
                  {getDirectionIcon(analysis.predictedMovementDirection)}
                  <span className="capitalize">{analysis.predictedMovementDirection}</span>
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm font-medium">Growth Potential</span>
              <div className="flex items-center gap-2 mt-1">
                <Progress value={analysis.potentialRating * 10} className="w-36 h-2" />
                <span className="text-lg font-bold">{analysis.potentialRating}/10</span>
              </div>
            </div>
          </div>

          {/* Outlook sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Short-Term Outlook</h4>
              <p className="text-sm">{analysis.shortTermOutlook || "No short-term outlook available"}</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Long-Term Outlook</h4>
              <p className="text-sm">{analysis.longTermOutlook || "No long-term outlook available"}</p>
            </div>
          </div>

          {/* Evidence points */}
          {analysis.evidencePoints && analysis.evidencePoints.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Key Evidence</h4>
              <ul className="list-disc pl-5 space-y-1">
                {analysis.evidencePoints.map((point, index) => (
                  <li key={index} className="text-sm">{point}</li>
                ))}
              </ul>
            </div>
          )}

          {/* News sentiment breakdown */}
          {(analysis.positiveNewsCount !== null || analysis.negativeNewsCount !== null) && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">News Sentiment</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center p-2 border rounded-md">
                  <ThumbsUp className="text-green-500 mb-1" size={16} />
                  <span className="text-xs">Positive</span>
                  <span className="font-bold">{analysis.positiveNewsCount || 0}</span>
                </div>
                <div className="flex flex-col items-center p-2 border rounded-md">
                  <ThumbsDown className="text-red-500 mb-1" size={16} />
                  <span className="text-xs">Negative</span>
                  <span className="font-bold">{analysis.negativeNewsCount || 0}</span>
                </div>
                <div className="flex flex-col items-center p-2 border rounded-md">
                  <AlertTriangle className="text-amber-500 mb-1" size={16} />
                  <span className="text-xs">Neutral</span>
                  <span className="font-bold">{analysis.neutralNewsCount || 0}</span>
                </div>
              </div>
            </div>
          )}

          {/* Price targets if available */}
          {analysis.priceTargets && (analysis.priceTargets.low !== null || analysis.priceTargets.high !== null) && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Price Targets</h4>
              <div className="flex items-center gap-4">
                {analysis.priceTargets.low !== null && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs">Low:</span>
                    <span className="font-bold">${analysis.priceTargets.low.toFixed(2)}</span>
                  </div>
                )}
                {analysis.priceTargets.high !== null && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs">High:</span>
                    <span className="font-bold">${analysis.priceTargets.high.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Analysis generated {analysis.analysisDate ? format(new Date(analysis.analysisDate), 'PPp') : 'recently'}
      </CardFooter>
    </Card>
  );
};

const DashboardPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('top-picks');
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  
  // Fetch top-rated stock analyses
  const { 
    data: topAnalyses, 
    isLoading: loadingTop 
  } = useQuery<{ success: boolean; data: StockAnalysis[] }>({
    queryKey: ['/api/analyses/top'],
    enabled: activeTab === 'top-picks'
  });
  
  // Fetch all stock analyses
  const { 
    data: allAnalyses, 
    isLoading: loadingAll 
  } = useQuery<{ success: boolean; data: StockAnalysis[] }>({
    queryKey: ['/api/analyses'],
    enabled: activeTab === 'all-stocks'
  });
  
  // Fetch watchlist (now available to all users)
  const { 
    data: watchlist, 
    isLoading: loadingWatchlist,
    refetch: refetchWatchlist
  } = useQuery<{ success: boolean; data: any[] }>({
    queryKey: ['/api/watchlist'],
    enabled: activeTab === 'watchlist'
  });
  
  // Fetch news for selected stock
  const { 
    data: stockNews, 
    isLoading: loadingNews 
  } = useQuery<{ success: boolean; data: NewsItem[] }>({
    queryKey: [selectedStock ? `/api/news/stock/${selectedStock}?limit=25&windowHours=24` : ''],
    enabled: selectedStock !== null,
  });
  
  // Fetch analysis for selected stock
  const { 
    data: stockAnalysis, 
    isLoading: loadingAnalysis 
  } = useQuery<{ success: boolean; data: StockAnalysis }>({
    queryKey: [selectedStock ? `/api/analyses/stock/${selectedStock}` : ''],
    enabled: selectedStock !== null,
  });
  
  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/analyses'] });
    queryClient.invalidateQueries({ queryKey: ['/api/analyses/top'] });
    queryClient.invalidateQueries({ queryKey: ['/api/news'] });
    
    if (selectedStock) {
      queryClient.invalidateQueries({ queryKey: ['/api/news/stock', selectedStock] });
      queryClient.invalidateQueries({ queryKey: ['/api/analyses/stock', selectedStock] });
    }
    
    toast({
      title: "Data Refreshed",
      description: "The latest stock data has been loaded",
    });
  };
  
  const addToWatchlist = async (stockId: number) => {
    try {
      await apiRequest('POST', '/api/watchlist', { stockId });
      toast({
        title: "Added to Watchlist",
        description: "Stock has been added to your watchlist",
      });
      refetchWatchlist();
    } catch (error) {
      toast({
        title: "Failed to Add",
        description: "Could not add stock to watchlist",
        variant: "destructive"
      });
    }
  };
  
  const removeFromWatchlist = async (stockId: number) => {
    try {
      await apiRequest('DELETE', `/api/watchlist/${stockId}`);
      toast({
        title: "Removed from Watchlist",
        description: "Stock has been removed from your watchlist",
      });
      refetchWatchlist();
    } catch (error) {
      toast({
        title: "Failed to Remove",
        description: "Could not remove stock from watchlist",
        variant: "destructive"
      });
    }
  };
  
  const isInWatchlist = (stockId: number) => {
    if (!watchlist || !watchlist.data) return false;
    return watchlist.data.some(item => item.stockId === stockId);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };
  
  const formatPercent = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100);
  };
  
  const renderPotentialRating = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 10; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`h-4 w-4 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
        />
      );
    }
    return <div className="flex items-center gap-0.5">{stars}</div>;
  };
  
  const getAnalysisColor = (direction: string) => {
    switch (direction) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };
  
  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-100 text-green-800';
    if (score >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };
  
  const handleSelectStock = (symbol: string) => {
    setSelectedStock(symbol);
    setActiveTab('details');
  };
  
  // Fetch news for quick preview in the analysis table
  const fetchNewsPreview = async (symbol: string) => {
    const result = await apiRequest('GET', `/api/news/stock/${symbol}?limit=3`);
    return await result.json();
  };
  
  const renderAnalysisTable = (analyses: StockAnalysis[], showEvidenceSources: boolean = false) => {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Recommendation</TableHead>
              <TableHead>Prediction</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {analyses.map((analysis) => (
              <React.Fragment key={analysis.id}>
                <TableRow>
                  <TableCell className="font-medium">{analysis.stockSymbol}</TableCell>
                  <TableCell>{analysis.companyName}</TableCell>
                  <TableCell>{renderPotentialRating(analysis.potentialRating)}</TableCell>
                  <TableCell>
                    <Badge className={`${analysis.potentialRating >= 7 ? 'bg-green-100 text-green-800' : 
                                        analysis.potentialRating >= 5 ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'}`}>
                      {analysis.recommendation || 
                       (analysis.potentialRating >= 9 ? 'Strong Buy' : 
                        analysis.potentialRating >= 7 ? 'Buy' : 
                        analysis.potentialRating >= 5 ? 'Hold' : 
                        analysis.potentialRating >= 3 ? 'Sell' : 'Strong Sell')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className={`flex items-center ${getAnalysisColor(analysis.predictedMovementDirection)}`}>
                      {analysis.predictedMovementDirection === 'up' && <TrendingUp className="mr-1 h-4 w-4" />}
                      {analysis.predictedMovementDirection === 'down' && <ArrowDown className="mr-1 h-4 w-4" />}
                      {analysis.predictedMovementPercent ? `${analysis.predictedMovementPercent.toFixed(2)}%` : 'Stable'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getConfidenceColor(analysis.confidenceScore)}>
                      {Math.round(analysis.confidenceScore * 100)}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleSelectStock(analysis.stockSymbol)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                      {isInWatchlist(analysis.stockId) ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeFromWatchlist(analysis.stockId)}
                        >
                          <Star className="h-4 w-4 mr-1 fill-yellow-500 text-yellow-500" />
                          Remove
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => addToWatchlist(analysis.stockId)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Watch
                        </Button>
                      )}
                      {showEvidenceSources && (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => {
                            const row = document.getElementById(`evidence-${analysis.id}`);
                            if (row) {
                              const currentDisplay = window.getComputedStyle(row).display;
                              row.style.display = currentDisplay === 'none' ? 'table-row' : 'none';
                            }
                          }}
                        >
                          <Newspaper className="h-4 w-4 mr-1" />
                          Sources
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
                {showEvidenceSources && (
                  <tr id={`evidence-${analysis.id}`} style={{display: 'table-row'}}>
                    <td colSpan={7} className="p-4 bg-gray-50">
                      <div className="text-sm font-medium mb-2">Evidence sources for {analysis.stockSymbol}:</div>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        <StockNewsSources stockSymbol={analysis.stockSymbol} />
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };
  
  const renderStockDetail = () => {
    if (!selectedStock) return null;
    
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="mt-4"
        >
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Stock Details</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedStock(null)}
                  >
                    Close
                  </Button>
                </CardTitle>
                <CardDescription>
                  Latest information and analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview">
                  <TabsList className="mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="news">News</TabsTrigger>
                    <TabsTrigger value="analysis">Analysis</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview">
                    {loadingAnalysis ? (
                      <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      </div>
                    ) : stockAnalysis?.data ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-lg font-bold">{stockAnalysis.data.stockSymbol}</h3>
                            <p className="text-sm text-gray-500">{stockAnalysis.data.companyName}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold">${stockAnalysis.data.currentPrice?.toFixed(2) || '0.00'}</div>
                            <div className={`text-sm ${(stockAnalysis.data.priceChangePercent || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {(stockAnalysis.data.priceChangePercent || 0) >= 0 ? '+' : ''}
                              {stockAnalysis.data.priceChangePercent?.toFixed(2) || '0.00'}%
                            </div>
                          </div>
                        </div>
                        
                        {/* Price Target Visualization */}
                        <div className="p-3 bg-gray-50 rounded-lg border">
                          <h4 className="font-semibold mb-2">Price Target Forecast</h4>
                          <div className="relative pt-6 pb-2">
                            {/* Current price marker */}
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-xs font-medium">
                              Current: ${stockAnalysis.data.currentPrice?.toFixed(2)}
                            </div>
                            
                            {/* Price bar */}
                            <div className="h-8 bg-gray-200 rounded-full w-full relative">
                              {/* Highlight range between low and high targets */}
                              {stockAnalysis.data.priceTargets && (
                                <div 
                                  className={`absolute h-full rounded-full ${stockAnalysis.data.predictedMovementDirection === 'up' ? 'bg-green-200' : stockAnalysis.data.predictedMovementDirection === 'down' ? 'bg-red-200' : 'bg-amber-200'}`}
                                  style={{ 
                                    left: `${Math.min(100, Math.max(0, ((stockAnalysis.data.priceTargets.low || 0) / ((stockAnalysis.data.priceTargets.high || 0) * 1.5)) * 100))}%`,
                                    width: `${Math.min(100, Math.max(0, (((stockAnalysis.data.priceTargets.high || 0) - (stockAnalysis.data.priceTargets.low || 0)) / ((stockAnalysis.data.priceTargets.high || 0) * 1.5)) * 100))}%`
                                  }}
                                ></div>
                              )}
                              
                              {/* Current price indicator */}
                              <div 
                                className="absolute top-0 h-8 w-2 bg-blue-600 rounded transform -translate-x-1/2"
                                style={{ left: `${Math.min(100, Math.max(0, ((stockAnalysis.data.currentPrice || 0) / ((stockAnalysis.data.priceTargets?.high || 0) * 1.5)) * 100))}%` }}
                              ></div>
                            </div>
                            
                            {/* Price labels */}
                            <div className="flex justify-between mt-1 text-xs text-gray-500">
                              <span>Low: ${stockAnalysis.data.priceTargets?.low?.toFixed(2) || 'N/A'}</span>
                              <span>High: ${stockAnalysis.data.priceTargets?.high?.toFixed(2) || 'N/A'}</span>
                            </div>
                          </div>
                          
                          <div className="mt-2 flex justify-between">
                            <div className="flex items-center gap-1">
                              <span className="text-xs">AI Prediction:</span>
                              <Badge className={`${stockAnalysis.data.predictedMovementDirection === 'up' ? 'bg-green-100 text-green-800' : stockAnalysis.data.predictedMovementDirection === 'down' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                                {stockAnalysis.data.predictedMovementDirection === 'up' ? '↑ Upward' : 
                                 stockAnalysis.data.predictedMovementDirection === 'down' ? '↓ Downward' : 
                                 '→ Stable'}
                              </Badge>
                            </div>
                            <div className="flex items-center">
                              <span className="text-xs mr-1">Confidence:</span>
                              <Badge variant="outline">{Math.round(stockAnalysis.data.confidenceScore * 100)}%</Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-semibold">Potential Rating</h4>
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${stockAnalysis.data.predictedMovementDirection === 'up' ? 'bg-green-500' : stockAnalysis.data.predictedMovementDirection === 'down' ? 'bg-red-500' : 'bg-amber-500'}`} 
                                style={{ width: `${stockAnalysis.data.potentialRating * 10}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 font-semibold">{stockAnalysis.data.potentialRating.toFixed(1)}</span>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold">Summary</h4>
                          <p className="text-sm mt-1 bg-blue-50 p-2 rounded italic">{stockAnalysis.data.summaryText}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg">
                          <div>
                            <h4 className="font-semibold">Short-Term Outlook</h4>
                            <p className="text-sm mt-1">{stockAnalysis.data.shortTermOutlook || "AI predicts stable performance in the short term, with minimal price fluctuations expected."}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold">Long-Term Outlook</h4>
                            <p className="text-sm mt-1">{stockAnalysis.data.longTermOutlook || "Long-term prospects depend on broader market conditions and future product developments."}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-semibold block">Industry</span>
                            {stockAnalysis.data.industry || 'Not available'}
                          </div>
                          <div>
                            <span className="font-semibold block">Sector</span>
                            {stockAnalysis.data.sector || 'Not available'}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold">Recommendation</h4>
                          <div className={`inline-flex items-center px-2 py-1 mt-1 rounded text-xs ${
                            stockAnalysis.data.potentialRating >= 7.5 ? 'bg-green-100 text-green-800' : 
                            stockAnalysis.data.potentialRating >= 6 ? 'bg-blue-100 text-blue-800' :
                            stockAnalysis.data.potentialRating >= 4.5 ? 'bg-amber-100 text-amber-800' :
                            'bg-red-100 text-red-800'}`}>
                            {stockAnalysis.data.recommendation || (
                              stockAnalysis.data.potentialRating >= 8.5 ? 'Strong Buy' : 
                              stockAnalysis.data.potentialRating >= 7 ? 'Buy' : 
                              stockAnalysis.data.potentialRating >= 5.5 ? 'Hold' : 
                              stockAnalysis.data.potentialRating >= 4 ? 'Sell' : 'Strong Sell'
                            )}
                          </div>
                        </div>
                        
                        {stockAnalysis.data.evidencePoints && stockAnalysis.data.evidencePoints.length > 0 && (
                          <div className="border-t pt-3 mt-3">
                            <h4 className="font-semibold flex items-center gap-1">
                              <span>Key Evidence</span>
                              <Badge variant="outline" className="font-normal">AI Analysis</Badge>
                            </h4>
                            <ul className="list-disc pl-5 space-y-1 text-sm mt-2">
                              {stockAnalysis.data.evidencePoints.map((point, idx) => (
                                <li key={idx}>{point}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        No analysis data available
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="news">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Recent News</h3>
                      <StockNewsSources stockSymbol={selectedStock} />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="analysis">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Market Analysis</h3>
                      <AINewsAnalysis stockSymbol={selectedStock} />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Analysis Dashboard</h1>
          <p className="text-muted-foreground">
            AI-powered insights for potential stock movements based on news and breakthroughs
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="top-picks" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <TabsList className="grid w-[400px] grid-cols-4">
              <TabsTrigger value="top-picks" className="flex items-center">
                <Star className="h-4 w-4 mr-2" />
                Top Picks
              </TabsTrigger>
              <TabsTrigger value="all-stocks" className="flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                All Stocks
              </TabsTrigger>
              <TabsTrigger value="watchlist" className="flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                Watchlist
              </TabsTrigger>
              <TabsTrigger value="details" disabled={!selectedStock} className="flex items-center">
                <Search className="h-4 w-4 mr-2" />
                Details
              </TabsTrigger>
            </TabsList>
            
            <Link href="/dashboard/biggest-losers">
              <Button variant="outline" size="sm" className="flex items-center whitespace-nowrap">
                <ArrowDown className="h-4 w-4 mr-2 text-destructive" />
                Biggest Losers
              </Button>
            </Link>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            className="flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <TabsContent value="top-picks" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                  <div>
                    <CardTitle>Top AI-Powered Stock Opportunities</CardTitle>
                    <CardDescription>
                      Stocks with the highest AI-detected potential based on recent news and breakthroughs - click Sources to view evidence
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="mt-2 sm:mt-0 bg-blue-50">
                    AI Analysis with Real-Time News Sources
                  </Badge>
                </CardHeader>
                <CardContent>
                  {loadingTop ? (
                    <div className="text-center py-4">Loading top picks...</div>
                  ) : topAnalyses && topAnalyses.data ? (
                    renderAnalysisTable(topAnalyses.data, true) // Show evidence sources
                  ) : (
                    <div className="text-center py-4 text-gray-500">No analyses available</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="all-stocks" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>NASDAQ Stocks Analysis</CardTitle>
                  <CardDescription>
                    Comprehensive analysis of NASDAQ stocks using real-time data from Alpha Vantage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 bg-gray-50 rounded-md p-4 border">
                    <div className="font-medium mb-2 flex items-center">
                      <RefreshCw className="h-4 w-4 mr-2 text-primary" />
                      Alpha Vantage NASDAQ Stocks Monitor
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      The system is continuously analyzing available NASDAQ stocks using Alpha Vantage API. 
                      Due to API rate limits (5 stocks every 12 seconds), we update a rotating batch of stocks 
                      with each refresh cycle.
                    </p>
                    <div className="text-xs text-gray-500 bg-white p-2 rounded border">
                      <span className="font-medium">Sources of analysis:</span> Real-time stock prices from Alpha Vantage API, news data from various sources, and machine learning models.
                    </div>
                  </div>
                  
                  {loadingAll ? (
                    <div className="text-center py-4">Loading analyses...</div>
                  ) : allAnalyses && allAnalyses.data ? (
                    <div>
                      <div className="mb-4 flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          Showing {allAnalyses.data.length} analyzed stocks from NASDAQ
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <ChevronDown className="h-4 w-4 mr-2" />
                              Sort By
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>Highest Potential</DropdownMenuItem>
                            <DropdownMenuItem>Latest Analysis</DropdownMenuItem>
                            <DropdownMenuItem>Symbol (A-Z)</DropdownMenuItem>
                            <DropdownMenuItem>Breaking News</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {renderAnalysisTable(allAnalyses.data)}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">No analyses available</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="watchlist" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>My Watchlist</CardTitle>
                  <CardDescription>
                    Stocks you've added to your personal watchlist
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingWatchlist ? (
                    <div className="text-center py-4">Loading watchlist...</div>
                  ) : watchlist && watchlist.data && watchlist.data.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Symbol</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Current Price</TableHead>
                            <TableHead>Change</TableHead>
                            <TableHead>Added On</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {watchlist.data.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.stock.symbol}</TableCell>
                              <TableCell>{item.stock.companyName}</TableCell>
                              <TableCell>{formatCurrency(item.stock.currentPrice)}</TableCell>
                              <TableCell>
                                <div className={item.stock.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                                  {item.stock.priceChange > 0 && '+'}
                                  {item.stock.priceChange.toFixed(2)} ({formatPercent(item.stock.priceChangePercent)})
                                </div>
                              </TableCell>
                              <TableCell>{formatDate(item.addedAt.toString())}</TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleSelectStock(item.stock.symbol)}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    Details
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => removeFromWatchlist(item.stockId)}
                                  >
                                    <Star className="h-4 w-4 mr-1 fill-yellow-500 text-yellow-500" />
                                    Remove
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">Your watchlist is empty</p>
                      <Button onClick={() => setActiveTab('top-picks')}>
                        Browse Top Picks
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="details" className="space-y-4">
              {renderStockDetail()}
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
};

export default DashboardPage;