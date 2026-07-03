"use client";

import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#fdfbf7] py-24 px-4">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 shadow-lg border-t-4 border-[#d4af37]">
        <h1 className="text-4xl font-serif text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-gray-500 text-sm mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p>
            Welcome to De Kuchney Villa (“we”, “our”, “us”). By accessing our website, making a reservation, or using our services, you agree to be bound by these Terms of Service (“Terms”). Please read them carefully.
          </p>

          <h2 className="text-2xl font-serif text-gray-900 pt-4">1. Reservations & Booking</h2>
          <p>
            All room reservations are subject to availability. A booking is confirmed only after you receive a confirmation email from us. You must provide accurate, complete, and up‑to‑date information when making a reservation.
          </p>
          <p>
            Check‑in time is from 14:00 (2 PM) and check‑out time is before 11:00 AM. Early check‑in or late check‑out may be available upon request and may incur additional charges.
          </p>

          <h2 className="text-2xl font-serif text-gray-900 pt-4">2. Payment</h2>
          <p>
            Payments are processed securely through <strong>Paystack</strong> (card & bank transfer) and <strong>OPay</strong> (wallet & bank transfer). Full payment is required at the time of booking unless otherwise agreed in writing.
          </p>
          <p>
            All prices are quoted in Nigerian Naira (₦) and include applicable taxes unless stated otherwise. Currency conversion fees, if any, are the responsibility of the guest.
          </p>

          <h2 className="text-2xl font-serif text-gray-900 pt-4">3. Cancellation & Refund Policy</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Free cancellation:</strong> Up to 7 days before check‑in – full refund.</li>
            <li><strong>Late cancellation (3–6 days before check‑in):</strong> 50% refund.</li>
            <li><strong>No‑show or cancellation less than 48 hours before check‑in:</strong> no refund.</li>
            <li>Refunds are processed to the original payment method within 5–10 business days.</li>
          </ul>
          <p>To cancel or modify a reservation, please contact us immediately at <a href="mailto:reservations@dekuchneyvilla.com" className="text-[#d4af37] hover:underline">reservations@dekuchneyvilla.com</a>.</p>

          <h2 className="text-2xl font-serif text-gray-900 pt-4">4. Guest Responsibilities</h2>
          <p>
            You agree to:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Comply with all hotel policies, including noise regulations and non‑smoking rules.</li>
            <li>Not host parties or events without prior written consent.</li>
            <li>Not damage property – you will be liable for any repair or replacement costs.</li>
            <li>Provide valid government‑issued identification upon check‑in.</li>
          </ul>

          <h2 className="text-2xl font-serif text-gray-900 pt-4">5. Liability</h2>
          <p>
            De Kuchney Villa is not liable for:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Loss, theft, or damage to personal belongings – we recommend using the in‑room safe.</li>
            <li>Personal injury unless caused by our gross negligence.</li>
            <li>Service interruptions due to force majeure (e.g., natural disasters, strikes, government actions).</li>
          </ul>
          <p>Our total liability shall not exceed the amount paid for the reservation.</p>

          <h2 className="text-2xl font-serif text-gray-900 pt-4">6. Intellectual Property</h2>
          <p>
            All content on this website (text, images, logos, videos) is the property of De Kuchney Villa or its licensors and is protected by copyright laws. You may not reproduce, distribute, or commercially exploit any content without our written permission.
          </p>

          <h2 className="text-2xl font-serif text-gray-900 pt-4">7. Prohibited Activities</h2>
          <p>You may not:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Use our website for any unlawful purpose.</li>
            <li>Attempt to bypass security measures or disrupt server operations.</li>
            <li>Submit false or misleading information.</li>
          </ul>

          <h2 className="text-2xl font-serif text-gray-900 pt-4">8. Changes to Terms</h2>
          <p>
            We reserve the right to update these Terms at any time. Changes become effective immediately upon posting. Your continued use of our services after changes constitutes acceptance of the new Terms.
          </p>

          <h2 className="text-2xl font-serif text-gray-900 pt-4">9. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any disputes shall be resolved exclusively in the courts of Abuja, Nigeria.
          </p>

          <h2 className="text-2xl font-serif text-gray-900 pt-4">10. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
          </p>
          <address className="not-italic mt-2">
            De Kuchney Villa<br />
            Zone F01, Abuja, Nigeria<br />
            Email: <a href="mailto:legal@dekuchneyvilla.com" className="text-[#d4af37] hover:underline">legal@dekuchneyvilla.com</a><br />
            Phone: +234 (913) 149-0624
          </address>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200 text-center">
          <Link href="/" className="text-[#d4af37] hover:underline">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}