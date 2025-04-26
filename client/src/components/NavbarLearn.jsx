import React, { useContext, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/context';
import { LogOut } from 'lucide-react';

function NavbarLearn() {
    const navigate=useNavigate()
    const context=useContext(AppContext)
    const loggedIn=context.state.loggedIn
    const mode=context.state.learnMode
    const setMode=context.setMode
    const dispatch=context.dispatch
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        localStorage.removeItem('name');
        localStorage.removeItem('userId');
        dispatch({type:'LOGGED_IN',payload:false})
        navigate('/login')
    }
    //check login/logout
    useEffect(() => {
        if (!context.state.loggedIn) {
            navigate('/login')
        }else{
            navigate(mode ? '/learn' : '/earn'); 
        }
    }, [mode,context.state])
    return (
        <nav className="bg-black px-6 py-4 flex justify-between items-center shadow-md h-24 sticky top-0 z-50">
            {/* Logo */}
            <NavLink to={mode?'/learn':'/earn'}>
            <img className='h-24' src="../public/logo.jpeg" alt="" />
            </NavLink>
            {/* Navigation Links */}
            {loggedIn && <ul className="flex space-x-6 text-gray-400 ">
                <li>
                    <NavLink
                        to={mode?'/learn':'/earn'}
                        className={({ isActive }) => isActive ? "text-white" : "hover:text-white transition-colors duration-300"}
                    >
                        Home
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to={mode?'Courses':'Gigs'}
                        className={({ isActive }) => isActive ? "text-white" : "hover:text-white transition-colors duration-300"}
                    >
                        {mode?'Courses':'Gigs'}
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to={mode?'upload':'UploadGig'}
                        className={({ isActive }) => isActive ? "text-white" : "hover:text-white transition-colors duration-300"}
                    >
                        {mode?'Upload Course':'Upload Gig'}
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
                    <button onClick={setMode} className="bg-blue-600 w-40 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg">
                        {mode?'Learn Mode':'Earn Mode'}
                    </button>
                </NavLink>
            </div>}
        </nav>
    );
}

export default NavbarLearn;
