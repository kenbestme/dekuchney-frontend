"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ✅ Backend API base URL (update if needed)
const API_URL = "https://api.dekuchneyvilla.com";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem("hotel_admin_token", data.token);
        router.push("/admin/settings");
      } else {
        setError(data.message || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Could not connect to the server. Is your backend running?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-sm shadow-2xl p-10 relative border-t-4 border-[#d4af37]">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-gray-900 mb-2 font-bold tracking-widest uppercase">Admin Access</h1>
          <div className="w-16 h-1 bg-[#d4af37] mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 uppercase tracking-widest">De Kuchney Villa</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-6 text-center border border-red-200 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] transition-colors bg-gray-50 text-gray-900"
              placeholder="admin@dekuchney.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
              Password
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] transition-colors bg-gray-50 text-gray-900"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#d4af37] hover:bg-[#b5952f] text-white font-bold tracking-widest uppercase py-4 mt-4 transition-colors shadow-lg rounded-sm disabled:opacity-70 flex justify-center items-center"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              "Secure Login"
            )}
          </button>
        </form>

        <div className="text-center mt-8">
          <Link href="/" className="text-xs text-gray-500 hover:text-[#d4af37] transition-colors">
            &larr; Return to Main Website
          </Link>
        </div>

      </div>
    </main>
  );
}