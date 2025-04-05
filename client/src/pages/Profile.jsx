import { Link } from 'react-router-dom';
import { AppContext } from '../context/context';
import { useContext } from 'react';

function Profile() {
  const context = useContext(AppContext)
  const user = context.state.profileData
  console.log(user)
  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-lg shadow-xl">
        {/* Profile Header */}
        <div className="flex flex-col items-center space-y-4">
          <img
            src={user.profilePicId ? `https://link.storjshare.io/raw/jxvb43rmljummjairrimelxup4fq/skill-hub/${user.profilePicId}` : 'https://creativeandcultural.wordpress.com/wp-content/uploads/2018/04/default-profile-picture.png?w=256'}
            alt="Profile"
            className="w-32 h-32 object-cover rounded-full border-4 border-blue-500 shadow-md hover:scale-105 transition-transform duration-300"
          />
          
          <h2 className="text-3xl font-semibold">{user && user.name}</h2>
          <p className="text-gray-400 text-sm">{user && user.designation}</p>
          <p className="text-gray-300 text-center max-w-lg">
            {user && user.bio}
          </p>
          <div className="flex space-x-4">
            <Link
              to="/edit-profile"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105"
            >
              Edit Profile
            </Link>
            {/* <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-300 transform hover:scale-105">
              Add Profile Picture
            </button> */}
          </div>
        </div>

        {/* Courses Section */}
        <div className="mt-10">
          <h3 className="text-2xl font-semibold border-b pb-2 mb-4">Courses Enrolled</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {user.coursesEnrolled && user.coursesEnrolled.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {user.coursesEnrolled.map((item, i) => (
                <div key={i} className="bg-gray-700 p-4 rounded-lg transition-transform duration-300">
                  <Link to={`/singlecourse/${item._id}`} className="text-blue-500 hover:underline hover:text-blue-700 transition duration-300">
                    <h4 className="text-lg font-semibold">{item.title}</h4>
                  </Link>
                  <p className="text-gray-400 text-sm">{item.category}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No courses uploaded.</p>
          )}
          </div>
        </div>

        <div className="mt-10">
          <h3 className="text-2xl font-semibold border-b pb-2 mb-4">Your Courses</h3>

          {user.courses && user.courses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {user.courses.map((item, i) => (
                <div key={i} className="bg-gray-700 p-4 rounded-lg transition-transform duration-300">
                  <Link to={`/singlecourse/${item._id}`} className="text-blue-500 hover:underline hover:text-blue-700 transition duration-300">
                    <h4 className="text-lg font-semibold">{item.title}</h4>
                  </Link>
                  <p className="text-gray-400 text-sm">{item.category}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No courses uploaded.</p>
          )}
        </div>

      </div>
    </div>
  );
}

export default Profile;
