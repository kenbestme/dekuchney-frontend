"use client";

import { useState, useEffect } from 'react';

export default function CheckoutPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    checkIn: "",
    checkOut: "",
    suite: "", // This will now fill automatically!
    requests: ""
  });

  // --- THE AUTOMATIC UPGRADE ---
  // This runs the moment the page loads to read the URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const autoSuite = params.get('suite');
    
    if (autoSuite) {
      setFormData(prev => ({ ...prev, suite: autoSuite }));
    }
  }, []);
  // -----------------------------

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Live price calculation based on real rooms
  const getRoomPrice = () => {
    if (formData.suite === 'standard') return 50000;
    if (formData.suite === 'classic') return 75000;
    if (formData.suite === 'royal') return 150000;
    return 0;
  };

  const currentPrice = getRoomPrice();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.checkIn || !formData.checkOut || !formData.suite) {
      alert("Please fill out all the fields and select a suite before paying.");
      return;
    }

    try {
      // 1. SAVE TO DATABASE
      const bookingResponse = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!bookingResponse.ok) {
        alert("Failed to save reservation in database. Check backend terminal.");
        return; 
      }

      // 2. CONNECT TO PAYSTACK
      const paymentResponse = await fetch("http://localhost:5000/api/payment/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: formData.email, 
          amount: currentPrice, 
          bookingId: Date.now() 
        }),
      });

      const paymentData = await paymentResponse.json();

      // 3. REDIRECT TO PAYSTACK
      if (paymentData.success) {
        window.location.href = paymentData.authorization_url;
      } else {
        alert("Booking saved, but payment failed. Reason: " + paymentData.message);
      }

    } catch (error) {
      console.error("Connection error:", error);
      alert("Could not connect to the server. Is the backend running?");
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50 py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4">Checkout & Payment</h1>
          <div className="w-24 h-1 bg-amber-600 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">
            Complete your reservation securely below.
          </p>
        </div>

        <div className="bg-white shadow-xl p-8 md:p-12 border-t-4 border-amber-600">
          <form className="space-y-8" onSubmit={handleSubmit}>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 uppercase tracking-wider mb-2">Full Name</label>
                <input 
                  type="text" 
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full border-b-2 border-gray-300 py-2 focus:outline-none focus:border-amber-600 transition-colors bg-transparent"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 uppercase tracking-wider mb-2">Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border-b-2 border-gray-300 py-2 focus:outline-none focus:border-amber-600 transition-colors bg-transparent"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 uppercase tracking-wider mb-2">Check-in Date</label>
                <input 
                  type="date" 
                  name="checkIn"
                  value={formData.checkIn}
                  onChange={handleChange}
                  className="w-full border-b-2 border-gray-300 py-2 focus:outline-none focus:border-amber-600 transition-colors bg-transparent text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 uppercase tracking-wider mb-2">Check-out Date</label>
                <input 
                  type="date" 
                  name="checkOut"
                  value={formData.checkOut}
                  onChange={handleChange}
                  className="w-full border-b-2 border-gray-300 py-2 focus:outline-none focus:border-amber-600 transition-colors bg-transparent text-gray-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 uppercase tracking-wider mb-2">Selected Suite</label>
              <select 
                name="suite"
                value={formData.suite}
                onChange={handleChange}
                className="w-full border-b-2 border-gray-300 py-2 focus:outline-none focus:border-amber-600 transition-colors bg-transparent text-gray-900 font-semibold cursor-pointer bg-gray-50"
              >
                <option value="">Choose a room...</option>
                <option value="standard">Standard Room (₦50,000)</option>
                <option value="classic">Classic Suite (₦75,000)</option>
                <option value="royal">Royal Villa (₦150,000)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 uppercase tracking-wider mb-2">Special Requests</label>
              <textarea 
                name="requests"
                value={formData.requests}
                onChange={handleChange}
                rows={4}
                className="w-full border-b-2 border-gray-300 py-2 focus:outline-none focus:border-amber-600 transition-colors bg-transparent resize-none"
                placeholder="Any special accommodations or requests?"
              ></textarea>
            </div>

            {/* LIVE PRICE DISPLAY */}
            {currentPrice > 0 && (
              <div className="py-6 border-t border-b border-gray-200 mt-8 mb-4 text-center bg-gray-50 rounded-lg">
                <span className="text-gray-500 uppercase tracking-widest text-xs font-bold">Total Due Today</span>
                <div className="text-4xl font-serif text-gray-900 mt-2">
                  ₦{currentPrice.toLocaleString()}
                </div>
              </div>
            )}

            <div className="pt-2">
              <button 
                type="submit" 
                className="w-full bg-gray-900 hover:bg-amber-700 text-white font-semibold tracking-widest uppercase py-5 transition-colors shadow-lg"
              >
                {currentPrice > 0 ? `Pay ₦${currentPrice.toLocaleString()}` : 'Pay Now'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </main>
  );
}