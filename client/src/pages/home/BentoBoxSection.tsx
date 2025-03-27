import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, useInView, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Search, AlertTriangle, BadgeCheck, Zap, BarChart2, 
  Target, ArrowRight, Brain, ChartBar, Eye, Activity, LineChart, 
  BellRing, Cpu, Sparkles, BarChart, PieChart 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Enhanced 3D card that reacts to mouse movement
const Interactive3DCard = ({ 
  children, 
  color, 
  className = "", 
  index 
}: { 
  children: React.ReactNode, 
  color: string, 
  className?: string, 
  index: number 
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const controls = useAnimation();
  const inView = useInView(cardRef, { once: false, amount: 0.2 });

  // Card animation variants with 3D movement
  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 300,
        delay: index * 0.1,
      }
    },
    hover: {
      scale: 1.02,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 300,
      }
    }
  };

  // Start animation when card comes into view
  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  // Calculate rotation based on mouse position
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate rotation (max 7 degrees in each direction)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateY = ((x - centerX) / centerX) * 7;
    const rotateX = ((centerY - y) / centerY) * 7;
    
    setRotation({ x: rotateX, y: rotateY });
  };

  return (
    <motion.div
      ref={cardRef}
      className={className}
      initial="hidden"
      animate={controls}
      variants={cardVariants}
      whileHover="hover"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setRotation({ x: 0, y: 0 });
      }}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
    >
      <Card 
        className={`h-full overflow-hidden border-none shadow-lg ${color}`}
        style={{
          transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transition: "transform 0.15s ease-out",
          transformStyle: "preserve-3d",
          boxShadow: isHovered ? 
            `0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1), 0 0 15px 2px ${color.replace('bg-', 'rgba(').replace('-50', ', 0.3)').replace('blue', '59, 130, 246').replace('amber', '245, 158, 11').replace('green', '16, 185, 129').replace('purple', '139, 92, 246').replace('indigo', '79, 70, 229').replace('rose', '244, 63, 94')}` 
            : ""
        }}
      >
        {/* Animated glow effect on hover */}
        {isHovered && (
          <motion.div 
            className="absolute inset-0 opacity-30 z-0 blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            style={{ 
              backgroundColor: color.replace('bg-', 'rgba(').replace('-50', ', 0.3)').replace('blue', '59, 130, 246').replace('amber', '245, 158, 11').replace('green', '16, 185, 129').replace('purple', '139, 92, 246').replace('indigo', '79, 70, 229').replace('rose', '244, 63, 94'),
            }}
          />
        )}
        <CardContent className="p-6 relative z-10">
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Animated icon with hover effects
const AnimatedIcon = ({ icon: Icon, color, size = 12 }: { icon: React.ElementType, color: string, size?: number }) => {
  return (
    <motion.div 
      className={`mb-4 relative`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", damping: 10, stiffness: 100 }}
      whileHover={{ 
        scale: 1.1,
        transition: { type: "spring", damping: 5, stiffness: 200 }
      }}
    >
      <motion.div 
        className={`h-${size} w-${size} relative z-10`}
        animate={{ 
          rotate: [0, 0, 0, 0, 0],
          scale: [1, 1.05, 1, 1.05, 1]
        }}
        transition={{ 
          duration: 5, 
          ease: "easeInOut", 
          times: [0, 0.25, 0.5, 0.75, 1],
          repeat: Infinity,
          repeatDelay: 0
        }}
      >
        <Icon className={`h-${size} w-${size} ${color}`} />
      </motion.div>
      
      {/* Background glow effect */}
      <motion.div 
        className="absolute inset-0 rounded-full opacity-20 blur-md"
        style={{ 
          backgroundColor: color.replace('text-', '').replace('blue', 'rgb(59, 130, 246)').replace('amber', 'rgb(245, 158, 11)').replace('green', 'rgb(16, 185, 129)').replace('purple', 'rgb(139, 92, 246)').replace('indigo', 'rgb(79, 70, 229)').replace('rose', 'rgb(244, 63, 94)'),
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          height: '80%'
        }}
        animate={{ 
          opacity: [0.1, 0.3, 0.1],
          scale: [0.8, 1.1, 0.8],
        }}
        transition={{ 
          duration: 4, 
          ease: "easeInOut", 
          repeat: Infinity,
          repeatDelay: 0
        }}
      />
    </motion.div>
  );
};

// Animated progress bar
const AnimatedProgressBar = ({ percentage = 85 }: { percentage?: number }) => {
  const progressRef = useRef<HTMLDivElement>(null);
  const inView = useInView(progressRef, { once: false, amount: 0.3 });
  
  return (
    <div ref={progressRef} className="mt-4 w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">Accuracy Rate</span>
        <motion.span 
          className="text-sm font-bold text-green-600"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {percentage}%
        </motion.span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
          initial={{ width: 0 }}
          animate={inView ? { width: `${percentage}%` } : { width: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

// Animated chart bars
const AnimatedBarChart = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const inView = useInView(chartRef, { once: false, amount: 0.3 });
  const bars = [65, 85, 45, 75, 55, 90, 40, 80];
  
  return (
    <div ref={chartRef} className="mt-4 h-16 flex items-end space-x-1">
      {bars.map((height, i) => (
        <motion.div 
          key={i}
          className="w-full bg-primary-500 rounded-t-sm"
          initial={{ height: 0 }}
          animate={inView ? { height: `${height}%` } : { height: 0 }}
          transition={{ 
            duration: 0.6, 
            delay: 0.1 + (i * 0.05), 
            type: "spring",
            stiffness: 200,
            damping: 15
          }}
          whileHover={{ 
            height: `${height + 10}%`, 
            backgroundColor: "#4338ca",
            transition: { duration: 0.2 }
          }}
        />
      ))}
    </div>
  );
};

// Animated pulse notification
const PulseNotification = () => {
  return (
    <div className="mt-4 flex justify-center">
      <div className="relative">
        <motion.div 
          className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center"
          animate={{ 
            boxShadow: [
              "0 0 0 0 rgba(59, 130, 246, 0.7)",
              "0 0 0 10px rgba(59, 130, 246, 0)",
              "0 0 0 0 rgba(59, 130, 246, 0)"
            ]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "loop"
          }}
        >
          <motion.div 
            className="w-10 h-10 rounded-full bg-blue-500"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "loop"
            }}
          />
        </motion.div>
        <motion.div 
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 border-2 border-white"
          animate={{ 
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 1,
            repeat: Infinity,
            repeatType: "loop"
          }}
        />
      </div>
    </div>
  );
};

// Animated sentiment indicators
const SentimentIndicator = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false });
  
  return (
    <div ref={ref} className="mt-4 flex justify-between">
      {[
        { label: "Bullish", color: "bg-green-100", textColor: "text-green-600", icon: TrendingUp, delay: 0.2 },
        { label: "Neutral", color: "bg-gray-100", textColor: "text-gray-600", icon: Activity, delay: 0.4 },
        { label: "Bearish", color: "bg-red-100", textColor: "text-red-600", icon: TrendingUp, flip: true, delay: 0.6 }
      ].map((item, i) => (
        <motion.div 
          key={i}
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: item.delay }}
          whileHover={{ scale: 1.1 }}
        >
          <motion.div 
            className={`w-12 h-12 rounded-full ${item.color} mx-auto flex items-center justify-center`}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <item.icon 
              className={`h-6 w-6 ${item.textColor}`} 
              style={{ transform: item.flip ? 'rotate(180deg)' : 'none' }} 
            />
          </motion.div>
          <p className="text-sm mt-1 text-gray-600">{item.label}</p>
        </motion.div>
      ))}
    </div>
  );
};

// Animated line chart
const AnimatedLineChart = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const inView = useInView(chartRef, { once: false, amount: 0.3 });
  
  // SVG path for chart line
  const linePath = "M0,50 C20,20 40,80 60,40 S80,60 100,30";
  
  return (
    <div ref={chartRef} className="mt-4 h-16 w-full">
      <svg width="100%" height="100%" viewBox="0 0 100 80">
        {/* Grid lines */}
        <motion.g 
          stroke="#e5e7eb" 
          strokeWidth="0.5" 
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 0.5 } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <line x1="0" y1="20" x2="100" y2="20" />
          <line x1="0" y1="40" x2="100" y2="40" />
          <line x1="0" y1="60" x2="100" y2="60" />
          <line x1="20" y1="0" x2="20" y2="80" />
          <line x1="40" y1="0" x2="40" y2="80" />
          <line x1="60" y1="0" x2="60" y2="80" />
          <line x1="80" y1="0" x2="80" y2="80" />
        </motion.g>
        
        {/* Chart line */}
        <motion.path
          d={linePath}
          fill="none"
          stroke="#4f46e5"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={inView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        
        {/* Data points */}
        {[0, 20, 40, 60, 80, 100].map((x, i) => {
          // Calculate y positions along the curve
          const y = i === 0 ? 50 : i === 1 ? 20 : i === 2 ? 80 : i === 3 ? 40 : i === 4 ? 60 : 30;
          
          return (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill="white"
              stroke="#4f46e5"
              strokeWidth="2"
              initial={{ scale: 0, opacity: 0 }}
              animate={inView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
              transition={{ 
                duration: 0.3, 
                delay: 0.5 + (i * 0.1),
                type: "spring",
                stiffness: 300,
                damping: 10
              }}
            />
          );
        })}
      </svg>
    </div>
  );
};

// Stock comparison metrics
const ComparisonMetrics = () => {
  const metrics = [
    { label: "Growth", value: "+24.5%" },
    { label: "P/E Ratio", value: "18.2x" },
    { label: "Volume", value: "4.2M" },
    { label: "Potential", value: "High" }
  ];
  
  return (
    <div className="mt-4 grid grid-cols-2 gap-2">
      {metrics.map((metric, i) => (
        <motion.div 
          key={i}
          className="bg-gray-100 p-3 rounded cursor-pointer"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false }}
          transition={{ delay: 0.1 * i, duration: 0.5 }}
          whileHover={{ 
            backgroundColor: "#f0f9ff",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" 
          }}
        >
          <p className="text-xs text-gray-500">{metric.label}</p>
          <p className="text-sm font-bold">{metric.value}</p>
        </motion.div>
      ))}
    </div>
  );
};

// Floating particles background effect
const FloatingParticles = () => {
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * 5
  }));
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-primary-200 opacity-30"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

const BentoBoxSection = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Enhanced card content with interactive elements
  const items = [
    {
      title: "AI-Powered Analysis",
      description: "Our advanced algorithms analyze thousands of NASDAQ stocks every 30 seconds to identify potential opportunities before they become obvious to the market.",
      icon: Zap,
      color: "bg-blue-50",
      textColor: "text-blue-500",
      index: 0,
      interactive: <AnimatedProgressBar percentage={94} />
    },
    {
      title: "Breakthrough Detection",
      description: "We scan the news for company breakthroughs, product launches, and technological innovations that signal potential growth.",
      icon: AlertTriangle,
      color: "bg-amber-50",
      textColor: "text-amber-500",
      index: 1,
      interactive: <AnimatedLineChart />
    },
    {
      title: "Real-Time Updates",
      description: "Our platform refreshes data every 30 seconds, ensuring you're always making decisions based on the most current information.",
      icon: TrendingUp,
      color: "bg-green-50",
      textColor: "text-green-500",
      index: 2,
      interactive: <PulseNotification />
    },
    {
      title: "Smaller Companies Focus",
      description: "While we analyze all NASDAQ stocks, we put special emphasis on finding promising smaller companies with breakthrough potential.",
      icon: Search,
      color: "bg-purple-50",
      textColor: "text-purple-500",
      index: 3,
      interactive: <AnimatedBarChart />
    },
    {
      title: "Sentiment Analysis",
      description: "We apply advanced natural language processing to evaluate news sentiment and determine its impact on stock potential.",
      icon: BadgeCheck,
      color: "bg-indigo-50",
      textColor: "text-indigo-500",
      index: 4,
      interactive: <SentimentIndicator />
    },
    {
      title: "Performance Metrics",
      description: "Clear visualization of stock performance data and AI-generated predictions on potential growth opportunities.",
      icon: BarChart2,
      color: "bg-rose-50",
      textColor: "text-rose-500",
      index: 5,
      interactive: <ComparisonMetrics />
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden" id="features">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50"></div>
      <FloatingParticles />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-800 to-primary-500"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, type: "spring" }}
          >
            How StockSense AI Works
          </motion.h2>
          
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2, type: "spring" }}
          >
            Our platform continuously analyzes thousands of NASDAQ-listed stocks every 30 seconds 
            to identify breakthrough opportunities before they hit the mainstream
          </motion.p>
        </div>
        
        {/* Interactive feature cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, index) => (
            <Interactive3DCard
              key={index}
              color={item.color}
              index={item.index}
              className="h-full"
            >
              <AnimatedIcon icon={item.icon} color={item.textColor} />
              
              <motion.h3 
                className="text-xl font-bold mb-2"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {item.title}
              </motion.h3>
              
              <motion.p 
                className="text-gray-600 mb-4"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {item.description}
              </motion.p>
              
              {/* Interactive element */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                {item.interactive}
              </motion.div>
            </Interactive3DCard>
          ))}
        </div>

        {/* Call to action with animated button */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.7 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button 
              className="bg-gradient-to-r from-primary-700 to-primary-500 hover:from-primary-800 hover:to-primary-600 text-white px-10 py-6 rounded-md text-lg shadow-lg"
              size="lg"
            >
              <motion.span
                className="flex items-center"
                initial={{ x: 0 }}
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                Start Finding Opportunities
                <ArrowRight className="ml-2 h-5 w-5" />
              </motion.span>
            </Button>
          </motion.div>
          
          {/* Subtle note about data updates */}
          <motion.p
            className="text-sm text-gray-500 mt-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.9 }}
          >
            Analyzing 5000+ stocks every 30 seconds for real-time intelligence
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

export default BentoBoxSection;