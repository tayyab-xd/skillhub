import React from 'react';

function CategoriesLearn() {
    return (
        <section className="bg-black text-white py-12 px-6">
            <h2 className="text-2xl font-bold mb-6 text-center">Course Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800 p-4 rounded-lg text-center cursor-pointer transition-transform transform hover:scale-105 hover:bg-blue-600 hover:shadow-lg">
                    Data Science
                </div>
                <div className="bg-gray-800 p-4 rounded-lg text-center cursor-pointer transition-transform transform hover:scale-105 hover:bg-green-600 hover:shadow-lg">
                    Business
                </div>
                <div className="bg-gray-800 p-4 rounded-lg text-center cursor-pointer transition-transform transform hover:scale-105 hover:bg-purple-600 hover:shadow-lg">
                    Computer Science
                </div>
                <div className="bg-gray-800 p-4 rounded-lg text-center cursor-pointer transition-transform transform hover:scale-105 hover:bg-pink-600 hover:shadow-lg">
                    Art & Design
                </div>
                <div className="bg-gray-800 p-4 rounded-lg text-center cursor-pointer transition-transform transform hover:scale-105 hover:bg-yellow-600 hover:shadow-lg">
                    Personal Development
                </div>
                <div className="bg-gray-800 p-4 rounded-lg text-center cursor-pointer transition-transform transform hover:scale-105 hover:bg-red-600 hover:shadow-lg">
                    Health
                </div>
                <div className="bg-gray-800 p-4 rounded-lg text-center cursor-pointer transition-transform transform hover:scale-105 hover:bg-indigo-600 hover:shadow-lg">
                    Language Learning
                </div>
                <div className="bg-gray-800 p-4 rounded-lg text-center cursor-pointer transition-transform transform hover:scale-105 hover:bg-teal-600 hover:shadow-lg">
                    Marketing
                </div>
            </div>
        </section>
    );
}

export default CategoriesLearn;
