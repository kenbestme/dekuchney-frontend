"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminGallery() {
  const router = useRouter();
  const [images, setImages] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem("hotel_admin_token");
    if (!token) {
      router.push("/admin/login");
    }
  }, [router]);

  const fetchGallery = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/gallery");
      const result = await res.json();
      if (result.success) setImages(result.data);
    } catch (err) {
      console.error("Error fetching images:", err);
    }
  };

  useEffect(() => { fetchGallery(); }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', imageFile);

    const token = localStorage.getItem("hotel_admin_token");
    if (!token) {
      alert("You are not logged in. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      // 1. Upload file – send token
      const uploadRes = await fetch("http://localhost:5000/api/upload", { 
        method: "POST", 
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData 
      });
      const uploadData = await uploadRes.json();

      if (uploadData.success) {
        // 2. Save metadata – send token
        const saveRes = await fetch("http://localhost:5000/api/gallery", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ src: uploadData.imageUrl, alt: "Gallery Image" })
        });
        const saveData = await saveRes.json();
        if (saveData.success) {
          fetchGallery();
          setImageFile(null);
        } else {
          alert("Failed to save image metadata: " + (saveData.message || "Unknown error"));
        }
      } else {
        alert("Upload failed: " + uploadData.message);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("An error occurred during upload.");
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (id: number) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    const token = localStorage.getItem("hotel_admin_token");
    if (!token) {
      alert("You are not logged in. Please log in again.");
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/gallery/${id}`, { 
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        fetchGallery();
      } else {
        alert("Delete failed: " + data.message);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("An error occurred while deleting.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gray-900 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-serif text-amber-500">De Kuchney Villa</h1>
            <p className="text-xs text-gray-400 uppercase tracking-widest">Gallery Management</p>
          </div>
          <div className="space-x-6 flex items-center text-sm font-bold tracking-wider uppercase">
            <Link href="/admin/dashboard" className="text-gray-300 hover:text-white transition-colors">Reservations</Link>
            <Link href="/admin/rooms" className="text-gray-300 hover:text-white transition-colors">Rooms</Link>
            <span className="text-amber-500 border-b-2 border-amber-500 pb-1 cursor-default">Gallery</span>
            <Link href="/admin/settings" className="text-gray-300 hover:text-white transition-colors">Settings</Link>
            <button
              onClick={() => {
                localStorage.removeItem("hotel_admin_token");
                router.push("/admin/login");
              }}
              className="bg-gray-800 hover:bg-red-600 px-4 py-2 rounded transition-colors border border-gray-700 ml-4"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-3xl font-serif mb-8 text-gray-900">Gallery Management</h1>
        
        <form onSubmit={handleUpload} className="bg-white p-6 rounded shadow-sm border border-gray-100 mb-8 flex gap-4 items-center">
          <input 
            type="file" 
            onChange={(e) => setImageFile(e.target.files?.[0] || null)} 
            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-[#d4af37] file:text-white hover:file:bg-[#b8962d] cursor-pointer"
          />
          <button 
            type="submit" 
            disabled={loading || !imageFile}
            className="bg-gray-900 text-white px-6 py-2 font-bold uppercase tracking-widest hover:bg-black disabled:opacity-50 transition"
          >
            {loading ? "Uploading..." : "Add Image"}
          </button>
        </form>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {images.map((img) => (
            <div key={img.id} className="relative group rounded overflow-hidden shadow-md bg-gray-200">
              <img src={`http://localhost:5000${img.src}`} className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105" alt="Gallery item" />
              <button 
                onClick={() => deleteImage(img.id)}
                className="absolute inset-0 bg-red-600 bg-opacity-70 flex items-center justify-center text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                DELETE
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}