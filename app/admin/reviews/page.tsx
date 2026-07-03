"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem('hotel_admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchReviews();
  }, [router]);

  const fetchReviews = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/reviews');
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
    const token = localStorage.getItem('hotel_admin_token');
    const url = editingId
      ? `http://localhost:5000/api/reviews/${editingId}`
      : 'http://localhost:5000/api/reviews';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(editingId ? 'Review updated!' : 'Review added!');
        setFormData({ name: '', location: '', suite: '', text: '', rating: 5 });
        setEditingId(null);
        fetchReviews();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.message || 'Operation failed');
      }
    } catch (err) {
      console.error(err);
      setMessage('Network error');
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
    const token = localStorage.getItem('hotel_admin_token');
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
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

  if (loading) return <div className="p-8 text-center">Loading reviews...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navigation (consistent with other admin pages) */}
      <nav className="bg-gray-900 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-serif text-amber-500">De Kuchney Villa</h1>
            <p className="text-xs text-gray-400 uppercase tracking-widest">Review Management</p>
          </div>
          <div className="space-x-6 flex items-center text-sm font-bold tracking-wider uppercase">
            <Link href="/admin/dashboard" className="text-gray-300 hover:text-white">Reservations</Link>
            <Link href="/admin/rooms" className="text-gray-300 hover:text-white">Rooms</Link>
            <Link href="/admin/gallery" className="text-gray-300 hover:text-white">Gallery</Link>
            <span className="text-amber-500 border-b-2 border-amber-500 pb-1">Reviews</span>
            <Link href="/admin/settings" className="text-gray-300 hover:text-white">Settings</Link>
            <button
              onClick={() => {
                localStorage.removeItem('hotel_admin_token');
                router.push('/admin/login');
              }}
              className="bg-gray-800 hover:bg-red-600 px-4 py-2 rounded border border-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-8">
        <h1 className="text-3xl font-serif mb-8">Manage Guest Reviews</h1>

        {/* Message */}
        {message && (
          <div className="mb-6 p-3 bg-green-100 text-green-700 border border-green-300 rounded">
            {message}
          </div>
        )}

        {/* Form (Add / Edit) */}
        <div className="bg-white p-6 rounded shadow mb-10">
          <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Review' : 'Add New Review'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Guest Name *"
                required
                className="border p-2 rounded w-full"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Location (e.g., Lagos, Nigeria) *"
                required
                className="border p-2 rounded w-full"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
              <input
                type="text"
                placeholder="Suite Name *"
                required
                className="border p-2 rounded w-full"
                value={formData.suite}
                onChange={(e) => setFormData({ ...formData, suite: e.target.value })}
              />
              <select
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                className="border p-2 rounded w-full"
              >
                {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Star{r !== 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <textarea
              placeholder="Review text *"
              required
              rows={4}
              className="border p-2 rounded w-full"
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
            ></textarea>
            <div className="flex gap-3">
              <button type="submit" className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700">
                {editingId ? 'Update Review' : 'Add Review'}
              </button>
              {editingId && (
                <button type="button" onClick={cancelEdit} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Reviews Table */}
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Suite</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Review</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reviews.map((review) => (
                <tr key={review.id}>
                  <td className="px-6 py-4 text-sm">{review.id}</td>
                  <td className="px-6 py-4 text-sm font-medium">{review.name}</td>
                  <td className="px-6 py-4 text-sm">{review.location}</td>
                  <td className="px-6 py-4 text-sm">{review.suite}</td>
                  <td className="px-6 py-4 text-sm">{review.rating} ★</td>
                  <td className="px-6 py-4 text-sm max-w-xs truncate">{review.text}</td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button onClick={() => handleEdit(review)} className="text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(review.id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-gray-500">No reviews yet. Add one above.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}