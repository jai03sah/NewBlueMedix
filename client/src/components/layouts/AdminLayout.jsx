import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Logout from '../auth/Logout';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  const isActive = (path) => {
    return location.pathname === path ? 'bg-blue-800 text-white' : 'text-blue-100 hover:bg-blue-700';
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-blue-900 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out z-20`}>
        <div className="flex items-center space-x-2 px-4">
          <span className="text-2xl font-extrabold">BlueMedix</span>
          <span className="px-2 py-1 bg-blue-800 rounded-lg text-xs">Admin</span>
        </div>
        
        <nav>
          <Link 
            to="/admin/dashboard" 
            className={`block py-2.5 px-4 rounded transition duration-200 ${isActive('/admin/dashboard')}`}
          > 
            Dashboard
          </Link>
          <Link 
            to="/admin/users" 
            className={`block py-2.5 px-4 rounded transition duration-200 ${isActive('/admin/users')}`}
          >
            User Management
          </Link>
          <Link 
            to="/admin/managers" 
            className={`block py-2.5 px-4 rounded transition duration-200 ${isActive('/admin/managers')}`}
          >
            Manager Management
          </Link>
          <Link 
            to="/admin/franchises" 
            className={`block py-2.5 px-4 rounded transition duration-200 ${isActive('/admin/franchises')}`}
          >
            Franchise Management
          </Link>
          <Link
            to="/admin/products"
            className={`block py-2.5 px-4 rounded transition duration-200 ${isActive('/admin/products')}`}
          >
            Product Management
          </Link>
          <Link
            to="/admin/categories"
            className={`block py-2.5 px-4 rounded transition duration-200 ${isActive('/admin/categories')}`}
          >
            Category Management
          </Link>
          <Link
            to="/admin/franchise-stock"
            className={`block py-2.5 px-4 rounded transition duration-200 ${isActive('/admin/franchise-stock')}`}
          >
            Franchise Stock
          </Link>
          <Link
            to="/admin/orders"
            className={`block py-2.5 px-4 rounded transition duration-200 ${isActive('/admin/orders')}`}
          >
            Order Management
          </Link>
          <Link
            to="/admin/reports"
            className={`block py-2.5 px-4 rounded transition duration-200 ${isActive('/admin/reports')}`}
          >
            Reports
          </Link>

          <div className="pt-4 mt-4 border-t border-blue-800">
            <Link
              to="/documentation"
              className={`block py-2.5 px-4 rounded transition duration-200 ${isActive('/documentation')} flex items-center`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              System Documentation
            </Link>
          </div>
        </nav>
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-md h-16 flex items-center justify-between px-6">
          <div className="flex items-center">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="text-gray-500 focus:outline-none md:hidden"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          
          <div className="flex items-center">
            <div className="relative group">
              <button className="flex items-center space-x-2 focus:outline-none">
                <span className="text-gray-700">{user?.name}</span>
                <img
                  className="h-8 w-8 rounded-full object-cover"
                  src={user?.img_url || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user?.name || "Admin")}
                  alt="Profile"
                />
              </button> 
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                <Link
                  to="/admin/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                > 
                  Your Profile
                </Link>
                <Link
                  to="/admin/logout"
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign out
                </Link>
              </div>
            </div>
            <Link
              to="/admin/logout"
              className="ml-4 px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded-md"
            > 
              Logout 
            </Link>
          </div>
        </header>
        
        {/* Main content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;