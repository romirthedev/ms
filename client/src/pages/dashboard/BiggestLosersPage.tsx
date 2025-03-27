import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowDownIcon, SearchIcon } from 'lucide-react';
import { Stock } from '@shared/schema';

export default function BiggestLosersPage() {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch biggest losers data
  const { data, isLoading, error } = useQuery<{ 
    success: boolean; 
    data: Stock[];
    industries: string[];
  }>({
    queryKey: ['/api/stocks/losers', selectedIndustry],
    staleTime: 60000, // 1 minute
  });

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
          {filteredLosers.map(stock => (
            <Link key={stock.id} href={`/dashboard/stock/${stock.symbol}`}>
              <a className="block h-full">
                <Card className="overflow-hidden h-full hover:shadow-md transition-shadow duration-300 cursor-pointer border-2 hover:border-primary/50">
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
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Current Price</p>
                        <p className="text-xl font-semibold">${(stock.currentPrice || 0).toFixed(2)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Previous Close</p>
                        <p className="text-xl font-semibold">${(stock.previousClose || 0).toFixed(2)}</p>
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
                  </CardContent>
                </Card>
              </a>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}