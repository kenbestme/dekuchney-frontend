"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ✅ Dynamic Live API URL
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://api.dekuchneyvilla.com';

export default function AdminSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    whatsapp_number: '',
    telegram_username: '',
    is_whatsapp_active: 1,
    is_telegram_active: 1
  });

  // ✅ Safe token retrieval
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || localStorage.getItem('hotel_admin_token');
    }
    return null;
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/admin/login");
      return;
    }

    // ✅ Using dynamic API and secure headers
    fetch(`${API_BASE}/api/settings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => {
        setSettings({
          whatsapp_number: data.whatsapp_number || '',
          telegram_username: data.telegram_username || '',
          is_whatsapp_active: data.is_whatsapp_active ?? 1,
          is_telegram_active: data.is_telegram_active ?? 1
        });
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load settings:", err);
        setLoading(false);
      });
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const token = getToken();
    
    try {
      const res = await fetch(`${API_BASE}/api/settings`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}` // ✅ Fixed missing auth header
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        alert('✅ Settings saved successfully!');
      } else {
        alert('❌ Failed to save settings. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving settings. Please check your internet connection.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("hotel_admin_token");
    router.push("/admin/login");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#d4af37]"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      
      {/* --- RESPONSIVE TOP NAVIGATION BAR --- */}
      <nav className="bg-gray-900 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
          <div className="text-center md:text-left w-full md:w-auto">
            <h1 className="text-xl md:text-2xl font-serif text-[#d4af37]">De Kuchney Villa</h1>
            <p className="text-xs text-gray-400 uppercase tracking-widest">System Settings</p>
          </div>
          
          <div className="flex items-center text-xs md:text-sm font-bold tracking-wider uppercase space-x-6 overflow-x-auto whitespace-nowrap pb-2 md:pb-0 w-full md:w-auto hide-scrollbar snap-x">
            <Link href="/admin/dashboard" className="text-gray-300 hover:text-white transition-colors snap-start">Dashboard</Link>
            <Link href="/admin/reception" className="text-gray-300 hover:text-white transition-colors snap-start">Reception</Link>
            <Link href="/admin/rooms" className="text-gray-300 hover:text-white transition-colors snap-start">Rooms</Link>
            <Link href="/admin/gallery" className="text-gray-300 hover:text-white transition-colors snap-start">Gallery</Link>
            <Link href="/admin/reviews" className="text-gray-300 hover:text-white transition-colors snap-start">Reviews</Link>
            <Link href="/admin/communications" className="text-gray-300 hover:text-white transition-colors snap-start">Comms</Link>
            
            {/* Active Tab */}
            <span className="text-[#d4af37] border-b-2 border-[#d4af37] pb-1 cursor-default snap-start">Settings</span>
            
            <button onClick={handleLogout} className="bg-gray-800 hover:bg-red-600 px-4 py-2 rounded transition-colors border border-gray-700 ml-2 snap-start">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* --- MAIN SETTINGS CONTENT --- */}
      <div className="p-4 sm:p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6 sm:p-8 border border-gray-200">
          <h2 className="text-2xl sm:text-3xl font-serif text-gray-900 mb-8 border-b border-gray-100 pb-4">Contact & Chat Settings</h2>
          
          <form onSubmit={handleSave} className="space-y-6 sm:space-y-8">
            
            {/* WhatsApp Settings */}
            <div className="bg-gray-50 p-5 sm:p-6 rounded-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-[#25D366]">WhatsApp</span> Configuration
                </h3>
                
                {/* WhatsApp Toggle Switch */}
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={settings.is_whatsapp_active === 1}
                      onChange={(e) => setSettings({...settings, is_whatsapp_active: e.target.checked ? 1 : 0})}
                    />
                    <div className={`block w-14 h-8 rounded-full transition-colors ${settings.is_whatsapp_active === 1 ? 'bg-[#25D366]' : 'bg-gray-300'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${settings.is_whatsapp_active === 1 ? 'transform translate-x-6' : ''}`}></div>
                  </div>
                  <span className="ml-3 text-sm font-bold text-gray-700 uppercase">
                    {settings.is_whatsapp_active === 1 ? 'Active' : 'Hidden'}
                  </span>
                </label>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-500 uppercase mb-2">WhatsApp Number (include country code)</label>
                <input 
                  type="text" 
                  placeholder="e.g. 2349131490624" 
                  className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                  value={settings.whatsapp_number}
                  onChange={(e) => setSettings({...settings, whatsapp_number: e.target.value})}
                />
              </div>
            </div>

            {/* Telegram Settings */}
            <div className="bg-gray-50 p-5 sm:p-6 rounded-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-[#0088cc]">Telegram</span> Configuration
                </h3>
                
                {/* Telegram Toggle Switch */}
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={settings.is_telegram_active === 1}
                      onChange={(e) => setSettings({...settings, is_telegram_active: e.target.checked ? 1 : 0})}
                    />
                    <div className={`block w-14 h-8 rounded-full transition-colors ${settings.is_telegram_active === 1 ? 'bg-[#0088cc]' : 'bg-gray-300'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${settings.is_telegram_active === 1 ? 'transform translate-x-6' : ''}`}></div>
                  </div>
                  <span className="ml-3 text-sm font-bold text-gray-700 uppercase">
                    {settings.is_telegram_active === 1 ? 'Active' : 'Hidden'}
                  </span>
                </label>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-500 uppercase mb-2">Telegram Username</label>
                <input 
                  type="text" 
                  placeholder="e.g. dekuchneyvilla" 
                  className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                  value={settings.telegram_username}
                  onChange={(e) => setSettings({...settings, telegram_username: e.target.value})}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={saving}
              className="w-full bg-[#d4af37] text-black font-bold uppercase tracking-widest px-6 py-4 rounded shadow hover:bg-[#b5952f] transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="4" strokeOpacity="0.3"></circle><path d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" fill="currentColor"></path></svg>
                  Saving...
                </>
              ) : 'Save Settings'}
            </button>
          </form>
        </div>
      </div>

      {/* Hide scrollbar CSS */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}