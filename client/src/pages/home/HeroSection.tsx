import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-r from-primary to-primary-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              Discover Tomorrow's Winning Stocks Today
            </h1>
            <p className="mt-4 text-xl text-blue-100">
              Our AI scans global news, breakthroughs, and trends to identify stocks poised for growth before traditional analysts.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <a href="#demo">
                <Button className="px-5 py-6 bg-white text-primary-700 hover:bg-blue-50">
                  Try Free Demo
                </Button>
              </a>
              <a href="#how-it-works">
                <Button variant="outline" className="px-5 py-6 border-white text-white hover:bg-primary-600">
                  How It Works
                  <i className="fa-solid fa-arrow-right ml-2"></i>
                </Button>
              </a>
            </div>
            <div className="mt-8 flex items-center">
              <div className="flex -space-x-2">
                <svg className="h-10 w-10 rounded-full ring-2 ring-white" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="32" cy="32" r="32" fill="#E5E7EB"/>
                  <path d="M40 24C40 28.4183 36.4183 32 32 32C27.5817 32 24 28.4183 24 24C24 19.5817 27.5817 16 32 16C36.4183 16 40 19.5817 40 24Z" fill="#9CA3AF"/>
                  <path d="M16 49.3333C16 42.7060 21.3726 37.3333 28 37.3333H36C42.6274 37.3333 48 42.7060 48 49.3333C48 51.5425 46.2091 53.3333 44 53.3333H20C17.7909 53.3333 16 51.5425 16 49.3333Z" fill="#9CA3AF"/>
                </svg>
                <svg className="h-10 w-10 rounded-full ring-2 ring-white" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="32" cy="32" r="32" fill="#E5E7EB"/>
                  <path d="M40 24C40 28.4183 36.4183 32 32 32C27.5817 32 24 28.4183 24 24C24 19.5817 27.5817 16 32 16C36.4183 16 40 19.5817 40 24Z" fill="#9CA3AF"/>
                  <path d="M16 49.3333C16 42.7060 21.3726 37.3333 28 37.3333H36C42.6274 37.3333 48 42.7060 48 49.3333C48 51.5425 46.2091 53.3333 44 53.3333H20C17.7909 53.3333 16 51.5425 16 49.3333Z" fill="#9CA3AF"/>
                </svg>
                <svg className="h-10 w-10 rounded-full ring-2 ring-white" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="32" cy="32" r="32" fill="#E5E7EB"/>
                  <path d="M40 24C40 28.4183 36.4183 32 32 32C27.5817 32 24 28.4183 24 24C24 19.5817 27.5817 16 32 16C36.4183 16 40 19.5817 40 24Z" fill="#9CA3AF"/>
                  <path d="M16 49.3333C16 42.7060 21.3726 37.3333 28 37.3333H36C42.6274 37.3333 48 42.7060 48 49.3333C48 51.5425 46.2091 53.3333 44 53.3333H20C17.7909 53.3333 16 51.5425 16 49.3333Z" fill="#9CA3AF"/>
                </svg>
              </div>
              <p className="ml-4 text-sm font-medium text-blue-100">Join 5,000+ investors and fund managers</p>
            </div>
          </div>
          <div className="relative lg:ml-10">
            <Card className="bg-white rounded-lg shadow-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-1.5"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1.5"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-xs text-gray-500">StockSense AI Dashboard</div>
              </div>
              <div className="p-4 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">News-Based Predictions</h3>
                  <div className="text-sm text-gray-500">Last updated: 2 hours ago</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="border border-gray-200 rounded-lg p-3 bg-green-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-medium text-gray-500">TSLA</span>
                        <h4 className="text-lg font-bold text-gray-800">Tesla Inc.</h4>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <i className="fa-solid fa-arrow-trend-up mr-1"></i> Rising
                      </span>
                    </div>
                    <div className="mt-2 flex items-center">
                      <span className="text-2xl font-bold text-gray-900">$224.57</span>
                      <span className="ml-2 text-sm font-medium text-green-600">+3.2%</span>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Breakthrough in battery technology announced</p>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-3 bg-blue-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-medium text-gray-500">MSFT</span>
                        <h4 className="text-lg font-bold text-gray-800">Microsoft</h4>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <i className="fa-solid fa-eye mr-1"></i> Watch
                      </span>
                    </div>
                    <div className="mt-2 flex items-center">
                      <span className="text-2xl font-bold text-gray-900">$340.12</span>
                      <span className="ml-2 text-sm font-medium text-green-600">+1.2%</span>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">New cloud computing partnership announced</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">RECENT NEWS ANALYSIS</h4>
                  <div className="space-y-2">
                    <div className="flex items-start p-2 rounded-md hover:bg-gray-50">
                      <span className="flex-shrink-0 h-8 w-8 rounded-full bg-accent flex items-center justify-center text-white">
                        <i className="fa-solid fa-newspaper"></i>
                      </span>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">Biotech firm announces successful phase 3 trials</p>
                        <p className="text-xs text-gray-500">Positive impact: MRNA, PFE, JNJ</p>
                      </div>
                      <span className="text-xs text-gray-500">12m ago</span>
                    </div>
                    <div className="flex items-start p-2 rounded-md hover:bg-gray-50">
                      <span className="flex-shrink-0 h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-white">
                        <i className="fa-solid fa-chart-line"></i>
                      </span>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">Semiconductor shortage easing according to industry reports</p>
                        <p className="text-xs text-gray-500">Positive impact: INTC, AMD, NVDA</p>
                      </div>
                      <span className="text-xs text-gray-500">1h ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-primary-700 to-transparent"></div>
    </section>
  );
};

export default HeroSection;
