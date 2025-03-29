import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

/**
 * Google News scraping service for real-time stock news analysis
 */

/**
 * Scrape Google News for a specific stock symbol and company name
 * @param symbol Stock symbol
 * @param companyName Company name for more targeted results
 * @returns Array of news articles with title, source, url, and snippet
 */
async function scrapeGoogleNews(symbol: string, companyName: string): Promise<any[]> {
  console.log(`Scraping Google News for ${symbol} (${companyName})...`);
  
  const searchQuery = encodeURIComponent(`${symbol} ${companyName} stock news`);
  const url = `https://www.google.com/search?q=${searchQuery}&tbm=nws&tbs=qdr:m`; // Last month's news
  
  try {
    // Launch browser
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });
    
    // Create a new page
    const page = await browser.newPage();
    
    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36');
    
    // Navigate to Google News
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    // Wait for news results to load
    await page.waitForSelector('div[role="main"]');
    
    // Get page content
    const content = await page.content();
    
    // Parse with Cheerio
    const $ = cheerio.load(content);
    
    // Extract news data
    const newsArticles: any[] = [];
    
    // Google news search results
    $('div.SoaBEf').each((i, element) => {
      try {
        const titleElement = $(element).find('div.n0jPhd');
        const title = titleElement.text().trim();
        
        const sourceElement = $(element).find('div.MgUUmf');
        const source = sourceElement.text().trim();
        
        const linkElement = $(element).find('a');
        const url = linkElement.attr('href');
        
        const snippetElement = $(element).find('div.GI74Re');
        const snippet = snippetElement.text().trim();
        
        const timeElement = $(element).find('div.OSrXXb span');
        const publishedTime = timeElement.text().trim();
        
        if (title && source && url) {
          // Ensure we have a proper URL
          const cleanUrl = url.startsWith('/url?q=') 
            ? decodeURIComponent(url.replace('/url?q=', '').split('&sa=')[0]) 
            : url;
          
          newsArticles.push({
            title,
            source,
            url: cleanUrl,
            snippet,
            publishedTime
          });
        }
      } catch (error) {
        console.error('Error parsing news item:', error);
      }
    });
    
    // Close the browser
    await browser.close();
    
    console.log(`Scraped ${newsArticles.length} news articles for ${symbol}`);
    return newsArticles;
  } catch (error) {
    console.error(`Error scraping Google News for ${symbol}:`, error);
    return [];
  }
}

/**
 * Get combined news text for AI analysis from scraped articles
 * @param newsArticles Array of news articles
 * @returns Consolidated text for analysis
 */
function prepareNewsTextForAnalysis(newsArticles: any[], symbol: string, companyName: string): string {
  if (!newsArticles || newsArticles.length === 0) {
    return `No recent news found for ${symbol} (${companyName}).`;
  }
  
  // Combine all news data into a single text
  const newsText = newsArticles.map((article, index) => {
    return `
Article ${index + 1}:
Title: ${article.title}
Source: ${article.source}
Time: ${article.publishedTime || 'Recent'}
Snippet: ${article.snippet || 'No preview available'}
URL: ${article.url}
---
`;
  }).join('\n');
  
  return `
Recent news articles for ${symbol} (${companyName}):
${newsText}
`;
}

export const googleNewsScrapingService = {
  scrapeGoogleNews,
  prepareNewsTextForAnalysis
};