import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const ManagerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [customDateRange, setCustomDateRange] = useState({ from: '', to: '' });

  useEffect(() => {
    fetchOrders();
  }, [activeTab, currentPage, selectedDateRange, customDateRange, searchQuery]); // Added searchQuery and fetchOrders is defined in the same component

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null); // Reset error state before new fetch
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      if (!token) {
        setError('Authentication token not found. Please log in again.');
        toast.error('Authentication required');
        setLoading(false);
        return;
      }

      if (!user || !user.franchise) {
        setError('No franchise assigned to this manager.');
        toast.error('No franchise assigned');
        setLoading(false);
        return;
      }

      // Build query parameters
      let url = `${process.env.REACT_APP_API_URL}/api/franchises/${user.franchise}/orders?page=${currentPage}`;

      // Use the correct parameter name for status filtering
      if (activeTab !== 'all') {
        url += `&status=${encodeURIComponent(activeTab)}`;
      }

      // Add search query if present
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }

      // Add date range filters
      if (selectedDateRange === 'today') {
        const today = new Date().toISOString().split('T')[0];
        url += `&startDate=${today}&endDate=${today}`;
      } else if (selectedDateRange === 'week') {
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        url += `&startDate=${weekAgo.toISOString().split('T')[0]}&endDate=${today.toISOString().split('T')[0]}`;
      } else if (selectedDateRange === 'month') {
        const today = new Date();
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        url += `&startDate=${monthAgo.toISOString().split('T')[0]}&endDate=${today.toISOString().split('T')[0]}`;
      } else if (selectedDateRange === 'custom' && customDateRange.from && customDateRange.to) {
        url += `&startDate=${customDateRange.from}&endDate=${customDateRange.to}`;
      }

      console.log('Fetching orders from:', url);

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data && response.data.success) {
        // Log the first order to see its structure
        if (response.data.orders && response.data.orders.length > 0) {
          console.log('First order structure:', response.data.orders[0]);

          // Debug the customer data structure in the first order
          const firstOrder = response.data.orders[0];
          console.log('Customer data in first order:', {
            user: firstOrder.user,
            user_id: firstOrder.user_id,
            customer: firstOrder.customer,
            customerId: firstOrder.customerId,
            userId: firstOrder.userId
          });
        }

        // Map the orders to ensure customer information is properly formatted
        const formattedOrders = (response.data.orders || []).map(order => {
          // Debug each order's structure
          debugOrderStructure(order);

          // Create a new order object with consistent customer information
          const formattedOrder = { ...order };

          // Check all possible customer data fields
          if (order.customer) {
            // If customer field exists, make sure it's properly structured
            formattedOrder.user_id = typeof order.customer === 'object' ? order.customer : {
              name: typeof order.customer === 'string' ? order.customer : 'Unknown Customer',
              _id: typeof order.customer === 'string' ? order.customer : 'unknown'
            };
          } else if (order.user_id && typeof order.user_id === 'string') {
            // If user_id is a string (just the ID), create a name object
            formattedOrder.user_id = {
              name: 'Customer #' + order.user_id.substring(0, 8),
              _id: order.user_id
            };
          } else if (order.user && typeof order.user === 'object') {
            // If user is an object, map it to user_id for consistency
            formattedOrder.user_id = order.user;
          } else if (order.userId && typeof order.userId === 'object') {
            // Check for userId variant
            formattedOrder.user_id = order.userId;
          } else if (order.customerId || order.customerName) {
            // Handle other possible customer fields
            formattedOrder.user_id = {
              name: order.customerName || ('Customer #' + order.customerId?.substring(0, 8)) || 'Unknown Customer',
              _id: order.customerId || 'unknown'
            };
          }

          return formattedOrder;
        });

        setOrders(formattedOrders);
        setTotalPages(response.data.pagination?.pages || 1);

        if (formattedOrders.length === 0 && currentPage > 1) {
          // If we get an empty page and we're not on page 1, go back to page 1
          setCurrentPage(1);
        }
      } else {
        setError(response.data?.message || 'Failed to fetch orders');
        toast.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Fetch orders error:', error);

      // Detailed error handling
      let errorMessage = 'An error occurred while fetching orders';

      if (isNetworkError(error)) {
        errorMessage = 'Network error: Unable to connect to the server. Please check your internet connection and try again.';
      } else if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const statusCode = error.response.status;
        const serverMessage = error.response.data?.message || '';

        if (statusCode === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (statusCode === 403) {
          errorMessage = 'You do not have permission to access order data.';
        } else if (statusCode === 404) {
          errorMessage = 'Order data not found.';
        } else if (statusCode === 500) {
          errorMessage = `Server error: ${serverMessage || 'Internal server error'}`;
        } else {
          errorMessage = `Error (${statusCode}): ${serverMessage || errorMessage}`;
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your network connection.';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = `Request error: ${error.message}`;
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if the error is a network error
  const isNetworkError = (error) => {
    return (
      error.message === 'Network Error' ||
      (error.request && !error.response) ||
      error.code === 'ECONNABORTED' ||
      (error.response && (error.response.status === 0 || error.response.status === 502 || error.response.status === 503 || error.response.status === 504))
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    // fetchOrders will be called by the useEffect when searchQuery changes
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDateRange('all');
    setCustomDateRange({ from: '', to: '' });
    setActiveTab('all');
    setCurrentPage(1);
    // fetchOrders will be called by the useEffect when state changes
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('Authentication required to update order status');
        return;
      }

      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/orders/${orderId}/status`,
        { deliverystatus: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data && response.data.success) {
        toast.success(`Order status updated to ${newStatus}`);

        // Update the order in the state
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order._id === orderId
              ? { ...order, deliverystatus: newStatus }
              : order
          )
        );
      } else {
        toast.error(response.data?.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Update order status error:', error);

      // Detailed error handling
      let errorMessage = 'Failed to update order status';

      if (isNetworkError(error)) {
        errorMessage = 'Network error: Unable to connect to the server. Please check your internet connection and try again.';
      } else if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const statusCode = error.response.status;
        const serverMessage = error.response.data?.message || '';

        if (statusCode === 400) {
          errorMessage = `Validation error: ${serverMessage || 'Please check your input'}`;
        } else if (statusCode === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (statusCode === 403) {
          errorMessage = 'You do not have permission to update this order.';
        } else if (statusCode === 404) {
          errorMessage = 'Order not found. It may have been deleted.';
        } else if (statusCode === 500) {
          errorMessage = `Server error: ${serverMessage || 'Internal server error'}`;
        } else {
          errorMessage = `Error (${statusCode}): ${serverMessage || errorMessage}`;
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your network connection.';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = `Request error: ${error.message}`;
      }

      toast.error(errorMessage);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Debug function to log customer information
  const debugCustomerInfo = (order) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Order ID:', order._id);
      console.log('Customer data:', {
        user_id: order.user_id,
        user: order.user,
        customer: order.customer
      });
    }
    return null;
  };

  // Helper function to get customer name from any available source
  const getCustomerName = (order) => {
    // Check all possible locations for customer name
    if (order.user_id) {
      if (typeof order.user_id === 'object') {
        return order.user_id.name || order.user_id.fullName;
      } else {
        return order.user_id; // If it's just a string
      }
    }

    if (order.user) {
      if (typeof order.user === 'object') {
        return order.user.name || order.user.fullName;
      } else {
        return order.user; // If it's just a string
      }
    }

    if (order.customer) {
      if (typeof order.customer === 'object') {
        return order.customer.name || order.customer.fullName;
      } else {
        return order.customer; // If it's just a string
      }
    }

    // Check other possible fields
    return order.customerName || order.userName || order.userId || order.customerId || null;
  };

  // Helper function to get customer email from any available source
  const getCustomerEmail = (order) => {
    // Check all possible locations for customer email
    if (order.user_id && typeof order.user_id === 'object') {
      return order.user_id.email;
    }

    if (order.user && typeof order.user === 'object') {
      return order.user.email;
    }

    if (order.customer && typeof order.customer === 'object') {
      return order.customer.email;
    }

    // Check other possible fields
    return order.customerEmail || order.userEmail || null;
  };

  // Helper function to get customer ID from any available source
  const getCustomerId = (order) => {
    // Check all possible locations for customer ID
    if (order.user_id) {
      if (typeof order.user_id === 'object') {
        return order.user_id._id;
      } else {
        return order.user_id; // If it's just a string ID
      }
    }

    if (order.user) {
      if (typeof order.user === 'object') {
        return order.user._id;
      } else {
        return order.user; // If it's just a string ID
      }
    }

    if (order.customer) {
      if (typeof order.customer === 'object') {
        return order.customer._id;
      } else {
        return order.customer; // If it's just a string ID
      }
    }

    // Check other possible fields
    return order.customerId || order.userId || null;
  };

  // Debug function to log order structure
  const debugOrderStructure = (order) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Order structure:', {
        id: order._id,
        user_id: order.user_id,
        user: order.user,
        customer: order.customer,
        customerId: order.customerId,
        userId: order.userId
      });
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
          <button
            onClick={() => fetchOrders()}
            className="ml-4 bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-full"
            title="Refresh order list"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setCurrentPage(1);
              fetchOrders();
            }}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded flex items-center"
          >
            <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Refresh
          </button>
          {(searchQuery || selectedDateRange !== 'all' || activeTab !== 'all') && (
            <button
              onClick={clearFilters}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded flex items-center"
            >
              <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                placeholder="Search by order ID or customer name"
                className="flex-1 border border-gray-300 rounded-l px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-r"
              >
                Search
              </button>
            </form>
          </div>

          {/* Date Range Filter */}
          <div>
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Custom Date Range */}
          {selectedDateRange === 'custom' && (
            <div className="flex space-x-2">
              <input
                type="date"
                value={customDateRange.from}
                onChange={(e) => setCustomDateRange({ ...customDateRange, from: e.target.value })}
                className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="date"
                value={customDateRange.to}
                onChange={(e) => setCustomDateRange({ ...customDateRange, to: e.target.value })}
                className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b">
        <nav className="flex space-x-8">
          <button
            onClick={() => {
              setActiveTab('all');
              setCurrentPage(1);
            }}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Orders
          </button>
          <button
            onClick={() => {
              setActiveTab('pending');
              setCurrentPage(1);
            }}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pending'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => {
              setActiveTab('accepted');
              setCurrentPage(1);
            }}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'accepted'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Accepted
          </button>
          <button
            onClick={() => {
              setActiveTab('dispatched');
              setCurrentPage(1);
            }}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'dispatched'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Dispatched
          </button>
          <button
            onClick={() => {
              setActiveTab('delivered');
              setCurrentPage(1);
            }}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'delivered'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Delivered
          </button>
          <button
            onClick={() => {
              setActiveTab('cancelled');
              setCurrentPage(1);
            }}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'cancelled'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Cancelled
          </button>
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : error ? (
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => fetchOrders()}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Try Again
            </button>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDateRange('all');
                setCustomDateRange({ from: '', to: '' });
                setActiveTab('all');
                setCurrentPage(1);
              }}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Reset Filters
            </button>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h2 className="text-xl font-semibold mt-4">No orders found</h2>
          <p className="text-gray-600 mt-2">
            {activeTab === 'all'
              ? "There are no orders in your franchise yet."
              : `There are no ${activeTab} orders.`}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    {/* Debug customer info in development */}
                    {debugCustomerInfo(order)}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order._id.substring(order._id.length - 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* Customer information cell with link to customer details */}
                      {getCustomerId(order) ? (
                        <Link to={`/manager/customers/${getCustomerId(order)}`} className="group">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              {/* Try to get the customer image from any available source */}
                              <img
                                className="h-8 w-8 rounded-full"
                                src={
                                  (order.user_id?.img_url || order.user?.img_url || order.customer?.img_url) ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    getCustomerName(order) || 'User'
                                  )}`
                                }
                                alt={getCustomerName(order) || 'User'}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-green-600">
                                {/* Display customer name */}
                                {getCustomerName(order) || 'Unknown Customer'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {/* Display customer email if available */}
                                {getCustomerEmail(order) || 'No email available'}
                              </div>
                              <div className="text-xs text-green-600 mt-1">
                                View Customer Profile
                              </div>
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                              N/A
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {getCustomerName(order) || 'Unknown Customer'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {getCustomerEmail(order) || 'No email available'}
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.product_id ? (
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded overflow-hidden">
                            {order.product_id.image && order.product_id.image.length > 0 ? (
                              <img 
                                src={order.product_id.image[0]} 
                                alt={order.product_id.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {order.product_id.name}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Product unavailable</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(order.deliverystatus)}`}>
                        {order.deliverystatus.charAt(0).toUpperCase() + order.deliverystatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.paymentStatus === 'Paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link 
                          to={`/manager/orders/${order._id}`} 
                          className="text-green-600 hover:text-green-900"
                        >
                          View
                        </Link>
                        
                        {/* Status Update Dropdown */}
                        {order.deliverystatus !== 'delivered' && order.deliverystatus !== 'cancelled' && (
                          <div className="relative inline-block text-left">
                            <div>
                              <button
                                type="button"
                                className="text-green-600 hover:text-green-900 focus:outline-none"
                                id={`status-menu-${order._id}`}
                                aria-expanded="true"
                                aria-haspopup="true"
                                onClick={() => {
                                  // Toggle dropdown menu
                                  const dropdown = document.getElementById(`status-dropdown-${order._id}`);
                                  if (dropdown) {
                                    dropdown.classList.toggle('hidden');
                                  }
                                }}
                              >
                                Update Status
                              </button>
                            </div>
                            <div
                              id={`status-dropdown-${order._id}`}
                              className="hidden origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                              role="menu"
                              aria-orientation="vertical"
                              aria-labelledby={`status-menu-${order._id}`}
                              tabIndex="-1"
                            >
                              <div className="py-1" role="none">
                                {order.deliverystatus !== 'accepted' && (
                                  <button
                                    onClick={() => handleStatusChange(order._id, 'accepted')}
                                    className="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                    role="menuitem"
                                    tabIndex="-1"
                                  >
                                    Accept Order
                                  </button>
                                )}
                                {(order.deliverystatus === 'accepted' || order.deliverystatus === 'pending') && (
                                  <button
                                    onClick={() => handleStatusChange(order._id, 'dispatched')}
                                    className="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                    role="menuitem"
                                    tabIndex="-1"
                                  >
                                    Mark as Dispatched
                                  </button>
                                )}
                                {order.deliverystatus === 'dispatched' && (
                                  <button
                                    onClick={() => handleStatusChange(order._id, 'delivered')}
                                    className="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                    role="menuitem"
                                    tabIndex="-1"
                                  >
                                    Mark as Delivered
                                  </button>
                                )}
                                {order.deliverystatus !== 'cancelled' && (
                                  <button
                                    onClick={() => handleStatusChange(order._id, 'cancelled')}
                                    className="text-red-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                    role="menuitem"
                                    tabIndex="-1"
                                  >
                                    Cancel Order
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {/* Page numbers */}
                    {[...Array(totalPages).keys()].map(number => {
                      const pageNumber = number + 1;
                      // Show current page, first, last, and pages around current
                      if (
                        pageNumber === 1 || 
                        pageNumber === totalPages || 
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === pageNumber
                                ? 'z-10 bg-green-50 border-green-500 text-green-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      } else if (
                        pageNumber === 2 || 
                        pageNumber === totalPages - 1
                      ) {
                        // Show ellipsis
                        return (
                          <span
                            key={pageNumber}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                          >
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManagerOrders;