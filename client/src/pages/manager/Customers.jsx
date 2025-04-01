import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaSearch, FaUser, FaEnvelope, FaPhone, FaShoppingBag } from 'react-icons/fa';

const ManagerCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    // On initial load, try to fetch customers with fallback ready
    const initialLoad = async () => {
      try {
        await fetchCustomers();
      } catch (error) {
        // If there's any error, try the fallback method
        // console.log('Error in initial load, trying fallback:', error);
        await fetchCustomersFromOrders();
      }
    };

    initialLoad();
  }, [currentPage, searchQuery, sortBy, sortOrder]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
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

      // First try to get customers from the franchise-specific endpoint
      let url = `${process.env.REACT_APP_API_URL}/api/franchises/${user.franchise}/customers?page=${currentPage}`;

      // Add search parameter if provided
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }

      // Add sorting parameters
      url += `&sortBy=${sortBy}&sortOrder=${sortOrder}`;

      console.log('Fetching customers from:', url);

      try {
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data && response.data.success) {
          // console.log('Customers data:', response.data);
          setCustomers(response.data.customers || []);
          setTotalPages(response.data.pagination?.pages || 1);

          if (response.data.customers && response.data.customers.length === 0 && currentPage > 1) {
            // If we get an empty page and we're not on page 1, go back to page 1
            setCurrentPage(1);
          }
          setLoading(false);
          return;
        }
      } catch (franchiseError) {
        console.log('Franchise-specific endpoint failed:', franchiseError);

        // Check if it's a permission error (403)
        if (franchiseError.response && franchiseError.response.status === 403) {
          console.log('Permission denied (403), automatically trying orders fallback');
          // Don't show an error message, just try the fallback
        } else {
          console.log('Franchise-specific endpoint failed for a reason other than permissions, trying general users endpoint');
        }
      }

      // If we're here, the franchise-specific endpoint didn't work
      // Try to get customers from orders
      console.log('Franchise-specific endpoint failed, trying to get customers from orders');
      await fetchCustomersFromOrders();

      // If we still don't have customers, try the users endpoint as a last resort
      if (customers.length === 0) {
        try {
          const fallbackUrl = `${process.env.REACT_APP_API_URL}/api/users?role=user&page=${currentPage}`;
          console.log('No customers found from orders, trying users endpoint:', fallbackUrl);

          const fallbackResponse = await axios.get(fallbackUrl, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (fallbackResponse.data && fallbackResponse.data.success) {
            console.log('Fallback users data:', fallbackResponse.data);

            // Filter users to only include those with role 'user'
            const allUsers = fallbackResponse.data.users || [];

            // We'll set these as our customers for now
            setCustomers(allUsers);
            setTotalPages(fallbackResponse.data.pagination?.pages || 1);
          } else {
            setError(fallbackResponse.data?.message || 'Failed to fetch customers');
            toast.error('Failed to fetch customers');
          } 
        } catch (usersError) {
          console.error('Error fetching users:', usersError);

          // Instead of just showing an error, automatically try to fetch customers from orders
          console.log('Permission denied for direct customer access, automatically trying orders fallback');

          // Clear the error so it doesn't show while we're trying the fallback
          setError(null);

          // Try to get customers from orders as a last resort
          await fetchCustomersFromOrders();

          // If we still don't have customers after trying the fallback, show a more generic error
          // if (customers.length === 0) {
          //   setError('No customer data available. Please try again later.');
          //   toast.error('No customer data available');
          // }
        }
      } 
    } catch (error) {
      console.error('Fetch customers error:', error);
      handleApiError(error, 'An error occurred while fetching customers');
    } finally {
      setLoading(false);
    }
  };

  const handleApiError = (error, defaultMessage) => {
    let errorMessage = defaultMessage;
    let shouldShowToast = true;

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const statusCode = error.response.status;
      const serverMessage = error.response.data?.message || '';

      if (statusCode === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (statusCode === 403) {
        // For permission errors, we'll try to show customers from orders instead
        // Don't show any error message, just use the fallback

        // Try to fetch orders and extract customer data
        fetchCustomersFromOrders();

        // Don't set error state since we're handling it with the fallback
        setError(null);

        return; // Exit early since we're handling this case specially
      } else if (statusCode === 404) {
        errorMessage = 'Customer data not found.';
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
    if (shouldShowToast) {
      toast.error(errorMessage);
    } else {
      // Show an informational toast instead
      toast.info(errorMessage);
    }
  };

  // Function to fetch customers from orders as a fallback
  const fetchCustomersFromOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      if (!token || !user || !user.franchise) {
        return;
      }

      const ordersUrl = `${process.env.REACT_APP_API_URL}/api/franchises/${user.franchise}/orders?limit=100`;
      console.log('Fetching customers from orders:', ordersUrl);

      const response = await axios.get(ordersUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data && response.data.success && response.data.orders) {
        // Extract unique customers from orders
        const customersMap = new Map();

        response.data.orders.forEach(order => {
          let customerId = null;
          let customerData = null;

          // Try to extract customer data from various fields
          if (order.user_id) {
            customerId = typeof order.user_id === 'object' ? order.user_id._id : order.user_id;
            customerData = typeof order.user_id === 'object' ? order.user_id : { _id: order.user_id };
          } else if (order.user) {
            customerId = typeof order.user === 'object' ? order.user._id : order.user;
            customerData = typeof order.user === 'object' ? order.user : { _id: order.user };
          } else if (order.customer) {
            customerId = typeof order.customer === 'object' ? order.customer._id : order.customer;
            customerData = typeof order.customer === 'object' ? order.customer : { _id: order.customer };
          }

          // If we found a customer ID and it's not already in our map
          if (customerId && !customersMap.has(customerId)) {
            // Create a customer object with available data
            const customer = {
              _id: customerId,
              name: customerData.name || `Customer #${customerId.substring(0, 8)}`,
              email: customerData.email || 'Email not available',
              createdAt: customerData.createdAt || order.createdAt,
              orderCount: 1
            };

            customersMap.set(customerId, customer);
          } else if (customerId && customersMap.has(customerId)) {
            // Increment order count for existing customer
            const existingCustomer = customersMap.get(customerId);
            existingCustomer.orderCount = (existingCustomer.orderCount || 0) + 1;
            customersMap.set(customerId, existingCustomer);
          }
        });

        // Convert map to array
        const extractedCustomers = Array.from(customersMap.values());
        console.log(`Extracted ${extractedCustomers.length} unique customers from orders`);

        // Sort customers by name
        extractedCustomers.sort((a, b) => {
          if (sortBy === 'name') {
            return sortOrder === 'asc'
              ? a.name.localeCompare(b.name)
              : b.name.localeCompare(a.name);
          } else if (sortBy === 'email') {
            return sortOrder === 'asc'
              ? (a.email || '').localeCompare(b.email || '')
              : (b.email || '').localeCompare(a.email || '');
          } else if (sortBy === 'createdAt') {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
          }
          return 0;
        });

        setCustomers(extractedCustomers);
        setTotalPages(1); // Since we're not paginating this data
        setError(null); // Clear any previous errors
        setUsingFallback(true); // Indicate we're using the fallback method
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching customers from orders:', error);
      setError('Could not retrieve customer information. Please try again later.');
      toast.error('Failed to load customer data');
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      // If already sorting by this field, toggle the order
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // If sorting by a new field, default to ascending order
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Customer Management</h1>
          <button
            onClick={() => fetchCustomers()}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded flex items-center"
          >
            <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Refresh
          </button>
        </div>

        {/* {usingFallback && (
          <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4" role="alert">
            <div className="flex">
              <div className="py-1">
                <svg className="h-6 w-6 text-blue-500 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-bold">Limited Customer Data Access</p>
                <p className="text-sm">Direct access to customer data is restricted. Showing only customers who have placed orders with your franchise.</p>
              </div>
            </div>
          </div>
        )} */}
      </div>

      {/* Search */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email"
            className="flex-1 border border-gray-300 rounded-l px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-r flex items-center"
          >
            <FaSearch className="mr-2" />
            Search
          </button>
        </form>
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
          <div className="flex space-x-4">
            <button
              onClick={() => fetchCustomers()}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Try Again
            </button>
            <button
              onClick={() => fetchCustomersFromOrders()}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              Show Customers from Orders
            </button>
          </div>
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <div className="flex flex-col items-center justify-center py-12">
            <FaUser className="text-gray-400 text-5xl mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No customers found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery ? `No results for "${searchQuery}"` : "There are no customers in your franchise yet."}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Clear search
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Customer
                      {sortBy === 'name' && (
                        <span className="ml-1">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center">
                      Email
                      {sortBy === 'email' && (
                        <span className="ml-1">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center">
                      Joined
                      {sortBy === 'createdAt' && (
                        <span className="ml-1">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img 
                            className="h-10 w-10 rounded-full"
                            src={customer.img_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.name)}&background=random`}
                            alt={customer.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {customer.name}
                          </div>
                          {customer.phone && (
                            <div className="text-sm text-gray-500">
                              {customer.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <FaEnvelope className="text-gray-400 mr-2" />
                        {customer.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(customer.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <FaShoppingBag className="text-gray-400 mr-2" />
                        {customer.orderCount || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        to={`/manager/customers/${customer._id}`} 
                        className="text-green-600 hover:text-green-900"
                      >
                        View Details
                      </Link>
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
                        currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {/* Page numbers */}
                    {[...Array(totalPages).keys()].map(number => (
                      <button
                        key={number + 1}
                        onClick={() => setCurrentPage(number + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === number + 1
                            ? 'z-10 bg-green-50 border-green-500 text-green-600'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {number + 1}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
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

export default ManagerCustomers;