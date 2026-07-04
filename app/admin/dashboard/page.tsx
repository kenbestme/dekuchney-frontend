"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ✅ Use the live API automatically
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://api.dekuchneyvilla.com';

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
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = getToken();
    try {
      // ✅ Now using API_BASE instead of localhost
      const bookingsRes = await fetch(`${API_BASE}/api/bookings`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
      });
      const bookingsData = await bookingsRes.json();
      const bookingsArray = Array.isArray(bookingsData) ? bookingsData : [];
      setBookings(bookingsArray);

      const roomsRes = await fetch(`${API_BASE}/api/rooms`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
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

  const handleApprove = async (id: number) => {
    const token = getToken();
    setUpdatingId(id);
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    const token = getToken();
    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
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

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} selected booking(s)?`)) return;
    const token = getToken();
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/api/bookings/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('hotel_admin_token');
    router.push('/admin/login');
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-amber-500"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <nav className="bg-gray-900 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left w-full md:w-auto">
            <h1 className="text-xl md:text-2xl font-serif text-amber-500">De Kuchney Villa</h1>
            <p className="text-xs text-gray-400 uppercase tracking-widest">Admin Dashboard</p>
          </div>
          <div className="flex overflow-x-auto w-full md:w-auto pb-2 md:pb-0 space-x-6 items-center text-xs md:text-sm font-bold tracking-wider uppercase hide-scrollbar snap-x">
            <span className="text-amber-500 border-b-2 border-amber-500 pb-1 cursor-default whitespace-nowrap snap-start">Dashboard</span>
            <Link href="/admin/reception" className="text-gray-300 hover:text-white whitespace-nowrap snap-start">Reception</Link>
            <Link href="/admin/rooms" className="text-gray-300 hover:text-white whitespace-nowrap snap-start">Rooms</Link>
            <Link href="/admin/gallery" className="text-gray-300 hover:text-white whitespace-nowrap snap-start">Gallery</Link>
            <Link href="/admin/reviews" className="text-gray-300 hover:text-white whitespace-nowrap snap-start">Reviews</Link>
            <Link href="/admin/communications" className="text-gray-300 hover:text-white whitespace-nowrap snap-start">Comms</Link>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded shadow border border-gray-100">
            <p className="text-xs sm:text-sm text-gray-500">Total Bookings</p>
            <p className="text-2xl sm:text-3xl font-bold text-amber-600">{stats.totalBookings}</p>
          </div>
          <div className="bg-white p-4 rounded shadow border border-gray-100">
            <p className="text-xs sm:text-sm text-gray-500">Check‑Ins Today</p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.todayCheckIns}</p>
          </div>
          <div className="bg-white p-4 rounded shadow border border-gray-100">
            <p className="text-xs sm:text-sm text-gray-500">Check‑Outs Today</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.todayCheckOuts}</p>
          </div>
          <div className="bg-white p-4 rounded shadow border border-gray-100">
            <p className="text-xs sm:text-sm text-gray-500">Occupancy Rate</p>
            <p className="text-2xl sm:text-3xl font-bold text-indigo-600">{stats.occupancyRate}</p>
          </div>
        </div>

        {/* Bookings Table with Actions */}
        <div className="bg-white shadow rounded overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-b gap-4">
            <h2 className="text-xl font-bold">Recent Bookings</h2>
            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition disabled:opacity-50 w-full sm:w-auto"
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Suite</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      No bookings found.
                    </td>
                  </tr>
                ) : (
                  bookings.slice(0, 20).map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(booking.id)}
                          onChange={() => toggleSelect(booking.id)}
                          className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm">{booking.id}</td>
                      <td className="px-4 py-3 text-sm">
                        <p className="font-bold text-gray-900">{booking.full_name}</p>
                        <p className="text-xs text-gray-500">{booking.email}</p>
                      </td>
                      <td className="px-4 py-3 text-sm">{booking.suite}</td>
                      <td className="px-4 py-3 text-sm">
                        <p className="text-xs"><span className="font-semibold">In:</span> {booking.check_in}</p>
                        <p className="text-xs"><span className="font-semibold">Out:</span> {booking.check_out}</p>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">₦{Number(booking.amount || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${
                          booking.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.payment_status || 'pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm space-x-2 whitespace-nowrap">
                        {booking.payment_status !== 'paid' && (
                          <button
                            onClick={() => handleApprove(booking.id)}
                            disabled={updatingId === booking.id}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition disabled:opacity-50"
                          >
                            {updatingId === booking.id ? '...' : 'Approve'}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(booking.id)}
                          disabled={deletingId === booking.id}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition disabled:opacity-50"
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
      
      {/* Hide scrollbar for mobile nav */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}