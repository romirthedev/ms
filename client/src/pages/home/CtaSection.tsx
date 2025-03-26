import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const CtaSection = () => {
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const { mutate: subscribeToNewsletter, isPending } = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest('POST', '/api/newsletter', { email });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'You have been subscribed to our newsletter.',
        variant: 'default',
      });
      setEmail('');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      subscribeToNewsletter(email);
    }
  };

  return (
    <section className="bg-primary py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Stay Ahead of the Market</h2>
            <p className="mt-4 text-lg text-blue-100">
              Join our newsletter for weekly insights on emerging market trends and potential investment opportunities.
            </p>
            
            <form className="mt-8" onSubmit={handleSubmit}>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label htmlFor="email-address" className="sr-only">Email address</label>
                  <Input
                    id="email-address"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    className="w-full px-5 py-3 border-gray-300 placeholder-gray-500 focus:ring-accent focus:border-accent"
                    placeholder="Enter your email"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isPending}
                  className="flex-none w-full sm:w-auto px-5 py-3 bg-white text-primary hover:bg-blue-50"
                >
                  {isPending ? 'Subscribing...' : 'Subscribe'}
                </Button>
              </div>
              <p className="mt-3 text-sm text-blue-100">
                We care about your data. Read our <a href="#" className="text-white underline">Privacy Policy</a>.
              </p>
            </form>
          </div>
          
          <div className="relative lg:ml-10">
            <Card className="shadow-xl">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Ready to transform your investment approach?
                </h3>
                <p className="text-gray-600 mb-6">
                  Start discovering tomorrow's market winners today with our AI-powered analysis.
                </p>
                <div className="space-y-3">
                  <a href="#demo">
                    <Button variant="secondary" className="w-full">
                      Try Free Demo
                    </Button>
                  </a>
                  <a href="#contact">
                    <Button variant="outline" className="w-full border-gray-300 text-gray-700 bg-white hover:bg-gray-50">
                      Contact Sales
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
