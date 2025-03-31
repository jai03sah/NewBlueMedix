import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const AddressForm = ({ onSuccess, initialData = null, isEdit = false }) => {
  const [formData, setFormData] = useState({
    Street: initialData?.Street || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    pincode: initialData?.pincode || '',
    country: initialData?.country || 'India',
    phone_number: initialData?.phone_number || ''
  });
  
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.Street || !formData.city || !formData.state || !formData.pincode || !formData.country || !formData.phone_number) {
      toast.error('Please fill in all fields');
      return;
    }

    // Validate phone number
    if (!/^\d{10}$/.test(formData.phone_number)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    // Validate pincode
    if (!/^\d{6}$/.test(formData.pincode)) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('You must be logged in to manage addresses');
        return;
      }

      let response;
      
      if (isEdit && initialData?._id) {
        // Update existing address
        response = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/addresses/${initialData._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        if (response.data.success) {
          toast.success('Address updated successfully');
        }
      } else {
        // Create new address
        response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/addresses`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        if (response.data.success) {
          toast.success('Address added successfully');
          // Reset form after successful submission
          setFormData({
            Street: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India',
            phone_number: ''
          });
        }
      }
      
      // Call the success callback if provided
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(response.data.address);
      }
      
    } catch (error) {
      console.error('Address form error:', error);
      toast.error(error.response?.data?.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="Street" className="block text-sm font-medium text-gray-700">Street Address</label>
        <input
          type="text"
          id="Street"
          name="Street"
          value={formData.Street}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your street address"
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your city"
            required
          />
        </div>
        
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your state"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">Pincode</label>
          <input
            type="text"
            id="pincode"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter 6-digit pincode"
            maxLength="6"
            required
          />
        </div>
        
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your country"
            required
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">Phone Number</label>
        <input
          type="tel"
          id="phone_number"
          name="phone_number"
          value={formData.phone_number}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter 10-digit phone number"
          maxLength="10"
          required
        />
      </div>
      
      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            isEdit ? 'Update Address' : 'Add Address'
          )}
        </button>
      </div>
    </form>
  );
};

export default AddressForm;