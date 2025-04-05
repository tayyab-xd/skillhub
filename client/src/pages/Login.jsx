import axios from 'axios';
import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify';
import { AppContext } from '../context/context';

function Login() {
  const navigate = useNavigate()
  const context=useContext(AppContext)
  const dispatch=context.dispatch
  const [user, setUser] = useState({ email: '', password: '' })
  const handleInput = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value })
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData();
    formData.append('email', user.email)
    formData.append('password', user.password)
    try {
      const response = await axios.post('http://localhost:3000/user/login', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success("Login successful! ",{
        autoClose: 1000,
      });
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('email', response.data.email)
      localStorage.setItem('name', response.data.name)
      localStorage.setItem('userId', response.data.userId)
      dispatch({type:'LOGGED_IN',payload:true})
      const successSound = new Audio('../public/success.mp3');
      successSound.play()
      navigate('/')
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.msg);
      } else {
        console.log(error);
      }
    }
  }
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black text-white px-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md transform hover:scale-105 transition-transform duration-300">
        <h2 className="text-3xl font-bold text-center mb-6 animate-fadeIn">Welcome Back</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email" name='email'
              required value={user.email}
              onChange={handleInput}
              className="w-full p-3 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password" name='password'
              onChange={handleInput} value={user.password}
              className="w-full p-3 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 py-3 rounded-md font-semibold text-white hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Log In
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-400 hover:text-blue-500 transition-colors">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
