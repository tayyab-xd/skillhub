import React, { useContext, useState } from "react";
import { AppContext } from "../context/context";
import { Search, Filter, ChevronDown } from "lucide-react";
import { NavLink } from 'react-router-dom'
import NavbarLearn from "../components/NavbarLearn";

const CoursesPage = () => {
  const context = useContext(AppContext)
  const courses = context.state.filterCourses
  const allCourses = context.state.courses
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  
  const titleFitler = (e) => {
    setTitle(e.target.value)
    context.dispatch({ type: 'FILTER_TITLE', payload: e.target.value })
  }
  const filterCategory=(e)=>{
    setCategory(e.target.value)
    context.dispatch({ type: 'FILTER_CATEGORY', payload: e.target.value })
  }
  return (
    <>
    <NavbarLearn/>
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full md:w-1/3">
          <input
            type="text" name="title" value={title} onChange={titleFitler}
            placeholder="Search courses..."
            className="w-full p-3 pl-10 bg-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        </div>
        <div className="flex gap-4">
          <select onChange={filterCategory} className="bg-gray-800 p-3 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option value="">Select Category</option>
            {allCourses && allCourses.map((item, i) => (
              <option key={i} value={item.category}>
                {item.category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {courses && courses.map((item, i) => (
          <div
            key={i}
            className="bg-gray-800 rounded-xl overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300"
          > 
            <img
              src={`https://link.storjshare.io/raw/jx7pshuf3hqzux6iwpuh2o3fet5a/skill-hub/${item.thumbnailId}`}
              alt="Course Thumbnail"
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm mb-4">By {item.userId.name}</p>
              <NavLink to={`/singlecourse/${item._id}`}>
                <button className="bg-blue-500 py-2 px-4 rounded-lg w-full hover:bg-blue-600 transition">
                  View Course
                </button>
              </NavLink>
            </div>
          </div>
        ))}

      </div>
    </div>
    </>
  );
};

export default CoursesPage;