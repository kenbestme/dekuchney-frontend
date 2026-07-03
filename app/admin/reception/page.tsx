"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ---------- TYPES ----------
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
  amount: number;
  status: string;
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

type Stats = {
  checkInsToday: number;
  departuresToday: number;
  occupancyRate: string;
  totalRooms: number;
  occupiedRooms: number;
};

// ---------- MAIN COMPONENT ----------
export default function ReceptionDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  
  // Lists for the Overview Tab
  const [arrivalsTodayList, setArrivalsTodayList] = useState<any[]>([]); 
  const [departuresTodayList, setDeparturesTodayList] = useState<any[]>([]); 
  
  const [settlingId, setSettlingId] = useState<number | null>(null);
  const [stats, setStats] = useState<Stats>({
    checkInsToday: 0,
    departuresToday: 0,
    occupancyRate: '0%',
    totalRooms: 0,
    occupiedRooms: 0,
  });

  // Explicitly typing the return type to satisfy TypeScript
  const safeFetch = async (url: string, options: any = {}): Promise<{ ok: boolean; status: number; data: any }> => {
    try {
      const res = await fetch(url, options);
      const text = await res.text();
      let data: any = {};
      try { data = JSON.parse(text); } catch { /* Ignore parse errors */ }
      return { ok: res.ok, status: res.status, data };
    } catch (error) {
      return { ok: false, status: 500, data: { message: "Network connection failed" } };
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('hotel_admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    setRequests([
      { id: 1, guest: 'John Doe', type: 'room_service', description: 'Extra towels', status: 'pending' },
      { id: 2, guest: 'Jane Smith', type: 'wake_up', description: '6 AM wake-up call', status: 'in_progress' },
    ]);
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('hotel_admin_token');
    try {
      // 1. Fetch Rooms
      const roomsRes = await safeFetch('http://localhost:5000/api/rooms', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const roomsArray = Array.isArray(roomsRes.data) ? roomsRes.data : (roomsRes.data.data || []);
      const roomsWithStatus = roomsArray.map((r: any) => ({
        ...r, status: r.status || 'available',
      }));
      setRooms(roomsWithStatus);

      // 2. Fetch Bookings
      const bookingsRes = await safeFetch('http://localhost:5000/api/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const bookingsArray = Array.isArray(bookingsRes.data) ? bookingsRes.data : [];
      
      // BULLETPROOF DATE MATCHING
      const now = new Date();
      const todayString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      
      const getJustDate = (val: any) => {
        if (!val) return '';
        const str = String(val);
        // If it starts with YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.substring(0, 10);
        // Force parse other database formats
        try {
          const d = new Date(val);
          if (!isNaN(d.getTime())) {
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          }
        } catch(e) {}
        return str.substring(0, 10);
      };

      // Safely grab the property names whether your DB uses snake_case or camelCase
      const safeData = bookingsArray.map((b: any) => ({
        id: b.id,
        name: b.full_name || b.guest_name || b.fullName || b.guestName || 'Unknown',
        room: b.suite || b.suite_name || b.room || 'Unassigned',
        checkIn: getJustDate(b.check_in || b.checkIn || b.checkin),
        checkOut: getJustDate(b.check_out || b.checkOut || b.checkout),
        amount: Number(b.amount) || 0,
        status: b.status || 'pending',
        paymentStatus: b.payment_status || b.paymentStatus || 'pending'
      }));

      // Compute stats
      const checkInsToday = safeData.filter(b => b.checkIn === todayString).length;
      const departuresToday = safeData.filter(b => b.checkOut === todayString).length;
      const totalRooms = roomsWithStatus.length;
      const occupiedRooms = roomsWithStatus.filter((r: any) => r.status === 'occupied').length;
      const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

      setStats({
        checkInsToday, departuresToday, occupancyRate: `${occupancyRate}%`, totalRooms, occupiedRooms,
      });

      // Overview Arrivals List
      const arrivals = safeData.filter(b => b.checkIn === todayString);
      setArrivalsTodayList(arrivals);

      // Overview Departures List
      const departures = safeData.filter(b => b.checkOut === todayString);
      setDeparturesTodayList(departures);

      // Guests Tab Data
      const relevantGuests = safeData.filter(b => b.paymentStatus !== 'cancelled');
      setGuests(relevantGuests);

      // Upcoming reservations - ADDED EXACT TYPESCRIPT CASTING HERE
      const upcomingReservations = safeData
        .filter(b => b.checkIn >= todayString && b.paymentStatus !== 'cancelled')
        .map(b => ({
          id: b.id,
          guestName: b.name,
          room: b.room,
          checkIn: b.checkIn,
          checkOut: b.checkOut,
          status: (b.paymentStatus === 'paid' ? 'confirmed' : 'pending') as 'confirmed' | 'pending',
        }));
      setReservations(upcomingReservations);

      // Invoices
      const invoicesList = safeData.map(b => ({
        id: b.id,
        guest: b.name,
        amount: b.amount,
        paid: b.paymentStatus === 'paid',
        date: b.checkIn,
      }));
      setInvoices(invoicesList);

    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSettlePayment = async (bookingId: number) => {
    const token = localStorage.getItem('hotel_admin_token');
    setSettlingId(bookingId);
    const res = await safeFetch(`http://localhost:5000/api/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: 'paid' }),
    });

    if (res.ok) {
      alert('✅ Payment marked as paid');
      await fetchData();
    } else {
      alert('❌ Failed to settle payment');
    }
    setSettlingId(null);
  };

  const handleCheckIn = async (formData: any) => {
    const token = localStorage.getItem('hotel_admin_token');
    const roomId = formData.roomId ? parseInt(formData.roomId) : null;
    if (!roomId) { alert('Please select a room.'); return; }

    const assignedRoom = rooms.find(r => r.id === roomId);
    const bookingPayload = {
      fullName: formData.guestName,
      email: formData.email,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      suite: assignedRoom ? assignedRoom.name : 'Walk-in Guest',
      requests: '',
      amount: formData.paymentConfirmed ? 0 : 25000, 
      status: 'checked_in',
      roomId,
    };

    const createRes = await safeFetch('http://localhost:5000/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(bookingPayload),
    });

    if (!createRes.ok) { alert('❌ Failed to create booking'); return; }

    const bookingId = createRes.data.id;
    const checkInRes = await safeFetch(`http://localhost:5000/api/bookings/${bookingId}/check-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ roomId }),
    });

    if (checkInRes.ok) {
      alert(`✅ Guest checked in successfully!`);
      await fetchData();
      setActiveTab('overview'); 
    } else {
      alert('❌ Check-in failed.');
    }
  };

  const handleCheckOut = async (bookingId: number) => {
    const token = localStorage.getItem('hotel_admin_token');
    const res = await safeFetch(`http://localhost:5000/api/bookings/${bookingId}/check-out`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      alert('✅ Checked out successfully!');
      await fetchData();
      setActiveTab('overview');
    } else {
      alert('❌ Check-out failed.');
    }
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
            <button
              onClick={() => { localStorage.removeItem('hotel_admin_token'); router.push('/admin/login'); }}
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
            { key: 'checkin', label: 'Check-In' },
            { key: 'checkout', label: 'Check-Out' },
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
              className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-b-2 border-amber-500 text-amber-600 bg-amber-50/30'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white p-6 rounded-b-lg shadow-sm border border-gray-200 mb-6">
          {activeTab === 'overview' && <OverviewTab stats={stats} arrivals={arrivalsTodayList} departures={departuresTodayList} onRefresh={fetchData} />}
          {activeTab === 'checkin' && <CheckInTab rooms={rooms} onCheckIn={handleCheckIn} />}
          {activeTab === 'checkout' && <CheckOutTab guests={guests} onCheckOut={handleCheckOut} />}
          {activeTab === 'reservations' && (
            <ReservationsTab rooms={rooms} reservations={reservations} onAction={() => {}} onRefresh={fetchData} />
          )}
          {activeTab === 'guests' && <GuestsTab guests={guests} />}
          {activeTab === 'rooms' && <RoomStatusTab rooms={rooms} onRefresh={fetchData} />}
          {activeTab === 'requests' && <RequestsTab requests={requests} onAction={() => {}} />}
          {activeTab === 'billing' && <BillingTab invoices={invoices} onSettle={handleSettlePayment} settlingId={settlingId} />}
          {activeTab === 'messages' && <MessagesTab />}
          {activeTab === 'reports' && <ReportsTab />}
        </div>
      </div>
    </div>
  );
}

// ---------- TAB COMPONENTS ----------

function OverviewTab({ stats, arrivals, departures, onRefresh }: { stats: Stats, arrivals: any[], departures: any[], onRefresh: () => void }) {
  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Welcome to the Reception Desk</h3>
          <p className="text-gray-600">Manage front-desk operations efficiently. Use the tabs above to navigate.</p>
        </div>
        <button 
          onClick={onRefresh}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded shadow-sm transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Check-Ins Today</p>
          <p className="text-4xl font-bold text-amber-600 mt-2">{stats.checkInsToday}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Departures Today</p>
          <p className="text-4xl font-bold text-blue-600 mt-2">{stats.departuresToday}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Occupancy Rate</p>
          <p className="text-4xl font-bold text-green-600 mt-2">{stats.occupancyRate}</p>
          <p className="text-xs text-gray-400 mt-1 font-bold">{stats.occupiedRooms} / {stats.totalRooms} rooms occupied</p>
        </div>
      </div>

      {/* Side-by-Side Arrivals and Departures Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        
        {/* Arrivals Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h4 className="font-bold text-gray-800 uppercase tracking-wider text-sm">Today's Expected Arrivals</h4>
          </div>
          {arrivals.length === 0 ? (
            <div className="p-8 text-center bg-white">
              <p className="text-gray-500 font-medium">No check-ins scheduled for today.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Guest Name</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Assigned Room</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {arrivals.map((arrival, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-bold text-gray-800">{arrival.name}</td>
                      <td className="px-6 py-4 font-medium text-gray-600">{arrival.room}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                          arrival.status === 'checked_in' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {arrival.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Departures Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h4 className="font-bold text-gray-800 uppercase tracking-wider text-sm">Today's Expected Departures</h4>
          </div>
          {departures.length === 0 ? (
            <div className="p-8 text-center bg-white">
              <p className="text-gray-500 font-medium">No check-outs scheduled for today.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Guest Name</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Room</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {departures.map((departure, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-bold text-gray-800">{departure.name}</td>
                      <td className="px-6 py-4 font-medium text-gray-600">{departure.room}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                          departure.status === 'checked_out' ? 'bg-gray-200 text-gray-700' : 
                          departure.status === 'checked_in' ? 'bg-blue-100 text-blue-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {departure.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function CheckInTab({ rooms, onCheckIn }: { rooms: Room[]; onCheckIn: (data: any) => void }) {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const formatISO = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const [form, setForm] = useState({
    guestName: '', email: '', phone: '',
    checkIn: formatISO(now),
    checkOut: formatISO(tomorrow),
    roomId: '', idVerified: false, paymentConfirmed: false,
  });
  
  const availableRooms = rooms.filter(r => r.status === 'available' || !r.status);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.roomId) { alert('Please select a room.'); return; }
    onCheckIn(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white">
      <h3 className="text-xl font-bold text-gray-800">New Guest Check-In</h3>
      {availableRooms.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded text-yellow-800">
          No available rooms at the moment. Please update room status in the Room Status tab.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name *</label>
              <input type="text" className="w-full border p-3 rounded focus:outline-none focus:border-amber-500" required value={form.guestName} onChange={(e) => setForm({ ...form, guestName: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email *</label>
              <input type="email" className="w-full border p-3 rounded focus:outline-none focus:border-amber-500" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
              <input type="tel" className="w-full border p-3 rounded focus:outline-none focus:border-amber-500" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Room Assignment *</label>
              <select className="w-full border p-3 rounded focus:outline-none focus:border-amber-500" required value={form.roomId} onChange={(e) => setForm({ ...form, roomId: e.target.value })}>
                <option value="">Select Room</option>
                {availableRooms.map((room) => (<option key={room.id} value={room.id}>{room.name}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Check-in *</label>
              <input type="date" className="w-full border p-3 rounded focus:outline-none focus:border-amber-500" required value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Check-out *</label>
              <input type="date" className="w-full border p-3 rounded focus:outline-none focus:border-amber-500" required value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="w-full bg-amber-600 text-white font-bold uppercase px-8 py-3 rounded hover:bg-amber-700 transition">Complete Check-In</button>
        </>
      )}
    </form>
  );
}

function CheckOutTab({ guests, onCheckOut }: { guests: Guest[]; onCheckOut: (id: number) => void }) {
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const currentlyCheckedInGuests = guests.filter(g => g.status === 'checked_in');

  return (
    <div className="space-y-6 max-w-2xl">
      <h3 className="text-xl font-bold text-gray-800">Guest Check-Out</h3>
      <select className="border p-3 rounded w-full md:w-2/3 focus:outline-none focus:border-amber-500" onChange={(e) => { setSelectedGuest(currentlyCheckedInGuests.find(g => g.id === Number(e.target.value)) || null); }}>
        <option value="">-- Choose a Checked-In Guest --</option>
        {currentlyCheckedInGuests.map((g) => (<option key={g.id} value={g.id}>{g.name} (Room {g.room})</option>))}
      </select>

      {selectedGuest && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mt-4 shadow-sm">
          <p className="font-bold text-lg mb-2">{selectedGuest.name} - {selectedGuest.room}</p>
          <div className="bg-white p-4 rounded border flex justify-between items-center mb-6">
             <span className="font-bold">Total Outstanding Bill:</span>
             <span className="font-bold text-2xl text-red-600">₦{selectedGuest.amount.toLocaleString()}</span>
          </div>
          <button className="w-full bg-green-600 text-white font-bold uppercase px-4 py-3 rounded hover:bg-green-700 transition" onClick={() => { onCheckOut(selectedGuest.id); setSelectedGuest(null); }}>
            Settle Bill & Check Out
          </button>
        </div>
      )}
    </div>
  );
}

function ReservationsTab({ rooms, reservations, onAction, onRefresh }: { rooms: Room[]; reservations: Reservation[]; onAction: (id: number, action: string) => void; onRefresh: () => void; }) {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ guestName: '', email: '', phone: '', checkIn: '', checkOut: '', roomId: '', status: 'pending' });
  const [submitting, setSubmitting] = useState(false);

  const filtered = reservations.filter((r) => (r.guestName || "").toLowerCase().includes(search.toLowerCase()));
  const availableRooms = rooms.filter((r) => r.status === 'available' || r.status === 'reserved' || !r.status);

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem('hotel_admin_token');
    
    try {
      const room = rooms.find((r) => r.id === parseInt(formData.roomId));
      const payload = {
        fullName: formData.guestName, email: formData.email, checkIn: formData.checkIn, checkOut: formData.checkOut,
        suite: room ? room.name : 'Reserved Suite', requests: '', amount: 0, status: formData.status, roomId: parseInt(formData.roomId),
      };

      const res = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        alert('✅ Reservation created successfully!');
        setShowForm(false);
        setFormData({ guestName: '', email: '', phone: '', checkIn: '', checkOut: '', roomId: '', status: 'pending' });
        onRefresh();
      } else {
         const data = await res.json();
         alert('❌ Failed to create reservation: ' + (data.message || data.sqlMessage));
      }
    } catch (err) {
      alert('Error creating reservation. Check server connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Upcoming Reservations</h3>
        <div className="flex gap-3">
          <button onClick={() => setShowForm(!showForm)} className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded font-bold uppercase tracking-wider text-sm transition">
            {showForm ? 'Cancel Form' : '+ New Reservation'}
          </button>
          <input type="text" placeholder="Search guest..." className="border p-2 rounded text-sm focus:outline-none focus:border-amber-500" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreateReservation} className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8 shadow-sm">
          <h4 className="font-bold text-lg mb-4">Create New Reservation</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <input type="text" placeholder="Guest Name *" className="border p-3 rounded" required value={formData.guestName} onChange={(e) => setFormData({ ...formData, guestName: e.target.value })} />
            <input type="email" placeholder="Email *" className="border p-3 rounded" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            <select className="border p-3 rounded" required value={formData.roomId} onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}>
              <option value="">Select Room *</option>
              {availableRooms.map((room) => (<option key={room.id} value={room.id}>{room.name} ({room.status || 'available'})</option>))}
            </select>
            <input type="date" placeholder="Check-in *" className="border p-3 rounded" required value={formData.checkIn} onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })} />
            <input type="date" placeholder="Check-out *" className="border p-3 rounded" required value={formData.checkOut} onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })} />
            <select className="border p-3 rounded" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
              <option value="pending">Payment Pending</option>
              <option value="confirmed">Payment Confirmed</option>
            </select>
          </div>
          <button type="submit" disabled={submitting || availableRooms.length === 0} className="mt-6 bg-green-600 hover:bg-green-700 text-white font-bold uppercase tracking-wider px-8 py-3 rounded transition">
            {submitting ? 'Creating...' : 'Save Reservation'}
          </button>
        </form>
      )}

      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Guest</th><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Room</th><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Check-in</th><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Actions</th></tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map((r) => (
              <tr key={r.id}>
                <td className="px-6 py-4 font-bold">{r.guestName}</td><td className="px-6 py-4">{r.room}</td><td className="px-6 py-4">{r.checkIn}</td>
                <td className="px-6 py-4 space-x-3">
                  <button className="text-blue-600 hover:text-blue-900 font-bold" onClick={() => onAction(r.id, 'modify')}>Modify</button>
                  <button className="text-red-600 hover:text-red-900 font-bold" onClick={() => onAction(r.id, 'cancel')}>Cancel</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GuestsTab({ guests }: { guests: Guest[] }) {
  const [filter, setFilter] = useState('current');
  
  const now = new Date();
  const todayString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  const filtered = 
    filter === 'current' ? guests.filter((g) => g.status === 'checked_in')
    : filter === 'arrivals' ? guests.filter((g) => g.checkIn === todayString)
    : guests.filter((g) => g.checkOut === todayString); // Departures

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
        <button className={`px-4 py-2 font-bold text-sm uppercase tracking-wider rounded transition-colors ${filter === 'current' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} onClick={() => setFilter('current')}>
          In-House (Checked In)
        </button>
        <button className={`px-4 py-2 font-bold text-sm uppercase tracking-wider rounded transition-colors ${filter === 'arrivals' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} onClick={() => setFilter('arrivals')}>
          Arrivals Today
        </button>
        <button className={`px-4 py-2 font-bold text-sm uppercase tracking-wider rounded transition-colors ${filter === 'departures' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} onClick={() => setFilter('departures')}>
          Departures Today
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded border border-dashed border-gray-300">
           <p className="text-gray-500 font-medium">No guests found in this list.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filtered.map((g) => (
            <div key={g.id} className="bg-white p-5 rounded-lg border shadow-sm">
              <h4 className="font-bold text-lg">{g.name}</h4>
              <p className="text-amber-600 font-bold mb-2">Room {g.room}</p>
              <div className="mb-2">
                 <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wider rounded ${
                   g.status === 'checked_in' ? 'bg-green-100 text-green-800' 
                   : g.status === 'checked_out' ? 'bg-gray-200 text-gray-700' 
                   : 'bg-yellow-100 text-yellow-800'
                 }`}>
                   {g.status.replace('_', ' ')}
                 </span>
              </div>
              <p className="text-xs text-gray-500 font-medium">IN: {g.checkIn} | OUT: {g.checkOut}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RoomStatusTab({ rooms, onRefresh }: { rooms: Room[]; onRefresh: () => void }) {
  const [updating, setUpdating] = useState<number | null>(null);
  const statusColors: Record<string, string> = { available: 'bg-green-50 border-green-200 text-green-900', occupied: 'bg-red-50 border-red-200 text-red-900', reserved: 'bg-yellow-50 border-yellow-200 text-yellow-900', maintenance: 'bg-gray-100 border-gray-300 text-gray-900' };

  const handleStatusChange = async (roomId: number, newStatus: string) => {
    const token = localStorage.getItem('hotel_admin_token');
    if (!confirm(`Change room status to "${newStatus.toUpperCase()}"?`)) return;
    setUpdating(roomId);
    await fetch(`http://localhost:5000/api/rooms/${roomId}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status: newStatus }) });
    onRefresh();
    setUpdating(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Live Room Dashboard</h3>
        <button onClick={onRefresh} className="bg-gray-800 hover:bg-black text-white px-5 py-2 rounded text-sm font-bold uppercase tracking-wider transition">Refresh Status</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {rooms.map((room) => (
          <div key={room.id} className={`p-5 rounded-lg border-2 ${statusColors[room.status] || 'bg-gray-50 border-gray-200'}`}>
            <p className="font-bold text-lg">{room.name}</p>
            <select value={room.status} onChange={(e) => handleStatusChange(room.id, e.target.value)} disabled={updating === room.id} className="w-full text-xs font-bold uppercase rounded border-gray-300 py-2 mt-4 focus:outline-none focus:border-amber-500">
              {['available', 'occupied', 'reserved', 'maintenance'].map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

function RequestsTab({ requests, onAction }: { requests: RequestItem[]; onAction: (id: number, action: string) => void }) {
  return (
    <div className="max-w-4xl">
      <h3 className="text-xl font-bold mb-6 text-gray-800">Guest Services & Requests</h3>
      {requests.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded border border-dashed border-gray-300">
           <p className="text-gray-500 font-medium">No pending requests.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <p className="font-bold text-lg mb-1">{req.guest}</p>
                <p className="text-gray-600 mb-2">{req.description}</p>
                <span className={`inline-block text-xs font-bold uppercase px-2 py-1 rounded ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                  {req.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BillingTab({ invoices, onSettle, settlingId }: { invoices: Invoice[]; onSettle: (id: number) => void; settlingId: number | null }) {
  return (
    <div>
      <h3 className="text-xl font-bold mb-6 text-gray-800">Outstanding Payments</h3>
      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Guest Name</th><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Amount Due</th><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Action</th></tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td className="px-6 py-4 font-bold">{inv.guest}</td><td className="px-6 py-4 font-bold">₦{inv.amount.toLocaleString()}</td>
                <td className="px-6 py-4">
                  {!inv.paid ? (
                    <button onClick={() => onSettle(inv.id)} disabled={settlingId === inv.id} className="bg-gray-800 text-white font-bold text-xs px-4 py-2 rounded">Settle Bill</button>
                  ) : (<span className="text-gray-400 text-xs font-bold uppercase">Cleared</span>)}
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
  return (
    <div className="max-w-2xl">
      <h3 className="text-xl font-bold mb-6 text-gray-800">Staff Messages</h3>
      <div className="border border-gray-200 rounded-lg p-5 bg-gray-50 text-center"><p className="text-gray-500 font-medium">No messages yet.</p></div>
    </div>
  );
}

function ReportsTab() {
  return (
    <div>
      <h3 className="text-xl font-bold mb-6 text-gray-800">System Reports</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[{ label: 'Daily Arrivals Manifest' }, { label: 'Daily Departures Log' }, { label: 'Live Occupancy Report' }].map((r) => (
          <button key={r.label} className="p-6 bg-white border border-gray-200 rounded-lg text-left"><h4 className="font-bold">{r.label}</h4></button>
        ))}
      </div>
    </div>
  );
}