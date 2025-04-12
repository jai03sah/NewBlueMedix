import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import Logout from '../auth/Logout';
import { scrollToElement, handleHashLinkClick } from '../../utils/scrollUtils';

const UserLayout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get user from localStorage
  const getUserData = () => {
    const userData = JSON.parse(localStorage.getItem('user'));
    return userData;
  };
  
  const user = getUserData();

  // Handle hash links when the component mounts or location changes
  useEffect(() => {
    // Check if there's a hash in the URL
    if (location.hash) {
      // Wait a bit for the page to fully render before scrolling
      setTimeout(() => {
        scrollToElement(location.hash.substring(1));
      }, 100);
    }
  }, [location]);
  
  // Update cart count when user data changes
  useEffect(() => {
    // Initial cart count
    const userData = getUserData();
    setCartCount(userData?.shopping_cart?.length || 0);
    
    // Listen for storage events (when cart is updated)
    const handleStorageChange = () => {
      const updatedUser = getUserData();
      setCartCount(updatedUser?.shopping_cart?.length || 0);
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check for updates every second (as a fallback)
    const intervalId = setInterval(() => {
      const updatedUser = getUserData();
      setCartCount(updatedUser?.shopping_cart?.length || 0);
    }, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);


  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-blue-600">BlueMedix</Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link to="/products" className="text-gray-600 hover:text-blue-600">Products</Link>
              <Link to="/categories" className="text-gray-600 hover:text-blue-600">Categories</Link>
              <a
                href="#about-us"
                className="text-gray-600 hover:text-blue-600 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  handleHashLinkClick('#about-us', navigate, location.pathname);
                }}
              >
                About Us
              </a>
              <a
                href="#contact"
                className="text-gray-600 hover:text-blue-600 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  handleHashLinkClick('#contact', navigate, location.pathname);
                }}
              >
                Contact
              </a>
            </nav>
            
            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <Link to="/cart" className="text-gray-600 hover:text-blue-600 relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {cartCount}
                </span>
              </Link>
              
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <img 
                    className="h-8 w-8 rounded-full object-cover"
                    src={user?.img_url || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user?.name || "User")}
                    alt="Profile"
                  /> 
                  <span className="hidden md:block text-gray-700">{user?.name}</span>
                </button>
                
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <Link
                      to="/user/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Your Profile
                    </Link>
                    <Link 
                      to="/orders" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Your Orders
                    </Link>
                    <Link
                      to="/user/logout"
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    > 
                      Sign out
                    </Link>
                  </div>
                )}
              </div>
              
              {/* Mobile menu button */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden text-gray-600 focus:outline-none"
              > 
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className="md:hidden py-4 border-t">
              <Link 
                to="/products" 
                className="block py-2 text-gray-600 hover:text-blue-600"
                onClick={() => setIsMenuOpen(false)}
              > 
                Products
              </Link>
              <Link 
                to="/categories" 
                className="block py-2 text-gray-600 hover:text-blue-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Categories
              </Link>
              <a
                href="#about-us"
                className="block py-2 text-gray-600 hover:text-blue-600 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  setIsMenuOpen(false);
                  handleHashLinkClick('#about-us', navigate, location.pathname);
                }}
              >
                About Us
              </a>
              <a
                href="#contact"
                className="block py-2 text-gray-600 hover:text-blue-600 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  setIsMenuOpen(false);
                  handleHashLinkClick('#contact', navigate, location.pathname);
                }}
              >
                Contact
              </a>
            </nav>
          )}
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 bg-gray-50">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">BlueMedix</h3>
              <p className="text-gray-400">
                Your trusted partner for medical supplies and equipment.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/products" className="text-gray-400 hover:text-white">Products</Link></li>
                <li><Link to="/categories" className="text-gray-400 hover:text-white">Categories</Link></li>
                <li>
                  <a
                    href="#about-us"
                    className="text-gray-400 hover:text-white cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      handleHashLinkClick('#about-us', navigate, location.pathname);
                    }}
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="text-gray-400 hover:text-white cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      handleHashLinkClick('#contact', navigate, location.pathname);
                    }}
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
              <ul className="space-y-2">
                <li><Link to="/faq" className="text-gray-400 hover:text-white">FAQ</Link></li>
                <li><Link to="/shipping" className="text-gray-400 hover:text-white">Shipping Policy</Link></li>
                <li><Link to="/returns" className="text-gray-400 hover:text-white">Returns & Refunds</Link></li>
                <li><Link to="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <address className="text-gray-400 not-italic">
                <p>123 Medical Plaza</p>
                <p>New Delhi, India</p>
                <p className="mt-2">Email: info@bluemedix.com</p>
                <p>Phone: +91 123 456 7890</p>
              </address>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} BlueMedix. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserLayout;