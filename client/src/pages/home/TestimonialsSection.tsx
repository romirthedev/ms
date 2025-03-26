import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface TestimonialProps {
  quote: string;
  name: string;
  role: string;
  stars: number;
}

const testimonials: TestimonialProps[] = [
  {
    quote: "StockSense AI has completely changed my investment approach. I was able to catch several emerging biotech stocks before major price movements based on their news analysis.",
    name: "Sarah Johnson",
    role: "Independent Investor",
    stars: 5,
  },
  {
    quote: "As a fund manager, I need insights that others don't have. StockSense AI has consistently provided early signals that have helped our fund outperform benchmarks by 21% this year.",
    name: "Michael Reynolds",
    role: "Hedge Fund Manager",
    stars: 5,
  },
  {
    quote: "The competitive analysis feature is what sets StockSense apart. Being able to see how news affects entire industry ecosystems has given us a tremendous edge in sector rotation strategies.",
    name: "Jennifer Chang",
    role: "Investment Advisor",
    stars: 4.5,
  },
];

const Testimonial = ({ quote, name, role, stars }: TestimonialProps) => {
  const renderStars = () => {
    const fullStars = Math.floor(stars);
    const hasHalfStar = stars % 1 !== 0;
    
    return (
      <div className="text-yellow-400 flex">
        {[...Array(fullStars)].map((_, i) => (
          <i key={i} className="fa-solid fa-star"></i>
        ))}
        {hasHalfStar && <i className="fa-solid fa-star-half-alt"></i>}
      </div>
    );
  };
  
  return (
    <Card className="bg-gray-50 overflow-hidden shadow-sm border border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          {renderStars()}
        </div>
        <blockquote className="mt-3 text-gray-700">
          <p>"{quote}"</p>
        </blockquote>
        <div className="mt-4 flex items-center">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
              <i className="fa-solid fa-user"></i>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{name}</p>
            <p className="text-sm text-gray-500">{role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">What Our Clients Say</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Hear from investors who've transformed their approach with StockSense AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Testimonial key={index} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
