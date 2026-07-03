"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Room = {
  id: number;
  name: string;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
};

type Guest = {
  id: number;
  name: string;
  room: string;
  checkIn: string;
  checkOut: string;
};

type Reservation = {
  id: number;
  guestName: string;
  room: string;
  checkIn: string;
  checkOut: string;
  status: 'confirmed' | 'pending' | 'cancelled';
};

type RequestItem = {
  id: number;
  guest: string;
  type: 'room_service' | 'wake_up' | 'airport' | 'special';
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
};

type Invoice = {
  id: number;
  guest: string;
  amount: number;
  paid: boolean;
  date: string;
};

export default function ReceptionDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

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

      const bookingsRes = await fetch('http://localhost:5000/api/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const bookingsData = await bookingsRes.json();
      const bookingsArray = Array.isArray(bookingsData) ? bookingsData : [];
      const today = new Date().toISOString().split('T')[0];
      const currentGuests = bookingsArray
        .filter((b: any) => b.status === 'checked_in' || (b.check_in <= today && b.check_out >= today))
        .map((b: any) => ({
          id: b.id,
          name: b.full_name || b.guest_name,
          room: b.suite || b.suite_name,
          checkIn: b.check_in,
          checkOut: b.check_out,
        }));
      setGuests(currentGuests);

      const upcomingReservations = bookingsArray
        .filter((b: any) => b.check_in > today && b.payment_status !== 'cancelled')
        .map((b: any) => ({
          id: b.id,
          guestName: b.full_name || b.guest_name,
          room: b.suite || b.suite_name,
          checkIn: b.check_in,
          checkOut: b.check_out,
          status: b.payment_status === 'paid' ? 'confirmed' : 'pending',
        }));
      setReservations(upcomingReservations);

      setRequests([
        { id: 1, guest: 'John Doe', type: 'room_service', description: 'Extra towels', status: 'pending' },
        { id: 2, guest: 'Jane Smith', type: 'wake_up', description: '6 AM wake-up call', status: 'in_progress' },
      ]);

      const invoicesList = bookingsArray.map((b: any) => ({
        id: b.id,
        guest: b.full_name || b.guest_name,
        amount: b.amount || 0,
        paid: b.payment_status === 'paid',
        date: b.check_in,
      }));
      setInvoices(invoicesList);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (formData: any) => {
    const token = localStorage.getItem('hotel_admin_token');
    try {
      const roomId = formData.roomId ? parseInt(formData.roomId) : null;
      if (!roomId) {
        alert('Please select a room.');
        return;
      }

      const bookingPayload = {
        fullName: formData.guestName,
        email: formData.email,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        suite: 'Walk-in Guest',
        requests: '',
        amount: 0,
        status: 'pending',
        roomId,
      };

      const createRes = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingPayload),
      });
      const createData = await createRes.json();
      if (!createRes.ok) {
        alert('❌ Failed to create booking: ' + (createData.sqlMessage || createData.message));
        return;
      }
      const bookingId = createData.id;

      const checkInRes = await fetch(`http://localhost:5000/api/bookings/${bookingId}/check-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roomId }),
      });
      if (checkInRes.ok) {
        alert(`✅ Guest checked in successfully! Booking ID: ${bookingId}`);
        await fetchData();
      } else {
        const err = await checkInRes.json();
        alert('❌ Check‑in failed: ' + err.message);
      }
    } catch (err) {
      console.error('Check-in error:', err);
      alert('Error during check‑in');
    }
  };

  const handleCheckOut = async (bookingId: number) => {
    const token = localStorage.getItem('hotel_admin_token');
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}/check-out`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert('✅ Checked out successfully!');
        await fetchData();
      } else {
        const err = await res.json();
        alert('❌ Check‑out failed: ' + err.message);
      }
    } catch (err) {
      console.error(err);
      alert('Error during check‑out');
    }
  };

  const handleReservationAction = (id: number, action: string) => {
    alert(`Reservation ${id} ${action}`);
  };

  const handleRequestAction = (id: number, action: string) => {
    alert(`Request ${id} ${action}`);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Reception Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gray-900 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-serif text-amber-500">De Kuchney Villa</h1>
            <p className="text-xs text-gray-400 uppercase tracking-widest">Reception Desk</p>
          </div>
          <div className="space-x-6 flex items-center text-sm font-bold tracking-wider uppercase">
            <Link href="/admin/dashboard" className="text-gray-300 hover:text-white">Dashboard</Link>
            <span className="text-amber-500 border-b-2 border-amber-500 pb-1">Reception</span>
            <Link href="/admin/rooms" className="text-gray-300 hover:text-white">Rooms</Link>
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
        <div className="flex flex-wrap border-b border-gray-200 bg-white rounded-t-lg overflow-x-auto">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'checkin', label: 'Check‑In' },
            { key: 'checkout', label: 'Check‑Out' },
            { key: 'reservations', label: 'Reservations' },
            { key: 'guests', label: 'Guests' },
            { key: 'rooms', label: 'Room Status' },
            { key: 'requests', label: 'Guest Requests' },
            { key: 'billing', label: 'Billing' },
            { key: 'messages', label: 'Messages' },
            { key: 'reports', label: 'Reports' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'border-b-2 border-amber-500 text-amber-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white p-6 rounded-b-lg shadow mb-6">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'checkin' && <CheckInTab rooms={rooms} onCheckIn={handleCheckIn} />}
          {activeTab === 'checkout' && <CheckOutTab guests={guests} onCheckOut={handleCheckOut} />}
          {/* ✅ Pass rooms and onRefresh to ReservationsTab */}
          {activeTab === 'reservations' && (
            <ReservationsTab
              rooms={rooms}
              reservations={reservations}
              onAction={handleReservationAction}
              onRefresh={fetchData}
            />
          )}
          {activeTab === 'guests' && <GuestsTab guests={guests} />}
          {activeTab === 'rooms' && <RoomStatusTab rooms={rooms} onRefresh={fetchData} />}
          {activeTab === 'requests' && <RequestsTab requests={requests} onAction={handleRequestAction} />}
          {activeTab === 'billing' && <BillingTab invoices={invoices} />}
          {activeTab === 'messages' && <MessagesTab />}
          {activeTab === 'reports' && <ReportsTab />}
        </div>
      </div>
    </div>
  );
}

// ---------- TAB COMPONENTS ----------

function OverviewTab() {
  const stats = { checkInsToday: 5, departuresToday: 3, occupancyRate: '78%' };
  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
        <h3 className="text-lg font-bold text-gray-900">Welcome to the Reception Desk</h3>
        <p className="text-gray-600">Manage front‑desk operations efficiently. Use the tabs above to navigate.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded shadow border border-gray-100">
          <p className="text-sm text-gray-500">Check‑Ins Today</p>
          <p className="text-3xl font-bold text-amber-600">{stats.checkInsToday}</p>
        </div>
        <div className="bg-white p-4 rounded shadow border border-gray-100">
          <p className="text-sm text-gray-500">Departures Today</p>
          <p className="text-3xl font-bold text-blue-600">{stats.departuresToday}</p>
        </div>
        <div className="bg-white p-4 rounded shadow border border-gray-100">
          <p className="text-sm text-gray-500">Occupancy Rate</p>
          <p className="text-3xl font-bold text-green-600">{stats.occupancyRate}</p>
        </div>
      </div>
      <div className="bg-gray-50 p-4 rounded border border-gray-200">
        <h4 className="font-medium text-gray-700">Reception Contact</h4>
        <p className="text-sm text-gray-600">📞 +234 (913) 149-0624</p>
        <p className="text-sm text-gray-600">✉️ reception@dekuchneyvilla.com</p>
        <p className="text-sm text-gray-600">🕒 Operating Hours: 24/7</p>
      </div>
    </div>
  );
}

function CheckInTab({ rooms, onCheckIn }: { rooms: Room[]; onCheckIn: (data: any) => void }) {
  const [form, setForm] = useState({
    guestName: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    roomId: '',
    idVerified: false,
    paymentConfirmed: false,
  });
  const availableRooms = rooms.filter(r => r.status === 'available' || !r.status);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.roomId) {
      alert('Please select a room.');
      return;
    }
    onCheckIn(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <h3 className="text-xl font-bold">New Guest Check‑In</h3>
      {availableRooms.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-yellow-700">
          No available rooms at the moment.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full Name *"
              className="border p-2 rounded"
              required
              value={form.guestName}
              onChange={(e) => setForm({ ...form, guestName: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email *"
              className="border p-2 rounded"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              type="tel"
              placeholder="Phone"
              className="border p-2 rounded"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <input
              type="date"
              placeholder="Check-in"
              className="border p-2 rounded"
              required
              value={form.checkIn}
              onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
            />
            <input
              type="date"
              placeholder="Check-out"
              className="border p-2 rounded"
              required
              value={form.checkOut}
              onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
            />
            <select
              className="border p-2 rounded"
              required
              value={form.roomId}
              onChange={(e) => setForm({ ...form, roomId: e.target.value })}
            >
              <option value="">Select Room</option>
              {availableRooms.map((room) => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col space-y-2">
            <label className="flex items-center space-x-2">
              <input type="checkbox" checked={form.idVerified} onChange={(e) => setForm({ ...form, idVerified: e.target.checked })} />
              <span>ID Verified</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" checked={form.paymentConfirmed} onChange={(e) => setForm({ ...form, paymentConfirmed: e.target.checked })} />
              <span>Payment Confirmed</span>
            </label>
          </div>
          <button type="submit" className="bg-amber-600 text-white px-6 py-2 rounded hover:bg-amber-700">
            Check In
          </button>
        </>
      )}
    </form>
  );
}

function CheckOutTab({ guests, onCheckOut }: { guests: Guest[]; onCheckOut: (id: number) => void }) {
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Guest Check‑Out</h3>
      <select
        className="border p-2 rounded w-64"
        onChange={(e) => {
          const guest = guests.find(g => g.id === Number(e.target.value));
          setSelectedGuest(guest || null);
        }}
      >
        <option value="">Select Guest</option>
        {guests.map((g) => (
          <option key={g.id} value={g.id}>{g.name} – Room {g.room}</option>
        ))}
      </select>
      {selectedGuest && (
        <div className="bg-gray-50 p-4 rounded border">
          <p><strong>Guest:</strong> {selectedGuest.name}</p>
          <p><strong>Room:</strong> {selectedGuest.room}</p>
          <p><strong>Check-in:</strong> {selectedGuest.checkIn}</p>
          <p><strong>Check-out:</strong> {selectedGuest.checkOut}</p>
          <p><strong>Bill:</strong> ₦{Math.floor(Math.random() * 50000 + 10000).toLocaleString()}</p>
          <div className="flex space-x-2 mt-3">
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={() => onCheckOut(selectedGuest.id)}>
              Settle Bill & Check Out
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Print Invoice</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ✅ UPDATED ReservationsTab with Create Reservation Form
function ReservationsTab({
  rooms,
  reservations,
  onAction,
  onRefresh,
}: {
  rooms: Room[];
  reservations: Reservation[];
  onAction: (id: number, action: string) => void;
  onRefresh: () => void;
}) {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    guestName: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    roomId: '',
    status: 'pending',
  });
  const [submitting, setSubmitting] = useState(false);

  const filtered = reservations.filter((r) =>
    r.guestName.toLowerCase().includes(search.toLowerCase())
  );

  // Show rooms that are available or reserved (not occupied or maintenance)
  const availableRooms = rooms.filter(
    (r) => r.status === 'available' || r.status === 'reserved' || !r.status
  );

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.guestName ||
      !formData.email ||
      !formData.checkIn ||
      !formData.checkOut ||
      !formData.roomId
    ) {
      alert('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    const token = localStorage.getItem('hotel_admin_token');
    try {
      const room = rooms.find((r) => r.id === parseInt(formData.roomId));
      const payload = {
        fullName: formData.guestName,
        email: formData.email,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        suite: room ? room.name : 'Reserved Suite',
        requests: '',
        amount: 0,
        status: formData.status, // 'pending' or 'confirmed'
        roomId: parseInt(formData.roomId),
      };

      const res = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        alert('✅ Reservation created successfully!');
        setShowForm(false);
        setFormData({
          guestName: '',
          email: '',
          phone: '',
          checkIn: '',
          checkOut: '',
          roomId: '',
          status: 'pending',
        });
        onRefresh();
      } else {
        alert('❌ Failed to create reservation: ' + (data.message || data.sqlMessage));
      }
    } catch (err) {
      console.error(err);
      alert('Error creating reservation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h3 className="text-xl font-bold">Upcoming Reservations</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded text-sm font-medium transition"
          >
            {showForm ? 'Cancel' : '+ New Reservation'}
          </button>
          <input
            type="text"
            placeholder="Search guest..."
            className="border p-2 rounded text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Create Reservation Form */}
      {showForm && (
        <form
          onSubmit={handleCreateReservation}
          className="bg-gray-50 p-4 rounded border border-gray-200 mb-6"
        >
          <h4 className="font-bold text-lg mb-3">Create New Reservation</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Guest Name *"
              className="border p-2 rounded"
              required
              value={formData.guestName}
              onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email *"
              className="border p-2 rounded"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <input
              type="tel"
              placeholder="Phone"
              className="border p-2 rounded"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <select
              className="border p-2 rounded"
              required
              value={formData.roomId}
              onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
            >
              <option value="">Select Room *</option>
              {availableRooms.length === 0 ? (
                <option value="" disabled>No rooms available</option>
              ) : (
                availableRooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name} ({room.status || 'available'})
                  </option>
                ))
              )}
            </select>
            <input
              type="date"
              placeholder="Check-in *"
              className="border p-2 rounded"
              required
              value={formData.checkIn}
              onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
            />
            <input
              type="date"
              placeholder="Check-out *"
              className="border p-2 rounded"
              required
              value={formData.checkOut}
              onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
            />
            <select
              className="border p-2 rounded"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
            </select>
          </div>
          {availableRooms.length === 0 && (
            <p className="text-yellow-600 text-sm mt-2">
              ⚠️ No rooms are available for reservation. Please add rooms or change their status.
            </p>
          )}
          <button
            type="submit"
            disabled={submitting || availableRooms.length === 0}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-medium transition disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Create Reservation'}
          </button>
        </form>
      )}

      {/* Reservations List */}
      {filtered.length === 0 ? (
        <p className="text-gray-500">No upcoming reservations.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Guest
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Room
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Check‑in
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Check‑out
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-2">{r.guestName}</td>
                  <td className="px-4 py-2">{r.room}</td>
                  <td className="px-4 py-2">{r.checkIn}</td>
                  <td className="px-4 py-2">{r.checkOut}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        r.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : r.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      className="text-blue-600 hover:underline text-sm"
                      onClick={() => onAction(r.id, 'modify')}
                    >
                      Modify
                    </button>
                    <button
                      className="text-red-600 hover:underline text-sm"
                      onClick={() => onAction(r.id, 'cancel')}
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function GuestsTab({ guests }: { guests: Guest[] }) {
  const [filter, setFilter] = useState('current');
  const today = new Date().toISOString().split('T')[0];
  const filtered =
    filter === 'current'
      ? guests
      : filter === 'arrivals'
      ? guests.filter((g) => g.checkIn === today)
      : guests.filter((g) => g.checkOut === today);
  return (
    <div>
      <div className="flex space-x-4 mb-4">
        <button
          className={`px-3 py-1 rounded ${
            filter === 'current' ? 'bg-amber-600 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setFilter('current')}
        >
          Current Guests
        </button>
        <button
          className={`px-3 py-1 rounded ${
            filter === 'arrivals' ? 'bg-amber-600 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setFilter('arrivals')}
        >
          Arrivals Today
        </button>
        <button
          className={`px-3 py-1 rounded ${
            filter === 'departures' ? 'bg-amber-600 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setFilter('departures')}
        >
          Departures Today
        </button>
      </div>
      {filtered.length === 0 ? (
        <p className="text-gray-500">No guests found.</p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((g) => (
            <li key={g.id} className="bg-gray-50 p-3 rounded border flex justify-between">
              <span>
                {g.name} – Room {g.room}
              </span>
              <span className="text-sm text-gray-500">
                {g.checkIn} → {g.checkOut}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------- UPDATED RoomStatusTab with dropdown ----------
function RoomStatusTab({ rooms, onRefresh }: { rooms: Room[]; onRefresh: () => void }) {
  const [updating, setUpdating] = useState<number | null>(null);
  const statusColors: Record<string, string> = {
    available: 'bg-green-100 text-green-800',
    occupied: 'bg-red-100 text-red-800',
    reserved: 'bg-yellow-100 text-yellow-800',
    maintenance: 'bg-gray-100 text-gray-800',
  };

  const statusOptions = ['available', 'occupied', 'reserved', 'maintenance'];

  const handleStatusChange = async (roomId: number, newStatus: string) => {
    const token = localStorage.getItem('hotel_admin_token');
    if (!confirm(`Change room status to "${newStatus}"?`)) return;
    setUpdating(roomId);
    try {
      const res = await fetch(`http://localhost:5000/api/rooms/${roomId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        onRefresh();
      } else {
        const err = await res.json();
        alert('Failed to update status: ' + err.message);
      }
    } catch (err) {
      console.error(err);
      alert('Error updating room status');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Room Status</h3>
        <button
          onClick={onRefresh}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium transition"
        >
          Refresh
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {rooms.map((room) => (
          <div
            key={room.id}
            className={`p-4 rounded shadow border ${
              statusColors[room.status] || 'bg-gray-100'
            }`}
          >
            <p className="font-bold">{room.name}</p>
            <div className="mt-2">
              <select
                value={room.status}
                onChange={(e) => handleStatusChange(room.id, e.target.value)}
                disabled={updating === room.id}
                className="block w-full text-sm rounded border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 bg-white text-gray-700"
              >
                {statusOptions.map((opt) => (
                  <option key={opt} value={opt} className="capitalize">
                    {opt}
                  </option>
                ))}
              </select>
              {updating === room.id && (
                <span className="text-xs text-gray-500">Updating...</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RequestsTab({ requests, onAction }: { requests: RequestItem[]; onAction: (id: number, action: string) => void }) {
  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Guest Requests</h3>
      {requests.length === 0 ? (
        <p className="text-gray-500">No requests.</p>
      ) : (
        <ul className="space-y-3">
          {requests.map((req) => (
            <li key={req.id} className="bg-gray-50 p-4 rounded border flex justify-between items-start">
              <div>
                <p>
                  <strong>{req.guest}</strong> – {req.type.replace('_', ' ').toUpperCase()}
                </p>
                <p className="text-sm text-gray-600">{req.description}</p>
                <span
                  className={`inline-block mt-1 text-xs px-2 py-1 rounded ${
                    req.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : req.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {req.status}
                </span>
              </div>
              <div className="space-x-2">
                {req.status === 'pending' && (
                  <button
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                    onClick={() => onAction(req.id, 'start')}
                  >
                    Start
                  </button>
                )}
                {req.status === 'in_progress' && (
                  <button
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                    onClick={() => onAction(req.id, 'complete')}
                  >
                    Complete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function BillingTab({ invoices }: { invoices: Invoice[] }) {
  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Billing & Payments</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Guest</th>
              <th className="px-4 py-2 text-left">Amount</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-t">
                <td className="px-4 py-2">{inv.guest}</td>
                <td className="px-4 py-2">₦{inv.amount.toLocaleString()}</td>
                <td className="px-4 py-2">{inv.date}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      inv.paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {inv.paid ? 'Paid' : 'Unpaid'}
                  </span>
                </td>
                <td className="px-4 py-2">
                  {!inv.paid && (
                    <button className="bg-amber-600 text-white px-3 py-1 rounded text-sm">
                      Settle
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MessagesTab() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: 'Meeting with management at 3 PM', timestamp: '2026-06-16 10:00' },
  ]);
  const handleSend = () => {
    if (!message.trim()) return;
    setMessages([...messages, { id: Date.now(), text: message, timestamp: new Date().toLocaleString() }]);
    setMessage('');
  };
  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Messages & Notifications</h3>
      <div className="border rounded p-4 max-h-80 overflow-y-auto bg-gray-50">
        {messages.map((m) => (
          <div key={m.id} className="mb-2 p-2 bg-white rounded shadow-sm">
            <p>{m.text}</p>
            <p className="text-xs text-gray-400">{m.timestamp}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex space-x-2">
        <input
          type="text"
          placeholder="Write a message..."
          className="flex-1 border p-2 rounded"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
}

function ReportsTab() {
  const reports = [
    { label: 'Daily Arrivals', link: '#' },
    { label: 'Daily Departures', link: '#' },
    { label: 'Occupancy Report', link: '#' },
    { label: 'Revenue Summary', link: '#' },
  ];
  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Reports</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((r) => (
          <a key={r.label} href={r.link} className="block p-4 bg-gray-50 border rounded hover:bg-gray-100 transition">
            {r.label} →
          </a>
        ))}
      </div>
    </div>
  );
}