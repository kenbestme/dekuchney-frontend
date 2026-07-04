"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ✅ Dynamic Live API URL
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://api.dekuchneyvilla.com';

interface Review {
  id: number;
  name: string;
  location: string;
  suite: string;
  text: string;
  rating: number;
}

export default function AdminReviews() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    suite: '',
    text: '',
    rating: 5,
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState('');

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
      router.push('/admin/login');
      return;
    }
    fetchReviews();
  }, [router]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/reviews`);
      const data = await res.json();
      if (data.success) setReviews(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    const token = getToken();
    const url = editingId
      ? `${API_BASE}/api/reviews/${editingId}`
      : `${API_BASE}/api/reviews`;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(editingId ? 'Review updated successfully!' : 'Review added successfully!');
        setFormData({ name: '', location: '', suite: '', text: '', rating: 5 });
        setEditingId(null);
        fetchReviews();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.message || 'Operation failed');
      }
    } catch (err) {
      console.error(err);
      setMessage('Network error. Check your connection.');
    }
  };

  const handleEdit = (review: Review) => {
    setEditingId(review.id);
    setFormData({
      name: review.name,
      location: review.location,
      suite: review.suite,
      text: review.text,
      rating: review.rating,
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    const token = getToken();
    try {
      const res = await fetch(`${API_BASE}/api/reviews/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
      });
      const data = await res.json();
      if (data.success) {
        fetchReviews();
        setMessage('Review deleted');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Delete failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', location: '', suite: '', text: '', rating: 5 });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('hotel_admin_token');
    router.push('/admin/login');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-amber-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Responsive Admin Navigation */}
      <nav className="bg-gray-900 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left w-full md:w-auto">
            <h1 className="text-xl md:text-2xl font-serif text-amber-500">De Kuchney Villa</h1>
            <p className="text-xs text-gray-400 uppercase tracking-widest">Review Management</p>
          </div>
          <div className="flex overflow-x-auto w-full md:w-auto pb-2 md:pb-0 space-x-6 items-center text-xs md:text-sm font-bold tracking-wider uppercase hide-scrollbar snap-x">
            <Link href="/admin/dashboard" className="text-gray-300 hover:text-white whitespace-nowrap snap-start">Reservations</Link>
            <Link href="/admin/rooms" className="text-gray-300 hover:text-white whitespace-nowrap snap-start">Rooms</Link>
            <Link href="/admin/gallery" className="text-gray-300 hover:text-white whitespace-nowrap snap-start">Gallery</Link>
            <span className="text-amber-500 border-b-2 border-amber-500 pb-1 whitespace-nowrap snap-start">Reviews</span>
            <Link href="/admin/settings" className="text-gray-300 hover:text-white whitespace-nowrap snap-start">Settings</Link>
            <button
              onClick={handleLogout}
              className="bg-gray-800 hover:bg-red-600 px-4 py-2 rounded border border-gray-700 whitespace-nowrap ml-2 snap-start transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-serif mb-6 text-gray-900">Manage Guest Reviews</h1>

        {/* Message Alert */}
        {message && (
          <div className="mb-6 p-4 bg-green-50 text-green-800 border-l-4 border-green-500 rounded shadow-sm font-medium">
            {message}
          </div>
        )}

        {/* Form (Add / Edit) */}
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md mb-10 border border-gray-100">
          <h2 className="text-xl font-bold mb-6 text-gray-800">{editingId ? 'Edit Review' : 'Add New Review'}</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Guest Name *</label>
                <input
                  type="text"
                  required
                  className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Location *</label>
                <input
                  type="text"
                  placeholder="e.g., Lagos, Nigeria"
                  required
                  className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Suite Name *</label>
                <input
                  type="text"
                  required
                  className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  value={formData.suite}
                  onChange={(e) => setFormData({ ...formData, suite: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Rating</label>
                <select
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                  className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                >
                  {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Star{r !== 1 ? 's' : ''}</option>)}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Review Text *</label>
              <textarea
                required
                rows={4}
                className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none"
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              ></textarea>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button type="submit" className="w-full sm:w-auto bg-amber-600 text-white font-bold uppercase tracking-widest px-6 py-3 rounded shadow hover:bg-amber-700 transition-colors">
                {editingId ? 'Update Review' : 'Add Review'}
              </button>
              {editingId && (
                <button type="button" onClick={cancelEdit} className="w-full sm:w-auto bg-gray-200 text-gray-800 font-bold uppercase tracking-widest px-6 py-3 rounded hover:bg-gray-300 transition-colors text-center">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Reviews Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Guest</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Suite</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Review</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500">{review.id}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 whitespace-nowrap">{review.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{review.location}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{review.suite}</td>
                    <td className="px-6 py-4 text-sm text-amber-500 font-bold">{review.rating} ★</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={review.text}>{review.text}</td>
                    <td className="px-6 py-4 text-sm space-x-3 whitespace-nowrap">
                      <button onClick={() => handleEdit(review)} className="text-blue-600 font-bold hover:text-blue-800 uppercase text-xs tracking-wider">Edit</button>
                      <button onClick={() => handleDelete(review.id)} className="text-red-600 font-bold hover:text-red-800 uppercase text-xs tracking-wider">Delete</button>
                    </td>
                  </tr>
                ))}
                {reviews.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-500 italic">
                      No reviews yet. Add your first review above!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}