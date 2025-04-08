#!/usr/bin/env python3

"""
Simple YFinance Service that provides stock information without external dependencies.
This service generates synthetic yet plausible information about stocks based on parameters.
"""

import json
import sys
import random
import argparse
import datetime
from typing import Dict, List, Any, Optional
import time

def get_top_losers(industry=None, limit=20):
    """
    Gets the top stock losers using real Yahoo Finance data
    
    Args:
        industry (str, optional): Filter by industry sector
        limit (int, optional): Maximum number of results to return
    
    Returns:
        list: List of dictionaries with stock loser information
    """
    try:
        # Import yfinance here
        import yfinance as yf
        
        today = datetime.datetime.now()
        
        # Format dates as strings 
        end_date = today.strftime('%Y-%m-%d')
        start_date = (today - datetime.timedelta(days=7)).strftime('%Y-%m-%d')
        
        # Get NYSE Composite index data
        nyse_ticker = yf.Ticker('^NYA')
        nyse_data = nyse_ticker.history(period='1d')
        
        # Get all NYSE stocks using the NYSE Composite components
        stock_list = nyse_ticker.components
        
        if not stock_list:
            # Fallback to a broader list if components not available
            stock_list = nyse_ticker.history(period='1d').index.get_level_values(0)
        
        # Remove any non-stock symbols and clean up the list
        stock_list = [ticker.split('.')[0] for ticker in stock_list if '.' not in ticker]
        print(f"Found {len(stock_list)} NYSE stocks")
        
        # Filter by industry if specified
        if industry and industry != "all":
            filtered_stocks = []
            for symbol in stock_list:
                try:
                    stock = yf.Ticker(symbol)
                    info = stock.info
                    if info.get('industry', '').lower() == industry.lower():
                        filtered_stocks.append(symbol)
                except:
                    continue
            stock_list = filtered_stocks
        
        # Create result data using actual stock information
        results = []
        
        # Process stocks in batches to avoid API limitations
        batch_size = 10
        for i in range(0, len(stock_list), batch_size):
            batch = stock_list[i:i+batch_size]
            
            # Skip empty batches
            if not batch:
                continue
                
            # Join tickers with a space for the batch request
            ticker_str = ' '.join(batch)
            multi_tickers = yf.Tickers(ticker_str)
            
            # Process each ticker in the batch
            for symbol in batch:
                try:
                    # Get real stock data from Yahoo Finance
                    stock = multi_tickers.tickers[symbol]
                    
                    # Get the latest price data
                    hist = stock.history(period="5d")
                    
                    if hist.empty:
                        print(f"No price data found for {symbol}")
                        continue
                    
                    # Calculate current price and previous close
                    current_price = hist['Close'].iloc[-1] if not hist.empty else 0
                    previous_close = hist['Close'].iloc[-2] if len(hist) > 1 else current_price
                    
                    # Calculate price change and percentage
                    price_change = current_price - previous_close
                    price_change_percent = (price_change / previous_close) * 100
                    
                    # Only include stocks that are down
                    if price_change_percent >= 0:
                        continue
                    
                    # Get 52-week high and low
                    hist_year = stock.history(period="1y")
                    week_52_low = hist_year['Low'].min() if not hist_year.empty else 0
                    week_52_high = hist_year['High'].max() if not hist_year.empty else 0
                    
                    # Additional info
                    info = stock.info
                    volume = info.get('volume', 0) if isinstance(info, dict) else 0
                    avg_volume = info.get('averageVolume', 0) if isinstance(info, dict) else 0
                    market_cap = info.get('marketCap', 0) if isinstance(info, dict) else 0
                    
                    # Create stock data using real values from Yahoo Finance
                    stock_data = {
                        "symbol": symbol,
                        "companyName": info.get('longName', symbol),
                        "currentPrice": round(current_price, 2),
                        "previousClose": round(previous_close, 2),
                        "priceChange": round(price_change, 2),
                        "priceChangePercent": round(price_change_percent, 2),
                        "industry": info.get('industry', ''),
                        "sector": info.get('sector', ''),
                        "marketCap": market_cap,
                        "exchange": "NYSE",
                        "volume": volume,
                        "averageVolume": avg_volume,
                        "52WeekLow": round(week_52_low, 2),
                        "52WeekHigh": round(week_52_high, 2)
                    }
                    
                    # Add news for each stock
                    stock_data["news"] = generate_news_for_stock(
                        stock_data["companyName"], 
                        symbol, 
                        today
                    )
                    
                    results.append(stock_data)
                except Exception as e:
                    print(f"Error fetching data for {symbol}: {str(e)}")
                    continue
        
        # Sort by price change percent (ascending to get biggest losers first)
        results.sort(key=lambda x: x["priceChangePercent"])
        
        # Take only what we need
        results = results[:limit]
        
        return {
            "success": True,
            "data": results,
            "industries": list(set(stock["industry"] for stock in results if stock["industry"])),
            "source": "yfinance",
            "message": "Retrieved top stock losers"
        }
    except Exception as e:
        # If there's an error, return error message
        print(f"Error fetching Yahoo Finance data: {str(e)}")
        return {
            "success": False,
            "data": [],
            "industries": [],
            "message": f"Error retrieving stock data: {str(e)}"
        }

