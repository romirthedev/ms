import React from 'react';
import { Link } from 'wouter';

const Footer = () => {
  return (
    <footer className="bg-gray-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center">
              <span className="text-white font-bold text-xl">
                StockSense<span className="text-accent">AI</span>
              </span>
            </div>
            <p className="mt-4 text-gray-300">
              StockSense AI uses artificial intelligence to scan news and identify potential stock movements before they happen. 
              Our predictive analytics give you the edge in today's competitive markets.
            </p>
            <div className="mt-6 flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fa-brands fa-twitter w-5 h-5"></i>
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fa-brands fa-linkedin w-5 h-5"></i>
                <span className="sr-only">LinkedIn</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fa-brands fa-facebook w-5 h-5"></i>
                <span className="sr-only">Facebook</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fa-brands fa-youtube w-5 h-5"></i>
                <span className="sr-only">YouTube</span>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Platform</h3>
            <ul className="mt-4 space-y-4">
              <li><a href="#features" className="text-base text-gray-300 hover:text-white">Features</a></li>
              <li><a href="#how-it-works" className="text-base text-gray-300 hover:text-white">How It Works</a></li>
              <li><a href="#pricing" className="text-base text-gray-300 hover:text-white">Pricing</a></li>
              <li><a href="#" className="text-base text-gray-300 hover:text-white">API Documentation</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Company</h3>
            <ul className="mt-4 space-y-4">
              <li><a href="#" className="text-base text-gray-300 hover:text-white">About Us</a></li>
              <li><a href="#" className="text-base text-gray-300 hover:text-white">Careers</a></li>
              <li><a href="#" className="text-base text-gray-300 hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="text-base text-gray-300 hover:text-white">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-gray-700 pt-8">
          <p className="text-base text-gray-400 text-center">&copy; {new Date().getFullYear()} StockSense AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
