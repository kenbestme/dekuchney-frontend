import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center bg-neutral-900">
        {/* Luxury Background Image */}
        <div 
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542314831-c6a4d14d8c85?q=80&w=2070')] bg-cover bg-center opacity-60"
        ></div>
        
        {/* Welcome Text Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-10">
          <p className="text-amber-500 font-medium tracking-[0.3em] uppercase mb-4">
            A New Standard of Elegance
          </p>
          <h1 className="text-5xl md:text-7xl font-serif text-white mb-8 drop-shadow-2xl leading-tight">
            Welcome to De Kuchney Villa Hotel
          </h1>
          <p className="text-lg md:text-2xl text-neutral-200 mb-12 font-light max-w-3xl mx-auto drop-shadow-md">
            Unparalleled luxury, breathtaking views, and uncompromising service in the heart of the city.
          </p>
          <Link 
            href="/rooms" 
            className="bg-amber-600 hover:bg-amber-700 text-white px-10 py-5 rounded-sm transition-all duration-300 text-lg tracking-wider uppercase shadow-xl hover:shadow-amber-900/50"
          >
            Explore Our Suites
          </Link>
        </div>
      </section>
    </main>
  );
}