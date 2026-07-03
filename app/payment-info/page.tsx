'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface BookingDetails {
  id: string;
  fullName: string;
  email: string;
  suite: string;
  checkIn: string;
  checkOut: string;
  amount: number;
}

// 1. Separate component that uses useSearchParams
function PaymentInfoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get('booking_id');

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  // Fetch booking details from backend
  useEffect(() => {
    if (!bookingId) {
      setLoading(false);
      return;
    }

    const fetchBooking = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}`);
        if (!res.ok) throw new Error('Booking not found');
        const data = await res.json();
        setBooking(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const handlePayWithPaystack = () => {
    if (!booking) return;
    setPaying(true);

    // DYNAMIC IMPORT: Prevents "window is not defined" error during Next.js build
    const PaystackPop = require('@paystack/inline-js');
    
    const paystack = new PaystackPop();
    paystack.newTransaction({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
      email: booking.email,
      amount: booking.amount * 100, // in kobo
      currency: 'NGN',
      channels: ['card', 'bank_transfer'], // Two payment methods
      metadata: {
        booking_id: booking.id,
        room_name: booking.suite,
        guest_name: booking.fullName,
      },
      onSuccess: (transaction: any) => {
        // Redirect to confirmation page after success
        router.push(`/booking-confirmation?booking_id=${booking.id}&ref=${transaction.reference}`);
      },
      onCancel: () => {
        alert('Payment cancelled. You can try again.');
        setPaying(false);
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#d4af37]"></div>
      </div>
    );
  }

  if (!bookingId || !booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdfbf7] px-4">
        <h1 className="text-3xl font-serif mb-4">No Booking Found</h1>
        <p className="text-gray-600 mb-6">Please go back and complete your reservation first.</p>
        <button
          onClick={() => router.push('/rooms')}
          className="bg-[#d4af37] text-black px-6 py-3 uppercase tracking-widest font-bold"
        >
          Back to Rooms
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-serif text-gray-900 mb-2">Complete Your Payment</h1>
          <p className="text-gray-600">Secure your stay at De Kuchney Villa</p>
        </div>

        {/* Booking Summary */}
        <div className="bg-white shadow-lg border border-gray-100 p-6 mb-8">
          <h2 className="text-2xl font-serif border-b pb-3 mb-4">Booking Summary</h2>
          <div className="space-y-2 text-gray-700">
            <p><strong>Guest:</strong> {booking.fullName}</p>
            <p><strong>Email:</strong> {booking.email}</p>
            <p><strong>Suite:</strong> {booking.suite}</p>
            <p><strong>Check-in:</strong> {new Date(booking.checkIn).toDateString()}</p>
            <p><strong>Check-out:</strong> {new Date(booking.checkOut).toDateString()}</p>
            <p className="text-2xl font-bold text-[#d4af37] pt-2">Total: ₦{booking.amount.toLocaleString()}</p>
          </div>
        </div>

        {/* Paystack Card & Bank Transfer Option */}
        <div className="bg-white shadow-lg border border-gray-100 p-6 mb-8">
          <h2 className="text-2xl font-serif border-b pb-3 mb-4">Pay Online (Instant)</h2>
          <p className="text-gray-600 mb-6">Pay securely with your card or bank transfer using Paystack.</p>
          <button
            onClick={handlePayWithPaystack}
            disabled={paying}
            className="w-full bg-[#d4af37] hover:bg-[#b5952f] text-black font-bold py-4 uppercase tracking-widest transition disabled:opacity-50"
          >
            {paying ? 'Processing...' : `Pay ₦${booking.amount.toLocaleString()} with Card / Bank Transfer`}
          </button>
        </div>

        {/* Manual Bank Transfer Details (Fallback) */}
        <div className="bg-white shadow-lg border border-gray-100 p-6">
          <h2 className="text-2xl font-serif border-b pb-3 mb-4">Direct Bank Transfer</h2>
          <p className="text-gray-600 mb-4">If you prefer to pay via direct bank transfer, use the details below:</p>
          <div className="bg-gray-50 p-4 rounded space-y-2">
            <p><strong>Bank Name:</strong> [Your Bank Name]</p>
            <p><strong>Account Name:</strong> De Kuchney Villa</p>
            <p><strong>Account Number:</strong> [Your Account Number]</p>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            After transfer, please send proof of payment to <strong>+234 XXX XXX XXXX</strong> (WhatsApp) or <strong>reservations@dekuchney.com</strong>. Your booking will be confirmed within 1 hour.
          </p>
          <button
            onClick={() => router.push('/')}
            className="mt-6 w-full border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-bold py-3 uppercase tracking-widest transition"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}

// 2. Wrap it with Suspense in the default export
export default function PaymentInfo() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#d4af37]"></div>
      </div>
    }>
      <PaymentInfoContent />
    </Suspense>
  );
}