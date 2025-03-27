#!/usr/bin/env python3

"""
Simple DeepSeek Service that provides stock information without external dependencies.
This service generates synthetic yet plausible information about stocks based on symbols.
"""

import json
import sys
import random
import argparse
import datetime
from typing import Dict, List, Any, Optional

def get_stock_info(symbol: str) -> Dict[str, Any]:
    """Generate detailed stock information for a symbol"""
    # Current date for timestamps
    today = datetime.datetime.now()
    
    # Basic company information based on symbol
    company_info = {
        'AAPL': {
            'name': 'Apple Inc.',
            'industry': 'Technology',
            'sector': 'Consumer Electronics',
            'price': random.uniform(170.0, 190.0),
            'prev_close': random.uniform(170.0, 190.0),
            'market_cap': 2800000000000,
            'summary': 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company offers iPhone, Mac, iPad, Apple Watch, and related accessories and services.',
        },
        'MSFT': {
            'name': 'Microsoft Corporation',
            'industry': 'Technology',
            'sector': 'Software',
            'price': random.uniform(370.0, 390.0),
            'prev_close': random.uniform(370.0, 390.0),
            'market_cap': 2900000000000,
            'summary': 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide. The company operates through Productivity and Business Processes, Intelligent Cloud, and More Personal Computing segments.',
        },
        'GOOGL': {
            'name': 'Alphabet Inc.',
            'industry': 'Technology',
            'sector': 'Internet Content & Information',
            'price': random.uniform(160.0, 175.0),
            'prev_close': random.uniform(160.0, 175.0),
            'market_cap': 2000000000000,
            'summary': 'Alphabet Inc. offers various products and platforms in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America. It operates through Google Services, Google Cloud, and Other Bets segments.',
        },
        'AMZN': {
            'name': 'Amazon.com, Inc.',
            'industry': 'Consumer Cyclical',
            'sector': 'Internet Retail',
            'price': random.uniform(170.0, 185.0),
            'prev_close': random.uniform(170.0, 185.0),
            'market_cap': 1900000000000,
            'summary': 'Amazon.com, Inc. engages in the retail sale of consumer products and subscriptions through online and physical stores in North America and internationally. It operates through North America, International, and Amazon Web Services (AWS) segments.',
        },
        'META': {
            'name': 'Meta Platforms, Inc.',
            'industry': 'Technology',
            'sector': 'Internet Content & Information',
            'price': random.uniform(470.0, 500.0),
            'prev_close': random.uniform(470.0, 500.0),
            'market_cap': 1200000000000,
            'summary': 'Meta Platforms, Inc. develops products that enable people to connect and share with friends and family through mobile devices, personal computers, virtual reality headsets, and wearables worldwide. It operates in two segments, Family of Apps and Reality Labs.',
        },
        'TSLA': {
            'name': 'Tesla, Inc.',
            'industry': 'Consumer Cyclical',
            'sector': 'Auto Manufacturers',
            'price': random.uniform(170.0, 190.0),
            'prev_close': random.uniform(170.0, 190.0),
            'market_cap': 600000000000,
            'summary': 'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems in the United States, China, and internationally. It operates in two segments, Automotive, and Energy Generation and Storage.',
        },
        'NVDA': {
            'name': 'NVIDIA Corporation',
            'industry': 'Technology',
            'sector': 'Semiconductors',
            'price': random.uniform(850.0, 1050.0),
            'prev_close': random.uniform(850.0, 1050.0),
            'market_cap': 2500000000000,
            'summary': 'NVIDIA Corporation provides graphics, compute and networking solutions in the United States, Taiwan, China, and internationally.',
        },
    }
    
    # Default values for any unknown symbol
    default_info = {
        'name': f'{symbol} Corporation',
        'industry': 'Various',
        'sector': 'Various',
        'price': random.uniform(50.0, 200.0),
        'prev_close': random.uniform(50.0, 200.0),
        'market_cap': random.randint(1000000000, 100000000000),
        'summary': f'Information for {symbol} is limited. This company operates in various sectors and markets.'
    }
    
    # Get company info or use default
    company = company_info.get(symbol, default_info)
    
    # Calculate price change
    price = company['price']
    prev_close = company['prev_close']
    price_change = price - prev_close
    price_change_percent = (price_change / prev_close) * 100
    
    # Generate 52-week range
    fifty_two_week_low = min(price * 0.7, prev_close * 0.7)
    fifty_two_week_high = max(price * 1.3, prev_close * 1.3)
    
    # Calculate volatility and PE ratio
    volatility = random.uniform(1.0, 5.0)
    pe_ratio = random.uniform(15.0, 40.0)
    beta = random.uniform(0.8, 1.5)
    
    # Determine sentiment based on price movement
    sentiment = 'Neutral'
    risk_level = 'Medium'
    
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
    
    # Generate insights
    insights = [
        f"The stock has {'declined' if price_change < 0 else 'increased'} {abs(price_change_percent):.2f}% recently.",
        f"The current P/E ratio of {pe_ratio:.2f} suggests {'a premium valuation' if pe_ratio > 25 else 'a reasonable valuation'}.",
        f"With a beta of {beta:.2f}, this stock is {'more' if beta > 1 else 'less'} volatile than the overall market.",
        f"The stock is trading at {(price / fifty_two_week_low - 1) * 100:.1f}% above its 52-week low.",
        f"Consider the {sentiment.lower()} sentiment when evaluating this investment opportunity."
    ]
    
    # Generate news
    news = [
        {
            'title': f"{company['name']} Reports {'Positive' if random.random() > 0.5 else 'Mixed'} Quarterly Results",
            'url': f"https://finance.example.com/news/{symbol.lower()}-quarterly-results",
            'publishedAt': (today - datetime.timedelta(days=random.randint(1, 5))).strftime('%Y-%m-%d'),
            'source': 'Financial News'
        },
        {
            'title': f"Analysts {'Upgrade' if random.random() > 0.5 else 'Maintain'} Rating on {company['name']}",
            'url': f"https://finance.example.com/news/{symbol.lower()}-analyst-rating",
            'publishedAt': (today - datetime.timedelta(days=random.randint(1, 10))).strftime('%Y-%m-%d'),
            'source': 'Market Analysis'
        },
        {
            'title': f"{company['name']} {'Expands' if random.random() > 0.5 else 'Optimizes'} Operations in Global Markets",
            'url': f"https://finance.example.com/news/{symbol.lower()}-global-markets",
            'publishedAt': (today - datetime.timedelta(days=random.randint(1, 15))).strftime('%Y-%m-%d'),
            'source': 'Business Journal'
        }
    ]
    
    # Build response
    result = {
        'success': True,
        'message': 'Detailed stock analysis',
        'data': {
            'symbol': symbol,
            'name': company['name'],
            'currentPrice': price,
            'previousClose': prev_close,
            'priceChange': price_change,
            'priceChangePercent': price_change_percent,
            'industry': company['industry'],
            'sector': company['sector'],
            'marketCap': company['market_cap'],
            'peRatio': pe_ratio,
            'beta': beta,
            'summary': company['summary'],
            'news': news,
            'volatility': volatility,
            'fiftyTwoWeekLow': fifty_two_week_low,
            'fiftyTwoWeekHigh': fifty_two_week_high,
            'insights': insights,
            'riskLevel': risk_level,
            'sentiment': sentiment
        }
    }
    
    return result

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Simple DeepSeek Service')
    parser.add_argument('--symbol', required=True, help='Stock symbol to analyze')
    
    args = parser.parse_args()
    
    try:
        result = get_stock_info(args.symbol)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({
            'success': False,
            'message': f'Error analyzing stock: {str(e)}',
            'symbol': args.symbol
        }))
        sys.exit(1)