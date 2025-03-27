import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Search, AlertTriangle, BadgeCheck, Zap, BarChart2, Target, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const BentoBoxSection = () => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  const items = [
    {
      title: "AI-Powered Analysis",
      description: "Our advanced algorithms analyze thousands of NASDAQ stocks every 30 seconds to identify potential opportunities before they become obvious to the market.",
      icon: <Zap className="h-12 w-12 text-blue-500" />,
      color: "bg-blue-50",
      index: 0
    },
    {
      title: "Breakthrough Detection",
      description: "We scan the news for company breakthroughs, product launches, and technological innovations that signal potential growth.",
      icon: <AlertTriangle className="h-12 w-12 text-amber-500" />,
      color: "bg-amber-50",
      index: 1
    },
    {
      title: "Real-Time Updates",
      description: "Our platform refreshes data every 30 seconds, ensuring you're always making decisions based on the most current information.",
      icon: <TrendingUp className="h-12 w-12 text-green-500" />,
      color: "bg-green-50",
      index: 2
    },
    {
      title: "Smaller Companies Focus",
      description: "While we analyze all NASDAQ stocks, we put special emphasis on finding promising smaller companies with breakthrough potential.",
      icon: <Search className="h-12 w-12 text-purple-500" />,
      color: "bg-purple-50",
      index: 3
    },
    {
      title: "Sentiment Analysis",
      description: "We apply advanced natural language processing to evaluate news sentiment and determine its impact on stock potential.",
      icon: <BadgeCheck className="h-12 w-12 text-indigo-500" />,
      color: "bg-indigo-50",
      index: 4
    },
    {
      title: "Performance Metrics",
      description: "Clear visualization of stock performance data and AI-generated predictions on potential growth opportunities.",
      icon: <BarChart2 className="h-12 w-12 text-rose-500" />,
      color: "bg-rose-50",
      index: 5
    }
  ];

  return (
    <section className="py-16 bg-gray-50" id="features">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            How StockSense AI Works
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Our platform continuously analyzes thousands of NASDAQ-listed stocks every 30 seconds to identify breakthrough opportunities
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <motion.div
              key={index}
              custom={item.index}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              <Card className={`h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 border-none ${item.color}`}>
                <CardContent className="p-6">
                  <div className="mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-600 mb-4">{item.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
        >
          <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-2 rounded-md text-lg" size="lg">
            Start Finding Opportunities <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default BentoBoxSection;