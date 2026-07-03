"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function About() {
  // State for the Image Lightbox
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Array of collage images for easy mapping and rendering
  const collageImages = [
    '/images/about-1.jpg',
    '/images/about-2.jpg',
    '/images/about-3.jpg'
  ];

  return (
    <div className="flex flex-col bg-[#fdfbf7] min-h-screen relative">
      
      {/* --- HERO BANNER --- */}
      <section className="relative w-full h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-gray-900">
        {/* Background Image */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/about-hero.jpg')" }}
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60 z-10" />
        {/* Decorative Gold Accent */}
        <div className="absolute inset-0 opacity-10 z-10" style={{ background: 'radial-gradient(circle at 30% 50%, #d4af37, transparent 70%)' }} />
        
        {/* Content */}
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-12 h-[2px] bg-[#d4af37]"></span>
            <span className="text-[#d4af37] tracking-[0.3em] uppercase text-sm font-semibold">Our Story</span>
            <span className="w-12 h-[2px] bg-[#d4af37]"></span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif text-white mb-4 drop-shadow-2xl">
            De Kuchney Villa
          </h1>
          <p className="text-[#d4af37] font-bold tracking-[0.3em] uppercase text-sm md:text-base drop-shadow-lg">
            A Legacy of Excellence Since 2021
          </p>
          <div className="w-20 h-1 bg-[#d4af37] mx-auto mt-6"></div>
        </div>

        {/* Bottom Gold Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-10 h-1.5 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
      </section>

      {/* --- THE VISION & HISTORY SECTION --- */}
      <section className="py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-5xl font-serif text-gray-900 mb-8 leading-tight">Redefining Luxury in the Heart of Metropolis</h2>
        <div className="h-1 w-24 bg-[#d4af37] mx-auto mb-10"></div>
        
        <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-serif italic mb-10">
          "Our mission was simple: to carve out a sanctuary where modern elegance seamlessly intertwines with timeless hospitality."
        </p>
        
        <div className="text-gray-600 leading-relaxed space-y-6 text-justify md:text-center">
          <p>
            Established in 2021, De Kuchney Villa was founded with a singular, passionate vision to elevate the hospitality landscape. Nestled in the serene and vibrant district of <strong>Abuja Kubwa F01</strong>, our hotel was meticulously designed to be more than just a place to rest—it is a premier destination for those who appreciate the finer things in life.
          </p>
          <p>
            What started as an ambitious endeavor has rapidly evolved into a hallmark of luxury and comfort in the capital city. Every architectural detail, every piece of custom furniture, and every state-of-the-art amenity has been carefully curated to provide an unforgettable, world-class experience for our guests. 
          </p>
          <p>
            From the moment you step into our grand lobby, you are not just a guest—you are family. We pride ourselves on our intuitive service, anticipating your needs before you even realize them. Whether you are visiting Abuja for a crucial business trip, a romantic escape, or a rejuvenating staycation, our dedicated team ensures your time with us is nothing short of perfection.
          </p>
        </div>
      </section>

      {/* --- INTERACTIVE IMAGE COLLAGE SECTION --- */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h3 className="text-sm font-bold tracking-[0.2em] uppercase text-gray-400 mb-2">A Glimpse of Elegance</h3>
            <p className="text-gray-500 italic font-serif">Click to expand</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {collageImages.map((image, index) => (
              <div 
                key={index}
                className={`relative h-80 bg-gray-200 bg-cover bg-center shadow-lg cursor-pointer overflow-hidden group ${index === 1 ? 'md:-translate-y-8' : ''}`} 
                style={{ backgroundImage: `url('${image}')` }}
                onClick={() => setSelectedImage(image)}
              >
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                  <svg className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- OUR PROMISE SECTION --- */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h3 className="text-3xl font-serif text-gray-900 mb-6">The De Kuchney Promise</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We believe that true luxury lies in the details. It is found in the crispness of our premium linens, the perfect temperature of our pool, the artful presentation of a meal crafted by our executive chefs, and the warm, genuine smiles of our staff. 
            </p>
            <p className="text-gray-600 mb-8 leading-relaxed">
              As a proud establishment in Abuja Kubwa F01, our commitment is to provide an environment of absolute tranquility and uncompromising quality, continually setting a new benchmark for hospitality in the region.
            </p>
            <div className="border-l-4 border-[#d4af37] pl-6 py-2">
              <p className="font-bold text-gray-900 text-lg">Charles Obialor</p>
              <p className="text-sm text-gray-500 uppercase tracking-widest">Managing Director & Founder</p>
            </div>
          </div>
          
          <div className="bg-[#1a1a1a] p-12 text-center text-white shadow-2xl relative">
            <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-[#d4af37] m-4"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 border-b-4 border-l-4 border-[#d4af37] m-4"></div>
            
            <h4 className="text-2xl font-serif text-[#d4af37] mb-6">Experience It Yourself</h4>
            <p className="text-gray-300 mb-8">Ready to create your own memories? Reserve your sanctuary today and experience the difference.</p>
            <Link href="/rooms" className="inline-block border-2 border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-black px-8 py-3 font-bold tracking-widest uppercase transition-colors">
              View Our Suites
            </Link>
          </div>
        </div>
      </section>

      {/* --- FULL SCREEN IMAGE LIGHTBOX --- */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={() => setSelectedImage(null)}
        >
          {/* Close Button */}
          <button 
            className="absolute top-6 right-6 md:top-10 md:right-10 text-white hover:text-[#d4af37] transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Expanded Image */}
          <img 
            src={selectedImage} 
            alt="Expanded view of De Kuchney Villa" 
            className="max-w-full max-h-[90vh] object-contain rounded shadow-2xl border-4 border-gray-800"
            onClick={(e) => e.stopPropagation()} // Prevents clicking the image from closing the modal
          />
        </div>
      )}

    </div>
  );
}