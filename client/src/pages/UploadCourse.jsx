import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function UploadCourse() {
  const [loading, setLoading] = useState(false);
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    category: "",
    thumbnail: null,
    video: null,
  });

  const handleInput = (e) => {
    setCourseData({ ...courseData, [e.target.name]: e.target.value });
  };

  const handleMedia = (e) => {
    setCourseData({ ...courseData, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    Object.keys(courseData).forEach((key) => {
      formData.append(key, courseData[key]);
    });

    try {
      await axios.post("http://localhost:3000/course/upload", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          "Content-Type": "multipart/form-data",
        },
      });
      const successSound = new Audio('../public/success.mp3');
      successSound.play()
      toast.success("Course uploaded successfully!");
      setCourseData({ title: "", description: "", category: "", thumbnail: null, video: null });
    } catch (error) {
      toast.error("Error uploading course!");
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6 pt-0 ">
      <div className="bg-gray-800 text-white p-8 rounded-2xl shadow-lg w-full max-w-4xl">
        <h2 className="text-2xl font-semibold text-center mb-6">Upload Course</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text" name="title" value={courseData.title} onChange={handleInput} required
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter course title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <input
                type="text" name="category" value={courseData.category} onChange={handleInput} required
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter category"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description" value={courseData.description} onChange={handleInput} required rows="4"
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter course description"
              ></textarea>
            </div>
            <div className="text-center">
              <button
                type="submit" disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                {loading ? "Uploading..." : "Upload Course"}
              </button>
            </div>
          </div>
          <div className="space-y-6">
            <div className="border border-gray-600 rounded-lg p-4 bg-gray-700">
              <label className="block text-sm font-medium mb-2">Thumbnail Image</label>
              <input
                type="file" accept="image/*" name="thumbnail" onChange={handleMedia} required
                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 file:bg-gray-600 file:text-white file:rounded-md file:px-3 file:py-2"
              />
            </div>
            <div className="border border-gray-600 rounded-lg p-4 bg-gray-700">
              <label className="block text-sm font-medium mb-2">Course Video</label>
              <input
                type="file" accept="video/*" name="video" onChange={handleMedia} required
                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 file:bg-gray-600 file:text-white file:rounded-md file:px-3 file:py-2"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadCourse;