import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, useAnimation, AnimatePresence, useInView } from 'framer-motion';
import { TrendingUp, Zap, BarChart3, Search, Globe, ArrowRight } from 'lucide-react';

const FloatingIcon = ({ Icon, color, initialX, initialY, delay }: { Icon: React.ElementType; color: string; initialX: number; initialY: number; delay: number }) => {
  return (
    <motion.div
      className={`absolute ${color} opacity-20`}
      style={{ left: `${initialX}px`, top: `${initialY}px` }}
      animate={{
        y: [0, -20, 0],
        opacity: [0.2, 0.5, 0.2],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        repeatType: "reverse",
      }}
    >
      <Icon size={40} />
    </motion.div>
  );
};

const GlowingParticles = () => {
  const particles = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 8 + 4,
    delay: Math.random() * 2
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-primary-300"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            opacity: [0.1, 0.4, 0.1],
            scale: [1, 1.5, 1],
            x: [0, Math.random() * 50 - 25],
            y: [0, Math.random() * 50 - 25],
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

const AnimatedTitle = ({ children }: { children: React.ReactNode }) => {
  const words = children.split(' ');
  return (
    <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight">
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-primary-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 * i, ease: "easeOut" }}
        >
          {word}
        </motion.span>
      ))}
    </h1>
  );
};

const AnimatedStatsCard = ({ label, value, delay }: { label: string; value: string | number; delay: number }) => {
  return (
    <motion.div
      className="p-4 rounded-lg bg-white/10 backdrop-blur-lg"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.2 }}
      >
        <p className="text-sm text-primary-200">{label}</p>
        <h3 className="text-2xl font-bold text-white">{value}</h3>
      </motion.div>
    </motion.div>
  );
};

const AnimatedParagraph = ({ children, delay = 0.4 }: { children: React.ReactNode; delay?: number }) => {
  return (
    <motion.p
      className="mt-4 text-xl font-medium text-green-800"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: delay, ease: "easeOut" }}
      style={{ textShadow: "0 1px 2px rgba(255,255,255,0.3)" }}
    >
      {children}
    </motion.p>
  );
};

const AnimatedButtons = () => {
  return (
    <motion.div
      className="mt-8 flex flex-col sm:flex-row gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
    >
      <a href="#demo">
        <Button className="px-5 py-6 bg-white text-green-800 hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
          <motion.span
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            Try Free Demo
          </motion.span>
        </Button>
      </a>
      <a href="#how-it-works">
        <Button variant="outline" className="px-5 py-6 border-white text-white hover:bg-primary-600 transition-all">
          <motion.div
            className="flex items-center"
            initial={{ x: 0 }}
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            How It Works
            <ArrowRight className="ml-2 h-4 w-4" />
          </motion.div>
        </Button>
      </a>
    </motion.div>
  );
};


