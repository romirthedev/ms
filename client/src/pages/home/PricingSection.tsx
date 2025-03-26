import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: PlanFeature[];
  isPopular?: boolean;
  buttonText: string;
  buttonVariant: 'default' | 'accent';
}

const pricingPlans: PricingPlan[] = [
  {
    name: 'Starter',
    price: '$29',
    description: 'Perfect for individual investors starting their journey.',
    features: [
      { text: '5 stock watchlist', included: true },
      { text: 'Daily prediction updates', included: true },
      { text: 'Email alerts', included: true },
      { text: 'Basic competitor analysis', included: true },
      { text: 'Advanced news filtering', included: false },
      { text: 'API access', included: false },
    ],
    buttonText: 'Get Started',
    buttonVariant: 'default',
  },
  {
    name: 'Professional',
    price: '$79',
    description: 'Ideal for serious investors focused on performance.',
    features: [
      { text: '25 stock watchlist', included: true },
      { text: 'Real-time prediction updates', included: true },
      { text: 'Email + SMS alerts', included: true },
      { text: 'Comprehensive competitor analysis', included: true },
      { text: 'Advanced news filtering', included: true },
      { text: 'API access', included: false },
    ],
    isPopular: true,
    buttonText: 'Get Started',
    buttonVariant: 'accent',
  },
  {
    name: 'Enterprise',
    price: '$249',
    description: 'Built for professional traders and fund managers.',
    features: [
      { text: 'Unlimited stock watchlist', included: true },
      { text: 'Real-time prediction updates', included: true },
      { text: 'Priority alerts (all channels)', included: true },
      { text: 'Full industry ecosystem analysis', included: true },
      { text: 'Custom news filters and sentiment analysis', included: true },
      { text: 'Full API access', included: true },
    ],
    buttonText: 'Contact Sales',
    buttonVariant: 'default',
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Transparent Pricing</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Choose the plan that best fits your investment strategy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <Card 
              key={index} 
              className={`overflow-hidden border ${plan.isPopular ? 'border-2 border-primary relative' : 'border-gray-200'}`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 inset-x-0">
                  <div className="bg-primary text-white text-xs font-medium px-3 py-1 text-center uppercase">Most Popular</div>
                </div>
              )}
              <CardContent className={`p-6 ${plan.isPopular ? 'pt-8' : ''}`}>
                <h3 className="text-lg font-medium text-gray-900">{plan.name}</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                  <span className="ml-1 text-xl font-medium text-gray-500">/month</span>
                </div>
                <p className="mt-5 text-gray-600">{plan.description}</p>

                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      {feature.included ? (
                        <i className="fa-solid fa-check text-green-500 mt-1 mr-2"></i>
                      ) : (
                        <i className="fa-solid fa-xmark text-gray-400 mt-1 mr-2"></i>
                      )}
                      <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Button 
                    className="w-full" 
                    variant={plan.buttonVariant === 'accent' ? 'secondary' : 'default'}
                  >
                    {plan.buttonText}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
