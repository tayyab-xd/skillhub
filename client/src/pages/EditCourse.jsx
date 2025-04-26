import React, { useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/context'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios'

function EditCourse() {
    const navigate=useNavigate()
    const context = useContext(AppContext)
    const location = useLocation()
    const [loading, setLoading] = useState(false)
    const [courseData, setCourseData] = useState({})
    const [selectedThumbnail, setSelectedThumbnail] = useState({'thumbnail':'','video':''});
    useEffect(() => {
        if (context.state.courses.length) {
            const found = context.state.courses.find(item => item._id === location.state.id);
            setCourseData(found);
        }
    }, [context.state.courses, location.state.id]);


    const handleInput = (e) => {
        setCourseData({
            ...courseData,
            [e.target.name]: e.target.value
        })
    }
    const handleMedia = (e) => {
        const file = e.target.files[0];  
        if (file) {
          setSelectedThumbnail({...selectedThumbnail,[e.target.name]:file.name});  
        }
        setCourseData({
            ...courseData,
            [e.target.name]:file
        })
      };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true)
        const formData = new FormData();
        formData.append('title', courseData.title);
        formData.append('category', courseData.category);
        formData.append('description', courseData.description);
        formData.append('thumbnail', courseData.thumbnail);
        formData.append('video', courseData.video);

        try {
            const response = await axios.put(
                `http://localhost:3000/course/editcourse/${courseData._id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            const successSound = new Audio('../public/success.mp3');
            successSound.play()
            toast.success('Course updated successfully!');
            navigate(`/singlecourse/${location.state.id}`)
        } catch (error) {
            console.log(error);
            toast.error('An error occurred while updating the Course.');
        }finally {
            setLoading(false);
          }
    }
    return (
        <>
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6 pt-0 ">
                <div className="bg-gray-800 text-white p-8 rounded-2xl shadow-lg w-full max-w-4xl">
                    <h2 className="text-2xl font-semibold text-center mb-6">Upload Course</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <input
                                    type="text" name="title" value={courseData?.title || ""}
                                    onChange={handleInput} required
                                    className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    placeholder="Enter course title"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Category</label>
                                <input
                                    type="text" name="category" value={courseData?.category || ""} onChange={handleInput} required
                                    className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    placeholder="Enter category"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    name="description" value={courseData?.description || ""} onChange={handleInput} required rows="4"
                                    className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    placeholder="Enter course description"
                                ></textarea>
                            </div>
                            <div className="text-center">
                                <button
                                    type="submit" disabled={loading}
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                                >
                                    {loading ? "Uploading..." : "Edit Course"}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="border border-gray-600 rounded-lg p-4 bg-gray-700">
                                <label className="block text-sm font-medium mb-2">Thumbnail Image</label>

                                <div className="flex items-center justify-between bg-gray-800 px-4 py-2 rounded-md mb-2">
                                    <span className="text-sm text-gray-300 truncate">
                                        {selectedThumbnail.thumbnail || courseData?.thumbnailId || "No file selected"}
                                    </span>
                                    <label className="text-blue-400 cursor-pointer hover:underline">
                                        Change
                                        <input
                                            type="file"
                                            accept="image/*"
                                            name="thumbnail"
                                            onChange={handleMedia}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="border border-gray-600 rounded-lg p-4 bg-gray-700">
                                <div className="border border-gray-600 rounded-lg p-4 bg-gray-700">
                                    <label className="block text-sm font-medium mb-2">Course Video</label>

                                    <div className="flex items-center justify-between bg-gray-800 px-4 py-2 rounded-md mb-2">
                                        <span className="text-sm text-gray-300 truncate">
                                            {selectedThumbnail.video || courseData?.videoId || "No file selected"}
                                        </span>
                                        <label className="text-blue-400 cursor-pointer hover:underline">
                                            Change
                                            <input
                                                type="file"
                                                accept="video/*"
                                                name="video"
                                                onChange={handleMedia}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default EditCourse
