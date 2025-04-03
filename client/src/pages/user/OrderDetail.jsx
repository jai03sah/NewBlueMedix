import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const OrderDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const userString = localStorage.getItem('user');

        if (!token) {
          setError('Authentication required. Please log in.');
          toast.error('Authentication required');
          setLoading(false);
          return;
        }

        if (userString) {
          try {
            const user = JSON.parse(userString);
            setUserRole(user.role);
            console.log('User role:', user.role);
          } catch (e) {
            console.error('Error parsing user data:', e);
          }
        }

        console.log('Fetching order details for ID:', orderId);
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/orders/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.data.success) {
          setOrder(response.data.order);
          console.log('Order details loaded:', response.data.order);
        } else {
          setError('Failed to fetch order details');
          toast.error('Failed to fetch order details');
        }
      } catch (error) {
        console.error('Fetch order details error:', error);
        console.error('Error response:', error.response?.data);

        if (error.response?.status === 403) {
          setError('You are not authorized to view this order');
          toast.error('Access denied');
        } else if (error.response?.status === 404) {
          setError('Order not found');
          toast.error('Order not found');
        } else {
          setError('An error occurred while fetching order details');
          toast.error('Failed to load order details');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'dispatched':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle order status update (for admin and manager)
  const handleStatusChange = async (newStatus) => {
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
        setOrder(prevOrder => ({
          ...prevOrder,
          deliverystatus: newStatus
        }));
      } else {
        toast.error(response.data?.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Update order status error:', error);
      toast.error('Failed to update order status: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Order Details</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Order Details</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error || 'Order not found'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Determine the back link based on the current path
  const getBackLink = () => {
    const path = window.location.pathname;
    if (path.includes('/manager/orders/')) {
      return '/manager/orders';
    } else if (path.includes('/admin/orders/')) {
      return '/admin/orders';
    } else {
      return '/orders';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Order Details</h1>
        <Link
          to={getBackLink()}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Orders
        </Link>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Order #{order.order_id}</h2>
          <p className="text-gray-600 text-sm mt-1">Placed on {formatDate(order.createdAt)}</p>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order Status */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Order Status</h3>
              <div className="flex items-center">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(order.deliverystatus)}`}>
                  {order.deliverystatus.charAt(0).toUpperCase() + order.deliverystatus.slice(1)}
                </span>

                {/* Status Update Options for Admin and Manager */}
                {(userRole === 'admin' || userRole === 'orderManager') &&
                 order.deliverystatus !== 'delivered' &&
                 order.deliverystatus !== 'cancelled' && (
                  <div className="ml-4">
                    <select
                      className="border border-gray-300 rounded text-sm py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => {
                        if (e.target.value) {
                          handleStatusChange(e.target.value);
                          e.target.value = "";
                        }
                      }}
                      defaultValue=""
                    >
                      <option value="">Update Status</option>
                      {order.deliverystatus !== 'pending' && <option value="pending">Pending</option>}
                      {order.deliverystatus !== 'accepted' && <option value="accepted">Accepted</option>}
                      {order.deliverystatus !== 'dispatched' && <option value="dispatched">Dispatched</option>}
                      {order.deliverystatus !== 'delivered' && <option value="delivered">Delivered</option>}
                      {order.deliverystatus !== 'cancelled' && <option value="cancelled">Cancelled</option>}
                    </select>
                  </div>
                )}
              </div>
            </div>
            
            {/* Payment Status */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Payment Status</h3>
              <div className="flex items-center">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  order.paymentStatus === 'Paid' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.paymentStatus || 'Pending'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="border-t my-4"></div>
          
          {/* Product Details */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Product</h3>
            {order.product_id ? (
              <div className="flex items-start">
                <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded overflow-hidden">
                  {order.product_id.image && order.product_id.image.length > 0 ? (
                    <img 
                      src={order.product_id.image[0]} 
                      alt={order.product_id.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <h4 className="text-base font-medium">{order.product_id.name}</h4>
                  <p className="text-gray-600 mt-1">${order.product_id.price.toFixed(2)}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">Product information not available</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Delivery Address */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Delivery Address</h3>
              {order.deliveryAddress ? (
                <div className="text-gray-700">
                  <p>{order.deliveryAddress.Street}</p>
                  <p>{order.deliveryAddress.city}, {order.deliveryAddress.state}</p>
                  <p>{order.deliveryAddress.pincode}, {order.deliveryAddress.country}</p>
                  <p className="mt-1">Phone: {order.deliveryAddress.phone_number}</p>
                </div>
              ) : (
                <p className="text-gray-600">Address information not available</p>
              )}
            </div>
            
            {/* Franchise Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Franchise</h3>
              {order.franchise ? (
                <div className="text-gray-700">
                  <p className="font-medium">{order.franchise.name}</p>
                  {order.franchise.address && (
                    <>
                      <p>{order.franchise.address.street}</p>
                      <p>{order.franchise.address.city}, {order.franchise.address.state}</p>
                      <p>{order.franchise.address.pincode}, {order.franchise.address.country}</p>
                    </>
                  )}
                  {order.franchise.contactNumber && (
                    <p className="mt-1">Contact: {order.franchise.contactNumber}</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-600">Franchise information not available</p>
              )}
            </div>
          </div>
          
          <div className="border-t my-4"></div>
          
          {/* Order Summary */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Order Summary</h3>
            <div className="bg-gray-50 p-4 rounded">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${order.subtotalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-medium">
                  {order.deliveryCharge > 0 ? 
                    `Rs ${order.deliveryCharge.toFixed(2)}` : 
                    <span className="text-green-600">Free</span>
                  }
                  {order.deliveryAddress && order.franchise && order.franchise.address && (
                    <span className="block text-xs text-gray-500 mt-1">
                      {order.deliveryAddress.pincode === order.franchise.address.pincode
                        ? "Same pincode delivery - no charge"
                        : "Different pincode delivery - Rs 40 charge"}
                    </span>
                  )}
                </span>
              </div>
              <div className="border-t border-gray-200 my-2"></div>
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Order Timeline */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Order Timeline</h2>
        </div>
        
        <div className="p-4">
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            <div className="relative pl-10 pb-8">
              <div className="absolute left-0 top-0 bg-blue-500 rounded-full h-8 w-8 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-base font-medium">Order Placed</h3>
              <p className="text-sm text-gray-500 mt-1">{formatDate(order.createdAt)}</p>
            </div>
            
            {order.deliverystatus !== 'pending' && (
              <div className="relative pl-10 pb-8">
                <div className="absolute left-0 top-0 bg-blue-500 rounded-full h-8 w-8 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-base font-medium">Order Accepted</h3>
                <p className="text-sm text-gray-500 mt-1">Your order has been accepted by the franchise</p>
              </div>
            )}
            
            {(order.deliverystatus === 'dispatched' || order.deliverystatus === 'delivered') && (
              <div className="relative pl-10 pb-8">
                <div className="absolute left-0 top-0 bg-blue-500 rounded-full h-8 w-8 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-5h2a1 1 0 00.9-.5l3-5A1 1 0 0016 3H4a1 1 0 00-1 1z" />
                  </svg>
                </div>
                <h3 className="text-base font-medium">Order Dispatched</h3>
                <p className="text-sm text-gray-500 mt-1">Your order is on its way</p>
              </div>
            )}
            
            {order.deliverystatus === 'delivered' && (
              <div className="relative pl-10">
                <div className="absolute left-0 top-0 bg-green-500 rounded-full h-8 w-8 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-base font-medium">Order Delivered</h3>
                <p className="text-sm text-gray-500 mt-1">Your order has been delivered successfully</p>
              </div>
            )}
            
            {order.deliverystatus === 'cancelled' && (
              <div className="relative pl-10">
                <div className="absolute left-0 top-0 bg-red-500 rounded-full h-8 w-8 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-base font-medium">Order Cancelled</h3>
                <p className="text-sm text-gray-500 mt-1">Your order has been cancelled</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;