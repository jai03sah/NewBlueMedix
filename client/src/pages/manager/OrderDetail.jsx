import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const ManagerOrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (!token) {
          setError('Authentication required. Please log in.');
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

  const handleStatusChange = async (newStatus) => {
    try {
      setStatusUpdateLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required to update order status');
        setStatusUpdateLoading(false);
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
      
      if (response.data.success) {
        toast.success(`Order status updated to ${newStatus}`);
        setOrder({ ...order, deliverystatus: newStatus });
      } else {
        toast.error(response.data?.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Update order status error:', error);
      toast.error('Failed to update order status');
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'dispatched':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
          <button
            onClick={() => navigate('/manager/orders')}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded flex items-center"
          >
            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500">Order not found.</p>
          <button
            onClick={() => navigate('/manager/orders')}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
          >
            Return to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center">
        <Link
          to="/manager/orders"
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded flex items-center"
        >
          <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Orders
        </Link>
        <h1 className="text-2xl font-bold text-gray-800 ml-4">Order Details</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Order Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Order #{order.order_id || order._id.substring(0, 8)}
              </h2>
              <p className="text-sm text-gray-600">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="flex items-center mt-2 sm:mt-0">
              <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusBadgeColor(order.deliverystatus)}`}>
                {order.deliverystatus.charAt(0).toUpperCase() + order.deliverystatus.slice(1)}
              </span>

              {/* Status Update Options */}
              {order.deliverystatus !== 'delivered' && 
               order.deliverystatus !== 'cancelled' && (
                <div className="ml-4">
                  <select
                    className="border border-gray-300 rounded text-sm py-1 px-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    onChange={(e) => {
                      if (e.target.value) {
                        handleStatusChange(e.target.value);
                        e.target.value = "";
                      }
                    }}
                    defaultValue=""
                    disabled={statusUpdateLoading}
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
        </div>

        {/* Order Details */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Customer Information */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Customer Information</h3>
            <div className="bg-gray-50 p-4 rounded">
              <p className="font-medium">{order.user?.name || 'N/A'}</p>
              <p className="text-gray-600">{order.user?.email || 'N/A'}</p>
              <p className="text-gray-600">{order.user?.phone || 'N/A'}</p>
            </div>
          </div>

          {/* Shipping Information */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Shipping Address</h3>
            <div className="bg-gray-50 p-4 rounded">
              {order.deliveryAddress ? (
                <>
                  <p className="font-medium">{order.deliveryAddress.name || 'N/A'}</p>
                  <p className="text-gray-600">
                    {order.deliveryAddress.Street || 'N/A'}, {order.deliveryAddress.city || 'N/A'}
                  </p>
                  <p className="text-gray-600">
                    {order.deliveryAddress.state || 'N/A'}, {order.deliveryAddress.pincode || 'N/A'}
                  </p>
                  <p className="text-gray-600">{order.deliveryAddress.phone || 'N/A'}</p>
                </>
              ) : (
                <p className="text-gray-600">No address information available</p>
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Payment Information</h3>
            <div className="bg-gray-50 p-4 rounded">
              <p className="font-medium">
                Payment Status: 
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.paymentStatus}
                </span>
              </p>
              <p className="text-gray-600 mt-2">Payment Method: {order.paymentMethod || 'Cash on Delivery'}</p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="p-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Order Items</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded overflow-hidden">
                        {order.product_id?.image && order.product_id.image.length > 0 ? (
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
                          {order.product_id?.name || 'Unknown Product'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.product_details?.description || ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${order.product_id?.price?.toFixed(2) || order.subtotalAmount?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    1
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${order.subtotalAmount?.toFixed(2) || '0.00'}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-sm text-right font-medium">
                    Subtotal
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${order.subtotalAmount?.toFixed(2) || '0.00'}
                  </td>
                </tr>
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-sm text-right font-medium">
                    Delivery Charge
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${order.deliveryCharge?.toFixed(2) || '0.00'}
                  </td>
                </tr>
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-sm text-right font-medium">
                    Total
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    ${order.totalAmount?.toFixed(2) || '0.00'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Order Timeline */}
        <div className="p-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Order Timeline</h3>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            <div className="space-y-6 relative">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-500 flex items-center justify-center z-10">
                  <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900">Order Placed</h4>
                  <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                </div>
              </div>
              
              {order.deliverystatus !== 'pending' && (
                <div className="flex items-start">
                  <div className={`flex-shrink-0 h-8 w-8 rounded-full ${order.deliverystatus === 'cancelled' ? 'bg-red-500' : 'bg-blue-500'} flex items-center justify-center z-10`}>
                    <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-900">
                      {order.deliverystatus === 'cancelled' ? 'Order Cancelled' : 'Order Accepted'}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {order.statusUpdatedAt ? formatDate(order.statusUpdatedAt) : 'Date not available'}
                    </p>
                  </div>
                </div>
              )}
              
              {(order.deliverystatus === 'dispatched' || order.deliverystatus === 'delivered') && (
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center z-10">
                    <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-5h2.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1v-4a1 1 0 00-1-1h-8a1 1 0 00-.8.4L8.4 8H5V5a1 1 0 00-1-1H3z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-900">Order Dispatched</h4>
                    <p className="text-sm text-gray-500">
                      {order.dispatchDate ? formatDate(order.dispatchDate) : 'Date not available'}
                    </p>
                  </div>
                </div>
              )}
              
              {order.deliverystatus === 'delivered' && (
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-500 flex items-center justify-center z-10">
                    <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-900">Order Delivered</h4>
                    <p className="text-sm text-gray-500">
                      {order.deliveryDate ? formatDate(order.deliveryDate) : 'Date not available'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 flex justify-between">
          <Link
            to="/manager/orders"
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded flex items-center"
          >
            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Orders
          </Link>
          
          {order.deliverystatus !== 'delivered' && order.deliverystatus !== 'cancelled' && (
            <div className="flex space-x-2">
              <button
                onClick={() => handleStatusChange('dispatched')}
                className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded flex items-center"
                disabled={statusUpdateLoading || order.deliverystatus === 'dispatched'}
              >
                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-5h2.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1v-4a1 1 0 00-1-1h-8a1 1 0 00-.8.4L8.4 8H5V5a1 1 0 00-1-1H3z" />
                </svg>
                Mark as Dispatched
              </button>
              <button
                onClick={() => handleStatusChange('delivered')}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded flex items-center"
                disabled={statusUpdateLoading}
              >
                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Mark as Delivered
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerOrderDetail;