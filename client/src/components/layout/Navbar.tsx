import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { LogOut, User, BarChart3 } from 'lucide-react';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

const NavLink = ({ href, children, className = '' }: NavLinkProps) => (
  <a
    href={href}
    className={`border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${className}`}
  >
    {children}
  </a>
);

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [, navigate] = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <span className="text-primary font-bold text-xl cursor-pointer">
                  StockSense<span className="text-accent">AI</span>
                </span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NavLink href="#features">Features</NavLink>
              <NavLink href="#how-it-works">How It Works</NavLink>
              <NavLink href="#testimonials">Testimonials</NavLink>
              <NavLink href="/dashboard">Dashboard</NavLink>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <NavLink href="#contact">Contact</NavLink>
            <Link href="/dashboard">
              <span className="bg-accent text-white hover:bg-accent/90 px-4 py-2 rounded-md text-sm font-medium cursor-pointer">
                Dashboard
              </span>
            </Link>
            <a href="#demo" className="bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium">
              Try Demo
            </a>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              aria-expanded="false"
              onClick={toggleMobileMenu}
            >
              <span className="sr-only">Open main menu</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 6h16M4 12h16M4 18h16" 
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`sm:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="pt-2 pb-3 space-y-1">
          <a
            href="#features"
            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
          >
            How It Works
          </a>
          <a
            href="#testimonials"
            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
          >
            Testimonials
          </a>
          <Link href="/dashboard">
            <span className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 cursor-pointer">
              Dashboard
            </span>
          </Link>
          <a
            href="#contact"
            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
          >
            Contact
          </a>
          <a
            href="#demo"
            className="block text-center mx-4 my-2 px-4 py-2 rounded-md text-base font-medium text-white bg-primary hover:bg-primary/90"
          >
            Try Demo
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
