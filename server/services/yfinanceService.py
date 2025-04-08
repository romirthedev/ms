#!/usr/bin/env python3

import yfinance as yf
import pandas as pd
import json
import os
import traceback
from datetime import datetime, timedelta
import logging
from urllib.request import urlopen

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_top_losers(industry=None, limit=20):
    """
    Gets the top stock losers from Yahoo Finance

    Args:
        industry (str, optional): Filter by industry sector
        limit (int, optional): Maximum number of results to return

    Returns:
        list: List of dictionaries with stock loser information
    """
    try:
        # Get today's date and yesterday's date
        today = datetime.now()
        yesterday = today - timedelta(days=1)

        logger.info(f"Fetching top losers for {today.strftime('%Y-%m-%d')}")

        # Use the screener API to get the biggest losers directly
        try:
            # Get top losers from Yahoo Finance screener
            url = "https://query2.finance.yahoo.com/v1/finance/screener/predefined/saved?formatted=true&lang=en-US&region=US&scrIds=day_losers&count=500"
            
            response = urlopen(url)
            data = json.loads(response.read())
            
            quotes = data['finance']['result'][0]['quotes']
            symbols = [quote.get('symbol', '') for quote in quotes if quote.get('symbol', '')]
            
            # Get all stock data at once using yfinance
            try:
                # Download data in batches of 50 symbols
                batch_size = 50
                stock_data = {}
                
                for i in range(0, len(symbols), batch_size):
                    batch = symbols[i:i + batch_size]
                    try:
                        batch_data = yf.download(batch, period='2d', group_by='ticker')
                        stock_data.update(batch_data)
                    except Exception as e:
                        logger.error(f"Error downloading batch {i//batch_size + 1}: {str(e)}")
                        # Continue with next batch even if one fails
                        continue
                
                all_losers = []
                for symbol in symbols:
                    try:
                        # Get detailed info using yfinance
                        ticker = yf.Ticker(symbol)
                        ticker_info = ticker.info
                        
                        # Skip if we can't get the info
                        if not ticker_info:
                            continue
                            
                        # Get market
                        exchange = ticker_info.get('exchange', '').upper()
                        if 'NYSE' not in exchange and 'NASDAQ' not in exchange:
                            continue
                            
                        # Get price data from downloaded data
                        if symbol in stock_data:
                            current_price = stock_data[symbol]['Close'].iloc[-1]
                            previous_close = stock_data[symbol]['Close'].iloc[0]
                            price_change = current_price - previous_close
                            price_change_percent = (price_change / previous_close) * 100
                            
                            # Get additional market data
                            volume = stock_data[symbol]['Volume'].iloc[-1]
                            high = stock_data[symbol]['High'].max()
                            low = stock_data[symbol]['Low'].min()
                        else:
                            # Fallback to individual ticker data if not in bulk download
                            try:
                                hist = ticker.history(period='2d')
                                if not hist.empty and len(hist) >= 2:
                                    current_price = hist['Close'].iloc[-1]
                                    previous_close = hist['Close'].iloc[0]
                                    price_change = current_price - previous_close
                                    price_change_percent = (price_change / previous_close) * 100
                                    volume = hist['Volume'].iloc[-1]
                                    high = hist['High'].max()
                                    low = hist['Low'].min()
                                else:
                                    continue
                            except Exception as e:
                                logger.error(f"Error getting individual data for {symbol}: {str(e)}")
                                continue
                            
                        # Skip if price data is invalid
                        if not current_price or not previous_close:
                            continue
                        
                        # Get industry info
                        industry_value = ticker_info.get('industry', '')
                        sector = ticker_info.get('sector', '')
                        
                        # Filter by industry if specified
                        if industry and industry != 'all' and industry_value.lower() != industry.lower():
                            continue

                        # Get news for the stock
                        news = []
                        try:
                            news_items = ticker.news[:3]  # Get up to 3 news items
                            for item in news_items:
                                title = item.get('title', '')
                                link = item.get('link', '')
                                published_date = item.get('providerPublishTime', '')

                                news.append({
                                    'title': title,
                                    'url': link,
                                    'publishedAt': published_date,
                                    'source': item.get('publisher', 'Yahoo Finance')
                                })
                        except Exception as e:
                            logger.error(f"Error getting news for {symbol}: {str(e)}")

                        # Add to the losers list
                        all_losers.append({
                            'symbol': symbol,
                            'companyName': ticker_info.get('longName', symbol),
                            'currentPrice': current_price,
                            'priceChange': price_change,
                            'priceChangePercent': price_change_percent,
                            'industry': industry_value,
                            'sector': sector,
                            'marketCap': ticker_info.get('marketCap', 0),
                            'exchange': exchange,
                            'news': news,
                            'volume': volume,
                            'high': high,
                            'low': low,
                            'averageVolume': ticker_info.get('averageVolume', 0),
                            '52WeekLow': ticker_info.get('fiftyTwoWeekLow', 0),
                            '52WeekHigh': ticker_info.get('fiftyTwoWeekHigh', 0)
                        })
                    except Exception as e:
                        logger.error(f"Error processing quote {symbol}: {str(e)}")
                        continue

            except Exception as e:
                logger.error(f"Error downloading stock data: {str(e)}")
                raise

            # Sort all losers by price change percent (ascending, biggest losers first)
            all_losers.sort(key=lambda x: x['priceChangePercent'])

            # Return the top losers up to the limit
            return {'success': True, 'data': all_losers[:limit]}

        except Exception as e:
            logger.error(f"Error using screener API: {str(e)}")
            raise

    except Exception as e:
        logger.error(f"Error getting top losers: {str(e)}")
        traceback.print_exc()
        return {'success': False, 'error': str(e)}

