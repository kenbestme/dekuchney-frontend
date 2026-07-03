"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [featuredRooms, setFeaturedRooms] = useState([]);
  // State to track the clicked amenity image for the full-screen modal
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/rooms");
        const result = await response.json();
        
        let roomsArray = [];
        if (Array.isArray(result)) {
          roomsArray = result;
        } else if (result.data && Array.isArray(result.data)) {
          roomsArray = result.data;
        } else {
          roomsArray = [];
        }
        
        setFeaturedRooms(roomsArray.slice(0, 3));
      } catch (err) {
        console.error("Failed to fetch featured rooms:", err);
        setFeaturedRooms([]);
      }
    };
    fetchRooms();
  }, []);

  // List of amenities
  const amenities = [
    { title: "Restaurant", image: "/images/restaurant.jpg" },
    { title: "Pool Side", image: "/images/pool.jpg" },
    { title: "Fitness Gym", image: "/images/gym.jpg" },
    { title: "Lounge & Bar", image: "/images/lounge.jpg" },
    { title: "VIP Lounge", image: "/images/VIP Ber.jpg" },
    { title: "Secure Parking", image: "/images/parking.jpg" }
  ];

  return (
    <div className="flex flex-col bg-[#fdfbf7]">
      
      {/* --- VIDEO HERO SECTION --- */}
      <section className="relative h-[85vh] md:h-[90vh] flex items-center justify-center overflow-hidden">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/videos/home-hero.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 z-10" style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}></div>
        <div className="relative z-20 text-center px-4 sm:px-6 w-full max-w-5xl mx-auto mt-16 md:mt-0">
          <p className="text-[#d4af37] font-bold tracking-[0.2em] md:tracking-[0.3em] uppercase mb-4 text-xs sm:text-sm md:text-base drop-shadow-md">
            Welcome to Metropolis
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold mb-6 drop-shadow-lg leading-tight">
            Experience Unrivaled <br className="hidden sm:block"/> Elegance & Luxury
          </h1>
          <p className="text-gray-200 text-base sm:text-lg md:text-xl mb-8 md:mb-10 max-w-2xl mx-auto drop-shadow px-4 md:px-0">
            Your exclusive sanctuary in the heart of the city. Discover world-class amenities, breathtaking views, and unparalleled service.
          </p>
          <Link href="/rooms" className="inline-block w-full sm:w-auto bg-[#d4af37] hover:bg-[#b5952f] text-black px-8 py-4 rounded font-bold tracking-widest uppercase transition-all shadow-xl hover:scale-105 active:scale-95">
            Discover Our Suites
          </Link>
        </div>
      </section>

      {/* --- SPLIT WELCOME SECTION --- */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Mobile-Friendly Overlapping Images */}
          <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] w-full block order-2 lg:order-1 mt-8 lg:mt-0">
            <div className="absolute top-0 left-0 w-[65%] h-[80%] border-4 border-white shadow-xl z-10 overflow-hidden bg-gray-200">
              <img src="/images/welcome-1.jpg" alt="Villa Exterior" className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="absolute bottom-0 right-0 w-[65%] h-[80%] border-4 border-white shadow-xl overflow-hidden bg-gray-200 z-20">
              <img src="/images/welcome-2.jpg" alt="Villa Interior" className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-6 w-24 h-24 md:w-32 md:h-32 border-4 border-[#d4af37] z-0"></div>
          </div>
          
          <div className="order-1 lg:order-2 text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-gray-900 mb-4 md:mb-6 leading-tight">A New Standard of Making Memories</h2>
            <p className="text-lg md:text-xl text-[#d4af37] font-serif italic mb-6">Your Comfort, Our Priority</p>
            <p className="text-gray-600 mb-6 leading-relaxed text-sm md:text-base">
              Whether you are traveling for business or seeking a romantic getaway, De Kuchney Villa offers a tranquil oasis designed for your ultimate comfort. Immerse yourself in refined architecture, bespoke furnishings, and a team dedicated to anticipating your every need.
            </p>
            <p className="text-gray-600 mb-8 leading-relaxed text-sm md:text-base">
              Experience world-class amenities, breathtaking city views, and unparalleled service right in the heart of the metropolis.
            </p>
            <div className="border-l-4 border-[#d4af37] pl-4 lg:pl-6 py-1 inline-block text-left">
              <p className="font-bold text-gray-900">Charles Obialor</p>
              <p className="text-xs md:text-sm text-gray-500 uppercase tracking-widest">Managing Director</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURED ROOMS SECTION --- */}
      <section className="py-16 md:py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-serif text-gray-900">Our Signature Rooms</h2>
            <div className="w-16 h-1 bg-[#d4af37] mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {featuredRooms.map((room: any) => {
              // Handle images safely
              let imagesArray = [];
              if (Array.isArray(room.images)) {
                imagesArray = room.images;
              } else if (typeof room.images === 'string') {
                try {
                  imagesArray = JSON.parse(room.images);
                } catch {
                  imagesArray = [room.images];
                }
              }
              let firstImage = imagesArray.length > 0 ? imagesArray[0] : null;
              if (firstImage && !firstImage.startsWith('http')) {
                firstImage = `http://localhost:5000${firstImage}`;
              }
              
              const bedCount = room.beds || 1;
              const wifi = room.wifi === 1 || room.wifi === true;
              const maxGuests = room.max_guests || 2;
              
              return (
                <div key={room.id} className="bg-[#fdfbf7] shadow-lg overflow-hidden border border-gray-100 flex flex-col group">
                  <div className="h-56 sm:h-64 relative bg-gray-200 overflow-hidden">
                    {firstImage ? (
                      <img src={firstImage} alt={room.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">No Image</div>
                    )}
                    <div className="absolute top-4 right-4 bg-[#d4af37] text-black font-bold py-1 px-3 text-xs uppercase shadow-md z-10">
                      ₦{Number(room.price_per_night).toLocaleString()}
                    </div>
                  </div>
                  <div className="p-5 md:p-6 flex flex-col flex-grow">
                    <h3 className="text-xl md:text-2xl font-serif text-gray-900 mb-3 group-hover:text-[#d4af37] transition-colors">{room.name}</h3>
                    <div className="flex flex-wrap gap-3 md:gap-4 text-[10px] md:text-xs text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-200 pb-4">
                      <span className="flex items-center gap-1">🛏️ {bedCount} Bed{bedCount !== 1 ? 's' : ''}</span>
                      {wifi && <span className="flex items-center gap-1">📶 Wi-Fi</span>}
                      <span className="flex items-center gap-1">👥 Max {maxGuests}</span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-grow">{room.description}</p>
                    <Link href={`/rooms/${room.slug}`} className="block text-center bg-gray-900 hover:bg-[#d4af37] text-white hover:text-black w-full px-4 py-3 text-sm font-bold uppercase tracking-widest transition-colors">
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Mobile 'View All' Button */}
          <div className="text-center mt-10">
            <Link href="/rooms" className="inline-block border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-8 py-3 text-sm font-bold uppercase tracking-widest transition-colors">
              View All Suites
            </Link>
          </div>
        </div>
      </section>

      {/* --- PHOTO-GRID AMENITIES SECTION --- */}
      <section className="bg-[#fdfbf7] py-16 md:py-20">
        <div className="max-w-7xl mx-auto text-center mb-8 md:mb-12 px-4">
          <h2 className="inline-block bg-[#e8debc] px-6 py-2 text-2xl md:text-3xl font-serif text-gray-900 shadow-sm">
            Our Amenities
          </h2>
          <p className="text-gray-500 text-sm mt-4 italic font-serif">Tap any image to view gallery</p>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            
            {amenities.map((amenity, index) => (
              <div 
                key={index} 
                className="relative h-56 sm:h-64 md:h-72 overflow-hidden group bg-gray-900 cursor-pointer rounded-sm shadow-md"
                onClick={() => setSelectedImage(amenity.image)}
              >
                <img src={amenity.image} alt={amenity.title} className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 z-10"></div>
                
                <div className="absolute inset-x-0 bottom-0 p-6 z-20 flex justify-between items-end">
                  <h3 className="text-white text-xl md:text-2xl font-serif drop-shadow-md translate-y-2 group-hover:translate-y-0 transition-transform duration-300">{amenity.title}</h3>
                  <svg className="w-6 h-6 text-[#d4af37] opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            ))}
            
          </div>
        </div>
      </section>

      {/* --- IMAGE LIGHTBOX MODAL --- */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          {/* Close Button */}
          <button 
            className="absolute top-4 right-4 md:top-8 md:right-8 text-white hover:text-[#d4af37] transition-colors bg-black/50 rounded-full p-2"
            onClick={() => setSelectedImage(null)}
            aria-label="Close modal"
          >
            <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Expanded Image */}
          <img 
            src={selectedImage} 
            alt="Expanded Amenity" 
            className="max-w-full max-h-[85vh] object-contain rounded shadow-2xl border-2 border-gray-800"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}

    </div>
  );
}