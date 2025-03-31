import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import AddressForm from '../../components/AddressForm';
import UserLayout from '../../components/layouts/UserLayout';

const EditAddress = () => {
  const { addressId } = useParams();
  const navigate = useNavigate();
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAddress();
  }, [addressId]);

  const fetchAddress = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to edit addresses');
        setLoading(false);
        return;
      }
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/addresses/${addressId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        setAddress(response.data.address);
      } else {
        setError('Failed to fetch address');
        toast.error('Failed to load address');
      }
    } catch (error) {
      console.error('Fetch address error:', error);
      setError('An error occurred while fetching the address');
      toast.error('Failed to load address');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    // Redirect to addresses page after successful update
    navigate('/addresses');
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Edit Address</h1>
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
          <h1 className="text-2xl font-bold mb-6">Edit Address</h1>
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

  if (!address) {
    return (
      <UserLayout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Edit Address</h1>
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <p>Address not found. It may have been deleted.</p>
            <Link 
              to="/addresses" 
              className="mt-2 inline-block bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded"
            >
              Back to Addresses
            </Link>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Edit Address</h1>
          <Link 
            to="/addresses" 
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Addresses
          </Link>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <AddressForm 
            initialData={address} 
            isEdit={true} 
            onSuccess={handleSuccess} 
          />
        </div>
      </div>
    </UserLayout>
  );
};

export default EditAddress;