def get_deepseek_info(symbol):
    """
    Gets detailed information about a stock by analyzing data from Yahoo Finance
    and providing AI-enhanced insights.
    
    Args:
        symbol (str): Stock symbol to get information for
        
    Returns:
        dict: Comprehensive stock information and analysis
    """
    try:
        logger.info(f"Fetching detailed information for {symbol}")
        
        # Get the stock data from Yahoo Finance
        ticker = yf.Ticker(symbol)
        
        # Get basic info
        ticker_info = ticker.info
        if not ticker_info:
            return {
                'success': False, 
                'message': f'No information found for {symbol}',
                'symbol': symbol
            }
        
        # Get recent price history
        history = ticker.history(period='1mo')
        if history.empty:
            return {
                'success': False,
                'message': f'No price history found for {symbol}',
                'symbol': symbol
            }
        
        # Get recent news
        news = []
        try:
            # Get news for this stock
            stock_news = ticker.news[:5]
            for item in stock_news:
                if isinstance(item, dict):
                    title = item.get('title', '')
                    link = item.get('link', '')
                    published = item.get('providerPublishTime', None)
                    
                    if published:
                        published_date = datetime.fromtimestamp(published).strftime('%Y-%m-%d %H:%M:%S')
                    else:
                        published_date = 'Unknown'
                    
                    news.append({
                        'title': title,
                        'url': link,
                        'publishedAt': published_date,
                        'source': item.get('publisher', 'Yahoo Finance')
                    })
        except Exception as e:
            logger.error(f"Error getting news for {symbol}: {str(e)}")
        
        # Calculate key metrics
        name = ticker_info.get('shortName', symbol)
        current_price = history['Close'].iloc[-1] if not history.empty else None
        prev_close = ticker_info.get('previousClose', None)
        
        # Get price change
        price_change = None
        price_change_percent = None
        if current_price and prev_close:
            price_change = current_price - prev_close
            price_change_percent = (price_change / prev_close) * 100
        
        # Calculate volatility
        volatility = history['Close'].pct_change().std() * 100 if len(history) > 5 else None
        
        # Determine sentiment based on price movement, volume, and other factors
        sentiment = 'Neutral'
        risk_level = 'Medium'
        
        # Based on recent performance
        if price_change_percent:
            if price_change_percent < -5:
                sentiment = 'Bearish'
                risk_level = 'High'
            elif price_change_percent < -2:
                sentiment = 'Slightly Bearish'
                risk_level = 'Medium-High'
            elif price_change_percent > 5:
                sentiment = 'Bullish'
                risk_level = 'Medium-High'
            elif price_change_percent > 2:
                sentiment = 'Slightly Bullish'
                risk_level = 'Medium'
        
        # Generate insights based on the data
        insights = []
        
        # Price-based insight
        if price_change_percent:
            if price_change_percent < 0:
                insights.append(f"The stock has declined {abs(price_change_percent):.2f}% recently, which may indicate selling pressure.")
            else:
                insights.append(f"The stock has increased {price_change_percent:.2f}% recently, which may indicate buying interest.")
        
        # Volume-based insight
        if 'Volume' in history.columns and not history.empty:
            avg_volume = history['Volume'].mean()
            recent_volume = history['Volume'].iloc[-1]
            volume_change = ((recent_volume / avg_volume) - 1) * 100
            
            if volume_change > 50:
                insights.append(f"Trading volume is up significantly ({volume_change:.2f}%), indicating increased investor interest.")
            elif volume_change < -30:
                insights.append(f"Trading volume is down ({abs(volume_change):.2f}%), which may indicate decreased investor interest.")
        
        # Volatility insight
        if volatility:
            if volatility > 3:
                insights.append(f"The stock shows high volatility ({volatility:.2f}%), suggesting potential for large price swings.")
            elif volatility < 1:
                insights.append(f"The stock shows low volatility ({volatility:.2f}%), suggesting more stable price movement.")
        
        # Market cap insight
        market_cap = ticker_info.get('marketCap', None)
        if market_cap:
            if market_cap > 200_000_000_000:  # $200B
                insights.append("This is a large-cap stock, which typically offers more stability but potentially lower growth.")
            elif market_cap < 2_000_000_000:  # $2B
                insights.append("This is a small-cap stock, which typically offers higher growth potential but more risk.")
        
        # Add a general conclusion if we have fewer than 3 insights
        if len(insights) < 3:
            insights.append(f"Consider monitoring this stock's performance relative to its sector and broader market trends.")
        
        return {
            'success': True,
            'message': 'Detailed stock analysis from Yahoo Finance',
            'data': {
                'symbol': symbol,
                'name': name,
                'currentPrice': current_price,
                'previousClose': prev_close,
                'priceChange': price_change,
                'priceChangePercent': price_change_percent,
                'industry': ticker_info.get('industry', 'Unknown'),
                'sector': ticker_info.get('sector', 'Unknown'),
                'marketCap': ticker_info.get('marketCap', None),
                'peRatio': ticker_info.get('trailingPE', None),
                'beta': ticker_info.get('beta', None),
                'summary': ticker_info.get('longBusinessSummary', f"No summary available for {name}."),
                'news': news,
                'volatility': volatility,
                'fiftyTwoWeekLow': ticker_info.get('fiftyTwoWeekLow', None),
                'fiftyTwoWeekHigh': ticker_info.get('fiftyTwoWeekHigh', None),
                'insights': insights,
                'riskLevel': risk_level,
                'sentiment': sentiment
            }
        }
    
    except Exception as e:
        logger.error(f"Error getting DeepSeek info for {symbol}: {str(e)}")
        traceback.print_exc()
        return {
            'success': False,
            'message': f'Error analyzing {symbol}: {str(e)}',
            'symbol': symbol
        }

# Command-line argument processing
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='YFinance Stock Data Service')
    parser.add_argument('command', choices=['get_top_losers', 'get_deepseek_info'], 
                        help='Command to execute')
    parser.add_argument('--industry', help='Filter by industry sector')
    parser.add_argument('--symbol', help='Stock symbol for deepseek info')
    parser.add_argument('--limit', type=int, default=20, help='Maximum number of results to return')
    
    args = parser.parse_args()
    
    try:
        if args.command == 'get_top_losers':
            result = get_top_losers(industry=args.industry, limit=args.limit)
            print(json.dumps(result))
        elif args.command == 'get_deepseek_info':
            if not args.symbol:
                print(json.dumps({
                    'success': False,
                    'error': 'Symbol is required for get_deepseek_info command'
                }))
            else:
                result = get_deepseek_info(args.symbol)
                print(json.dumps(result))
    except Exception as e:
        logger.error(f"Error executing command: {str(e)}")
        traceback.print_exc()
        print(json.dumps({
            'success': False,
            'error': str(e)
        }))