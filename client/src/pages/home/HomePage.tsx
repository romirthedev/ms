import React, { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from './HeroSection';
import StatsSection from './StatsSection';
import FeaturesSection from './FeaturesSection';
import HowItWorksSection from './HowItWorksSection';
import DemoSection from './DemoSection';
import ComparisonSection from './ComparisonSection';
import PricingSection from './PricingSection';
import TestimonialsSection from './TestimonialsSection';
import CtaSection from './CtaSection';
import ContactSection from './ContactSection';
import BentoBoxSection from './BentoBoxSection';

const HomePage = () => {
  useEffect(() => {
    // Smooth scrolling for anchor links
    const smoothScroll = (e: Event, anchor: HTMLAnchorElement) => {
      e.preventDefault();
      
      const targetId = anchor.getAttribute('href');
      if (targetId && targetId.startsWith('#') && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          window.scrollTo({
            top: targetElement.getBoundingClientRect().top + window.scrollY - 80,
            behavior: 'smooth'
          });
        }
      }
    };

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => smoothScroll(e, anchor as HTMLAnchorElement));
    });

    return () => {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.removeEventListener('click', (e) => smoothScroll(e, anchor as HTMLAnchorElement));
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
        <BentoBoxSection /> {/* Add the animated bento box section */}
        <FeaturesSection />
        <HowItWorksSection />
        <DemoSection />
        <ComparisonSection />
        <PricingSection />
        <TestimonialsSection />
        <CtaSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