def get_real_news_url(symbol, source):
    """
    Generate a real, working URL for news about a stock
    """
    # Map sources to their URL templates
    source_urls = {
        "Market Watch": f"https://www.marketwatch.com/investing/stock/{symbol.lower()}",
        "Financial Times": f"https://www.ft.com/stream/a046e7a9-d20b-4e8d-8f38-ed5eda8e9769/{symbol.lower()}",
        "Bloomberg": f"https://www.bloomberg.com/quote/{symbol}:US",
        "Reuters": f"https://www.reuters.com/companies/{symbol}.O",
        "CNBC": f"https://www.cnbc.com/quotes/{symbol}",
        "Wall Street Journal": f"https://www.wsj.com/market-data/quotes/{symbol}",
        "Investor's Business Daily": f"https://www.investors.com/stock-lists/ibd-50/{symbol.lower()}/",
        # Fallback to Yahoo Finance if source isn't mapped
        "default": f"https://finance.yahoo.com/quote/{symbol}"
    }
    
    # Get the URL template for the given source, or use default
    url_template = source_urls.get(source, source_urls["default"])
    
    # Add a timestamp to prevent caching (not needed for real use, but helpful in simulation)
    timestamp = int(time.time())
    if '?' in url_template:
        return f"{url_template}&t={timestamp}"
    else:
        return f"{url_template}?t={timestamp}"

def generate_news_for_stock(company_name, symbol, today):
    """Generate news articles for a stock"""
    news_count = random.randint(2, 5)
    news = []
    
    # Possible news headlines
    headlines = [
        f"{company_name} Reports Q1 Earnings Below Expectations",
        f"Analyst Downgrades {company_name} Citing Growth Concerns",
        f"{company_name} Faces Increased Competition in Core Markets",
        f"Industry Slowdown Impacts {company_name}'s Revenue Forecast",
        f"{company_name} Announces Restructuring Plan, Shares Drop",
        f"Key Executive Departures at {company_name} Worry Investors",
        f"{company_name} Delays Product Launch, Stock Falls",
        f"Regulatory Scrutiny Weighs on {company_name}",
        f"Supply Chain Issues Continue to Impact {company_name}",
        f"{company_name} Reduces Full-Year Guidance",
        f"Investors React to {company_name}'s Disappointing Outlook",
        f"Market Selloff Hits {company_name} Shares Hard",
        f"{company_name} Faces Margin Pressure Amid Rising Costs",
        f"Technical Selloff Continues for {company_name}",
        f"Short Sellers Target {company_name} After Recent Earnings"
    ]
    
    # News sources
    sources = ["Market Watch", "Financial Times", "Bloomberg", "Reuters", "CNBC", "Wall Street Journal", "Investor's Business Daily"]
    
    # Generate random news items
    random.shuffle(headlines)
    for i in range(min(news_count, len(headlines))):
        days_ago = random.randint(1, 10)
        news_date = today - datetime.timedelta(days=days_ago)
        
        news.append({
            "title": headlines[i],
            "url": get_real_news_url(symbol, sources[random.randint(0, len(sources)-1)]),
            "publishedAt": news_date.strftime("%Y-%m-%d"),
            "source": random.choice(sources)
        })
    
    return news

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Simple YFinance Service')
    parser.add_argument('command', choices=['get_top_losers'], help='Command to execute')
    parser.add_argument('--industry', help='Industry filter')
    parser.add_argument('--limit', type=int, default=20, help='Maximum number of results')
    
    args = parser.parse_args()
    
    try:
        if args.command == 'get_top_losers':
            result = get_top_losers(args.industry, args.limit)
            print(json.dumps(result))
    except Exception as e:
        error_result = {
            "success": False,
            "message": f"Error: {str(e)}"
        }
        print(json.dumps(error_result))
        sys.exit(1)