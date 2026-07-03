"use client";

import Link from 'next/link';

export default function RecreationPage() {
  return (
    <div className="flex flex-col bg-[#fdfbf7] min-h-screen">
      
      {/* --- HERO BANNER --- */}
      <section className="relative w-full h-[60vh] md:h-[80vh] min-h-[400px] md:min-h-[600px] flex items-center justify-center overflow-hidden bg-gray-900">
        {/* Background Image */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/pool.jpg')" }}
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60 z-10" />
        {/* Decorative Gold Accent */}
        <div className="absolute inset-0 opacity-10 z-10" style={{ background: 'radial-gradient(circle at 30% 50%, #d4af37, transparent 70%)' }} />
        
        {/* Content */}
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto mt-12 md:mt-0">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-4">
            <span className="w-8 md:w-12 h-[2px] bg-[#d4af37]"></span>
            <span className="text-[#d4af37] tracking-[0.2em] md:tracking-[0.3em] uppercase text-xs md:text-sm font-semibold">Wellness & Leisure</span>
            <span className="w-8 md:w-12 h-[2px] bg-[#d4af37]"></span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-white mb-4 drop-shadow-2xl">
            Recreation
          </h1>
          <p className="text-[#d4af37] font-bold tracking-[0.15em] md:tracking-[0.3em] uppercase text-xs sm:text-sm md:text-base drop-shadow-lg">
            Rejuvenate Your Mind and Body
          </p>
          <div className="w-16 md:w-20 h-1 bg-[#d4af37] mx-auto mt-6"></div>
        </div>

        {/* Bottom Gold Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-10 h-1.5 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
      </section>

      {/* --- PAGE INTRO --- */}
      <section className="py-16 md:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-5xl font-serif text-gray-900 mb-6 leading-tight">Elevate Your Stay</h2>
        <p className="text-lg md:text-xl text-[#d4af37] font-serif italic mb-8">Exclusive access for our esteemed guests</p>
        <p className="text-gray-600 leading-relaxed text-sm md:text-base">
          At De Kuchney Villa, we believe that true luxury extends beyond your suite. Whether you are looking to maintain your fitness routine or completely unwind under the sun, our premium recreational facilities are designed to provide the ultimate balance of activity and relaxation.
        </p>
      </section>

      {/* --- SWIMMING POOL SECTION --- */}
      <section className="py-12 md:py-20 bg-white border-t border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            
            {/* Image */}
            <div className="w-full lg:w-1/2 relative h-[350px] md:h-[500px] shadow-2xl group overflow-hidden rounded-sm">
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
              <img 
                src="/images/pool.jpg" 
                alt="Luxury Swimming Pool" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Gold Border Accent */}
              <div className="absolute -bottom-4 -left-4 w-32 h-32 border-4 border-[#d4af37] z-0 hidden lg:block"></div>
            </div>

            {/* Text Content */}
            <div className="w-full lg:w-1/2 text-center lg:text-left">
              <div className="inline-block bg-[#fdfbf7] border border-gray-200 px-4 py-1 text-xs font-bold tracking-widest text-[#d4af37] uppercase mb-6">
                Relaxation
              </div>
              <h2 className="text-3xl md:text-5xl font-serif text-gray-900 mb-6">Crystal Clear <br/> Swimming Pool</h2>
              <p className="text-gray-600 leading-relaxed mb-6 text-sm md:text-base">
                Dive into serenity at our pristine outdoor swimming pool. Surrounded by elegant lounging areas and lush landscaping, it is the perfect oasis to escape the city's hustle.
              </p>
              <ul className="text-left space-y-4 text-sm text-gray-600 mb-8 border-l-2 border-[#d4af37] pl-6">
                <li className="flex items-center gap-2"><span className="text-[#d4af37]">✓</span> Temperature-controlled water</li>
                <li className="flex items-center gap-2"><span className="text-[#d4af37]">✓</span> Premium poolside loungers & cabanas</li>
                <li className="flex items-center gap-2"><span className="text-[#d4af37]">✓</span> Refreshing cocktails and snacks served poolside</li>
                <li className="flex items-center gap-2"><span className="text-[#d4af37]">✓</span> Dedicated children's wading area</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* --- FITNESS GYM SECTION --- */}
      <section className="py-12 md:py-20 bg-[#fdfbf7] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20">
            
            {/* Image */}
            <div className="w-full lg:w-1/2 relative h-[350px] md:h-[500px] shadow-2xl group overflow-hidden rounded-sm">
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
              <img 
                src="/images/gym.jpg" 
                alt="State of the Art Fitness Gym" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Gold Border Accent */}
              <div className="absolute -top-4 -right-4 w-32 h-32 border-4 border-[#d4af37] z-0 hidden lg:block"></div>
            </div>

            {/* Text Content */}
            <div className="w-full lg:w-1/2 text-center lg:text-left">
              <div className="inline-block bg-white border border-gray-200 px-4 py-1 text-xs font-bold tracking-widest text-[#d4af37] uppercase mb-6">
                Health & Wellness
              </div>
              <h2 className="text-3xl md:text-5xl font-serif text-gray-900 mb-6">State-of-the-Art <br/> Fitness Gym</h2>
              <p className="text-gray-600 leading-relaxed mb-6 text-sm md:text-base">
                Never miss a workout during your travels. Our exclusive fitness center is fully equipped with the latest high-end cardio and strength-training machines, providing everything you need for a complete workout.
              </p>
              <ul className="text-left space-y-4 text-sm text-gray-600 mb-8 border-l-2 border-[#d4af37] pl-6">
                <li className="flex items-center gap-2"><span className="text-[#d4af37]">✓</span> 24/7 secure access for all guests</li>
                <li className="flex items-center gap-2"><span className="text-[#d4af37]">✓</span> Advanced cardio equipment (treadmills, ellipticals, bikes)</li>
                <li className="flex items-center gap-2"><span className="text-[#d4af37]">✓</span> Comprehensive free weights & resistance machines</li>
                <li className="flex items-center gap-2"><span className="text-[#d4af37]">✓</span> Complimentary towels and hydration station</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* --- CALL TO ACTION --- */}
      <section className="py-20 bg-gray-900 text-center px-4">
        <div className="max-w-3xl mx-auto">
          <svg className="w-12 h-12 text-[#d4af37] mx-auto mb-6 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          <h2 className="text-3xl md:text-4xl font-serif text-white mb-6">Experience the Perfect Getaway</h2>
          <p className="text-gray-400 mb-10 text-sm md:text-base">
            Book your suite today and enjoy complimentary access to all our luxury recreational facilities.
          </p>
          <Link href="/rooms" className="inline-block bg-[#d4af37] text-black font-bold py-4 px-10 uppercase tracking-widest hover:bg-white transition-colors shadow-2xl">
            Reserve Your Room
          </Link>
        </div>
      </section>

    </div>
  );
}