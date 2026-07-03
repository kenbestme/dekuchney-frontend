"use client";

import { useState, useEffect, useRef } from 'react';

interface Review {
  id: number;
  name: string;
  location: string;
  suite: string;
  text: string;
  rating: number;
}

// Fallback reviews so the website never looks broken or empty
const defaultReviews: Review[] = [
  {
    id: 991,
    name: "DAVID VANCE",
    location: "ATLANTA, USA",
    suite: "LUXURY SUITE",
    text: "Stunning aesthetics, immaculate cleanliness, and a world-class gym and pool setup. The automated booking and confirmation process was completely seamless. Highly recommended for elite travelers.",
    rating: 5
  },
  {
    id: 992,
    name: "AMINA J.",
    location: "LAGOS, NIGERIA",
    suite: "PREMIUM SUITE",
    text: "The epitome of luxury in Abuja. The staff anticipated my every need before I even asked. Truly a 5-star experience from check-in to check-out.",
    rating: 5
  }
];

export default function ReviewsCarousel() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Fetch reviews from backend API
  const fetchReviews = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/reviews');
      if (!res.ok) throw new Error('Failed to fetch reviews');
      
      const data = await res.json();
      const reviewsArray = Array.isArray(data) ? data : data.data || [];

      // Smart Mapping: Safely handle whatever column names the database uses
      const mappedReviews = reviewsArray.map((r: any) => ({
        id: r.id || Math.random(),
        name: r.name || r.guest_name || r.guestName || "Valued Guest",
        location: r.location || r.guest_location || "Unknown",
        suite: r.suite || r.room_type || r.room || "Luxury Suite",
        text: r.text || r.review_text || r.review || r.comment || "",
        rating: Number(r.rating) || 5
      })).filter((r: Review) => r.text !== ""); // Only keep reviews that actually have text

      // If database is empty, use the premium default reviews
      if (mappedReviews.length > 0) {
        setReviews(mappedReviews);
      } else {
        setReviews(defaultReviews);
      }

    } catch (err) {
      console.error('Error fetching reviews:', err);
      // Fallback to default reviews if the server is down
      setReviews(defaultReviews);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Auto-play logic
  useEffect(() => {
    if (!isAutoPlaying || reviews.length <= 1) return;
    
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % reviews.length);
    }, 6000); // Changes every 6 seconds

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAutoPlaying, reviews.length, activeIndex]);

  const nextReview = () => {
    if (reviews.length <= 1) return;
    setActiveIndex((prev) => (prev + 1) % reviews.length);
    resetAutoPlay();
  };

  const prevReview = () => {
    if (reviews.length <= 1) return;
    setActiveIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
    resetAutoPlay();
  };

  const resetAutoPlay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (isAutoPlaying) {
      intervalRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % reviews.length);
      }, 6000);
    }
  };

  const pauseAutoPlay = () => setIsAutoPlaying(false);
  const resumeAutoPlay = () => setIsAutoPlaying(true);

  if (loading) {
    return (
      <section className="bg-[#111111] text-white py-24 px-4 border-t-2 border-[#d4af37]">
        <div className="max-w-4xl mx-auto text-center animate-pulse">
          <div className="h-4 w-32 bg-gray-700 mx-auto mb-4 rounded"></div>
          <div className="h-10 w-64 bg-gray-700 mx-auto mb-8 rounded"></div>
          <div className="h-24 w-full max-w-2xl bg-gray-800 mx-auto rounded mb-8"></div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="bg-[#111111] text-white py-24 px-4 relative overflow-hidden border-t-2 border-[#d4af37]"
      onMouseEnter={pauseAutoPlay}
      onMouseLeave={resumeAutoPlay}
    >
      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
        <span className="text-[180px] md:text-[280px] font-serif font-bold text-white/[0.03] select-none tracking-widest">
          DKV
        </span>
      </div>

      <div className="max-w-5xl mx-auto text-center relative z-10">
        <h2 className="text-[#d4af37] font-bold tracking-[0.2em] uppercase text-xs md:text-sm mb-4">
          Guest Testimonials
        </h2>
        <h3 className="text-3xl md:text-5xl font-serif text-white mb-6 tracking-wide uppercase">
          The Verdict of Luxury
        </h3>
        <div className="w-16 h-[2px] bg-[#d4af37] mx-auto mb-12"></div>

        <div className="relative flex items-center justify-center min-h-[300px] md:min-h-[250px]">
          
          {/* Only show arrows if there is more than 1 review */}
          {reviews.length > 1 && (
            <button
              onClick={prevReview}
              className="absolute left-0 md:-left-8 z-20 text-gray-500 hover:text-[#d4af37] transition-colors p-2 focus:outline-none"
              aria-label="Previous Review"
            >
              <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          <div className="w-full relative h-full flex items-center justify-center overflow-hidden">
            {reviews.map((review, index) => (
              <div
                key={review.id}
                className={`transition-all duration-700 ease-in-out absolute w-full px-8 md:px-20 ${
                  index === activeIndex
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
                
                <p className="text-lg md:text-2xl font-serif italic text-gray-200 leading-relaxed max-w-4xl mx-auto mb-8 drop-shadow-sm">
                  "{review.text}"
                </p>
                
                <div>
                  <h4 className="text-base md:text-lg font-bold uppercase tracking-widest text-white drop-shadow-md">
                    {review.name}
                  </h4>
                  <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-[0.2em] mt-2 font-bold">
                    {review.location} <span className="mx-2 text-gray-600">•</span> <span className="text-[#d4af37]">{review.suite}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Only show arrows if there is more than 1 review */}
          {reviews.length > 1 && (
            <button
              onClick={nextReview}
              className="absolute right-0 md:-right-8 z-20 text-gray-500 hover:text-[#d4af37] transition-colors p-2 focus:outline-none"
              aria-label="Next Review"
            >
              <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

        </div>

        {/* Pagination Dots */}
        {reviews.length > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setActiveIndex(index);
                  resetAutoPlay();
                }}
                className={`h-1.5 transition-all duration-300 rounded-full ${
                  index === activeIndex ? "w-8 bg-[#d4af37]" : "w-2 bg-gray-600 hover:bg-gray-400"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}