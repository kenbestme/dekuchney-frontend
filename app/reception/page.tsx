"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function ReceptionPage() {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Preload hero image
    const img = new Image();
    img.src = '/images/reception-hero.jpg';
    img.onload = () => setImageLoaded(true);
  }, []);

  return (
    <div className="flex flex-col bg-[#fdfbf7] min-h-screen">
      
      {/* --- HERO BANNER --- */}
      <section className="relative h-[90vh] min-h-[600px] w-full overflow-hidden bg-gray-900">
        {/* Background Image */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-700"
          style={{ 
            backgroundImage: `url('/images/reception-hero.jpg')`,
            opacity: imageLoaded ? 1 : 0,
          }}
        />
        {/* Fallback gradient if image not found */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        
        {/* Decorative gold overlay */}
        <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 30% 50%, #d4af37, transparent 70%)' }} />

        {/* Content */}
        <div className="relative z-20 h-full flex items-center max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 mt-12 md:mt-0">
          <div className="max-w-2xl text-white">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 md:w-10 h-[2px] bg-[#d4af37]"></span>
              <span className="text-[#d4af37] tracking-[0.2em] md:tracking-[0.3em] uppercase text-xs md:text-sm font-semibold">Welcome to</span>
            </div>
            {/* Fixed the missing text in the H1 tag */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold leading-tight mb-2 drop-shadow-lg">
              De Kuchney
            </h1>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#d4af37] mb-6 drop-shadow-md">
              Villa Hotel
            </h2>
            <p className="text-lg md:text-2xl text-gray-200 font-light mb-4 italic">
              "Enchanted with Elegance"
            </p>
            <p className="text-sm md:text-lg text-gray-300 max-w-lg mb-10 leading-relaxed">
              Experience comfort, luxury, and unforgettable hospitality at the heart of the city. Our reception team is ready to welcome you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/rooms" 
                className="text-center bg-[#d4af37] hover:bg-[#b5952f] text-black font-bold uppercase tracking-widest px-8 py-4 rounded-sm transition-colors shadow-xl"
              >
                Book a Room
              </Link>
              <Link 
                href="/contact" 
                className="text-center border-2 border-white hover:bg-white hover:text-black text-white font-bold uppercase tracking-widest px-8 py-4 rounded-sm transition-colors"
              >
                Contact Reception
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom decorative bar */}
        <div className="absolute bottom-0 left-0 right-0 z-10 h-1.5 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
      </section>

      {/* --- STATS / HIGHLIGHTS SECTION --- */}
      <section className="py-12 md:py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-2xl md:text-3xl font-bold text-[#d4af37]">24/7</p>
            <p className="text-xs md:text-sm text-gray-500 uppercase tracking-wider mt-2 font-bold">Front Desk</p>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-bold text-[#d4af37]">★ ★ ★ ★ ★</p>
            <p className="text-xs md:text-sm text-gray-500 uppercase tracking-wider mt-2 font-bold">Exceptional Service</p>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-bold text-[#d4af37]">✦</p>
            <p className="text-xs md:text-sm text-gray-500 uppercase tracking-wider mt-2 font-bold">Luxury Experience</p>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-bold text-[#d4af37]">❤</p>
            <p className="text-xs md:text-sm text-gray-500 uppercase tracking-wider mt-2 font-bold">Memorable Stay</p>
          </div>
        </div>
      </section>

      {/* --- RECEPTION & OVERVIEW SECTION --- */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-[#d4af37] font-bold tracking-[0.2em] md:tracking-[0.3em] uppercase text-xs md:text-sm">Our Reception</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-gray-900 mt-3 mb-6 leading-tight">
              Where Every Guest <br className="hidden md:block" />Feels Like Family
            </h2>
            <p className="text-gray-600 leading-relaxed mb-8 text-sm md:text-base">
              Our dedicated front desk team is available 24/7 to ensure your stay is seamless and memorable. 
              From express check‑in to personalized concierge services, we handle every detail with absolute care.
            </p>

            {/* --- UPGRADED: CHECK-IN & CHECK-OUT OVERVIEW --- */}
            <div className="bg-white border border-gray-200 shadow-lg rounded-sm p-6 mb-8 flex flex-col sm:flex-row gap-6 sm:gap-0 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 relative overflow-hidden">
              {/* Decorative side accent */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#d4af37]"></div>
              
              <div className="flex-1 sm:pr-6">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                  <h4 className="font-bold text-gray-900 uppercase tracking-widest text-xs">Check-In</h4>
                </div>
                <p className="text-3xl font-serif text-gray-900 mb-2">2:00 <span className="text-lg text-[#d4af37]">PM</span></p>
                <p className="text-xs text-gray-500 leading-relaxed">Early check-in is available upon request, subject to suite availability.</p>
              </div>
              
              <div className="flex-1 sm:pl-6 pt-6 sm:pt-0">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  <h4 className="font-bold text-gray-900 uppercase tracking-widest text-xs">Check-Out</h4>
                </div>
                <p className="text-3xl font-serif text-gray-900 mb-2">12:00 <span className="text-lg text-[#d4af37]">PM</span></p>
                <p className="text-xs text-gray-500 leading-relaxed">Express and late check-out options can be arranged with the front desk.</p>
              </div>
            </div>

            {/* Additional Services List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="flex items-center gap-3">
                <span className="text-[#d4af37] text-lg">✓</span>
                <span className="font-medium">Express Check‑in / Check‑out</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#d4af37] text-lg">✓</span>
                <span className="font-medium">Concierge &amp; Porter Services</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#d4af37] text-lg">✓</span>
                <span className="font-medium">24/7 Guest Support</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#d4af37] text-lg">✓</span>
                <span className="font-medium">Luggage Storage &amp; Valet</span>
              </div>
            </div>
          </div>
          
          <div className="relative mt-8 lg:mt-0">
            <div className="aspect-[4/3] bg-gray-200 rounded-sm shadow-2xl overflow-hidden group">
              <img 
                src="/images/reception-desk.jpg" 
                alt="De Kuchney Villa Reception Desk" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            {/* Decorative gold accents */}
            <div className="absolute -top-4 -left-4 w-16 md:w-24 h-16 md:h-24 border-t-4 border-l-4 border-[#d4af37] rounded-tl-sm hidden md:block"></div>
            <div className="absolute -bottom-4 -right-4 w-16 md:w-24 h-16 md:h-24 border-b-4 border-r-4 border-[#d4af37] rounded-br-sm hidden md:block"></div>
          </div>
        </div>
      </section>

      {/* --- CONTACT & CTA --- */}
      <section className="bg-gray-900 text-white py-16 md:py-20 border-t-4 border-[#d4af37]">
        <div className="max-w-4xl mx-auto text-center px-6">
          <svg className="w-12 h-12 text-[#d4af37] mx-auto mb-6 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 3l-6 6M21 3v6M21 3h-6M3 21l6-6M3 21v-6M3 21h6M15.426 14.54l-2.073-2.073M8.536 9.46L6.463 7.387M18 10a8 8 0 11-16 0 8 8 0 0116 0z" />
          </svg>
          <h3 className="text-3xl md:text-4xl font-serif mb-6">Need Assistance Before Arrival?</h3>
          <p className="text-gray-400 mb-10 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
            Reach out to our reception team anytime. We are here to accommodate special requests and ensure your stay is planned perfectly.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-16 text-sm mb-12 bg-black/30 p-8 rounded-sm">
            <div>
              <p className="text-gray-500 uppercase tracking-widest mb-1 font-bold">Phone</p>
              <p className="text-[#d4af37] font-bold text-lg">+234 (913) 149-0624</p>
            </div>
            <div className="hidden md:block w-px bg-gray-700"></div>
            <div>
              <p className="text-gray-500 uppercase tracking-widest mb-1 font-bold">Email</p>
              <p className="text-[#d4af37] font-bold text-lg">reception@dekuchneyvilla.com</p>
            </div>
            <div className="hidden md:block w-px bg-gray-700"></div>
            <div>
              <p className="text-gray-500 uppercase tracking-widest mb-1 font-bold">Hours</p>
              <p className="text-[#d4af37] font-bold text-lg">24 / 7</p>
            </div>
          </div>
          <div>
            <Link 
              href="/contact" 
              className="inline-block bg-[#d4af37] text-black hover:bg-white px-10 py-4 font-bold uppercase tracking-widest transition-colors shadow-xl w-full md:w-auto"
            >
              Send a Direct Message
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}