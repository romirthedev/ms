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

def get_top_losers(industry=None, limit=20):
    """
    Gets the top stock losers
    
    Args:
        industry (str, optional): Filter by industry sector
        limit (int, optional): Maximum number of results to return
    
    Returns:
        list: List of dictionaries with stock loser information
    """
    # Generate a list of industries for filtering
    industries = [
        "Technology", 
        "Healthcare", 
        "Financial Services", 
        "Consumer Cyclical",
        "Communication Services",
        "Industrials",
        "Consumer Defensive",
        "Energy",
        "Utilities",
        "Real Estate",
        "Basic Materials"
    ]
    
    # List of stock symbols and company names
    stocks = [
        {"symbol": "AAPL", "companyName": "Apple Inc.", "industry": "Technology", "sector": "Consumer Electronics"},
        {"symbol": "MSFT", "companyName": "Microsoft Corporation", "industry": "Technology", "sector": "Software"},
        {"symbol": "AMZN", "companyName": "Amazon.com Inc.", "industry": "Consumer Cyclical", "sector": "Internet Retail"},
        {"symbol": "GOOGL", "companyName": "Alphabet Inc.", "industry": "Communication Services", "sector": "Internet Content & Information"},
        {"symbol": "TSLA", "companyName": "Tesla Inc.", "industry": "Consumer Cyclical", "sector": "Auto Manufacturers"},
        {"symbol": "NVDA", "companyName": "NVIDIA Corporation", "industry": "Technology", "sector": "Semiconductors"},
        {"symbol": "META", "companyName": "Meta Platforms Inc.", "industry": "Communication Services", "sector": "Internet Content & Information"},
        {"symbol": "NFLX", "companyName": "Netflix Inc.", "industry": "Communication Services", "sector": "Entertainment"},
        {"symbol": "PYPL", "companyName": "PayPal Holdings Inc.", "industry": "Financial Services", "sector": "Credit Services"},
        {"symbol": "INTC", "companyName": "Intel Corporation", "industry": "Technology", "sector": "Semiconductors"},
        {"symbol": "CSCO", "companyName": "Cisco Systems Inc.", "industry": "Technology", "sector": "Communication Equipment"},
        {"symbol": "ADBE", "companyName": "Adobe Inc.", "industry": "Technology", "sector": "Software"},
        {"symbol": "CMCSA", "companyName": "Comcast Corporation", "industry": "Communication Services", "sector": "Entertainment"},
        {"symbol": "PEP", "companyName": "PepsiCo Inc.", "industry": "Consumer Defensive", "sector": "Beverages - Non-Alcoholic"},
        {"symbol": "AVGO", "companyName": "Broadcom Inc.", "industry": "Technology", "sector": "Semiconductors"},
        {"symbol": "TXN", "companyName": "Texas Instruments Incorporated", "industry": "Technology", "sector": "Semiconductors"},
        {"symbol": "COST", "companyName": "Costco Wholesale Corporation", "industry": "Consumer Defensive", "sector": "Discount Stores"},
        {"symbol": "TMUS", "companyName": "T-Mobile US Inc.", "industry": "Communication Services", "sector": "Telecom Services"},
        {"symbol": "DHR", "companyName": "Danaher Corporation", "industry": "Healthcare", "sector": "Diagnostics & Research"},
        {"symbol": "AMAT", "companyName": "Applied Materials Inc.", "industry": "Technology", "sector": "Semiconductor Equipment & Materials"},
        {"symbol": "AMGN", "companyName": "Amgen Inc.", "industry": "Healthcare", "sector": "Biotechnology"},
        {"symbol": "SBUX", "companyName": "Starbucks Corporation", "industry": "Consumer Cyclical", "sector": "Restaurants"},
        {"symbol": "QCOM", "companyName": "QUALCOMM Incorporated", "industry": "Technology", "sector": "Semiconductors"},
        {"symbol": "AMD", "companyName": "Advanced Micro Devices Inc.", "industry": "Technology", "sector": "Semiconductors"},
        {"symbol": "SHOP", "companyName": "Shopify Inc.", "industry": "Technology", "sector": "Software - Application"},
        {"symbol": "UBER", "companyName": "Uber Technologies, Inc.", "industry": "Technology", "sector": "Software - Application"},
        {"symbol": "ZM", "companyName": "Zoom Video Communications Inc.", "industry": "Technology", "sector": "Software - Application"},
        {"symbol": "ROKU", "companyName": "Roku Inc.", "industry": "Communication Services", "sector": "Entertainment"},
        {"symbol": "DDOG", "companyName": "Datadog Inc.", "industry": "Technology", "sector": "Software - Application"},
        {"symbol": "ABNB", "companyName": "Airbnb Inc.", "industry": "Consumer Cyclical", "sector": "Travel Services"},
        {"symbol": "COIN", "companyName": "Coinbase Global Inc.", "industry": "Financial Services", "sector": "Financial Data & Stock Exchanges"},
        {"symbol": "RBLX", "companyName": "Roblox Corporation", "industry": "Communication Services", "sector": "Electronic Gaming & Multimedia"},
        {"symbol": "SQ", "companyName": "Block Inc.", "industry": "Financial Services", "sector": "Software - Infrastructure"},
        {"symbol": "ETSY", "companyName": "Etsy Inc.", "industry": "Consumer Cyclical", "sector": "Internet Retail"},
        {"symbol": "MTTR", "companyName": "Matterport Inc.", "industry": "Technology", "sector": "Software - Application"},
        {"symbol": "ME", "companyName": "23andMe Holding Co.", "industry": "Healthcare", "sector": "Diagnostics & Research"},
        {"symbol": "DKNG", "companyName": "DraftKings Inc.", "industry": "Consumer Cyclical", "sector": "Gambling"},
        {"symbol": "NET", "companyName": "Cloudflare Inc.", "industry": "Technology", "sector": "Software - Infrastructure"},
        {"symbol": "MDB", "companyName": "MongoDB Inc.", "industry": "Technology", "sector": "Software - Infrastructure"},
        {"symbol": "SNOW", "companyName": "Snowflake Inc.", "industry": "Technology", "sector": "Software - Infrastructure"},
        {"symbol": "SOFI", "companyName": "SoFi Technologies Inc.", "industry": "Financial Services", "sector": "Credit Services"},
        {"symbol": "TWLO", "companyName": "Twilio Inc.", "industry": "Technology", "sector": "Software - Infrastructure"},
        {"symbol": "OKTA", "companyName": "Okta Inc.", "industry": "Technology", "sector": "Software - Infrastructure"},
        {"symbol": "FSLY", "companyName": "Fastly Inc.", "industry": "Technology", "sector": "Software - Infrastructure"},
        {"symbol": "ZS", "companyName": "Zscaler Inc.", "industry": "Technology", "sector": "Software - Infrastructure"},
        {"symbol": "FTNT", "companyName": "Fortinet Inc.", "industry": "Technology", "sector": "Software - Infrastructure"},
        {"symbol": "PANW", "companyName": "Palo Alto Networks Inc.", "industry": "Technology", "sector": "Software - Infrastructure"},
        {"symbol": "PATH", "companyName": "UiPath Inc.", "industry": "Technology", "sector": "Software - Infrastructure"},
        {"symbol": "U", "companyName": "Unity Software Inc.", "industry": "Technology", "sector": "Software - Application"},
        {"symbol": "TOST", "companyName": "Toast Inc.", "industry": "Technology", "sector": "Software - Application"},
        {"symbol": "DOCN", "companyName": "DigitalOcean Holdings Inc.", "industry": "Technology", "sector": "Software - Infrastructure"},
        {"symbol": "SFIX", "companyName": "Stitch Fix Inc.", "industry": "Consumer Cyclical", "sector": "Specialty Retail"},
        {"symbol": "CLOV", "companyName": "Clover Health Investments Corp.", "industry": "Healthcare", "sector": "Healthcare Plans"},
        {"symbol": "WISH", "companyName": "ContextLogic Inc.", "industry": "Consumer Cyclical", "sector": "Internet Retail"},
        {"symbol": "DNA", "companyName": "Ginkgo Bioworks Holdings Inc.", "industry": "Healthcare", "sector": "Biotechnology"},
        {"symbol": "ASTS", "companyName": "AST SpaceMobile Inc.", "industry": "Technology", "sector": "Telecom Services"}
    ]
    
    # Filter by industry if specified
    if industry:
        stocks = [stock for stock in stocks if stock["industry"] == industry]
    
    # Generate results
    results = []
    today = datetime.datetime.now()
    
    # We'll generate more than we need, so we can sort and take the most negative ones
    for stock in stocks[:min(len(stocks), limit * 3)]:
        # Generate a negative price change
        price_change_percent = -random.uniform(1.0, 15.0)
        current_price = random.uniform(10.0, 500.0)
        previous_close = current_price / (1 + price_change_percent / 100)
        price_change = current_price - previous_close
        
        # Create stock data
        stock_data = {
            "symbol": stock["symbol"],
            "companyName": stock["companyName"],
            "currentPrice": current_price,
            "previousClose": previous_close,
            "priceChange": price_change,
            "priceChangePercent": price_change_percent,
            "industry": stock["industry"],
            "sector": stock["sector"],
            "marketCap": random.uniform(1000000000, 2000000000000),
            "exchange": "NASDAQ",
            "volume": random.randint(1000000, 50000000),
            "averageVolume": random.randint(2000000, 100000000),
            "52WeekLow": current_price * 0.7,
            "52WeekHigh": current_price * 1.5
        }
        
        # Add news for some stocks
        if random.random() > 0.3:
            stock_data["news"] = generate_news_for_stock(stock["companyName"], stock["symbol"], today)
        
        results.append(stock_data)
    
    # Sort by price change percent (ascending = biggest losers first)
    results.sort(key=lambda x: x["priceChangePercent"])
    
    # Take only what we need
    results = results[:limit]
    
    return {
        "success": True,
        "data": results,
        "industries": industries,
        "message": "Retrieved top stock losers"
    }

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
            "url": f"https://finance.example.com/news/{symbol.lower()}-{i}",
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