import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/context';
import { useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { toast } from 'react-toastify';
import axios from 'axios';
import moment from 'moment';
import "react-toastify/dist/ReactToastify.css";
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

function SingleGig() {
    const [showModal, setShowModal] = useState(false);
    const [stars, setStars] = useState(0);
    const [comment, setComment] = useState('');
    const [reviews, setReviews] = useState();
    const [loading, setloading] = useState(false);
    const [alreadyComment, setAlreadyComment] = useState(false);
    const [owner, setOwner] = useState(false);
    const context = useContext(AppContext);
    const params = useParams();
    const data = context.state.gigs.find((item) => item._id === params.id);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/gig/get-reviews/${data._id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setReviews(response.data.reviews);
            } catch (error) {
                console.log(error);
            }
        };
        fetchReviews();
    }, []);

    const handleReviewSubmit = async () => {
        try {
            setloading(true);
            const token = localStorage.getItem("token");
            await axios.post(
                `http://localhost:3000/gig/add-review/${data._id}`,
                { stars, comment },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            toast.success("Review uploaded", { autoClose: 1000 });
            setStars(0);
            setComment('');
            setShowModal(false);
        } catch (error) {
            toast.error(error.response.data.error || "Error uploading comment");
        } finally {
            setloading(false);
        }
    };

    useEffect(() => {
        if (data.userId._id == localStorage.getItem('userId')) {
            setOwner(true);
        }
    }, []);

    useEffect(() => {
        const userCommentexists = reviews && reviews.find((item) => item.userId._id == context.state.profileData._id);
        if (userCommentexists) {
            setAlreadyComment(true);
        }
    }, [reviews]);

    const deleteComment = async (reviewId) => {
        const response = await axios.delete(`http://localhost:3000/gig/delete-review/${reviewId}/${data._id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            }
        });
    }

    const averageRating = reviews && reviews.length > 0
        ? (reviews.reduce((acc, item) => acc + item.stars, 0) / reviews.length).toFixed(1)
        : null;


    if (!data) return <div className="text-white p-10">Gig not found.</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white px-4 py-10">
            <div className="max-w-6xl mx-auto space-y-10">
                {/* TOP SECTION: Images on left, Seller info + price + order on right */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Left: Gig Images */}
                    <div className="rounded-xl overflow-hidden shadow-lg">
                        <Swiper
                            modules={[Navigation, Pagination, Autoplay]}
                            navigation
                            pagination={{ clickable: true }}
                            autoplay={{ delay: 3000, disableOnInteraction: false }}
                            slidesPerView={1}
                            className="rounded-xl"
                        >
                            {data.images.map((img, i) => (
                                <SwiperSlide key={i}>
                                    <img
                                        src={`https://link.storjshare.io/raw/jub6kg32liwv44ypptxr3bry5bzq/skill-hub/${img}`}
                                        alt={`Gig ${i}`}
                                        className="w-full h-96 object-cover rounded-xl"
                                    />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>

                    {/* Right: Price + Seller Info + Order */}
                    <div className="bg-white/5 p-6 rounded-2xl h-fit space-y-6 shadow-lg">
                        <div>
                            <h2 className="text-2xl font-semibold">Rs {data.price}</h2>
                            <p className="text-white/70">Delivery in {data.deliveryTime} Days</p>
                            {!owner && (
                                <button className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition duration-300">
                                    Order Now
                                </button>
                            )}
                        </div>

                        <div className="border-t border-white/10 pt-4">
                            <h3 className="text-lg font-semibold mb-3">Seller Info</h3>
                            <div className="flex items-center gap-4">
                                <img
                                    src={data.userId.profilePicId
                                        ? `https://link.storjshare.io/raw/jxvb43rmljummjairrimelxup4fq/skill-hub/${data.userId.profilePicId}`
                                        : 'https://creativeandcultural.wordpress.com/wp-content/uploads/2018/04/default-profile-picture.png?w=256'}
                                    alt="Profile"
                                    className="w-14 h-14 rounded-full object-cover border border-white/10"
                                />
                                <div>
                                    <p className="font-semibold">{data.userId.name}</p>
                                    <p className="text-white/60 text-sm">{data.userId.email}</p>
                                    <p className="text-white/60 text-sm">{data.userId.designation}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTTOM SECTION: Description, Rating, Comments */}
                <div className="space-y-10">
                    {/* Description */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-2">Description</h2>
                        <p className="text-white/80 leading-relaxed">{data.description}</p>
                    </section>

                    {/* Rating */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-2">Rating</h2>
                        {data.reviews.length > 0 ? (
                            <>
                                {(() => {
                                    const averageRating = (
                                        data.reviews.reduce((acc, item) => acc + item.stars, 0) /
                                        data.reviews.length
                                    ).toFixed(1);

                                    const fullStars = Math.floor(averageRating);
                                    const hasHalfStar = averageRating - fullStars >= 0.5;
                                    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

                                    return (
                                        <>
                                            <div className="flex items-center space-x-1 text-yellow-400 text-2xl">
                                                {[...Array(fullStars)].map((_, i) => (
                                                    <span key={`full-${i}`}>★</span>
                                                ))}
                                                {hasHalfStar && <span key="half">☆</span>}
                                                {[...Array(emptyStars)].map((_, i) => (
                                                    <span key={`empty-${i}`} className="text-white/30">★</span>
                                                ))}
                                            </div>
                                            <p className="text-sm text-white/60 mt-1">
                                                {averageRating} out of 5 – based on {data.reviews.length} {data.reviews.length === 1 ? 'review' : 'reviews'}
                                            </p>
                                        </>
                                    );
                                })()}
                            </>
                        ) : (
                            <p className="text-white/60 italic">No ratings yet.</p>
                        )}
                    </section>


                    {/* Comments */}
                    <section>
                        <h2 className="text-2xl font-semibold m-2">Comments</h2>
                        <div className="space-y-4">
                            {reviews && reviews.length > 0 ? (
                                reviews.map((item, i) => (
                                    <div key={i} className="bg-white/5 p-4 rounded-xl">
                                        <div className="w-auto flex items-center gap-4 bg-white/5 p-3 rounded-xl">
                                            {/* Profile Section */}
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={item.userId.profilePicId
                                                        ? `https://link.storjshare.io/raw/jxvb43rmljummjairrimelxup4fq/skill-hub/${item.userId.profilePicId}`
                                                        : 'https://creativeandcultural.wordpress.com/wp-content/uploads/2018/04/default-profile-picture.png?w=256'}
                                                    alt="Profile"
                                                    className="w-12 h-12 rounded-full object-cover border border-white/10"
                                                />
                                                <div>
                                                    <p className="font-semibold text-white">{item.userId.name}</p>
                                                    <p className="text-white/50 text-xs">{moment(item.createdAt).fromNow()}</p>
                                                </div>
                                            </div>
                                            {/* Delete Button */}
                                            {item.userId._id === context.state.profileData._id && (
                                                <button
                                                    onClick={() => deleteComment(item._id)}
                                                    className="text-red-500 text-sm font-medium hover:underline hover:text-red-400 transition"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex gap-1 text-yellow-400 mt-2">
                                            {[...Array(item.stars)].map((_, idx) => <span key={idx}>★</span>)}
                                        </div>
                                        <p className="text-white/70 text-sm mt-2">{item.comment}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-white/60 italic">No comments yet.</p>
                            )}
                        </div>

                        {!owner && !alreadyComment && (
                            <button
                                onClick={() => setShowModal(true)}
                                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl"
                            >
                                Add Review
                            </button>
                        )}
                    </section>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
                    <div className="bg-gray-900 text-white rounded-xl p-6 w-full max-w-md relative">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-2 right-3 text-2xl text-gray-500 hover:text-red-500"
                        >
                            ×
                        </button>
                        <h3 className="text-xl font-semibold mb-4">Leave a Review</h3>
                        <div className="flex gap-1 text-yellow-400 text-2xl mb-4">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStars(s)}
                                    className={s <= stars ? 'text-yellow-400' : 'text-gray-300'}
                                >
                                    ★
                                </button>
                            ))}
                        </div>

                        <textarea
                            rows="4"
                            className="bg-black w-full border border-gray-300 rounded-lg p-3 focus:outline-none"
                            placeholder="Write your comment..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />

                        <button
                            onClick={handleReviewSubmit}
                            disabled={loading}
                            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl"
                        >
                            {loading ? "Submitting..." : "Submit Review"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SingleGig;
