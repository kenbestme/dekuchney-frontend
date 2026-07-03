"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md fixed w-full z-50 top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24 items-center">
          
          {/* LOGO SECTION - LARGER (h-20) */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="transition-transform hover:opacity-90">
              <img 
                src="/images/logo.png" 
                alt="De Kuchney Villa Logo" 
                className="h-20 w-auto object-contain" 
              />
            </Link>
          </div>
          
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link href="/" className="text-gray-800 hover:text-amber-600 font-medium transition-colors">Home</Link>
            <Link href="/rooms" className="text-gray-800 hover:text-amber-600 font-medium transition-colors">Rooms & Suites</Link>
            
            {/* NEW RECREATION LINK ADDED HERE */}
            <Link href="/Gym-Swimming" className="text-gray-800 hover:text-amber-600 font-medium transition-colors">Gym & Swimming</Link>
            
            <Link href="/gallery" className="text-gray-800 hover:text-amber-600 font-medium transition-colors">Gallery</Link>
            <Link href="/about" className="text-gray-800 hover:text-amber-600 font-medium transition-colors">About</Link>
            <Link href="/contact" className="text-gray-800 hover:text-amber-600 font-medium transition-colors">Contact</Link>
            
            {/* FIXED RECEPTION LINK CLASSES */}
            <Link href="/reception" className="text-gray-800 hover:text-amber-600 font-medium transition-colors">Reception</Link>
            
            <Link href="/rooms" className="bg-amber-700 text-white px-8 py-3 rounded-sm hover:bg-amber-800 transition-colors uppercase tracking-wide text-sm font-semibold shadow-lg">
              Book Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-800 hover:text-amber-600 focus:outline-none"
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pt-4 pb-6 space-y-4 shadow-xl">
          <Link href="/" onClick={() => setIsOpen(false)} className="block text-gray-800 hover:text-amber-600 font-medium py-2">Home</Link>
          <Link href="/rooms" onClick={() => setIsOpen(false)} className="block text-gray-800 hover:text-amber-600 font-medium py-2">Rooms & Suites</Link>
          
          {/* NEW RECREATION LINK ADDED HERE FOR MOBILE */}
          <Link href="/Gym-Swimming" onClick={() => setIsOpen(false)} className="block text-gray-800 hover:text-amber-600 font-medium py-2">Gym & Swimming</Link>
          
          <Link href="/gallery" onClick={() => setIsOpen(false)} className="block text-gray-800 hover:text-amber-600 font-medium py-2">Gallery</Link>
          <Link href="/about" onClick={() => setIsOpen(false)} className="block text-gray-800 hover:text-amber-600 font-medium py-2">About</Link>
          <Link href="/contact" onClick={() => setIsOpen(false)} className="block text-gray-800 hover:text-amber-600 font-medium py-2">Contact</Link>
          
          {/* FIXED RECEPTION LINK CLASSES */}
          <Link href="/reception" onClick={() => setIsOpen(false)} className="block text-gray-800 hover:text-amber-600 font-medium py-2">Reception</Link>
          
          <Link 
            href="/rooms" 
            onClick={() => setIsOpen(false)} 
            className="block w-full text-center bg-amber-700 text-white py-3 rounded-sm hover:bg-amber-800 transition-colors uppercase tracking-wide text-sm font-semibold mt-4"
          >
            Book Now
          </Link>
        </div>
      )}
    </nav>
  );
}