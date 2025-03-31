import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import UserLayout from '../../components/layouts/UserLayout';

const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to view addresses');
        setLoading(false);
        return;
      }
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/addresses`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        setAddresses(response.data.addresses || []);
      } else {
        setError('Failed to fetch addresses');
        toast.error('Failed to load addresses');
      }
    } catch (error) {
      console.error('Fetch addresses error:', error);
      setError('An error occurred while fetching your addresses');
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (address) => {
    setAddressToDelete(address);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!addressToDelete) return;
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/addresses/${addressToDelete._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        // Remove the deleted address from state
        setAddresses(prevAddresses => 
          prevAddresses.filter(address => address._id !== addressToDelete._id)
        );
        
        toast.success('Address deleted successfully');
      } else {
        toast.error('Failed to delete address');
      }
    } catch (error) {
      console.error('Delete address error:', error);
      toast.error('Failed to delete address');
    } finally {
      setShowDeleteModal(false);
      setAddressToDelete(null);
    }
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Your Addresses</h1>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </UserLayout>
    );
  }

  if (error) {
    return (
      <UserLayout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Your Addresses</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
            >
              Try Again
            </button>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Your Addresses</h1>
          <Link 
            to="/addresses/add" 
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New Address
          </Link>
        </div>
        
        {addresses.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h2 className="text-xl font-semibold mt-4">No addresses found</h2>
            <p className="text-gray-600 mt-2">You haven't added any delivery addresses yet.</p>
            <Link 
              to="/addresses/add" 
              className="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            >
              Add Your First Address
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {addresses.map((address) => (
              <div key={address._id} className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-semibold">Delivery Address</h2>
                </div>
                
                <div className="p-4">
                  <p className="text-gray-700">{address.Street}</p>
                  <p className="text-gray-700">{address.city}, {address.state}</p>
                  <p className="text-gray-700">{address.pincode}, {address.country}</p>
                  <p className="text-gray-700 mt-2">Phone: {address.phone_number}</p>
                  
                  <div className="mt-4 flex space-x-3">
                    <Link 
                      to={`/addresses/edit/${address._id}`} 
                      className="text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit
                    </Link>
                    
                    <button 
                      onClick={() => confirmDelete(address)}
                      className="text-red-600 hover:text-red-800 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this address? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              > 
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </UserLayout>
  );
};

export default Addresses;