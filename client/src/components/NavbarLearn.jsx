import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AppContext } from '../context/context';

function NavbarLearn() {
    const context=useContext(AppContext)
    const loggedIn=context.state.loggedIn
    const dispatch=context.dispatch
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        localStorage.removeItem('name');
        localStorage.removeItem('userId');
        dispatch({type:'LOGGED_IN',payload:false})
    }
    return (
        <nav className="bg-black px-6 py-4 flex justify-between items-center shadow-md sticky top-0 z-50">
            {/* Logo */}
            <img className='h-16' src="../public/logo.png" alt="" />
            {/* Navigation Links */}
            {loggedIn && <ul className="flex space-x-6 text-gray-400 ">
                <li>
                    <NavLink
                        to="/"
                        className={({ isActive }) => isActive ? "text-white" : "hover:text-white transition-colors duration-300"}
                    >
                        Home
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="courses"
                        className={({ isActive }) => isActive ? "text-white" : "hover:text-white transition-colors duration-300"}
                    >
                        Courses
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="upload"
                        className={({ isActive }) => isActive ? "text-white" : "hover:text-white transition-colors duration-300"}
                    >
                        Upload Course
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to={`profile/${localStorage.getItem('userId')}`}
                        className={({ isActive }) => isActive ? "text-white" : "hover:text-white transition-colors duration-300"}
                    >
                        Profile
                    </NavLink>
                </li>
            </ul>}
            {loggedIn && <div className="gap-4 flex justify-between mt-4">
                <NavLink to="/login">
                    <button onClick={logout} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-transform transform hover:scale-105 shadow-lg">
                        Logout
                    </button>
                </NavLink>
                {/* Switch Mode Button */}
                <NavLink >
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg">
                        Earn Mode (coming soon)
                    </button>
                </NavLink>
            </div>}
        </nav>
    );
}

export default NavbarLearn;
