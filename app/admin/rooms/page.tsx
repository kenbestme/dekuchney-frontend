"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ✅ Use environment variable for API base URL
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

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

  // ✅ Safe token retrieval (prevents SSR errors)
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hotel_admin_token');
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

  const fetchRooms = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/rooms`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (Array.isArray(result)) setRooms(result);
      else if (result.data && Array.isArray(result.data)) setRooms(result.data);
      else setRooms([]);
    } catch (err) {
      console.error("Failed to load rooms", err);
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
        name: room.name, 
        description: room.description, 
        price_per_night: room.price_per_night, 
        max_guests: room.max_guests || '2',
        beds: room.beds ? room.beds.toString() : '1',
        wifi: room.wifi === 1 || room.wifi === true,
        imagesInput: parsedImages 
      });
    } else {
      setEditingRoom(null);
      setFormData({ 
        name: '', 
        description: '', 
        price_per_night: '', 
        max_guests: '2',
        beds: '1',
        wifi: true,
        imagesInput: '' 
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
      return;
    }

    let uploadedUrls: string[] = [];

    // Upload new images
    if (imageFiles.length > 0) {
      for (let i = 0; i < imageFiles.length; i++) {
        const fileData = new FormData();
        fileData.append('image', imageFiles[i]);
        
        try {
          const uploadRes = await fetch(`${API_BASE}/api/upload`, {
            method: "POST",
            headers: { 'Authorization': `Bearer ${token}` },
            body: fileData
          });
          const uploadData = await uploadRes.json();
          if (uploadData.success) {
            uploadedUrls.push(uploadData.imageUrl); 
          }
        } catch (err) {
          console.error(`Image ${imageFiles[i].name} upload failed:`, err);
          alert(`Failed to upload ${imageFiles[i].name}.`);
        }
      }
    }

    const autoSlug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const url = editingRoom ? `${API_BASE}/api/rooms/${editingRoom.id}` : `${API_BASE}/api/rooms`;
    const method = editingRoom ? "PATCH" : "POST";
    
    const existingUrls = formData.imagesInput.split(',').map(s => s.trim()).filter(Boolean);
    const finalImagesArray = [...existingUrls, ...uploadedUrls];

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name: formData.name,
          description: formData.description,
          price_per_night: parseFloat(formData.price_per_night),
          max_guests: parseInt(formData.max_guests),
          beds: parseInt(formData.beds),
          wifi: formData.wifi,
          images: finalImagesArray,
          slug: autoSlug
        })
      });
      
      if (!res.ok) throw new Error('Failed to save room');
      
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save room. Please try again.');
    }
    
    setIsUploading(false);
    setIsModalOpen(false);
    fetchRooms();
  };

  const deleteRoom = async (id: number) => {
    if (!confirm("Are you sure you want to delete this suite?")) return;
    
    const token = getToken();
    if (!token) {
      alert('Please login again.');
      return;
    }

    try {
      await fetch(`${API_BASE}/api/rooms/${id}`, { 
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRooms();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete room.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("hotel_admin_token");
    router.push("/admin/login");
  };

  // Helper to get first image URL for the thumbnail
  const getFirstImage = (roomImages: any) => {
    let imagesArray = [];
    if (Array.isArray(roomImages)) imagesArray = roomImages;
    else if (typeof roomImages === 'string') {
      try { imagesArray = JSON.parse(roomImages); } 
      catch { imagesArray = [roomImages]; }
    }
    const firstImage = imagesArray.length > 0 ? imagesArray[0] : null;
    if (firstImage && !firstImage.startsWith('http')) {
      // ✅ Prepend API_BASE if it's a relative path
      return `${API_BASE}${firstImage.startsWith('/') ? firstImage : '/' + firstImage}`;
    }
    return firstImage;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gray-900 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-serif text-amber-500">De Kuchney Villa</h1>
            <p className="text-xs text-gray-400 uppercase tracking-widest">Room Management</p>
          </div>
          <div className="space-x-6 flex items-center text-sm font-bold tracking-wider uppercase">
            <Link href="/admin/dashboard" className="text-gray-300 hover:text-white transition-colors">Reservations</Link>
            <span className="text-amber-500 border-b-2 border-amber-500 pb-1 cursor-default">Rooms</span>
            <Link href="/admin/gallery" className="text-gray-300 hover:text-white transition-colors">Gallery</Link>
            <Link href="/admin/reviews" className="text-gray-300 hover:text-white transition-colors">Reviews</Link>
            <Link href="/admin/settings" className="text-gray-300 hover:text-white transition-colors">Settings</Link>
            <button onClick={handleLogout} className="bg-gray-800 hover:bg-red-600 px-4 py-2 rounded transition-colors border border-gray-700 ml-4">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-serif text-gray-900">Suite Management</h2>
          <button onClick={() => openModal()} className="bg-[#d4af37] text-black font-bold uppercase tracking-widest px-6 py-3 rounded shadow-lg hover:bg-[#b5952f] transition-colors">+ Add New Suite</button>
        </div>

        {rooms.length === 0 ? (
          <div className="text-center py-12 text-gray-500 italic">No suites found. Click the button above to add your first room!</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room: any) => {
              const imageUrl = getFirstImage(room.images);
              
              let imgCount = 0;
              if (Array.isArray(room.images)) imgCount = room.images.length;
              else if (typeof room.images === 'string') {
                try { imgCount = JSON.parse(room.images).length; } catch { imgCount = 1; }
              }

              return (
                <div key={room.id} className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden flex flex-col relative">
                  {imageUrl ? (
                    <>
                      <img src={imageUrl} alt={room.name} className="w-full h-48 object-cover" />
                      {imgCount > 1 && (
                        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs font-bold px-2 py-1 rounded">
                          {imgCount} Photos
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">No image</div>
                  )}
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-bold text-xl mb-2">{room.name}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3 flex-grow">{room.description}</p>
                    <p className="text-gray-900 font-bold text-lg mb-4">₦{Number(room.price_per_night).toLocaleString()} <span className="text-xs text-gray-500 font-normal">/ night</span></p>
                    <div className="pt-3 border-t border-gray-100 flex justify-between">
                      <button onClick={() => openModal(room)} className="text-blue-600 font-bold hover:text-blue-800 transition-colors">Edit</button>
                      <button onClick={() => deleteRoom(room.id)} className="text-red-600 font-bold hover:text-red-800 transition-colors">Delete</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-serif mb-6">{editingRoom ? "Edit Suite" : "Add New Suite"}</h2>
              
              <label className="block text-sm font-bold text-gray-700 mb-1">Suite Name</label>
              <input required className="w-full border border-gray-300 rounded p-2 mb-4 focus:outline-none focus:border-[#d4af37]" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              
              <label className="block text-sm font-bold text-gray-700 mb-1">Price Per Night (₦)</label>
              <input required type="number" className="w-full border border-gray-300 rounded p-2 mb-4 focus:outline-none focus:border-[#d4af37]" value={formData.price_per_night} onChange={e => setFormData({...formData, price_per_night: e.target.value})} />
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Max Guests</label>
                  <input required type="number" className="w-full border border-gray-300 rounded p-2" value={formData.max_guests} onChange={e => setFormData({...formData, max_guests: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Number of Beds</label>
                  <input type="number" min="1" className="w-full border border-gray-300 rounded p-2" value={formData.beds} onChange={e => setFormData({...formData, beds: e.target.value})} />
                </div>
              </div>
              
              <div className="mb-4 flex items-center">
                <input type="checkbox" id="wifi" checked={formData.wifi} onChange={e => setFormData({...formData, wifi: e.target.checked})} className="w-5 h-5 mr-2" />
                <label htmlFor="wifi" className="text-sm font-bold text-gray-700">Free Wi-Fi</label>
              </div>
              
              <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
              <textarea required className="w-full border border-gray-300 rounded p-2 mb-4 h-24 focus:outline-none focus:border-[#d4af37]" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              
              <div className="bg-gray-50 p-4 border border-gray-200 rounded mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Upload New Photos (Select Multiple)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  className="w-full border border-gray-300 bg-white rounded p-2 mb-4" 
                  onChange={e => setImageFiles(e.target.files ? Array.from(e.target.files) : [])} 
                />
                
                <label className="block text-sm font-bold text-gray-700 mb-1">Current Image URLs</label>
                <p className="text-xs text-gray-500 mb-2">These are the images already saved. You can delete URLs here to remove them. Separate multiple URLs with a comma.</p>
                <textarea 
                  className="w-full border border-gray-300 rounded p-2 h-20 text-xs focus:outline-none focus:border-[#d4af37]" 
                  value={formData.imagesInput} 
                  onChange={e => setFormData({...formData, imagesInput: e.target.value})} 
                  placeholder="e.g., /uploads/img1.jpg, /uploads/img2.jpg"
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} disabled={isUploading} className="px-4 py-2 font-bold text-gray-500 hover:text-gray-800 transition">Cancel</button>
                <button type="submit" disabled={isUploading} className="px-6 py-2 bg-[#d4af37] hover:bg-[#b5952f] text-black font-bold uppercase tracking-widest rounded transition disabled:opacity-50">
                  {isUploading ? 'Uploading...' : 'Save Suite'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}