const StockCard = ({
  symbol,
  company,
  price,
  change,
  news,
  status,
  statusColor,
  delay
}: {
  symbol: string;
  company: string;
  price: string;
  change: string;
  news: string;
  status: string;
  statusColor: string;
  delay: number;
}) => {
  return (
    <motion.div
      className={`border border-gray-200 rounded-lg p-3 bg-${statusColor}-50`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: delay, ease: "easeOut" }}
      whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}
    >
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-medium text-gray-500">{symbol}</span>
          <h4 className="text-lg font-bold text-gray-800">{company}</h4>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${statusColor}-100 text-${statusColor}-800`}>
          {status === 'Rising' ? <TrendingUp className="mr-1 h-3 w-3" /> : <Search className="mr-1 h-3 w-3" />} {status}
        </span>
      </div>
      <div className="mt-2 flex items-center">
        <motion.span
          className="text-2xl font-bold text-gray-900"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: delay + 0.3 }}
        >
          {price}
        </motion.span>
        <motion.span
          className="ml-2 text-sm font-medium text-green-600"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: delay + 0.5 }}
        >
          {change}
        </motion.span>
      </div>
      <motion.div
        className="mt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: delay + 0.7 }}
      >
        <p className="text-sm text-gray-600">{news}</p>
      </motion.div>
    </motion.div>
  );
};

const NewsItem = ({
  icon: Icon,
  bgColor,
  title,
  impact,
  time,
  delay
}: {
  icon: React.ElementType;
  bgColor: string;
  title: string;
  impact: string;
  time: string;
  delay: number;
}) => {
  return (
    <motion.div
      className="flex items-start p-2 rounded-md hover:bg-gray-50 cursor-pointer"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: delay }}
      whileHover={{ backgroundColor: "#f9fafb" }}
    >
      <span className={`flex-shrink-0 h-8 w-8 rounded-full bg-${bgColor} flex items-center justify-center text-white`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{impact}</p>
      </div>
      <span className="text-xs text-gray-500">{time}</span>
    </motion.div>
  );
};


const AnimatedCounter = ({ value, duration = 2, delay = 0 }: { value: number; duration?: number; delay?: number }) => {
  const [count, setCount] = useState(0);
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      x: 0, // Using standard properties
      transition: { duration, delay }
    });

    let startTime: number | null = null;
    let frameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);

      if (progress < 1) {
        setCount(Math.floor(progress * value));
        frameId = requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    const timeoutId = setTimeout(() => {
      frameId = requestAnimationFrame(animate);
    }, delay * 1000);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timeoutId);
    };
  }, [value, duration, delay, controls]);

  return <span>{count}</span>;
};

const DashboardCard = () => {
  const [isTyping, setIsTyping] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTyping(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
    >
      <Card className="bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200">
        <motion.div
          className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          <div className="flex items-center">
            <motion.div
              className="w-3 h-3 bg-red-500 rounded-full mr-1.5"
              whileHover={{ scale: 1.2 }}
            ></motion.div>
            <motion.div
              className="w-3 h-3 bg-yellow-500 rounded-full mr-1.5"
              whileHover={{ scale: 1.2 }}
            ></motion.div>
            <motion.div
              className="w-3 h-3 bg-green-500 rounded-full"
              whileHover={{ scale: 1.2 }}
            ></motion.div>
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <div className="flex items-center mr-3">
              <div className={`w-2 h-2 rounded-full ${isTyping ? 'bg-green-500' : 'bg-green-200'} mr-1 animate-pulse`}></div>
              <span>LIVE</span>
            </div>
            <div>StockSense AI Dashboard • {formattedTime}</div>
          </div>
        </motion.div>

        <div className="p-4 bg-white">
          <motion.div
            className="flex items-center justify-between mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            <h3 className="text-lg font-semibold text-gray-800">News-Based Predictions</h3>
            <div className="text-sm text-gray-500 flex items-center">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
              Updating in real-time
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <StockCard
              symbol="TSLA"
              company="Tesla Inc."
              price="$224.57"
              change="+3.2%"
              news="Breakthrough in battery technology announced"
              status="Rising"
              statusColor="green"
              delay={1.4}
            />

            <StockCard
              symbol="MSFT"
              company="Microsoft"
              price="$340.12"
              change="+1.2%"
              news="New cloud computing partnership announced"
              status="Watch"
              statusColor="blue"
              delay={1.6}
            />
          </div>

          <motion.div
            className="mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.8 }}
          >
            <h4 className="text-sm font-medium text-gray-500 mb-2">RECENT NEWS ANALYSIS</h4>
            <div className="space-y-2">
              <NewsItem
                icon={BarChart3}
                bgColor="accent"
                title="Biotech firm announces successful phase 3 trials"
                impact="Positive impact: MRNA, PFE, JNJ"
                time="12m ago"
                delay={2.0}
              />
              <NewsItem
                icon={Globe}
                bgColor="secondary"
                title="Semiconductor shortage easing according to industry reports"
                impact="Positive impact: INTC, AMD, NVDA"
                time="1h ago"
                delay={2.2}
              />
            </div>
          </motion.div>

          <motion.div
            className="absolute bottom-3 right-3 flex items-center justify-end text-xs text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 2.4 }}
          >
            <div className="flex items-center">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1 animate-pulse"></div>
              <span className="mr-2">AI Processing</span>
            </div>
            <div className="flex items-center">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-1 animate-pulse"></div>
              <span>Real-time Data</span>
            </div>
          </motion.div>
        </div>
      </Card>

      <motion.div
        className="absolute -bottom-20 left-0 right-0 h-20 bg-gradient-to-b from-white to-transparent opacity-10 blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 1, delay: 2.5 }}
      />

      <motion.div
        className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-blue-500 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-1000"
        animate={{
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ zIndex: -1 }}
      />
    </motion.div>
  );
};

const StatCounter = ({ label, value, icon: Icon, delay }: { label: string; value: number; icon: React.ElementType; delay: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      className="flex items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.8, delay: delay }}
    >
      <div className="mr-3 bg-primary-100 p-2 rounded-full">
        <Icon className="h-5 w-5 text-primary-600" />
      </div>
      <div>
        <div className="text-2xl font-bold text-black" style={{ textShadow: "0 1px 2px rgba(255,255,255,0.3)" }}>
          {isInView ? <AnimatedCounter value={value} delay={delay} /> : 0}+
        </div>
        <div className="text-sm font-medium text-green-800">{label}</div>
      </div>
    </motion.div>
  );
};

const HeroSection = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white overflow-hidden">
      <GlowingParticles />

      <FloatingIcon Icon={TrendingUp} color="text-green-500" initialX={100} initialY={300} delay={0.5} />
      <FloatingIcon Icon={Zap} color="text-yellow-500" initialX={200} initialY={400} delay={2} />
      <FloatingIcon Icon={BarChart3} color="text-blue-500" initialX={600} initialY={350} delay={1.3} />
      <FloatingIcon Icon={Search} color="text-purple-500" initialX={700} initialY={250} delay={3} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <AnimatedTitle>
              Discover Tomorrow's Winning Stocks Today
            </AnimatedTitle>

            <AnimatedParagraph>
              Our AI scans global news, breakthroughs, and trends to identify stocks poised for growth before traditional analysts.
            </AnimatedParagraph>

            <AnimatedButtons />

            <div className="mt-12 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
              <AnimatedStatsCard label="Stocks Analyzed" value="10,000+" delay={1.2} />
              <AnimatedStatsCard label="Success Rate" value="87%" delay={1.4} />
              <AnimatedStatsCard label="Daily Predictions" value="500+" delay={1.6} />
              <AnimatedStatsCard label="Active Users" value="50,000+" delay={1.8} />
            </div>

            <motion.div
              className="mt-8 flex items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
            >
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="h-10 w-10 rounded-full ring-2 ring-white overflow-hidden"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.1 + (i * 0.1) }}
                    whileHover={{ y: -3, zIndex: 10 }}
                  >
                    <svg className="h-full w-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="32" cy="32" r="32" fill="#E5E7EB" />
                      <path d="M40 24C40 28.4183 36.4183 32 32 32C27.5817 32 24 28.4183 24 24C24 19.5817 27.5817 16 32 16C36.4183 16 40 19.5817 40 24Z" fill="#9CA3AF" />
                      <path d="M16 49.3333C16 42.7060 21.3726 37.3333 28 37.3333H36C42.6274 37.3333 48 42.7060 48 49.3333C48 51.5425 46.2091 53.3333 44 53.3333H20C17.7909 53.3333 16 51.5425 16 49.3333Z" fill="#9CA3AF" />
                    </svg>
                  </motion.div>
                ))}
              </div>
              <motion.p
                className="ml-4 text-sm font-medium text-black"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.4 }}
                style={{ textShadow: "0 1px 2px rgba(255,255,255,0.5)" }}
              >
                Join 5,000+ investors and fund managers
              </motion.p>
            </motion.div>
          </div>

          <DashboardCard />
        </div>
      </div>

      <motion.div
        className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-primary-950 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 1, delay: 0.5 }}
      />
    </section>
  );
};

export default HeroSection;