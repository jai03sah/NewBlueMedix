import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaShoppingBag } from 'react-icons/fa';

const CustomerDetails = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    fetchCustomerDetails();
    fetchCustomerOrders();
  }, [customerId]);

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      if (!token || !user || !user.franchise) {
        toast.error('Authentication required');
        navigate('/manager/login');
        return;
      }

      console.log('Fetching customer details for ID:', customerId);

      try {
        // First try the users endpoint
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/users/${customerId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.data && response.data.success) {
          console.log('Customer data from API:', response.data.user);
          setCustomer(response.data.user);
          setLoading(false);
          return;
        }
      } catch (userError) {
        console.error('Error fetching from users endpoint:', userError);
        // If the users endpoint fails, we'll try the customers endpoint
      }

      // If we're here, the users endpoint didn't work or didn't return data
      // Try the franchise-specific customers endpoint
      try {
        const franchiseResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/franchises/${user.franchise}/customers/${customerId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (franchiseResponse.data && franchiseResponse.data.success) {
          console.log('Customer data from franchise API:', franchiseResponse.data.customer);
          setCustomer(franchiseResponse.data.customer);
          setLoading(false);
          return;
        }
      } catch (franchiseError) {
        console.error('Error fetching from franchise customers endpoint:', franchiseError);
      }

      // If we're here, both endpoints failed
      // Try to get customer info from orders as a last resort
      console.log('Both user endpoints failed, trying to get customer from orders');
      await fetchCustomerFromOrders();

      // If we get here, we couldn't find the customer data
      setError('Customer information could not be found');
      toast.error('Failed to fetch customer details');
    } catch (error) {
      console.error('Fetch customer error:', error);
      handleApiError(error, 'Failed to fetch customer details');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      if (!token || !user || !user.franchise) {
        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/franchises/${user.franchise}/orders?customer=${customerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data && response.data.success) {
        setCustomerOrders(response.data.orders || []);
      }
    } catch (error) {
      console.error('Fetch customer orders error:', error);
      // Don't show toast for this secondary request
    }
  };

  const handleApiError = (error, defaultMessage) => {
    let errorMessage = defaultMessage;
    let shouldShowToast = true;

    if (error.response) {
      const statusCode = error.response.status;
      const serverMessage = error.response.data?.message || '';

      if (statusCode === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
        navigate('/manager/login');
      } else if (statusCode === 403) {
        // For permission errors, we'll try to get customer data from orders
        errorMessage = 'Direct access to customer data is restricted. Showing limited customer information.';
        shouldShowToast = false; // Don't show error toast since we're handling it gracefully

        // Try to get customer info from orders
        fetchCustomerFromOrders();
        return; // Exit early since we're handling this case specially
      } else if (statusCode === 404) {
        errorMessage = 'Customer not found.';
      } else if (statusCode === 500) {
        errorMessage = `Server error: ${serverMessage || 'Internal server error'}`;
      } else {
        errorMessage = `Error (${statusCode}): ${serverMessage || errorMessage}`;
      }
    } else if (error.request) {
      errorMessage = 'No response from server. Please check your network connection.';
    } else {
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

  // Function to fetch customer data from orders
  const fetchCustomerFromOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      if (!token || !user || !user.franchise) {
        return;
      }

      const ordersUrl = `${process.env.REACT_APP_API_URL}/api/franchises/${user.franchise}/orders?customer=${customerId}&limit=10`;
      console.log('Fetching customer from orders:', ordersUrl);

      const response = await axios.get(ordersUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data && response.data.success && response.data.orders && response.data.orders.length > 0) {
        // Extract customer data from the first order
        const order = response.data.orders[0];
        let customerData = null;

        // Try to extract customer data from various fields
        if (order.user_id && typeof order.user_id === 'object') {
          customerData = order.user_id;
        } else if (order.user && typeof order.user === 'object') {
          customerData = order.user;
        } else if (order.customer && typeof order.customer === 'object') {
          customerData = order.customer;
        }

        if (customerData) {
          // Create a customer object with available data
          const customer = {
            _id: customerId,
            name: customerData.name || `Customer #${customerId.substring(0, 8)}`,
            email: customerData.email || 'Email not available',
            phone: customerData.phone || null,
            address: customerData.address || null,
            createdAt: customerData.createdAt || order.createdAt,
            orderCount: response.data.orders.length
          };

          console.log('Created customer object from orders:', customer);
          setCustomer(customer);
          setCustomerOrders(response.data.orders);
          setLoading(false);
          setError(null);
          setUsingFallback(true);
        } else {
          // If we couldn't extract customer data, create a minimal customer object
          setCustomer({
            _id: customerId,
            name: `Customer #${customerId.substring(0, 8)}`,
            email: 'Email not available',
            createdAt: order.createdAt,
            orderCount: response.data.orders.length
          });
          setCustomerOrders(response.data.orders);
          setLoading(false);
          setError(null); // Don't show error since we're showing the fallback notice
          setUsingFallback(true);
        }
      } else {
        setError('No orders found for this customer');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching customer from orders:', error);
      setError('Could not retrieve customer information from orders');
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format order date with time
  const formatOrderDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
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
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <Link
            to="/manager/orders"
            className="inline-flex items-center text-green-600 hover:text-green-800"
          >
            <FaArrowLeft className="mr-2" />
            Back to Orders
          </Link>

          <Link
            to="/manager/customers"
            className="inline-flex items-center text-green-600 hover:text-green-800"
          >
            View All Customers
          </Link>
        </div>

        {usingFallback && (
          <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4" role="alert">
            <div className="flex">
              <div className="py-1">
                <svg className="h-6 w-6 text-blue-500 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-bold">Limited Customer Data Access</p>
                <p className="text-sm">Direct access to customer data is restricted. Showing limited customer information extracted from orders.</p>
              </div>
            </div>
          </div>
        )}
      </div>

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
          <button
            onClick={() => navigate('/manager/orders')}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
          >
            Return to Orders
          </button>
        </div>
      ) : customer ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Profile Card */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="bg-green-600 p-4 text-white">
              <h2 className="text-xl font-bold">Customer Profile</h2>
            </div>
            <div className="p-6">
              <div className="flex justify-center mb-6">
                <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {customer.img_url ? (
                    <img
                      src={customer.img_url}
                      alt={customer.name || 'Customer'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(customer.name || 'Customer')}&size=96&background=random`}
                      alt={customer.name || 'Customer'}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <FaUser className="text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">{customer.name || 'Name not available'}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FaEnvelope className="text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{customer.email || 'Email not available'}</p>
                  </div>
                </div>

                {customer.phone && (
                  <div className="flex items-center">
                    <FaPhone className="text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{customer.phone}</p>
                    </div>
                  </div>
                )}

                {customer.address && (
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">{customer.address}</p>
                    </div>
                  </div>
                )}

                {customer.createdAt ? (
                  <div className="flex items-center">
                    <FaCalendarAlt className="text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Member Since</p>
                      <p className="font-medium">{formatDate(customer.createdAt)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <FaCalendarAlt className="text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Member Since</p>
                      <p className="font-medium">Date not available</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center">
                  <FaShoppingBag className="text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Total Orders</p>
                    <p className="font-medium">{customerOrders.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Customer Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="bg-green-600 p-4 text-white">
                <h2 className="text-xl font-bold">Order History</h2>
              </div>
              
              {customerOrders.length > 0 ? (
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
                          Product
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {customerOrders.map((order) => (
                        <tr key={order._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{order._id.substring(order._id.length - 8)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatOrderDate(order.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
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
                                    <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-500">
                                      No img
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
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link 
                              to={`/manager/orders/${order._id}`} 
                              className="text-green-600 hover:text-green-900"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <p>No orders found for this customer.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <p className="text-gray-500">Customer not found.</p>
          <button
            onClick={() => navigate('/manager/orders')}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
          >
            Return to Orders
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerDetails;