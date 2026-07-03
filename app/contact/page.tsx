"use client";

import { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    inquiryType: 'general',
    message: ''
  });
  const [status, setStatus] = useState({ loading: false, success: false, error: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: false });

    try {
      const response = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus({ loading: false, success: true, error: false });
        setFormData({
          name: '', email: '', phone: '', subject: '', inquiryType: 'general', message: ''
        });
        setTimeout(() => setStatus(prev => ({ ...prev, success: false })), 5000);
      } else {
        throw new Error("Failed to send message");
      }
    } catch (err) {
      console.error("Contact form error:", err);
      setStatus({ loading: false, success: false, error: true });
    }
  };

  return (
    <div className="flex flex-col bg-[#fdfbf7] min-h-screen">
      
      {/* Hero Banner – Responsive Height & Typography */}
      <section className="relative w-full h-[60vh] md:h-[80vh] min-h-[400px] md:min-h-[600px] flex items-center justify-center overflow-hidden bg-gray-900">
        {/* Background Image */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/contact-hero.jpg')" }}
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60 z-10" />
        {/* Decorative Gold Accent */}
        <div className="absolute inset-0 opacity-10 z-10" style={{ background: 'radial-gradient(circle at 30% 50%, #d4af37, transparent 70%)' }} />
        
        {/* Content */}
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto mt-12 md:mt-0">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-4">
            <span className="w-8 md:w-12 h-[2px] bg-[#d4af37]"></span>
            <span className="text-[#d4af37] tracking-[0.2em] md:tracking-[0.3em] uppercase text-xs md:text-sm font-semibold">Get in Touch</span>
            <span className="w-8 md:w-12 h-[2px] bg-[#d4af37]"></span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-white mb-4 drop-shadow-2xl">
            Contact Us
          </h1>
          <p className="text-[#d4af37] font-bold tracking-[0.15em] md:tracking-[0.3em] uppercase text-xs sm:text-sm md:text-base drop-shadow-lg">
            We are here to assist you
          </p>
          <div className="w-16 md:w-20 h-1 bg-[#d4af37] mx-auto mt-6"></div>
        </div>

        {/* Bottom Gold Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-10 h-1.5 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
      </section>

      {/* Contact Content */}
      <section className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          
          {/* Left Side: Image & Info */}
          <div className="space-y-8">
            <div className="hidden lg:block h-[350px] relative shadow-xl overflow-hidden bg-gray-200">
              <img src="/images/contact-side.jpg" alt="De Kuchney Villa Contact" className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </div>
            
            <div className="bg-white p-6 md:p-8 shadow-lg border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-[#d4af37] m-2 opacity-50"></div>
              <h3 className="text-2xl font-serif mb-6 text-gray-900">Hotel Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1 bg-gray-50 p-3 rounded-full text-[#d4af37]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 uppercase tracking-widest text-xs mb-1">Address</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">No 3, Amaobi Uwaleke Street, Cadastral, Zone F01, Dushepe 901101, Federal Capital Territory, Nigeria</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-1 bg-gray-50 p-3 rounded-full text-[#d4af37]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 uppercase tracking-widest text-xs mb-1">Phone</h4>
                    <p className="text-gray-600 text-sm">+234 (913) 149-0624</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-1 bg-gray-50 p-3 rounded-full text-[#d4af37]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 uppercase tracking-widest text-xs mb-1">Email</h4>
                    <p className="text-gray-600 text-sm break-all">reservations@dekuchneyvilla.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-1 bg-[#25D366]/10 p-3 rounded-full text-[#25D366]">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 uppercase tracking-widest text-xs mb-1">WhatsApp</h4>
                    <p className="text-gray-600 text-sm">+234 (913) 149-0624</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Enhanced Form */}
          <div className="bg-white p-6 md:p-10 shadow-xl border border-gray-100">
            <h3 className="text-2xl md:text-3xl font-serif mb-2 text-gray-900">Send a Message</h3>
            <p className="text-sm text-gray-500 mb-8">Have a question or need assistance? Fill out the form below.</p>
            
            {status.success && (
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm font-bold shadow-sm">
                Thank you! Your message has been sent successfully. We will get back to you shortly.
              </div>
            )}
            
            {status.error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold shadow-sm">
                Something went wrong. Please try again later or call us directly.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <input 
                    type="text" 
                    placeholder="Your Name *" 
                    className="w-full p-4 border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition-all text-sm" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <input 
                    type="email" 
                    placeholder="Your Email *" 
                    className="w-full p-4 border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition-all text-sm" 
                    required 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <input 
                    type="tel" 
                    placeholder="Phone Number (optional)" 
                    className="w-full p-4 border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition-all text-sm" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <input 
                    type="text" 
                    placeholder="Subject" 
                    className="w-full p-4 border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition-all text-sm" 
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <select 
                  className="w-full p-4 border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition-all text-sm text-gray-700"
                  value={formData.inquiryType}
                  onChange={(e) => setFormData({...formData, inquiryType: e.target.value})}
                >
                  <option value="general">General Inquiry</option>
                  <option value="reservation">Reservation / Booking</option>
                  <option value="group">Group Booking</option>
                  <option value="event">Wedding / Event</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <textarea 
                  placeholder="Your Message *" 
                  className="w-full p-4 border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition-all h-36 resize-none text-sm" 
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                disabled={status.loading}
                className="w-full bg-[#d4af37] text-black font-bold py-4 uppercase tracking-widest hover:bg-[#b5952f] hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status.loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Google Map Section */}
      <section className="pb-12 md:pb-20 px-4 w-full">
        <div className="max-w-7xl mx-auto shadow-xl h-[300px] md:h-[450px] w-full rounded-sm overflow-hidden border border-gray-200">
          <iframe 
            src="https://maps.google.com/maps?q=De+Kuchney+Villa,+Zone+F01,+Abuja,+Nigeria&t=&z=16&ie=UTF8&iwloc=&output=embed" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen 
            loading="lazy"
            title="De Kuchney Villa Location"
          ></iframe>
        </div>
      </section>

    </div>
  );
}