import { useState } from 'react';
import axios from 'axios';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UploadGig = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    deliveryTime: '',
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setImages((prevImages) => [...prevImages, ...selectedFiles]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!images.length) {
      toast.error("Please upload atleast one image");
      setLoading(false);
      return;
    }

    const data = new FormData();
    for (let key in formData) {
      data.append(key, formData[key]);
    }
    images.forEach((image) => {
      data.append('image', image);
    });

    try {
      const res = await axios.post('http://localhost:3000/gig/creategig', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      toast.success("Gig uploaded successfully!");
      setFormData({ title: '', description: '', category: '', price: '', deliveryTime: '' });
      setImages([]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error uploading course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl p-8 rounded-3xl shadow-xl bg-white/10 backdrop-blur-md border border-white/20 text-white">
        <h1 className="text-3xl font-bold mb-6 text-center">📤 Upload New Gig</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          {[
            { label: 'Title', name: 'title', type: 'text' },
            { label: 'Description', name: 'description', type: 'textarea' },
            { label: 'Category', name: 'category', type: 'text' },
            { label: 'Price ($)', name: 'price', type: 'number' },
            { label: 'Delivery Time (days)', name: 'deliveryTime', type: 'number' }
          ].map(({ label, name, type }) => (
            <div key={name}>
              {type === 'textarea' ? (
                <textarea
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  required
                  rows="3"
                  placeholder={label}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 placeholder-white/60"
                />
              ) : (
                <input
                  type={type}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  required
                  placeholder={label}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 placeholder-white/60"
                />
              )}
            </div>
          ))}

          <div>
            <label className="block mb-1 text-white/80">Upload Images</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              multiple
              required
              className="w-full text-white bg-white/10 border border-white/20 rounded-xl px-4 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
            {images.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {images.map((img, i) => (
                  <img key={i} src={URL.createObjectURL(img)} alt="preview" className="w-20 h-20 object-cover rounded-lg border border-white/30" />
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition duration-300 text-white font-semibold rounded-2xl shadow-lg"
          >
            {loading ? 'Uploading...' : 'Create Gig'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadGig;
