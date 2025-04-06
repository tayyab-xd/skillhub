import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/context';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NavbarLearn from '../components/NavbarLearn';


function EditProfile() {
  const navigate = useNavigate()
  const context = useContext(AppContext);
  const oldUser = context.state.profileData;
  const [user, setUser] = useState(oldUser || {});
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profileDelLoading, setProfileDelLoading] = useState(false)

  useEffect(() => {
    if (oldUser) {
      setUser({
        ...user,
        password: '',
      });
    }
  }, [oldUser]);

  const handleInput = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value
    });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    setUser({
      ...user,
      profilePic: file
    });
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    if (user.name) formData.append("name", user.name);
    if (user.email) formData.append("email", user.email);
    if (user.bio) formData.append("bio", user.bio);
    if (user.designation) formData.append("designation", user.designation);
    if (user.password) formData.append("password", user.password);
    if (user.profilePic) formData.append("image", user.profilePic);

    try {
      setLoading(true);
      const updatedUser = await axios.put(`http://localhost:3000/user/updateUser/${oldUser._id}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const successSound = new Audio('../public/success.mp3');
      successSound.play()
      toast.success('Profile updated successfully!');
      navigate(`/profile/${oldUser._id}`)
    } catch (error) {
      toast.error('An error occurred while updating the profile.');
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  const deleteProfilePic = async () => {
    setProfileDelLoading(true)
    try {
      await axios.delete(`http://localhost:3000/user/${oldUser._id}/deleteprofilepic`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      setUser((prevUser) => ({
        ...prevUser,
        profilePic: '',
        profilePicId: '',
      }));
      const successSound = new Audio('../public/success.mp3');
      successSound.play()
      setProfileDelLoading(false)
      setImagePreview(null);
      toast.success('Profile removed')
    } catch (error) {
      console.log(error)
      toast.error(error.response.data.msg)
    }
  }

  return (
    <>
    <NavbarLearn/>
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-6">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-4xl flex flex-col md:flex-row gap-8">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row w-full gap-8">

          {/* Left Side: Profile Picture & Name */}
          <div className="flex flex-col items-center w-full md:w-1/3 bg-gray-700 p-6 rounded-lg">

            <label className="relative cursor-pointer group">
              <input
                type="file"
                accept="image/*"
                name="image"
                className="hidden"
                onChange={handleImage}
              />
              <img
                src={imagePreview || `https://link.storjshare.io/raw/jxvb43rmljummjairrimelxup4fq/skill-hub/${user.profilePicId}` || 'https://creativeandcultural.wordpress.com/wp-content/uploads/2018/04/default-profile-picture.png?w=256'}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-600 group-hover:border-blue-500 transition duration-300"
                onError={(e) => e.target.src = 'https://creativeandcultural.wordpress.com/wp-content/uploads/2018/04/default-profile-picture.png?w=256'}
              />

              <span className="absolute bottom-2 right-2 bg-blue-600 text-xs px-2 py-1 rounded-md opacity-90 group-hover:opacity-100 transition duration-300">
                Change
              </span>
            </label>

            {/* Name Input */}
            <div className="mt-4 w-full">
              <label className="block text-sm font-medium text-gray-300">Name</label>
              <input
                required
                type="text"
                value={user.name || ''}
                name="name"
                onChange={handleInput}
                className="w-full p-3 bg-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Right Side: Form Fields */}
          <div className="w-full md:w-2/3 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300">Email</label>
              <input
                required
                type="email"
                value={user.email || ''}
                name="email"
                onChange={handleInput}
                className="w-full p-3 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Password</label>
              <input
                type="password" name='password' onChange={handleInput}
                placeholder="Enter a new password"
                className="w-full p-3 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Designation</label>
              <input
                type="text"
                value={user.designation || ''}
                name="designation"
                onChange={handleInput}
                placeholder="Add your designation"
                className="w-full p-3 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Bio</label>
              <textarea
                value={user.bio || ''}
                name="bio"
                onChange={handleInput}
                placeholder="Add your bio"
                className="w-full p-3 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            {/* Save Button */}
            <div className="flex justify-center gap-4">
              <button type='button' onClick={() => navigate(-1)} className='underline'>Back</button>
              <button
                type="button"
                onClick={deleteProfilePic}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow-md transition duration-300"
              >
                {profileDelLoading ? 'Deleting' : 'Delete Profile Picture'}
              </button>

              <button
                type="submit"
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 shadow-md ${loading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                  }`}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
    </>
  );
}

export default EditProfile;
