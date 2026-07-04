"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ✅ Use environment variable for API base URL
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://api.dekuchneyvilla.com';

export default function AdminRooms() {
  const router = useRouter();
  
  const [rooms, setRooms] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    price_per_night: '', 
    max_guests: '2',
    beds: '1',
    wifi: true,
    imagesInput: '' 
  });

  // ✅ Safe token retrieval (Checks multiple common keys to prevent 403 Forbidden errors)
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || localStorage.getItem('hotel_admin_token') || localStorage.getItem('admin_token');
    }
    return null;
  };

  // Authentication check
  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/admin/login');
    }
  }, [router]);

  // Fetch Rooms
  const fetchRooms = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const url = `${API_BASE}/api/rooms`;
      const res = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      const result = await res.json();
      
      if (Array.isArray(result)) {
        setRooms(result);
      } else if (result.data && Array.isArray(result.data)) {
        setRooms(result.data);
      } else {
        setRooms([]);
      }
    } catch (err) {
      console.error("❌ Failed to load rooms:", err);
      setRooms([]);
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  const openModal = (room: any = null) => {
    setImageFiles([]);
    if (room) {
      setEditingRoom(room);
      let parsedImages = '';
      if (Array.isArray(room.images)) parsedImages = room.images.join(', ');
      else if (typeof room.images === 'string') {
        try { parsedImages = JSON.parse(room.images).join(', '); } 
        catch { parsedImages = room.images; }
      }
      setFormData({ 
        name: room.name || '', 
        description: room.description || '', 
        price_per_night: room.price_per_night ? room.price_per_night.toString() : '', 
        max_guests: room.max_guests ? room.max_guests.toString() : '2',
        beds: room.beds ? room.beds.toString() : '1',
        wifi: room.wifi === 1 || room.wifi === true,
        imagesInput: parsedImages 
      });
    } else {
      setEditingRoom(null);
      setFormData({ 
        name: '', description: '', price_per_night: '', 
        max_guests: '2', beds: '1', wifi: true, imagesInput: '' 
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    const token = getToken();
    if (!token) {
      alert('You are not authenticated. Please login again.');
      setIsUploading(false);
      router.push('/admin/login');
      return;
    }

    let uploadedUrls: string[] = [];

    // Upload new images safely
    if (imageFiles.length > 0) {
      for (let i = 0; i < imageFiles.length; i++) {
        const fileData = new FormData();
        fileData.append('image', imageFiles[i]);
        
        try {
          const uploadRes = await fetch(`${API_BASE}/api/upload`, {
            method: "POST",
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            },
            body: fileData
          });
          
          if (!uploadRes.ok) throw new Error(`Upload failed with status ${uploadRes.status}`);
          
          const uploadData = await uploadRes.json();
          // Backend might return imageUrl, url, path, or filePath. Check all.
          const uploadedPath = uploadData.imageUrl || uploadData.url || uploadData.path || uploadData.filePath;
          
          if (uploadedPath) {
            uploadedUrls.push(uploadedPath); 
          }
        } catch (err) {
          console.error(`Image ${imageFiles[i].name} upload failed:`, err);
          alert(`Failed to upload ${imageFiles[i].name}. It might be too large or the server rejected it.`);
        }
      }
    }

    const autoSlug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const url = editingRoom ? `${API_BASE}/api/rooms/${editingRoom.id}` : `${API_BASE}/api/rooms`;
    const method = editingRoom ? "PATCH" : "POST";
    
    const existingUrls = formData.imagesInput.split(',').map(s => s.trim()).filter(Boolean);
    const finalImagesArray = [...existingUrls, ...uploadedUrls];

    // Payload formatted safely
    const payload = { 
      name: formData.name,
      description: formData.description,
      price_per_night: parseFloat(formData.price_per_night) || 0,
      max_guests: parseInt(formData.max_guests) || 2,
      beds: parseInt(formData.beds) || 1,
      wifi: formData.wifi,
      images: finalImagesArray,
      slug: autoSlug
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || errorData?.error || `Server responded with ${res.status}`);
      }
      
      setIsModalOpen(false);
      fetchRooms();
    } catch (err: any) {
      console.error('Save error:', err);
      alert(`Failed to save room: ${err.message}. Please check your connection and try again.`);
    } finally {
      setIsUploading(false);
    }
  };

  const deleteRoom = async (id: number) => {
    if (!confirm("Are you sure you want to delete this suite?")) return;
    
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/rooms/${id}`, { 
        method: "DELETE",
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!res.ok) throw new Error('Delete failed');
      fetchRooms();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete room.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("hotel_admin_token");
    localStorage.removeItem("admin_token");
    router.push("/admin/login");
  };

  const getFirstImage = (roomImages: any) => {
    let imagesArray = [];
    if (Array.isArray(roomImages)) imagesArray = roomImages;
    else if (typeof roomImages === 'string') {
      try { imagesArray = JSON.parse(roomImages); } 
      catch { imagesArray = [roomImages]; }
    }
    const firstImage = imagesArray.length > 0 ? imagesArray[0] : null;
    if (firstImage && !firstImage.startsWith('http')) {
      return `${API_BASE}${firstImage.startsWith('/') ? firstImage : '/' + firstImage}`;
    }
    return firstImage;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Responsive Navbar */}
      <nav className="bg-gray-900 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left w-full md:w-auto">
            <h1 className="text-xl md:text-2xl font-serif text-amber-500">De Kuchney Villa</h1>
            <p className="text-xs text-gray-400 uppercase tracking-widest">Room Management</p>
          </div>
          {/* Scrollable links on mobile */}
          <div className="flex overflow-x-auto w-full md:w-auto pb-2 md:pb-0 space-x-6 items-center text-xs md:text-sm font-bold tracking-wider uppercase hide-scrollbar snap-x">
            <Link href="/admin/dashboard" className="text-gray-300 hover:text-white transition-colors whitespace-nowrap snap-start">Reservations</Link>
            <span className="text-amber-500 border-b-2 border-amber-500 pb-1 cursor-default whitespace-nowrap snap-start">Rooms</span>
            <Link href="/admin/gallery" className="text-gray-300 hover:text-white transition-colors whitespace-nowrap snap-start">Gallery</Link>
            <Link href="/admin/reviews" className="text-gray-300 hover:text-white transition-colors whitespace-nowrap snap-start">Reviews</Link>
            <Link href="/admin/settings" className="text-gray-300 hover:text-white transition-colors whitespace-nowrap snap-start">Settings</Link>
            <button onClick={handleLogout} className="bg-gray-800 hover:bg-red-600 px-4 py-2 rounded transition-colors border border-gray-700 whitespace-nowrap ml-2 snap-start">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-2xl md:text-3xl font-serif text-gray-900">Suite Management</h2>
          <button onClick={() => openModal()} className="w-full sm:w-auto bg-[#d4af37] text-black font-bold uppercase tracking-widest px-6 py-3 rounded shadow-lg hover:bg-[#b5952f] transition-colors">
            + Add New Suite
          </button>
        </div>

        {rooms.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-lg shadow-sm">
            <p className="text-gray-500 italic text-lg">No suites found. Click the button above to add your first room!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room: any) => {
              const imageUrl = getFirstImage(room.images);
              let imgCount = 0;
              if (Array.isArray(room.images)) imgCount = room.images.length;
              else if (typeof room.images === 'string') {
                try { imgCount = JSON.parse(room.images).length; } catch { imgCount = 1; }
              }

              return (
                <div key={room.id} className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden flex flex-col relative group">
                  {imageUrl ? (
                    <>
                      <img src={imageUrl} alt={room.name} className="w-full h-48 md:h-56 object-cover group-hover:scale-105 transition-transform duration-500" />
                      {imgCount > 1 && (
                        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs font-bold px-2 py-1 rounded shadow">
                          {imgCount} Photos
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-48 md:h-56 bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
                  )}
                  
                  <div className="p-5 flex flex-col flex-grow relative z-10 bg-white">
                    <h3 className="font-bold font-serif text-xl mb-2 text-gray-900">{room.name}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-grow leading-relaxed">{room.description}</p>
                    <p className="text-[#d4af37] font-bold text-xl mb-4">₦{Number(room.price_per_night || 0).toLocaleString()} <span className="text-xs text-gray-500 font-normal">/ night</span></p>
                    
                    <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                      <button onClick={() => openModal(room)} className="px-4 py-2 text-sm bg-blue-50 text-blue-700 font-bold rounded hover:bg-blue-100 transition-colors">Edit Suite</button>
                      <button onClick={() => deleteRoom(room.id)} className="px-4 py-2 text-sm bg-red-50 text-red-700 font-bold rounded hover:bg-red-100 transition-colors">Delete</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Responsive Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-serif mb-6 text-gray-900">{editingRoom ? "Edit Suite" : "Add New Suite"}</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Suite Name</label>
                  <input required className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Price Per Night (₦)</label>
                  <input required type="number" min="0" className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]" value={formData.price_per_night} onChange={e => setFormData({...formData, price_per_night: e.target.value})} />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Max Guests</label>
                  <input required type="number" min="1" className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-[#d4af37]" value={formData.max_guests} onChange={e => setFormData({...formData, max_guests: e.target.value})} />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Number of Beds</label>
                  <input type="number" min="1" className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-[#d4af37]" value={formData.beds} onChange={e => setFormData({...formData, beds: e.target.value})} />
                </div>
              </div>
              
              <div className="mb-4 flex items-center bg-gray-50 p-3 rounded border border-gray-100">
                <input type="checkbox" id="wifi" checked={formData.wifi} onChange={e => setFormData({...formData, wifi: e.target.checked})} className="w-5 h-5 mr-3 accent-[#d4af37]" />
                <label htmlFor="wifi" className="text-sm font-bold text-gray-700 cursor-pointer select-none">Include Free Wi-Fi</label>
              </div>
              
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Description</label>
              <textarea required className="w-full border border-gray-300 rounded p-3 mb-6 h-28 resize-none focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              
              <div className="bg-gray-50 p-5 border border-gray-200 rounded-lg mb-8">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Upload New Photos</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  className="w-full border border-gray-300 bg-white rounded p-2 mb-4 text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-900 file:text-white hover:file:bg-gray-700 cursor-pointer" 
                  onChange={e => setImageFiles(e.target.files ? Array.from(e.target.files) : [])} 
                />
                
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Current Image URLs</label>
                <p className="text-xs text-gray-400 mb-2">Separate multiple URLs with a comma. Delete text to remove an image.</p>
                <textarea 
                  className="w-full border border-gray-300 rounded p-3 h-20 text-xs font-mono focus:outline-none focus:border-[#d4af37]" 
                  value={formData.imagesInput} 
                  onChange={e => setFormData({...formData, imagesInput: e.target.value})} 
                  placeholder="e.g., /uploads/img1.jpg, /uploads/img2.jpg"
                />
              </div>
              
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setIsModalOpen(false)} disabled={isUploading} className="w-full sm:w-auto px-6 py-3 font-bold text-gray-600 hover:bg-gray-100 rounded transition text-center">
                  Cancel
                </button>
                <button type="submit" disabled={isUploading} className="w-full sm:w-auto px-8 py-3 bg-[#d4af37] hover:bg-[#b5952f] text-black font-bold uppercase tracking-widest rounded shadow-md transition disabled:opacity-50 flex items-center justify-center">
                  {isUploading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="4" strokeOpacity="0.3"></circle><path d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" fill="currentColor"></path></svg>
                      Saving...
                    </span>
                  ) : 'Save Suite'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Hide scrollbar for mobile nav global style */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}