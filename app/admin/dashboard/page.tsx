"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Booking = {
  id: number;
  full_name: string;
  email: string;
  suite: string;
  check_in: string;
  check_out: string;
  amount: number;
  payment_status: string;
  status: string;
  guest_city: string;
  guest_country: string;
  guest_ip: string;
  room_id: number | null;
};

type Room = {
  id: number;
  name: string;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
};

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [stats, setStats] = useState({
    totalBookings: 0,
    todayCheckIns: 0,
    todayCheckOuts: 0,
    occupancyRate: '0%',
  });

  useEffect(() => {
    const token = localStorage.getItem('hotel_admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('hotel_admin_token');
    try {
      const bookingsRes = await fetch('http://localhost:5000/api/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const bookingsData = await bookingsRes.json();
      const bookingsArray = Array.isArray(bookingsData) ? bookingsData : [];
      setBookings(bookingsArray);

      const roomsRes = await fetch('http://localhost:5000/api/rooms', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const roomsData = await roomsRes.json();
      let roomsArray = Array.isArray(roomsData) ? roomsData : roomsData.data || [];
      const roomsWithStatus = roomsArray.map((r: any) => ({
        ...r,
        status: r.status || 'available',
      }));
      setRooms(roomsWithStatus);

      const today = new Date().toISOString().split('T')[0];
      const todayCheckIns = bookingsArray.filter((b: any) => b.check_in === today).length;
      const todayCheckOuts = bookingsArray.filter((b: any) => b.check_out === today).length;
      const totalRooms = roomsWithStatus.length;
      const occupiedRooms = roomsWithStatus.filter((r: any) => r.status === 'occupied').length;
      const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

      setStats({
        totalBookings: bookingsArray.length,
        todayCheckIns,
        todayCheckOuts,
        occupancyRate: `${occupancyRate}%`,
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Approve (mark as paid)
  const handleApprove = async (id: number) => {
    const token = localStorage.getItem('hotel_admin_token');
    setUpdatingId(id);
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'paid' }),
      });
      if (res.ok) {
        fetchData();
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Single delete
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    const token = localStorage.getItem('hotel_admin_token');
    setDeletingId(id);
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchData();
      } else {
        alert('Delete failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting booking');
    } finally {
      setDeletingId(null);
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} selected booking(s)?`)) return;
    const token = localStorage.getItem('hotel_admin_token');
    setDeleting(true);
    try {
      const res = await fetch('http://localhost:5000/api/bookings/', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (res.ok) {
        setSelectedIds([]);
        fetchData();
      } else {
        alert('Bulk delete failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error during bulk delete');
    } finally {
      setDeleting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === bookings.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(bookings.map((b) => b.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gray-900 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-serif text-amber-500">De Kuchney Villa</h1>
            <p className="text-xs text-gray-400 uppercase tracking-widest">Admin Dashboard</p>
          </div>
          <div className="space-x-6 flex items-center text-sm font-bold tracking-wider uppercase">
            <span className="text-amber-500 border-b-2 border-amber-500 pb-1 cursor-default">Dashboard</span>
            <Link href="/admin/reception" className="text-gray-300 hover:text-white">Reception</Link>
            <Link href="/admin/rooms" className="text-gray-300 hover:text-white">Rooms</Link>
            <Link href="/admin/gallery" className="text-gray-300 hover:text-white">Gallery</Link>
            <Link href="/admin/reviews" className="text-gray-300 hover:text-white">Reviews</Link>
            <Link href="/admin/communications" className="text-gray-300 hover:text-white">Communications</Link>
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

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-4 rounded shadow border border-gray-100">
            <p className="text-sm text-gray-500">Total Bookings</p>
            <p className="text-3xl font-bold text-amber-600">{stats.totalBookings}</p>
          </div>
          <div className="bg-white p-4 rounded shadow border border-gray-100">
            <p className="text-sm text-gray-500">Check‑Ins Today</p>
            <p className="text-3xl font-bold text-blue-600">{stats.todayCheckIns}</p>
          </div>
          <div className="bg-white p-4 rounded shadow border border-gray-100">
            <p className="text-sm text-gray-500">Check‑Outs Today</p>
            <p className="text-3xl font-bold text-green-600">{stats.todayCheckOuts}</p>
          </div>
          <div className="bg-white p-4 rounded shadow border border-gray-100">
            <p className="text-sm text-gray-500">Occupancy Rate</p>
            <p className="text-3xl font-bold text-indigo-600">{stats.occupancyRate}</p>
          </div>
        </div>

        {/* Bookings Table with Actions */}
        <div className="bg-white shadow rounded overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-bold">Recent Bookings</h2>
            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : `Delete Selected (${selectedIds.length})`}
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === bookings.length && bookings.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Suite</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check‑in</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check‑out</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="px-4 py-8 text-center text-gray-500">
                      No bookings found.
                    </td>
                  </tr>
                ) : (
                  bookings.slice(0, 20).map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-4 py-2">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(booking.id)}
                          onChange={() => toggleSelect(booking.id)}
                          className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                        />
                      </td>
                      <td className="px-4 py-2 text-sm">{booking.id}</td>
                      <td className="px-4 py-2 text-sm font-medium">{booking.full_name}</td>
                      <td className="px-4 py-2 text-sm">{booking.email}</td>
                      <td className="px-4 py-2 text-sm">{booking.suite}</td>
                      <td className="px-4 py-2 text-sm">{booking.check_in}</td>
                      <td className="px-4 py-2 text-sm">{booking.check_out}</td>
                      <td className="px-4 py-2 text-sm">₦{booking.amount ? Number(booking.amount).toLocaleString() : 0}</td>
                      <td className="px-4 py-2 text-sm">
                        {booking.guest_city || booking.guest_country
                          ? `${booking.guest_city || ''}${booking.guest_city && booking.guest_country ? ', ' : ''}${booking.guest_country || ''}`
                          : '—'}
                      </td>
                      <td className="px-4 py-2 text-sm font-mono text-xs">{booking.guest_ip || '—'}</td>
                      <td className="px-4 py-2 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            booking.payment_status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {booking.payment_status || 'pending'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            booking.status === 'checked_in'
                              ? 'bg-blue-100 text-blue-800'
                              : booking.status === 'checked_out'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {booking.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm space-x-2 whitespace-nowrap">
                        {booking.payment_status !== 'paid' && (
                          <button
                            onClick={() => handleApprove(booking.id)}
                            disabled={updatingId === booking.id}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium transition disabled:opacity-50"
                          >
                            {updatingId === booking.id ? '...' : 'Approve'}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(booking.id)}
                          disabled={deletingId === booking.id}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition disabled:opacity-50"
                        >
                          {deletingId === booking.id ? '...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}