"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminCommunications() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // Added <any[]> to fix the TypeScript "never[]" error
  const [logs, setLogs] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  
  const [selectedBooking, setSelectedBooking] = useState('');
  const [emailForm, setEmailForm] = useState({ subject: '', message: '' });
  const [message, setMessage] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('hotel_admin_token') : null;

  useEffect(() => {
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [logsRes, templatesRes, bookingsRes] = await Promise.all([
        fetch('http://localhost:5000/api/communications/logs', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/communications/templates', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/bookings', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const logsData = await logsRes.json();
      const templatesData = await templatesRes.json();
      const bookingsData = await bookingsRes.json();
      
      if (logsData.success) setLogs(logsData.data);
      if (templatesData.success) setTemplates(templatesData.data);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !emailForm.subject || !emailForm.message) {
      alert('Please fill in all fields');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/communications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: parseInt(selectedBooking),
          subject: emailForm.subject,
          message: emailForm.message,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('✅ Email sent successfully!');
        setEmailForm({ subject: '', message: '' });
        setSelectedBooking('');
        fetchData();
        setTimeout(() => setMessage(''), 5000);
      } else {
        alert('Failed to send email: ' + data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Error sending email');
    }
  };

  const handleAutomatedEmail = async (type: 'pre_arrival' | 'post_stay') => {
    if (!confirm(`Send ${type.replace('_', ' ')} emails to all eligible guests?`)) return;
    try {
      const res = await fetch(`http://localhost:5000/api/communications/send-${type}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`✅ ${data.message} (${data.count || 0} sent)`);
        fetchData();
        setTimeout(() => setMessage(''), 5000);
      } else {
        alert('Failed: ' + data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Error sending automated emails');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gray-900 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-serif text-amber-500">De Kuchney Villa</h1>
            <p className="text-xs text-gray-400 uppercase tracking-widest">Communications</p>
          </div>
          <div className="space-x-6 flex items-center text-sm font-bold tracking-wider uppercase">
            <Link href="/admin/dashboard" className="text-gray-300 hover:text-white">Dashboard</Link>
            <Link href="/admin/reception" className="text-gray-300 hover:text-white">Reception</Link>
            <span className="text-amber-500 border-b-2 border-amber-500 pb-1">Communications</span>
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
        {message && (
          <div className="mb-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Manual Email */}
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-xl font-bold mb-4">Send Email to Guest</h3>
            <form onSubmit={handleSendEmail} className="space-y-4">
              <select
                className="w-full border p-2 rounded"
                value={selectedBooking}
                onChange={(e) => setSelectedBooking(e.target.value)}
                required
              >
                <option value="">Select a booking...</option>
                {bookings.map((b: any) => (
                  <option key={b.id} value={b.id}>
                    {b.full_name || b.guest_name} – {b.suite || b.suite_name} ({b.check_in} to {b.check_out})
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Subject"
                className="w-full border p-2 rounded"
                value={emailForm.subject}
                onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                required
              />
              <textarea
                placeholder="Your message (HTML supported)"
                className="w-full border p-2 rounded h-40"
                value={emailForm.message}
                onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
                required
              />
              <button
                type="submit"
                className="bg-amber-600 text-white px-6 py-2 rounded hover:bg-amber-700"
              >
                Send Email
              </button>
            </form>
          </div>

          {/* Automated Emails */}
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-xl font-bold mb-4">Automated Emails</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded border">
                <h4 className="font-bold">Pre-Arrival Email</h4>
                <p className="text-sm text-gray-600">Sent 2 days before check-in (automatically at 6 AM daily)</p>
                <button
                  onClick={() => handleAutomatedEmail('pre_arrival')}
                  className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                >
                  Send Now
                </button>
              </div>
              <div className="bg-gray-50 p-4 rounded border">
                <h4 className="font-bold">Post-Stay Email</h4>
                <p className="text-sm text-gray-600">Sent 1 day after check-out (automatically at 6 AM daily)</p>
                <button
                  onClick={() => handleAutomatedEmail('post_stay')}
                  className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                >
                  Send Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Email Logs */}
        <div className="mt-8 bg-white p-6 rounded shadow">
          <h3 className="text-xl font-bold mb-4">Recent Email Logs</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Recipient</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sent At</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log: any) => (
                  <tr key={log.id}>
                    <td className="px-4 py-2 text-sm">{log.recipient}</td>
                    <td className="px-4 py-2 text-sm">{log.subject}</td>
                    <td className="px-4 py-2 text-sm">{new Date(log.sent_at).toLocaleString()}</td>
                  </tr>
                ))}
                {logs.length === 0 && <tr><td colSpan={3} className="text-center py-4 text-gray-500">No logs yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}