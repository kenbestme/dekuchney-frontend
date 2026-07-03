"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// 1. Create an inner component that uses the searchParams
function BookingConfirmationContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking_id');
  const reference = searchParams.get('ref');

  return (
    <div className="max-w-2xl mx-auto text-center bg-white p-8 md:p-12 shadow-lg border-t-4 border-[#d4af37]">
      <div className="text-6xl mb-6">✅</div>
      <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">Payment Successful!</h1>
      <p className="text-gray-600 mb-6">
        Thank you for choosing De Kuchney Villa. Your booking has been confirmed.
      </p>
      <div className="bg-gray-50 p-4 rounded mb-6 text-left">
        <p><strong>Booking ID:</strong> {bookingId || 'N/A'}</p>
        <p><strong>Transaction Reference:</strong> {reference || 'N/A'}</p>
        <p className="mt-2 text-sm text-gray-500">A confirmation email has been sent to your inbox.</p>
      </div>
      <Link
        href="/"
        className="inline-block bg-[#d4af37] text-black px-8 py-3 uppercase tracking-widest font-bold hover:bg-[#b5952f] transition"
      >
        Return to Home
      </Link>
    </div>
  );
}

// 2. Wrap it in a Suspense boundary in the main export
export default function BookingConfirmationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] py-12 px-4">
      <Suspense fallback={
        <div className="text-center p-8 bg-white shadow-lg border-t-4 border-[#d4af37] max-w-2xl mx-auto w-full">
          Loading your confirmation details...
        </div>
      }>
        <BookingConfirmationContent />
      </Suspense>
    </div>
  );
}