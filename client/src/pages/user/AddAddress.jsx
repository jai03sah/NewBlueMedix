import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AddressForm from '../../components/AddressForm';
import UserLayout from '../../components/layouts/UserLayout';

const AddAddress = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Redirect to addresses page after successful submission
    navigate('/addresses');
  };

  return (
    <UserLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Add New Address</h1>
          <Link 
            to="/addresses" 
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Addresses
          </Link>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <AddressForm onSuccess={handleSuccess} />
        </div>
      </div>
    </UserLayout>
  );
};

export default AddAddress;