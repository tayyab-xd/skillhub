import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProgressBar = ({ progress }) => {
  return (
    <div className="w-full bg-gray-600 rounded-lg h-2 mt-4">
      <div
        className="bg-blue-500 h-2 rounded-lg transition-all duration-300"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};

function UploadCourse() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
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

  const pollProgress = async () => {
    try {
      const response = await axios.get("http://localhost:3000/course/upload-progress", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setProgress(response.data.progress);
      setProgressMessage(response.data.message);
    } catch (error) {
      console.error("Error fetching progress:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!courseData.video) {
      toast.error("Please select a video file");
      return;
    }

    setLoading(true);
    setProgress(0);

    const interval = setInterval(pollProgress, 1000); // Poll every second

    try {
      const formData = new FormData();
      formData.append("title", courseData.title);
      formData.append("description", courseData.description);
      formData.append("category", courseData.category);
      formData.append("thumbnail", courseData.thumbnail);
      formData.append("video", courseData.video);

      await axios.post("http://localhost:3000/course/upload", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Course uploaded successfully!");
      setCourseData({
        title: "",
        description: "",
        category: "",
        thumbnail: null,
        video: null,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "Error uploading course");
    } finally {
      clearInterval(interval); // Stop polling
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6 pt-0">
      <div className="bg-gray-800 text-white p-8 rounded-2xl shadow-lg w-full max-w-4xl">
        <h2 className="text-2xl font-semibold text-center mb-6">Upload Course</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={courseData.title}
                onChange={handleInput}
                required
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter course title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <input
                type="text"
                name="category"
                value={courseData.category}
                onChange={handleInput}
                required
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter category"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={courseData.description}
                onChange={handleInput}
                required
                rows="4"
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter course description"
              ></textarea>
            </div>
          </div>

          <div className="space-y-6">
            <div className="border border-gray-600 rounded-lg p-4 bg-gray-700">
              <label className="block text-sm font-medium mb-2">Thumbnail Image</label>
              <input
                type="file"
                accept="image/*"
                name="thumbnail"
                onChange={handleMedia}
                required
                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 file:bg-gray-600 file:text-white file:rounded-md file:px-3 file:py-2"
              />
            </div>

            <div className="border border-gray-600 rounded-lg p-4 bg-gray-700">
              <label className="block text-sm font-medium mb-2">Course Video</label>
              <input
                type="file"
                accept="video/*"
                name="video"
                onChange={handleMedia}
                required
                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 file:bg-gray-600 file:text-white file:rounded-md file:px-3 file:py-2"
              />
            </div>

            {loading && (
              <>
                <ProgressBar progress={progress} />
                <p className="text-sm text-gray-400 mt-2">{progressMessage}</p>
              </>
            )}

            <div className="text-center pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 px-4 rounded-lg font-semibold transition ${
                  loading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {loading ? "Uploading..." : "Upload Course"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadCourse;