import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const steps = [
  {
    number: 1,
    title: 'Data Collection',
    description:
      'Our AI continuously scans thousands of news sources, social media, company announcements, and financial reports.',
  },
  {
    number: 2,
    title: 'Sentiment Analysis',
    description:
      'Our NLP engine analyzes text to determine sentiment, relevance, and potential impact on stock performance.',
  },
  {
    number: 3,
    title: 'Prediction Generation',
    description:
      'Machine learning models combine sentiment data with historical patterns to generate actionable predictions.',
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">How StockSense AI Works</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Our proprietary algorithm uses advanced natural language processing to analyze news and predict market movements.
          </p>
        </div>

        <div className="relative">
          {/* Process Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-full w-0.5 bg-gray-200 md:hidden"></div>
                  <div className="w-full h-0.5 bg-gray-200 hidden md:block"></div>
                </div>
                <div className="relative flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center relative z-10">
                    <span className="text-lg font-bold">{step.number}</span>
                  </div>
                  <div className="mt-4 text-center">
                    <h3 className="text-lg font-medium text-gray-900">{step.title}</h3>
                    <p className="mt-2 text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Algorithm Visualization */}
          <div className="mt-16 bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-xl font-medium text-gray-900 mb-6 text-center">The StockSense Algorithm</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">SAMPLE NEWS INPUT</h4>
                  <div className="space-y-3">
                    <div className="p-2 border-l-4 border-blue-400 bg-blue-50 rounded-r-md">
                      <p className="text-sm text-gray-800">
                        "GenTech announces breakthrough in quantum computing that could revolutionize data processing."
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Source: Tech Journal, 2 hours ago</p>
                    </div>
                    <div className="p-2 border-l-4 border-green-400 bg-green-50 rounded-r-md">
                      <p className="text-sm text-gray-800">
                        "MediCore's new drug receives fast-track approval from FDA for rare disease treatment."
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Source: Health News Daily, 5 hours ago</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">AI ANALYSIS OUTPUT</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                      <span className="text-sm font-medium">GenTech (GNTC)</span>
                      <div className="flex items-center">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">+85% Positive</span>
                        <span className="ml-2 text-green-600 font-bold">↑</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                      <span className="text-sm font-medium">MediCore (MDCR)</span>
                      <div className="flex items-center">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">+92% Positive</span>
                        <span className="ml-2 text-green-600 font-bold">↑</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                      <span className="text-sm font-medium">CompuTech (CPTC)</span>
                      <div className="flex items-center">
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">-45% Negative</span>
                        <span className="ml-2 text-red-600 font-bold">↓</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <Card className="overflow-hidden border border-gray-200">
                <CardContent className="p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">PREDICTIVE ACCURACY OVER TIME</h4>
                  <div className="h-64 relative">
                    {/* Chart visualization */}
                    <div className="absolute bottom-0 left-0 right-0 h-50 flex items-end">
                      <div className="flex-1 flex items-end">
                        {/* Chart bars */}
                        <div className="w-1/6 h-12 bg-gray-200 mx-0.5 rounded-t"></div>
                        <div className="w-1/6 h-16 bg-gray-200 mx-0.5 rounded-t"></div>
                        <div className="w-1/6 h-20 bg-gray-200 mx-0.5 rounded-t"></div>
                        <div className="w-1/6 h-24 bg-gray-200 mx-0.5 rounded-t"></div>
                        <div className="w-1/6 h-32 bg-gray-200 mx-0.5 rounded-t"></div>
                        <div className="w-1/6 h-44 bg-primary mx-0.5 rounded-t"></div>
                        <div className="w-1/6 h-48 bg-primary mx-0.5 rounded-t"></div>
                        <div className="w-1/6 h-56 bg-primary mx-0.5 rounded-t"></div>
                      </div>
                    </div>
                    {/* Chart grid lines */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-full relative">
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200"></div>
                        <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-gray-200"></div>
                        <div className="absolute top-3/4 left-0 right-0 h-0.5 bg-gray-200"></div>
                        
                        {/* Trend line */}
                        <div className="absolute top-0 left-0 right-0 h-full">
                          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M0,70 C20,65 40,55 60,40 S80,20 100,10" stroke="#1a365d" strokeWidth="2" fill="none" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    {/* Axis labels */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 px-2">
                      <span>Traditional</span>
                      <span>StockSenseAI</span>
                    </div>
                    <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 py-2">
                      <span>100%</span>
                      <span>50%</span>
                      <span>0%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
