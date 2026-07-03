"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

export default function RoomDetailsPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [room, setRoom] = useState<any>(null);
  const [error, setError] = useState(false);

  // --- NEW: GALLERY STATE ---
  const [galleryImages, setGalleryImages] = useState<string[] | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    checkIn: '',
    checkOut: '',
    requests: '',
  });
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
    const fetchRoom = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/rooms/${slug}`);
        const result = await res.json();
        if (result.success && result.data) {
          setRoom(result.data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Failed to load room details", err);
        setError(true);
      }
    };
    if (slug && slug !== 'undefined') {
      fetchRoom();
    } else {
      setError(true);
    }
  }, [slug]);

  const isBookable = room?.status === 'available' || !room?.status;
  let statusMessage = '';
  if (room?.status === 'maintenance') statusMessage = 'Currently under maintenance';
  else if (room?.status === 'reserved') statusMessage = 'Currently reserved';
  else if (room?.status === 'occupied') statusMessage = 'Currently occupied';

  // Load Paystack script
  const loadPaystackScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && (window as any).PaystackPop) {
        resolve(true);
        return;
      }
      const existingScript = document.querySelector('script[src="https://js.paystack.co/v2/inline.js"]');
      if (existingScript) {
        const onLoad = () => {
          resolve(true);
          existingScript.removeEventListener('load', onLoad);
          existingScript.removeEventListener('error', onError);
        };
        const onError = () => {
          resolve(false);
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
    if (isSubmitting) return;
    if (!isBookable) {
      alert('This room is currently not available for booking.');
      return;
    }
    setIsSubmitting(true);
    try {
      const fullName = `${bookingForm.firstName} ${bookingForm.lastName}`.trim();

      const response = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email: bookingForm.email,
          phone: bookingForm.phone,
          address: bookingForm.address,
          city: bookingForm.city,
          state: bookingForm.state,
          country: bookingForm.country,
          checkIn: bookingForm.checkIn,
          checkOut: bookingForm.checkOut,
          requests: bookingForm.requests,
          suite: room.name,
          amount: room.price_per_night,
          status: "pending",
        }),
      });
      if (!response.ok) {
        alert("Failed to save reservation. Please try again.");
        setIsSubmitting(false);
        return;
      }
      const bookingData = await response.json();
      const bookingId = bookingData.id || bookingData.booking_id;
      if (!bookingId) {
        console.error("No booking ID returned from backend", bookingData);
        alert("Booking saved but no ID returned. Please contact support.");
        setIsSubmitting(false);
        return;
      }

      if (paymentMethod === 'paystack') {
        const loaded = await loadPaystackScript();
        if (!loaded || !(window as any).PaystackPop) {
          alert('Payment service unavailable. Please try OPay or refresh.');
          setIsSubmitting(false);
          return;
        }

        const paystack = new (window as any).PaystackPop();
        const amountInKobo = Math.round(room.price_per_night * 100);

        paystack.newTransaction({
          key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
          email: bookingForm.email,
          amount: amountInKobo,
          currency: 'NGN',
          channels: ['card', 'bank_transfer'],
          metadata: {
            booking_id: bookingId,
            room_name: room.name,
            guest_name: fullName,
            check_in: bookingForm.checkIn,
            check_out: bookingForm.checkOut,
          },
          onSuccess: async (tx: any) => {
            console.log('✅ Payment success, verifying...', tx);
            try {
              await fetch(`http://localhost:5000/api/payments/verify/${tx.reference}`);
              console.log('✅ Verification done, redirecting...');
            } catch (err) {
              console.error('Verification failed:', err);
            }
            router.push(`/booking-confirmation?booking_id=${bookingId}&ref=${tx.reference}`);
          },
          onCancel: () => {
            alert("Payment was cancelled. Your booking is saved and you can pay later.");
            router.push('/payment-info?booking_id=' + bookingId);
            setIsSubmitting(false);
          },
          onError: (err: any) => {
            console.error('Paystack error:', err);
            alert('Payment error: ' + (err.message || 'Unknown error'));
            setIsSubmitting(false);
          },
        });
      } else {
        // OPay
        const opayRes = await fetch("http://localhost:5000/api/payments/initialize-opay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: bookingForm.email,
            amount: room.price_per_night,
            bookingId: bookingId,
            fullName: fullName,
          }),
        });
        const opayData = await opayRes.json();
        if (opayData.success && opayData.authorization_url) {
          window.location.href = opayData.authorization_url;
        } else {
          alert("OPay initialization failed: " + (opayData.message || "unknown error"));
          setIsSubmitting(false);
          return;
        }
      }
      setIsBookingOpen(false);
      setIsSubmitting(false);
    } catch (err) {
      console.error("Booking error:", err);
      alert("Network error. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (error) return <div className="min-h-screen pt-40 text-center text-2xl text-red-500 font-serif">Suite not found.</div>;
  if (!room) return <div className="min-h-screen pt-40 text-center text-xl text-gray-500 font-serif">Loading luxury experience...</div>;

  // --- UPDATED: Image Parsing for Gallery ---
  let imagesArray = [];
  if (Array.isArray(room.images)) imagesArray = room.images;
  else if (typeof room.images === 'string') {
    try { imagesArray = JSON.parse(room.images); } 
    catch { imagesArray = [room.images]; }
  }

  // Ensure all images have the correct base URL
  const fullImages = imagesArray.map((img: string) => {
    if (img && !img.startsWith('http')) return `http://localhost:5000${img}`;
    return img;
  }).filter(Boolean);

  const mainImage = fullImages.length > 0 ? fullImages[0] : '/placeholder.jpg';

  const bedCount = room.beds || 1;
  const wifi = room.wifi === 1 || room.wifi === true;
  const maxGuests = room.max_guests || 2;

  return (
    <div className="min-h-screen bg-[#fdfbf7] pt-32 pb-20 relative">
      <div className="max-w-5xl mx-auto px-6">
        <Link href="/rooms" className="text-[#d4af37] font-bold hover:text-black transition-colors mb-6 inline-block">
          ← Back to All Suites
        </Link>

        <div className="bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-100">
          
          {/* --- INTERACTIVE HERO IMAGE --- */}
          <div 
            className={`relative ${fullImages.length > 0 ? 'cursor-pointer group' : ''}`}
            onClick={() => {
              if (fullImages.length > 0) {
                setGalleryImages(fullImages);
                setCurrentImageIndex(0);
              }
            }}
          >
            <img 
              src={mainImage} 
              alt={room.name} 
              className="w-full h-[500px] object-cover transition-transform duration-700 group-hover:scale-105" 
            />
            
            {/* Gallery Indicator Overlay */}
            {fullImages.length > 1 && (
              <div className="absolute bottom-6 right-6 bg-black/70 text-white text-sm font-bold px-4 py-2 rounded shadow-lg flex items-center gap-2 group-hover:bg-black transition-colors z-10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                View all {fullImages.length} photos
              </div>
            )}
          </div>

          <div className="p-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b pb-6">
              <h1 className="text-5xl font-serif text-gray-900 mb-4 md:mb-0">{room.name}</h1>
              <div className="text-left md:text-right">
                <p className="text-3xl font-bold text-gray-900">₦{Number(room.price_per_night).toLocaleString()}</p>
                <p className="text-gray-500 uppercase tracking-wider text-sm font-bold">Per Night</p>
              </div>
            </div>

            <div className="mb-10">
              <h3 className="text-xl font-bold mb-4 uppercase tracking-widest text-gray-400">Suite Overview</h3>
              <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">{room.description}</p>
            </div>

            <div className="mb-10 flex flex-wrap gap-4">
              <div className="bg-gray-50 p-4 rounded border">
                <span className="block text-xs text-gray-500 font-bold uppercase mb-1">Beds</span>
                <span className="font-bold text-lg text-gray-900">🛏️ {bedCount} Bed{bedCount !== 1 ? 's' : ''}</span>
              </div>
              {wifi && (
                <div className="bg-gray-50 p-4 rounded border">
                  <span className="block text-xs text-gray-500 font-bold uppercase mb-1">Connectivity</span>
                  <span className="font-bold text-lg text-gray-900">📶 Free Wi-Fi</span>
                </div>
              )}
              <div className="bg-gray-50 p-4 rounded border">
                <span className="block text-xs text-gray-500 font-bold uppercase mb-1">Max Capacity</span>
                <span className="font-bold text-lg text-gray-900">👥 {maxGuests} Guest{maxGuests !== 1 ? 's' : ''}</span>
              </div>
            </div>

            <div className="pt-8 text-center bg-gray-50 -mx-10 -mb-10 p-10 border-t">
              {isBookable ? (
                <button
                  onClick={() => setIsBookingOpen(true)}
                  className="bg-[#d4af37] text-black font-bold uppercase tracking-widest px-12 py-4 rounded shadow-lg hover:bg-[#b5952f] transition-colors text-lg w-full md:w-auto"
                >
                  Continue to Reservation
                </button>
              ) : (
                <div className="text-center">
                  <p className="text-red-600 font-bold text-lg mb-1">This suite is {statusMessage}</p>
                  <p className="text-sm text-gray-500 mb-3">We apologize for the inconvenience.</p>
                  <Link href="/rooms" className="text-[#d4af37] hover:underline font-bold">
                    View other available suites
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Current Image */}
          <img 
            src={galleryImages[currentImageIndex]} 
            alt={`Room Image ${currentImageIndex + 1}`} 
            className="max-w-full max-h-[85vh] object-contain rounded shadow-2xl border-2 border-gray-800"
            onClick={(e) => e.stopPropagation()} 
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
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
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
      {isBookingOpen && isBookable && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-[#fdfbf7] p-8 md:p-10 rounded-none max-w-2xl w-full shadow-2xl border-t-4 border-[#d4af37] max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-serif mb-2 text-gray-900">Reserve Your Stay</h2>
            <p className="text-[#d4af37] font-bold uppercase tracking-widest text-sm mb-8">{room.name}</p>
            <form onSubmit={submitBooking} className="space-y-5">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name *"
                  className="w-full p-4 border border-gray-300 outline-none focus:border-[#d4af37] bg-white"
                  required
                  value={bookingForm.firstName}
                  onChange={(e) => setBookingForm({ ...bookingForm, firstName: e.target.value })}
                  disabled={isSubmitting}
                />
                <input
                  type="text"
                  placeholder="Last Name *"
                  className="w-full p-4 border border-gray-300 outline-none focus:border-[#d4af37] bg-white"
                  required
                  value={bookingForm.lastName}
                  onChange={(e) => setBookingForm({ ...bookingForm, lastName: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="email"
                  placeholder="Email Address *"
                  className="w-full p-4 border border-gray-300 outline-none focus:border-[#d4af37] bg-white"
                  required
                  value={bookingForm.email}
                  onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                  disabled={isSubmitting}
                />
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  className="w-full p-4 border border-gray-300 outline-none focus:border-[#d4af37] bg-white"
                  required
                  value={bookingForm.phone}
                  onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>

              {/* Address */}
              <input
                type="text"
                placeholder="Address *"
                className="w-full p-4 border border-gray-300 outline-none focus:border-[#d4af37] bg-white"
                required
                value={bookingForm.address}
                onChange={(e) => setBookingForm({ ...bookingForm, address: e.target.value })}
                disabled={isSubmitting}
              />

              {/* City & State */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Town / City *"
                  className="w-full p-4 border border-gray-300 outline-none focus:border-[#d4af37] bg-white"
                  required
                  value={bookingForm.city}
                  onChange={(e) => setBookingForm({ ...bookingForm, city: e.target.value })}
                  disabled={isSubmitting}
                />
                <input
                  type="text"
                  placeholder="State *"
                  className="w-full p-4 border border-gray-300 outline-none focus:border-[#d4af37] bg-white"
                  required
                  value={bookingForm.state}
                  onChange={(e) => setBookingForm({ ...bookingForm, state: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>

              {/* Country */}
              <select
                className="w-full p-4 border border-gray-300 outline-none focus:border-[#d4af37] bg-white"
                value={bookingForm.country}
                onChange={(e) => setBookingForm({ ...bookingForm, country: e.target.value })}
                disabled={isSubmitting}
              >
                <option value="">Select Country / Region</option>
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* Check-in / Check-out */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Check-in</label>
                  <input
                    required
                    type="date"
                    className="w-full p-4 border border-gray-300 outline-none focus:border-[#d4af37] bg-white text-gray-700"
                    value={bookingForm.checkIn}
                    onChange={(e) => setBookingForm({ ...bookingForm, checkIn: e.target.value })}
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Special Requests */}
              <textarea
                placeholder="Special Requests (Optional)"
                className="w-full p-4 border border-gray-300 outline-none focus:border-[#d4af37] bg-white h-24 resize-none"
                value={bookingForm.requests}
                onChange={(e) => setBookingForm({ ...bookingForm, requests: e.target.value })}
                disabled={isSubmitting}
              />

              {/* Payment Method */}
              <div className="mb-4">
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Payment Method</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="paystack"
                      checked={paymentMethod === 'paystack'}
                      onChange={() => setPaymentMethod('paystack')}
                      disabled={isSubmitting}
                    />
                    Paystack (Card/Bank)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="opay"
                      checked={paymentMethod === 'opay'}
                      onChange={() => setPaymentMethod('opay')}
                      disabled={isSubmitting}
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
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-8 py-3 bg-[#d4af37] hover:bg-[#b5952f] text-black font-bold uppercase tracking-widest transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isSubmitting
                    ? 'Processing...'
                    : `Pay with ${paymentMethod === 'paystack' ? 'Paystack' : 'OPay'} – ₦${room.price_per_night.toLocaleString()}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}