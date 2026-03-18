import React from 'react';

const Navbar = () => {
  return (
    <nav className="bg-indigo-600 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-white text-xl font-bold">Book Buddy</span>
            </div>
            <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
              <a href="#" className="border-indigo-200 text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Home
              </a>
              <a href="#" className="border-transparent text-indigo-100 hover:text-white hover:border-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                My Books
              </a>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
             <button className="bg-indigo-700 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-800">
               Login
             </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
