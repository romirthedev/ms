import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
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
  const { data, isLoading } = useQuery<{ success: boolean; data: NewsItem[] }>({
    queryKey: [`/api/news/stock/${stockSymbol}`],
    enabled: true,
  });

  // Logging for debugging
  console.log(`News data for ${stockSymbol}:`, data);

  // Local formatDate function to prevent reference errors
  const formatNewsDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
  };

  if (isLoading) return <div className="col-span-3 text-center py-2">Loading evidence sources...</div>;
  if (!data || !data.data || data.data.length === 0) {
    return <div className="col-span-3 text-center py-2">No evidence sources available</div>;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
      {data.data.map((news: NewsItem, idx: number) => (
        <a 
          key={idx} 
          href={news.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-2 border rounded hover:bg-gray-100 transition-colors"
        >
          <div className="text-sm font-medium mb-1 line-clamp-2">{news.title}</div>
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>{news.source}</span>
            <span>{formatNewsDate(news.publishedAt.toString())}</span>
          </div>
        </a>
      ))}
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
  const { user } = useAuth();
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
  
  // Fetch user's watchlist
  const { 
    data: watchlist, 
    isLoading: loadingWatchlist,
    refetch: refetchWatchlist
  } = useQuery<{ success: boolean; data: any[] }>({
    queryKey: ['/api/watchlist'],
    enabled: user !== null && activeTab === 'watchlist'
  });
  
  // Fetch news for selected stock
  const { 
    data: stockNews, 
    isLoading: loadingNews 
  } = useQuery<{ success: boolean; data: NewsItem[] }>({
    queryKey: ['/api/news/stock', selectedStock],
    enabled: selectedStock !== null,
  });
  
  // Fetch analysis for selected stock
  const { 
    data: stockAnalysis, 
    isLoading: loadingAnalysis 
  } = useQuery<{ success: boolean; data: StockAnalysis }>({
    queryKey: ['/api/analyses/stock', selectedStock],
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
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add stocks to your watchlist",
        variant: "destructive"
      });
      return;
    }
    
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
              <TableHead>Prediction</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Date</TableHead>
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
                    <div className={`flex items-center ${getAnalysisColor(analysis.predictedMovementDirection)}`}>
                      {analysis.predictedMovementDirection === 'up' && <TrendingUp className="mr-1 h-4 w-4" />}
                      {analysis.predictedMovementDirection === 'down' && <ArrowUpRight className="mr-1 h-4 w-4 rotate-180" />}
                      {analysis.predictedMovementPercent ? `${analysis.predictedMovementPercent.toFixed(2)}%` : 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getConfidenceColor(analysis.confidenceScore)}>
                      {Math.round(analysis.confidenceScore * 100)}%
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(analysis.analysisDate.toString())}</TableCell>
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
                              if (row.style.display === 'none') {
                                row.style.display = 'table-row';
                              } else {
                                row.style.display = 'none';
                              }
                            }
                          }}
                        >
                          <Newspaper className="h-4 w-4 mr-1" />
                          Toggle Sources
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
                {showEvidenceSources && (
                  <tr id={`evidence-${analysis.id}`}>
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
                        
                        <div className="space-y-2">
                          <h4 className="font-semibold">Potential Rating</h4>
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${getAnalysisColor(stockAnalysis.data.recommendation || '')}`} 
                                style={{ width: `${stockAnalysis.data.potentialRating * 10}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 font-semibold">{stockAnalysis.data.potentialRating.toFixed(1)}</span>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold">Summary</h4>
                          <p className="text-sm mt-1">{stockAnalysis.data.summaryText}</p>
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
                          <div className={`inline-flex items-center px-2 py-1 mt-1 rounded text-xs ${getConfidenceColor(stockAnalysis.data.confidenceScore)}`}>
                            {stockAnalysis.data.recommendation || 'Neutral'}
                          </div>
                        </div>
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
                    <CardTitle>Top Stock Opportunities</CardTitle>
                    <CardDescription>
                      Stocks with the highest AI-detected potential based on recent news and breakthroughs
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="mt-2 sm:mt-0">
                    Evidence sources shown below each stock - click "Toggle Sources" to hide/show
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
                  {!user ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">Please log in to view your watchlist</p>
                      <Button>Log In</Button>
                    </div>
                  ) : loadingWatchlist ? (
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