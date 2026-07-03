"use client";

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

// --- TYPES ---
interface Review {
  id: number;
  name: string;
  location: string;
  room: string;
  text: string;
  rating: number;
}

// --- PREMIUM FALLBACK REVIEWS ---
const defaultReviews: Review[] = [
  {
    id: 1,
    name: "DAVID VANCE",
    location: "ATLANTA, USA",
    room: "LUXURY SUITE",
    text: "Stunning aesthetics, immaculate cleanliness, and a world-class gym and pool setup. The automated booking and confirmation process was completely seamless. Highly recommended for elite travelers.",
    rating: 5
  },
  {
    id: 2,
    name: "AMINA J.",
    location: "LAGOS, NIGERIA",
    room: "PREMIUM SUITE",
    text: "The epitome of luxury in Abuja. The staff anticipated my every need before I even asked. Truly a 5-star experience from check-in to check-out.",
    rating: 5
  },
  {
    id: 3,
    name: "SARAH & MARK T.",
    location: "LONDON, UK",
    room: "EXECUTIVE SUITE",
    text: "We spent our anniversary here and it was absolutely magical. The suite was breathtaking, the pool side was pristine, and the dining was world-class.",
    rating: 5
  }
];

export default function Footer() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- FETCH REVIEWS FROM BACKEND ---
  const fetchReviews = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/reviews');
      if (!res.ok) throw new Error('Failed to fetch reviews');
      
      const data = await res.json();
      const reviewsArray = Array.isArray(data) ? data : data.data || [];

      // Smart Mapping: Handle varying database column names
      const mappedReviews = reviewsArray.map((r: any) => ({
        id: r.id || Math.random(),
        name: r.name || r.guest_name || r.guestName || r.author || "Valued Guest",
        location: r.location || r.guest_location || r.country || "Unknown",
        room: r.suite || r.room_type || r.room || "Luxury Suite",
        // Catch any possible column name for the review content
        text: r.text || r.review_text || r.review || r.comment || r.message || r.content || "",
        rating: Number(r.rating) || 5
      })).filter((r: Review) => r.text && r.text.trim() !== ""); 

      // Use database reviews if available, otherwise use defaults
      if (mappedReviews.length > 0) {
        setReviews(mappedReviews);
      } else {
        setReviews(defaultReviews);
      }
    } catch (err) {
      console.error('Error fetching reviews for footer:', err);
      setReviews(defaultReviews);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // --- AUTO-SLIDE LOGIC ---
  useEffect(() => {
    if (!isAutoPlaying || reviews.length <= 1) return;
    
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % reviews.length);
    }, 6000); 

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAutoPlaying, reviews.length]);

  const nextSlide = () => {
    if (reviews.length <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % reviews.length);
    resetAutoPlay();
  };

  const prevSlide = () => {
    if (reviews.length <= 1) return;
    setCurrentSlide((prev) => (prev - 1 + reviews.length) % reviews.length);
    resetAutoPlay();
  };

  const resetAutoPlay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (isAutoPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % reviews.length);
      }, 6000);
    }
  };

  const pauseAutoPlay = () => setIsAutoPlaying(false);
  const resumeAutoPlay = () => setIsAutoPlaying(true);

  return (
    <footer className="w-full flex flex-col mt-20">
      
      {/* --- GUEST TESTIMONIALS CAROUSEL SECTION --- */}
      <section 
        className="bg-[#111111] py-24 border-t-2 border-[#d4af37] relative overflow-hidden flex flex-col items-center justify-center"
        onMouseEnter={pauseAutoPlay}
        onMouseLeave={resumeAutoPlay}
      >
        
        {/* Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
          <span className="text-[180px] md:text-[280px] font-serif font-bold text-white/[0.03] select-none tracking-widest">
            DKV
          </span>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
          
          {/* Header */}
          <h2 className="text-[#d4af37] font-bold tracking-[0.2em] uppercase text-xs md:text-sm mb-4">Guest Testimonials</h2>
          <h3 className="text-3xl md:text-5xl font-serif text-white mb-6 tracking-wide uppercase">THE VERDICT OF LUXURY</h3>
          <div className="w-16 h-[2px] bg-[#d4af37] mx-auto mb-10"></div>

          {loading ? (
             <div className="h-[350px] md:h-[250px] flex items-center justify-center text-gray-500 animate-pulse">
               Loading Testimonials...
             </div>
          ) : (
            <>
              {/* Carousel Container - FIXED HEIGHT PREVENTS COLLAPSE */}
              <div className="relative flex items-center justify-center h-[350px] md:h-[250px] w-full">
                
                {/* Left Arrow */}
                {reviews.length > 1 && (
                  <button 
                    onClick={prevSlide}
                    className="absolute left-0 md:-left-8 z-20 text-gray-500 hover:text-[#d4af37] transition-colors p-2"
                    aria-label="Previous Testimonial"
                  >
                    <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}

                {/* Testimonial Slides */}
                {reviews.map((review, index) => (
                  <div
                    key={review.id}
                    className={`absolute w-full px-8 md:px-20 transition-all duration-700 ease-in-out flex flex-col items-center justify-center ${
                      index === currentSlide
                        ? "opacity-100 transform translate-x-0 scale-100 pointer-events-auto z-10"
                        : "opacity-0 transform translate-x-12 scale-95 pointer-events-none z-0"
                    }`}
                  >
                    {/* 5 Stars */}
                    <div className="flex justify-center text-[#d4af37] mb-6 space-x-1.5">
                      {[...Array(review.rating > 0 && review.rating <= 5 ? review.rating : 5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 md:w-6 md:h-6 drop-shadow-md" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    
                    <p className="text-lg md:text-2xl text-gray-200 italic font-serif leading-relaxed mb-8 drop-shadow-sm max-w-4xl text-center">
                      "{review.text}"
                    </p>
                    
                    <div className="text-center">
                      <p className="text-white font-bold uppercase tracking-widest text-lg md:text-xl drop-shadow-md">{review.name}</p>
                      <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-[0.2em] mt-2 font-bold">
                        {review.location} <span className="mx-2 text-gray-600">•</span> <span className="text-[#d4af37]">{review.room}</span>
                      </p>
                    </div>
                  </div>
                ))}

                {/* Right Arrow */}
                {reviews.length > 1 && (
                  <button 
                    onClick={nextSlide}
                    className="absolute right-0 md:-right-8 z-20 text-gray-500 hover:text-[#d4af37] transition-colors p-2"
                    aria-label="Next Testimonial"
                  >
                    <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}

              </div>

              {/* Pagination Dots */}
              {reviews.length > 1 && (
                <div className="flex justify-center items-center mt-6 md:mt-12 space-x-2">
                  {reviews.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentSlide(index);
                        resetAutoPlay();
                      }}
                      className={`transition-all duration-300 ${
                        currentSlide === index 
                          ? "w-8 h-1.5 bg-[#d4af37] rounded-full" 
                          : "w-2 h-2 bg-gray-600 rounded-full hover:bg-gray-400"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    ></button>
                  ))}
                </div>
              )}
            </>
          )}

        </div>
      </section>

      {/* --- PRE-FOOTER CONTACT & MAP SECTION --- */}
      <section className="w-full flex flex-col md:flex-row h-auto md:h-[450px]">
        {/* Map */}
        <div className="w-full md:w-1/3 h-[350px] md:h-full relative group border-t md:border-t-0 border-[#2a2a2a]">
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500 z-10 pointer-events-none"></div>
          <iframe 
            src="https://maps.google.com/maps?q=De+Kuchney+Villa,+Zone+F01,+Abuja,+Nigeria&t=&z=16&ie=UTF8&iwloc=&output=embed" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen 
            loading="lazy"
            title="De Kuchney Villa Location"
            className="grayscale-[20%] contrast-125"
          ></iframe>
        </div>

        {/* Center Contact Action */}
        <div className="relative w-full md:w-1/3 h-[450px] md:h-full flex flex-col justify-center items-center text-center p-8 overflow-hidden bg-gray-900 border-x border-[#2a2a2a]">
          <img 
            src="/images/welcome-2.jpg" 
            alt="Contact Background" 
            className="absolute inset-0 w-full h-full object-cover z-0 opacity-100" 
          />
          <div className="absolute inset-0 z-10 bg-black/30 backdrop-blur-[1px]"></div> 
          <div className="absolute inset-0 z-10 mix-blend-overlay bg-[#d4af37]/30"></div> 
          
          <div className="relative z-20 flex flex-col items-center">
            <svg className="w-12 h-12 text-[#d4af37] mb-6 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <h3 className="text-3xl font-serif text-white mb-4 drop-shadow-md">Contact Us</h3>
            <div className="text-gray-100 mb-6 space-y-2 drop-shadow">
              <p className="text-sm font-sans tracking-widest text-gray-100 uppercase font-bold drop-shadow-md">Reservations</p>
              <p className="text-2xl font-bold text-[#d4af37] tracking-wider drop-shadow-lg bg-black/20 px-4 py-1 rounded-sm">+234 (913) 149-0624</p>
            </div>
            <p className="text-white font-medium italic mb-8 drop-shadow-md">Reserve your luxury suite today.</p>
            <Link href="/rooms" className="bg-[#d4af37] text-black font-bold py-4 px-10 uppercase tracking-widest hover:bg-white transition-colors shadow-2xl">
              Book Now
            </Link>
          </div>
        </div>

        {/* Right Quick Info */}
        <div className="w-full md:w-1/3 h-[450px] md:h-full bg-[#0d0d0d] flex flex-col justify-center p-12 text-left">
          <svg className="w-12 h-12 text-[#d4af37] mb-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h3 className="text-3xl font-serif text-white mb-10">Drop a Line</h3>
          <div className="space-y-8">
            <div>
              <p className="text-xs text-[#d4af37] font-bold uppercase tracking-widest mb-2">General Information</p>
              <a href="mailto:reservations@dekuchneyvilla.com" className="text-gray-300 hover:text-white transition-colors text-sm md:text-base border-b border-transparent hover:border-white pb-1">
                reservations@dekuchneyvilla.com
              </a>
            </div>
            <div>
              <p className="text-xs text-[#d4af37] font-bold uppercase tracking-widest mb-2">Careers & HR</p>
              <a href="mailto:hr@dekuchneyvilla.com" className="text-gray-300 hover:text-white transition-colors text-sm md:text-base border-b border-transparent hover:border-white pb-1">
                hr@dekuchneyvilla.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* --- MAIN FOOTER LINKS & COPYRIGHT --- */}
      <section className="bg-[#0a0a0a] text-white pt-16 pb-8 border-t-4 border-[#d4af37]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            
            {/* Brand Section */}
            <div>
              <h2 className="text-2xl font-serif text-[#d4af37] mb-6 tracking-widest uppercase drop-shadow-md">De Kuchney Villa</h2>
              <p className="text-gray-400 font-light leading-relaxed text-sm pr-4">
                Experience unparalleled luxury, breathtaking views, and uncompromising service in the heart of Abuja. Your perfect, exclusive getaway awaits.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-[0.2em]">Explore</h3>
              <ul className="space-y-4 text-sm font-light text-gray-400">
                <li><Link href="/" className="hover:text-[#d4af37] transition-colors flex items-center gap-2"><span className="w-2 h-[1px] bg-[#d4af37]"></span> Home</Link></li>
                <li><Link href="/rooms" className="hover:text-[#d4af37] transition-colors flex items-center gap-2"><span className="w-2 h-[1px] bg-[#d4af37]"></span> Rooms & Suites</Link></li>
                <li><Link href="/about" className="hover:text-[#d4af37] transition-colors flex items-center gap-2"><span className="w-2 h-[1px] bg-[#d4af37]"></span> About Us</Link></li>
                <li><Link href="/contact" className="hover:text-[#d4af37] transition-colors flex items-center gap-2"><span className="w-2 h-[1px] bg-[#d4af37]"></span> Contact</Link></li>
              </ul>
            </div>

            {/* Location & Social Media */}
            <div>
              <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-[0.2em]">Locate Us</h3>
              <ul className="space-y-4 text-sm font-light text-gray-400 mb-8 leading-relaxed">
                <li className="flex items-start">
                  <span className="mr-3 text-[#d4af37] mt-1">📍</span>
                  <span>
                    No 3, Amaobi Uwaleke Street, <br />
                    Cadastral, Zone F01, Dushepe <br />
                    901101, Federal Capital Territory, <br />
                    Nigeria
                  </span>
                </li>
              </ul>

              {/* Social Media Icons */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#d4af37] mb-4">Follow Us</h4>
                <div className="flex space-x-5">
                  <a 
                    href="https://www.facebook.com/share/1Cgk3Y1yVv/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[#d4af37] transition-transform hover:-translate-y-1"
                    aria-label="Facebook"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879v-6.99h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.99C18.343 21.128 22 16.991 22 12z" />
                    </svg>
                  </a>
                  <a 
                    href="https://www.instagram.com/dekuchneyvilla_?igsh=MTJlZ2FmMDA3ODZ6Zw==" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[#d4af37] transition-transform hover:-translate-y-1"
                    aria-label="Instagram"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                  <a 
                    href="https://twitter.com/dekuchneyvilla" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[#d4af37] transition-transform hover:-translate-y-1"
                    aria-label="Twitter"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0021.683-11.606c0-.278-.007-.556-.017-.832a9.97 9.97 0 002.46-2.548z" />
                    </svg>
                  </a>
                  <a 
                    href="https://linkedin.com/company/dekuchneyvilla" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[#d4af37] transition-transform hover:-translate-y-1"
                    aria-label="LinkedIn"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.771-.773 1.771-1.729V1.729C24 .774 23.204 0 22.225 0z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright Bottom Bar */}
          <div className="border-t border-[#2a2a2a] pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 font-light tracking-wide gap-4">
            <p>&copy; {new Date().getFullYear()} De Kuchney Villa Hotel. All rights reserved.</p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
              <a 
                href="https://maps.app.goo.gl/Mh7CWX2M8hqHJ48H9" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white hover:text-[#d4af37] transition-colors font-bold flex items-center gap-1.5"
              >
                <svg className="w-4 h-4 text-[#d4af37]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Leave a Review
              </a>
              
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>

        </div>
      </section>

    </footer>
  );
}