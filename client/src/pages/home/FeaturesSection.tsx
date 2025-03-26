import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface FeatureProps {
  icon: string;
  title: string;
  description: string;
  iconBgColor: string;
  iconTextColor: string;
}

const features: FeatureProps[] = [
  {
    icon: 'fa-newspaper',
    title: 'Global News Analysis',
    description: 'Our AI scans 10,000+ news sources globally in real-time to identify market-moving events.',
    iconBgColor: 'bg-primary-100',
    iconTextColor: 'text-primary-600',
  },
  {
    icon: 'fa-brain',
    title: 'Breakthrough Detection',
    description: 'Identify companies with recent innovations or breakthroughs before they impact stock prices.',
    iconBgColor: 'bg-secondary-100',
    iconTextColor: 'text-secondary-600',
  },
  {
    icon: 'fa-chart-line',
    title: 'Predictive Analytics',
    description: 'Our algorithms analyze patterns to predict which stocks are likely to rise before traditional signals appear.',
    iconBgColor: 'bg-accent-100',
    iconTextColor: 'text-accent-600',
  },
  {
    icon: 'fa-industry',
    title: 'Competitor Analysis',
    description: 'Understand how news affects not just a single company but its entire competitive landscape.',
    iconBgColor: 'bg-blue-100',
    iconTextColor: 'text-blue-600',
  },
  {
    icon: 'fa-bell',
    title: 'Real-time Alerts',
    description: 'Receive instant notifications when our AI detects high-probability trading opportunities.',
    iconBgColor: 'bg-green-100',
    iconTextColor: 'text-green-600',
  },
  {
    icon: 'fa-user-shield',
    title: 'Personalized Insights',
    description: 'Customize your watchlist and receive tailored recommendations based on your investment strategy.',
    iconBgColor: 'bg-purple-100',
    iconTextColor: 'text-purple-600',
  },
];

const Feature = ({ icon, title, description, iconBgColor, iconTextColor }: FeatureProps) => (
  <Card className="border border-gray-200">
    <CardContent className="pt-6">
      <div className={`w-12 h-12 rounded-md ${iconBgColor} ${iconTextColor} flex items-center justify-center mb-4`}>
        <i className={`fa-solid ${icon} text-xl`}></i>
      </div>
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600">{description}</p>
    </CardContent>
  </Card>
);

const FeaturesSection = () => {
  return (
    <section id="features" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Why Choose StockSense AI?</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Our platform goes beyond traditional stock analysis by leveraging AI to process global news and identify emerging trends.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Feature key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
