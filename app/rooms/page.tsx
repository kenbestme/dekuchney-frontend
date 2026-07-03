"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

const countries = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda',
  'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas',
  'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize',
  'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil',
  'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia',
  'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China',
  'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba',
  'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica',
  'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea',
  'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland',
  'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana',
  'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia',
  'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica',
  'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Korea, North',
  'Korea, South', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon',
  'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta',
  'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia',
  'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique',
  'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand',
  'Nicaragua', 'Niger', 'Nigeria', 'North Macedonia', 'Norway', 'Oman',
  'Pakistan', 'Palau', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru',
  'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia',
  'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent',
  'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia',
  'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia',
  'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'Spain',
  'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
  'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo',
  'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan',
  'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom',
  'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City',
  'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe',
];

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- NEW GALLERY STATE ---
  const [galleryImages, setGalleryImages] = useState<string[] | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [bookingForm, setBookingForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', state: '', country: '',
    checkIn: '', checkOut: '', requests: '',
  });
  const [isPaying, setIsPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'opay'>('paystack');

  // Auto-detect country
  useEffect(() => {
    const detectCountry = async () => {
      try {
        const res = await fetch('https://ip-api.com/json/?fields=country');
        const data = await res.json();
        if (data.country) {
          setBookingForm((prev) => ({ ...prev, country: data.country }));
        }
      } catch (error) {
        console.warn('Could not auto-detect country.');
      }
    };
    detectCountry();
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/rooms");
        const text = await res.text();
        try {
          const result = JSON.parse(text);
          let roomsArray = [];
          if (Array.isArray(result)) roomsArray = result;
          else if (result.data && Array.isArray(result.data)) roomsArray = result.data;
          else roomsArray = [];
          setRooms(roomsArray);
        } catch (err) {
          console.error("JSON parse error", err);
          setRooms([]);
        }
      } catch (err) {
        console.error("Network error", err);
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const handleBookNow = (room: any) => {
    setSelectedRoom(room);
    setIsBookingOpen(true);
  };

  // Load Paystack script
  const loadPaystackScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && (window as any).PaystackPop) {
        resolve(true);
        return;
      }
      const existingScript = document.querySelector('script[src="https://js.paystack.co/v2/inline.js"]');
      if (existingScript) {
        const onLoad = () => { resolve(true); cleanup(); };
        const onError = () => { resolve(false); cleanup(); };
        const cleanup = () => {
          existingScript.removeEventListener('load', onLoad);
          existingScript.removeEventListener('error', onError);
        };
        existingScript.addEventListener('load', onLoad);
        existingScript.addEventListener('error', onError);
        if ((window as any).PaystackPop) resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v2/inline.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
      setTimeout(() => {
        if ((window as any).PaystackPop) resolve(true);
        else resolve(false);
      }, 10000);
    });
  };

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPaying) return;
    setIsPaying(true);

    try {
      const fullName = `${bookingForm.firstName} ${bookingForm.lastName}`.trim();

      const response = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName, email: bookingForm.email, phone: bookingForm.phone,
          address: bookingForm.address, city: bookingForm.city, state: bookingForm.state,
          country: bookingForm.country, checkIn: bookingForm.checkIn, checkOut: bookingForm.checkOut,
          requests: bookingForm.requests, suite: selectedRoom.name, amount: selectedRoom.price_per_night,
          status: "pending",
        }),
      });

      if (!response.ok) throw new Error("Save failed");
      const bookingData = await response.json();
      const bookingId = bookingData.id || bookingData.booking_id;
      if (!bookingId) throw new Error("No booking ID");

      if (paymentMethod === 'paystack') {
        const loaded = await loadPaystackScript();
        if (!loaded || !(window as any).PaystackPop) {
          alert('Payment service unavailable. Please try OPay or refresh.');
          setIsPaying(false);
          return;
        }

        const paystack = new (window as any).PaystackPop();
        const amountInKobo = Math.round(selectedRoom.price_per_night * 100);

        paystack.newTransaction({
          key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
          email: bookingForm.email,
          amount: amountInKobo,
          currency: 'NGN',
          channels: ['card', 'bank_transfer'],
          metadata: {
            booking_id: bookingId,
            room_name: selectedRoom.name,
            custom_fields: [
              { display_name: "Guest Name", variable_name: "guest_name", value: fullName },
              { display_name: "Suite", variable_name: "suite", value: selectedRoom.name },
              { display_name: "Check-in", variable_name: "check_in", value: bookingForm.checkIn },
              { display_name: "Check-out", variable_name: "check_out", value: bookingForm.checkOut },
            ],
          },
          onSuccess: async (tx: any) => {
            try {
              await fetch(`http://localhost:5000/api/payments/verify/${tx.reference}`);
            } catch (err) {
              console.error('Verification failed:', err);
            }
            window.location.href = `/booking-confirmation?booking_id=${bookingId}&ref=${tx.reference}`;
          },
          onCancel: () => {
            alert('Payment cancelled.');
            setIsPaying(false);
          },
          onError: (err: any) => {
            alert('Payment error: ' + (err.message || 'Unknown error'));
            setIsPaying(false);
          },
        });
      } else {
        // OPay
        const opayRes = await fetch("http://localhost:5000/api/payments/initialize-opay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: bookingForm.email, amount: selectedRoom.price_per_night, bookingId: bookingId, fullName: fullName }),
        });
        const opayData = await opayRes.json();
        if (opayData.success && opayData.authorization_url) {
          window.location.href = opayData.authorization_url;
        } else {
          alert("OPay initialization failed: " + (opayData.message || "unknown error"));
          setIsPaying(false);
        }
      }
    } catch (err) {
      alert("Booking error: " + (err instanceof Error ? err.message : 'Unknown error'));
      setIsPaying(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#d4af37]"></div>
      </div>
    );

  return (
    <div className="flex flex-col bg-[#fdfbf7] min-h-screen">
      {/* Hero Banner */}
      <section className="relative w-full h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-gray-900">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/rooms-hero.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/60 z-10" />
        <div
          className="absolute inset-0 opacity-10 z-10"
          style={{ background: 'radial-gradient(circle at 30% 50%, #d4af37, transparent 70%)' }}
        />

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-12 h-[2px] bg-[#d4af37]"></span>
            <span className="text-[#d4af37] tracking-[0.3em] uppercase text-sm font-semibold">Discover</span>
            <span className="w-12 h-[2px] bg-[#d4af37]"></span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif text-white mb-4 drop-shadow-2xl">Rooms & Suites</h1>
          <p className="text-[#d4af37] font-bold tracking-[0.3em] uppercase text-sm md:text-base drop-shadow-lg">
            Your Sanctuary Awaits
          </p>
          <div className="w-20 h-1 bg-[#d4af37] mx-auto mt-6"></div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10 h-1.5 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
      </section>

      {/* Rooms Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-6">Discover True Comfort</h2>
          <p className="text-gray-600 leading-relaxed">
            Every room and suite at De Kuchney Villa is meticulously designed to provide an oasis of calm and luxury. From
            plush bedding to modern amenities, experience uncompromising comfort during your stay.
          </p>
        </div>

        {rooms.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No rooms available at the moment. Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {rooms.map((room: any) => {
              let parsedImages = [];
              if (Array.isArray(room.images)) parsedImages = room.images;
              else if (typeof room.images === 'string') {
                try {
                  parsedImages = JSON.parse(room.images);
                } catch {
                  parsedImages = [room.images];
                }
              }
              
              // Map over all images to ensure the localhost URL is added properly
              const fullImages = parsedImages.map((img: string) => {
                if (img && !img.startsWith('http')) return `http://localhost:5000${img}`;
                return img;
              }).filter(Boolean);

              const firstImage = fullImages.length > 0 ? fullImages[0] : null;

              const isBookable = room.status === 'available' || !room.status;
              let statusLabel = '';
              if (room.status === 'maintenance') statusLabel = 'Under Maintenance';
              else if (room.status === 'reserved') statusLabel = 'Reserved';
              else if (room.status === 'occupied') statusLabel = 'Occupied';

              return (
                <div key={room.id} className="bg-white shadow-xl overflow-hidden border border-gray-100 flex flex-col group">
                  
                  {/* --- INTERACTIVE GALLERY IMAGE --- */}
                  <div 
                    className="h-72 relative bg-gray-200 overflow-hidden cursor-pointer"
                    onClick={() => {
                      if (fullImages.length > 0) {
                        setGalleryImages(fullImages);
                        setCurrentImageIndex(0);
                      }
                    }}
                  >
                    {firstImage ? (
                      <img
                        src={firstImage}
                        alt={room.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-300 text-gray-500">
                        No Image Available
                      </div>
                    )}
                    
                    {/* Visual Indicator for Gallery */}
                    {fullImages.length > 1 && (
                      <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs font-bold px-3 py-1.5 rounded flex items-center gap-2 z-10 shadow-lg">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        1 / {fullImages.length}
                      </div>
                    )}

                    <div className="absolute top-4 left-4 bg-[#d4af37] text-black font-bold py-1 px-3 text-sm uppercase shadow-md z-10">
                      ₦{Number(room.price_per_night).toLocaleString()} / Night
                    </div>
                  </div>

                  <div className="p-8 flex flex-col flex-grow">
                    <h3 className="text-2xl font-serif text-gray-900 mb-4 group-hover:text-[#d4af37] transition-colors">
                      {room.name}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500 uppercase tracking-wider mb-6 border-b border-gray-100 pb-6">
                      <span className="flex items-center gap-1">
                        🛏️ {room.beds || 1} Bed{room.beds !== 1 ? 's' : ''}
                      </span>
                      {room.wifi && <span className="flex items-center gap-1">📶 Free Wi-Fi</span>}
                      <span className="flex items-center gap-1">👥 Max {room.max_guests || 2}</span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-8 flex-grow leading-relaxed">
                      {room.description}
                    </p>
                    <div className="mt-auto flex gap-3">
                      <Link
                        href={`/rooms/${room.slug}`}
                        className="flex-1 text-center border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-bold py-3 text-xs uppercase tracking-widest"
                      >
                        View Details
                      </Link>
                      {isBookable ? (
                        <button
                          onClick={() => handleBookNow(room)}
                          className="flex-1 text-center bg-gray-900 hover:bg-[#d4af37] border-2 border-gray-900 hover:border-[#d4af37] text-white hover:text-black font-bold py-3 text-xs uppercase tracking-widest transition-all duration-300"
                        >
                          Book Now
                        </button>
                      ) : (
                        <div className="flex-1 text-center bg-gray-300 text-gray-700 font-bold py-3 text-xs uppercase tracking-widest cursor-not-allowed rounded">
                          {statusLabel}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* --- ROOM GALLERY LIGHTBOX MODAL --- */}
      {galleryImages && galleryImages.length > 0 && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-95 p-4"
          onClick={() => setGalleryImages(null)}
        >
          {/* Close Button */}
          <button 
            className="absolute top-6 right-6 md:top-10 md:right-10 text-white hover:text-[#d4af37] transition-colors z-50"
            onClick={() => setGalleryImages(null)}
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Previous Button */}
          {galleryImages.length > 1 && (
            <button 
              className="absolute left-4 md:left-10 text-white hover:text-[#d4af37] transition-colors z-50 p-2"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
              }}
            >
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
          )}

          {/* Current Image */}
          <img 
            src={galleryImages[currentImageIndex]} 
            alt="Room Gallery" 
            className="max-w-full max-h-[85vh] object-contain rounded shadow-2xl border-2 border-gray-800"
            onClick={(e) => e.stopPropagation()} // Prevents clicking the image from closing the modal
          />

          {/* Next Button */}
          {galleryImages.length > 1 && (
            <button 
              className="absolute right-4 md:right-10 text-white hover:text-[#d4af37] transition-colors z-50 p-2"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
              }}
            >
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          )}

          {/* Image Counter */}
          {galleryImages.length > 1 && (
            <div className="absolute bottom-6 text-white text-sm font-bold tracking-widest uppercase bg-black/50 px-4 py-2 rounded">
              {currentImageIndex + 1} / {galleryImages.length}
            </div>
          )}
        </div>
      )}

      {/* Booking Modal */}
      {isBookingOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-[#fdfbf7] p-8 md:p-10 rounded-none max-w-2xl w-full shadow-2xl border-t-4 border-[#d4af37] max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-serif mb-2 text-gray-900">Reserve Your Stay</h2>
            <p className="text-[#d4af37] font-bold uppercase tracking-widest text-sm mb-8">{selectedRoom?.name}</p>
            <form onSubmit={submitBooking} className="space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name *"
                  className="w-full p-4 border border-gray-300 outline-none focus:border-[#d4af37] bg-white"
                  required
                  value={bookingForm.firstName}
                  onChange={(e) => setBookingForm({ ...bookingForm, firstName: e.target.value })}
                  disabled={isPaying}
                />
                <input
                  type="text"
                  placeholder="Last Name *"
                  className="w-full p-4 border border-gray-300 outline-none focus:border-[#d4af37] bg-white"
                  required
                  value={bookingForm.lastName}
                  onChange={(e) => setBookingForm({ ...bookingForm, lastName: e.target.value })}
                  disabled={isPaying}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="email"
                  placeholder="Email Address *"
                  className="w-full p-4 border border-gray-300 outline-none focus:border-[#d4af37] bg-white"
                  required
                  value={bookingForm.email}
                  onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                  disabled={isPaying}
                />
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  className="w-full p-4 border border-gray-300 outline-none focus:border-[#d4af37] bg-white"
                  required
                  value={bookingForm.phone}
                  onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                  disabled={isPaying}
                />
              </div>

              <input
                type="text"
                placeholder="Address *"
                className="w-full p-4 border border-gray-300 outline-none focus:border-[#d4af37] bg-white"
                required
                value={bookingForm.address}
                onChange={(e) => setBookingForm({ ...bookingForm, address: e.target.value })}
                disabled={isPaying}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Town / City *"
                  className="w-full p-4 border border-gray-300 outline-none focus:border-[#d4af37] bg-white"
                  required
                  value={bookingForm.city}
                  onChange={(e) => setBookingForm({ ...bookingForm, city: e.target.value })}
                  disabled={isPaying}
                />
                <input
                  type="text"
                  placeholder="State *"
                  className="w-full p-4 border border-gray-300 outline-none focus:border-[#d4af37] bg-white"
                  required
                  value={bookingForm.state}
                  onChange={(e) => setBookingForm({ ...bookingForm, state: e.target.value })}
                  disabled={isPaying}
                />
              </div>

              <select
                className="w-full p-4 border border-gray-300 outline-none focus:border-[#d4af37] bg-white"
                value={bookingForm.country}
                onChange={(e) => setBookingForm({ ...bookingForm, country: e.target.value })}
                disabled={isPaying}
              >
                <option value="">Select Country / Region</option>
                {countries.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Check-in</label>
                  <input
                    required
                    type="date"
                    className="w-full p-4 border border-gray-300 outline-none focus:border-[#d4af37] bg-white text-gray-700"
                    value={bookingForm.checkIn}
                    onChange={(e) => setBookingForm({ ...bookingForm, checkIn: e.target.value })}
                    disabled={isPaying}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Check-out</label>
                  <input
                    required
                    type="date"
                    className="w-full p-4 border border-gray-300 outline-none focus:border-[#d4af37] bg-white text-gray-700"
                    value={bookingForm.checkOut}
                    onChange={(e) => setBookingForm({ ...bookingForm, checkOut: e.target.value })}
                    disabled={isPaying}
                  />
                </div>
              </div>

              <textarea
                placeholder="Special Requests (Optional)"
                className="w-full p-4 border border-gray-300 outline-none focus:border-[#d4af37] bg-white h-24 resize-none"
                value={bookingForm.requests}
                onChange={(e) => setBookingForm({ ...bookingForm, requests: e.target.value })}
                disabled={isPaying}
              />

              <div className="mb-4">
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Payment Method</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="paystack"
                      checked={paymentMethod === 'paystack'}
                      onChange={() => setPaymentMethod('paystack')}
                      disabled={isPaying}
                    />
                    Paystack (Card/Bank)
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="opay"
                      checked={paymentMethod === 'opay'}
                      onChange={() => setPaymentMethod('opay')}
                      disabled={isPaying}
                    />
                    OPay (Wallet/Bank)
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsBookingOpen(false)}
                  className="px-6 py-3 text-gray-500 font-bold uppercase tracking-widest hover:text-gray-900 transition-colors"
                  disabled={isPaying}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPaying}
                  className="px-8 py-3 bg-[#d4af37] hover:bg-[#b5952f] text-black font-bold uppercase tracking-widest transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPaying
                    ? 'Processing...'
                    : `Pay with ${paymentMethod === 'paystack' ? 'Paystack' : 'OPay'} – ₦${Number(selectedRoom?.price_per_night || 0).toLocaleString()}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}