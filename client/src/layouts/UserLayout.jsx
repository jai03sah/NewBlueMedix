import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const UserLayout = ({ children }) => {
  const location = useLocation();
  
  // Define navigation links
  const navLinks = [
    { path: '/user/dashboard', label: 'Dashboard' },
    { path: '/cart', label: 'Cart' },
    { path: '/orders', label: 'Orders' },
    { path: '/addresses', label: 'Addresses' },
    { path: '/products', label: 'Products' }
  ];
  
  // Check if the current path matches or starts with a nav link path
  const isActive = (path) => {
    if (path === '/user/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-blue-600">BlueMedix</Link>
          
          <div className="flex items-center space-x-4">
            <Link to="/user/dashboard" className="text-gray-700 hover:text-blue-600">
              My Account
            </Link>
            <Link to="/user/logout" className="text-red-600 hover:text-red-800">
              Logout
            </Link>
          </div>
        </div>
      </header>
      
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto py-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`whitespace-nowrap px-1 py-2 text-sm font-medium border-b-2 ${
                  isActive(link.path)
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="py-6">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white shadow-inner py-6 mt-8">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} BlueMedix. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default UserLayout;