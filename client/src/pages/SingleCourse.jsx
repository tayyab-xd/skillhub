import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/context';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import NavbarLearn from '../components/NavbarLearn';

function SingleCourse() {
    const navigate = useNavigate();
    const params = useParams();
    const context = useContext(AppContext);
    const [course, setCourse] = useState(null);
    const [comment, setComment] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [enrolled, setEnrolled] = useState(false);
    const [courseOwner, setCourseOwner] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false)

    //finding courses
    useEffect(() => {
        const foundCourse = context.state.courses.find((item) => item._id === params.id);
        setCourse(foundCourse);
        if (foundCourse) {
            const check = context.state.profileData._id == foundCourse.userId._id;
            if (check) {
                setCourseOwner(true);
                setTimeout(() => setEnrolled(true), 100);
            }
        }
    }, [context.state.courses, params.id]);

    const enroll = async () => {
        try {
            const response = await axios.post(`http://localhost:3000/course/enroll/${course._id}`, {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            new Audio('../public/success.mp3').play();
            setEnrolled(true);
            toast.success(response.data.msg, { autoClose: 3000 });
        } catch (error) {
            toast.error('Error');
        }
    };

    const leaveCourse = async () => {
        try {
            await axios.delete(`http://localhost:3000/course/leavecourse/${course._id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            new Audio('../public/success.mp3').play();
            setEnrolled(false);
            toast.success("You have left the course");
        } catch (error) {
            toast.error("Failed to leave the course");
        }
    };

    // enrollement check
    useEffect(() => {
        const check = course && course.students.find((item) => item.userId == context.state.profileData._id);
        setEnrolled(!!check);
    }, [course]);

    const uploadComment = async (e) => {
        e.preventDefault();
        if (!newComment) return;
        try {
            await axios.post(`http://localhost:3000/course/${params.id}/reviews`, { newComment }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setNewComment('');
            new Audio('../public/success.mp3').play();
            toast.success("Comment uploaded", { autoClose: 1000 });
        } catch (error) {
            toast.error("Error uploading comment");
        }
    };

    const deleteComment = async (commentId) => {
        try {
            await axios.delete(`http://localhost:3000/course/deletecomment/${course._id}/${commentId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setComment((prevComments) => prevComments.filter((item) => item._id !== commentId));
            new Audio('../public/success.mp3').play();
            toast.success("Comment Deleted", { autoClose: 1000 });
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to delete comment");
        }
    };

    // comment fetch
    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/course/${params.id}/reviews`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                setComment(response.data.reviews || []);
            } catch (error) {
                console.error("Error fetching comments:", error);
            }
        };
        fetchComments();
    }, [params.id, newComment]);

    const deleteCourse = async () => {
        setDeleteLoading(true)
        try {
            await axios.delete(`http://localhost:3000/course/deletecourse/${course._id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setDeleteLoading(false)
            new Audio('../public/success.mp3').play();
            toast.success("Course Deleted", { autoClose: 2000 });
            navigate('/courses');
        } catch (error) {
            toast.error(error.response?.data || error.message, { autoClose: 2000 });
            console.error("Delete Course Error:", error.response?.data || error.message);
        }
    };

    if (!course) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }
    
    return (
        <>
        <NavbarLearn/>
        <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Course Details Section */}
                <div className="bg-gray-800 p-8 rounded-lg shadow-xl space-y-8 relative">
                    {courseOwner && (
                        <div className="absolute top-4 right-4">
                            <button
                                onClick={deleteCourse}
                                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300 shadow-lg"
                            >
                                <Trash2 className="w-5 h-5" />
                                {deleteLoading?'Deleting..':'Delete'}
                            </button>
                        </div>
                    )}
                    <h2 className="text-4xl font-semibold text-center">{course.title}</h2>
                    <h2 className="text-2xl text-gray-400 font-semibold text-center">Category: {course.category}</h2>
                    <p className="text-lg text-gray-400 text-center">{course.description}</p>

                    <div className="flex items-center justify-center space-x-4 mt-8">
                        <img
                            src={course && course.userId.profilePicId ? `https://link.storjshare.io/raw/jxvb43rmljummjairrimelxup4fq/skill-hub/${course.userId.profilePicId}` : 'https://creativeandcultural.wordpress.com/wp-content/uploads/2018/04/default-profile-picture.png?w=256'}
                            alt="Instructor"
                            className="w-16 h-16 rounded-full object-cover"
                        />
                        <div className="text-center">
                            <h3 className="text-xl font-semibold">{course.userId.name}</h3>
                            <p className="text-gray-400 text-sm">{course.userId.designation}</p>
                        </div>
                    </div>

                    {!courseOwner && (
                        <div className="mt-8 text-center">
                            <button
                                onClick={enrolled ? leaveCourse : enroll}
                                className="w-52 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105"
                            >
                                {enrolled ? 'Leave Course' : 'Enroll'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Course Video */}
                <div className="relative w-auto bg-gray-800 rounded-lg overflow-hidden shadow-xl transform  transition-transform duration-300">
                    {!enrolled && (
                        <div className="absolute inset-0 bg-black bg-opacity-100 flex justify-center items-center text-white text-xl font-semibold">
                            You need to get enrolled first to access the video
                        </div>
                    )}
                    <video
                        controls={enrolled ? true : undefined}
                        className="w-full h-80 object-cover"
                        src={`https://link.storjshare.io/raw/jwcaqlb3tvyuc6nfarrznqaw6hdq/skill-hub/${course.videoId}`}
                    />
                </div>

                {/* Course Reviews Section */}
                <div className="bg-gray-800 p-8 rounded-lg shadow-xl space-y-6">
                    <h3 className="text-2xl font-semibold text-white">Student Reviews</h3>

                    <form onSubmit={uploadComment} className="bg-gray-700 p-4 w-96 rounded-lg shadow-md flex flex-col gap-3">
                        <label className="text-sm font-medium text-gray-300">Leave a Review</label>
                        <input
                            type="text"
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write your review..."
                            value={newComment}
                            className="w-full p-3 bg-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                        />
                        <button
                            type="submit"
                            className="bg-blue-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                            Submit Review
                        </button>
                    </form>

                    <div className="space-y-6">
                        <AnimatePresence>
                            {comment.length > 0 ? (
                                [...comment].reverse().map((item) => (
                                    <motion.div
                                        key={item._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="bg-gray-800 p-5 rounded-lg shadow-lg"
                                    >
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={item && item.userId.profilePicId ? `https://link.storjshare.io/raw/jxvb43rmljummjairrimelxup4fq/skill-hub/${item.userId.profilePicId}` : 'https://creativeandcultural.wordpress.com/wp-content/uploads/2018/04/default-profile-picture.png?w=256'}
                                                alt="User Profile"
                                                className="w-12 h-12 rounded-full border-2 border-gray-500 object-cover"
                                            />
                                            <div>
                                                <h4 className="text-lg font-semibold text-white flex items-center gap-3">
                                                    {item.userId.name}
                                                    {course.userId._id === item.userId._id && (
                                                        <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full font-medium">
                                                            Owner
                                                        </span>
                                                    )}
                                                    {context.state.profileData._id === item.userId._id && (
                                                        <button
                                                            onClick={() => deleteComment(item._id)}
                                                            className="ml-3 text-sm text-red-500 hover:text-red-400 transition"
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </h4>
                                                <p className="text-sm text-gray-400">
                                                    {new Date(item.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-gray-300 mt-4 border-l-4 border-blue-600 pl-3">
                                            {item.comment}
                                        </p>
                                    </motion.div>
                                ))
                            ) : (
                                <p className="text-gray-400">No reviews yet. Be the first to leave a review!</p>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}

export default SingleCourse;
