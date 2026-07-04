"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

// ✅ Use environment variable for API base URL
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

interface GalleryImage {
  id: number;
  src: string;
  alt: string;
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  // ============================================================
  // ✅ DEBUGGING VERSION – with console logs
  // ============================================================
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const url = `${API_BASE}/api/gallery`;
        console.log('📡 Fetching gallery from:', url);
        const res = await fetch(url);
        console.log('📊 Response status:', res.status);
        
        const data = await res.json();
        console.log('📦 Gallery data:', data);
        
        if (data.success) {
          setImages(data.data);
          console.log('✅ Set images:', data.data.length);
        } else {
          console.error('❌ Failed to fetch gallery – success false');
          setImages([]);
        }
      } catch (err) {
        console.error('❌ Error fetching gallery:', err);
        setImages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#d4af37]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-[#fdfbf7] min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative h-[50vh] flex items-center justify-center overflow-hidden bg-cover bg-center"
        style={{ 
          backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/images/gallery-hero.jpg')" 
        }}
      >
        <div className="relative z-20 text-center px-4">
          <h1 className="text-5xl md:text-6xl font-serif text-white mb-4 drop-shadow-2xl">The Gallery</h1>
          <p className="text-[#d4af37] font-bold tracking-[0.3em] uppercase text-sm md:text-base drop-shadow-lg">
            A Visual Journey
          </p>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-gray-600 max-w-2xl mx-auto">
            Experience the unparalleled elegance of De Kuchney Villa. Every detail has been meticulously designed to provide a sanctuary of luxury and comfort.
          </p>
        </div>

        {images.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No images available yet. Please check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <div
                key={image.id}
                onClick={() => setSelectedImage(image)}
                className="group relative overflow-hidden rounded-lg shadow-lg bg-gray-100 aspect-square cursor-pointer"
              >
                <img
                  src={`${API_BASE}${image.src.startsWith('/') ? image.src : '/' + image.src}`}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-white text-sm font-medium tracking-wider uppercase">View</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-16">
          <Link href="/" className="inline-block border-2 border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-black px-8 py-3 font-bold uppercase tracking-widest transition-colors">
            Return Home
          </Link>
        </div>
      </section>

      {/* Modal with constrained image size */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-auto h-auto">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white text-3xl hover:text-[#d4af37] transition-colors z-10"
              aria-label="Close"
            >
              ✕
            </button>
            <img
              src={`${API_BASE}${selectedImage.src.startsWith('/') ? selectedImage.src : '/' + selectedImage.src}`}
              alt={selectedImage.alt}
              className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-lg shadow-2xl mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
}