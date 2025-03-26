import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const newsFeed = [
  {
    category: 'TECHNOLOGY',
    title: 'Quantum Computing Breakthrough Announced by TechFuture Inc.',
    description: 'Scientists have achieved a milestone in quantum technology that could accelerate computation speeds.',
    time: '3 hours ago',
    sentiment: 'Bullish',
  },
  {
    category: 'HEALTHCARE',
    title: 'BioGenetics Receives FDA Approval for Revolutionary Treatment',
    description: 'The company\'s new gene therapy approach has shown promising results in clinical trials.',
    time: '5 hours ago',
    sentiment: 'Bullish',
  },
  {
    category: 'ENERGY',
    title: 'SolarMax Unveils New High-Efficiency Solar Panel Technology',
    description: 'The breakthrough could reduce production costs by 30% while improving efficiency.',
    time: '6 hours ago',
    sentiment: 'Bullish',
  },
  {
    category: 'AUTOMOTIVE',
    title: 'ElectroDrive Announces Battery Innovation for Extended Range',
    description: 'The new battery technology could extend electric vehicle range by up to 40%.',
    time: '8 hours ago',
    sentiment: 'Bullish',
  },
  {
    category: 'FINANCE',
    title: 'Global Banking Consortium Announces Regulatory Changes',
    description: 'New financial regulations could impact liquidity requirements for major banks.',
    time: '9 hours ago',
    sentiment: 'Bearish',
  },
];

const stockPredictions = [
  {
    symbol: 'QNTM',
    name: 'TechFuture Inc.',
    recommendation: 'Strong Buy',
    currentPrice: '$87.54',
    predictedMovement: '+12.3%',
    analysis: 'Quantum computing breakthrough will likely position TechFuture ahead of competitors. High impact on cloud computing revenue expected within 6-12 months.',
    competitor: { symbol: 'QCOM', impact: '-3.2%' },
  },
  {
    symbol: 'BGNTX',
    name: 'BioGenetics',
    recommendation: 'Strong Buy',
    currentPrice: '$142.20',
    predictedMovement: '+18.7%',
    analysis: 'FDA approval is a major milestone. Treatment addresses a $4.2B market with limited competition. Expect significant revenue growth in the next 2-3 quarters.',
    competitor: { symbol: 'PHRM', impact: '-5.1%' },
  },
  {
    symbol: 'SLMX',
    name: 'SolarMax',
    recommendation: 'Buy',
    currentPrice: '$53.41',
    predictedMovement: '+9.2%',
    analysis: 'Cost reduction in solar technology will improve margins substantially. Technology appears to be 12-18 months ahead of competitors based on announced specifications.',
    competitor: { symbol: 'SNRG', impact: '-2.5%' },
  },
  {
    symbol: 'ELDR',
    name: 'ElectroDrive',
    recommendation: 'Buy',
    currentPrice: '$92.75',
    predictedMovement: '+7.8%',
    analysis: 'Battery innovation addresses the primary consumer concern for EVs. Expected to accelerate adoption rate and market share growth against traditional automotive manufacturers.',
    competitor: { symbol: 'AUTO', impact: '-1.2%' },
  },
];

const NewsCard = ({ news }: { news: typeof newsFeed[0] }) => (
  <div className="news-card p-3 border border-gray-200 rounded-lg hover:shadow-md transition-transform duration-300 hover:-translate-y-1">
    <span className="text-xs font-medium text-gray-500 block">{news.category}</span>
    <h4 className="font-medium text-gray-900 mt-1">{news.title}</h4>
    <p className="text-sm text-gray-600 mt-1">{news.description}</p>
    <div className="flex items-center justify-between mt-2">
      <span className="text-xs text-gray-500">{news.time}</span>
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
        news.sentiment === 'Bullish' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {news.sentiment}
      </span>
    </div>
  </div>
);

const StockPredictionCard = ({ stock }: { stock: typeof stockPredictions[0] }) => (
  <div className="border border-green-200 rounded-lg p-4 bg-green-50">
    <div className="flex justify-between">
      <div>
        <span className="text-xs text-gray-500">{stock.symbol}</span>
        <h4 className="text-lg font-bold text-gray-900">{stock.name}</h4>
      </div>
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        {stock.recommendation}
      </span>
    </div>
    
    <div className="mt-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-500">Current Price</span>
        <span className="text-base font-bold text-gray-900">{stock.currentPrice}</span>
      </div>
      <div className="flex justify-between items-center mt-1">
        <span className="text-sm font-medium text-gray-500">Predicted Movement</span>
        <span className="text-base font-bold text-green-600">{stock.predictedMovement}</span>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-200">
        <span className="text-xs font-medium text-gray-500 block">AI ANALYSIS</span>
        <p className="text-sm text-gray-700 mt-1">{stock.analysis}</p>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-gray-500">Competitive Impact</span>
          <div>
            <span className="text-xs font-medium mr-1">{stock.competitor.symbol}</span>
            <span className="text-xs text-red-600">{stock.competitor.impact}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const DemoSection = () => {
  return (
    <section id="demo" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">See Our AI in Action</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Discover how our AI scans through news to identify potential stock movements.
          </p>
        </div>

        <Card className="overflow-hidden border border-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-3">
            {/* News Feed */}
            <div className="border-r border-gray-200 p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Live News Feed</h3>
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {/* News items */}
                {newsFeed.map((news, index) => (
                  <NewsCard key={index} news={news} />
                ))}
              </div>
            </div>

            {/* AI Analysis */}
            <div className="col-span-2 p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">AI Analysis & Stock Predictions</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {stockPredictions.map((stock, index) => (
                  <StockPredictionCard key={index} stock={stock} />
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default DemoSection;
