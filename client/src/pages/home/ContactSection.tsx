import React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { apiRequest } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const ContactSection = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const { toast } = useToast();

  const { mutate: submitContactForm, isPending } = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const response = await apiRequest('POST', '/api/contact', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Message Sent!',
        description: 'We\'ll get back to you as soon as possible.',
        variant: 'default',
      });
      setFormData({ name: '', email: '', phone: '', message: '' });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitContactForm(formData);
  };

  return (
    <section id="contact" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Get in Touch</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Have questions? Our team is here to help you find the right solution for your investment needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="name">Name</Label>
                <div className="mt-1">
                  <Input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="py-3 px-4 block w-full"
                    placeholder="Your name"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="mt-1">
                  <Input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="py-3 px-4 block w-full"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <div className="mt-1">
                  <Input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="py-3 px-4 block w-full"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <div className="mt-1">
                  <Textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    className="py-3 px-4 block w-full"
                    placeholder="How can we help you?"
                    required
                  />
                </div>
              </div>
              <div>
                <Button 
                  type="submit" 
                  className="w-full py-3"
                  disabled={isPending}
                >
                  {isPending ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            </form>
          </div>

          <div>
            <Card className="bg-gray-50 h-full border border-gray-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Our Information</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <i className="fa-solid fa-location-dot w-6 h-6 text-primary"></i>
                    </div>
                    <div className="ml-3 text-base text-gray-600">
                      <p>123 Financial District</p>
                      <p>New York, NY 10005</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <i className="fa-solid fa-phone w-6 h-6 text-primary"></i>
                    </div>
                    <div className="ml-3 text-base text-gray-600">
                      <p>+1 (555) 123-4567</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <i className="fa-solid fa-envelope w-6 h-6 text-primary"></i>
                    </div>
                    <div className="ml-3 text-base text-gray-600">
                      <p>info@stocksenseai.com</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-md font-medium text-gray-900 mb-2">Connect With Us</h4>
                    <div className="flex space-x-4">
                      <a href="#" className="text-gray-400 hover:text-gray-500">
                        <i className="fa-brands fa-twitter w-5 h-5"></i>
                      </a>
                      <a href="#" className="text-gray-400 hover:text-gray-500">
                        <i className="fa-brands fa-linkedin w-5 h-5"></i>
                      </a>
                      <a href="#" className="text-gray-400 hover:text-gray-500">
                        <i className="fa-brands fa-facebook w-5 h-5"></i>
                      </a>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Business Hours</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <p className="text-sm text-gray-600">Monday - Friday:</p>
                        <p className="text-sm text-gray-900">9:00 AM - 6:00 PM EST</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-sm text-gray-600">Saturday:</p>
                        <p className="text-sm text-gray-900">10:00 AM - 2:00 PM EST</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-sm text-gray-600">Sunday:</p>
                        <p className="text-sm text-gray-900">Closed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
