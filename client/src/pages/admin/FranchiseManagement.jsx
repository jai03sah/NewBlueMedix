import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const FranchiseManagement = () => {
  const [franchises, setFranchises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentFranchise, setCurrentFranchise] = useState(null);
  const [managers, setManagers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    contactNumber: '',
    email: '',
    manager: ''
  });

  useEffect(() => {
    fetchFranchises();
    fetchManagers();
  }, [currentPage, sortBy, sortOrder]);

  const fetchFranchises = async () => {
    try {
      setLoading(true);
      setError(null); // Reset error state before new fetch
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Authentication token not found. Please log in again.');
        toast.error('Authentication required');
        setLoading(false);
        return;
      }

      // Build query parameters
      let url = `${process.env.REACT_APP_API_URL}/api/franchises?page=${currentPage}`;

      if (searchQuery && searchQuery.trim() !== '') {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }

      url += `&sortBy=${sortBy}&sortOrder=${sortOrder}`;

      console.log('Fetching franchises from:', url);
      console.log('Using token:', token ? `${token.substring(0, 10)}...` : 'No token');

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Response received:', response.status, response.statusText);
      console.log('Response data:', JSON.stringify(response.data, null, 2));

      if (response.data && response.data.success) {
        setFranchises(response.data.franchises || []);
        setTotalPages(response.data.pagination?.pages || 1);

        if (response.data.franchises && response.data.franchises.length === 0 && currentPage > 1) {
          // If we get an empty page and we're not on page 1, go back to page 1
          setCurrentPage(1);
        }

        // If we got an empty array but it's a valid response, don't show an error
        if (response.data.franchises.length === 0 && currentPage === 1) {
          setError(null);
        }
      } else {
        setError(response.data?.message || 'Failed to fetch franchises');
        toast.error('Failed to fetch franchises');
      }
    } catch (error) {
      console.error('Fetch franchises error:', error);

      // Detailed error handling
      let errorMessage = 'An error occurred while fetching franchises';

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
          errorMessage = 'You do not have permission to access franchise data.';
        } else if (statusCode === 404) {
          // For 404, we'll just show an empty list instead of an error
          setFranchises([]);
          setTotalPages(1);
          setLoading(false);
          return; // Exit early without setting error
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

      // Set empty franchises array to prevent UI issues
      setFranchises([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('Authentication required to fetch managers');
        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/users/managers`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data && response.data.success) {
        setManagers(response.data.managers || []);
      } else {
        toast.error(response.data?.message || 'Failed to fetch managers');
      }
    } catch (error) {
      console.error('Fetch managers error:', error);

      // Detailed error handling
      let errorMessage = 'Failed to load managers';

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const statusCode = error.response.status;
        const serverMessage = error.response.data?.message || '';

        if (statusCode === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (statusCode === 403) {
          errorMessage = 'You do not have permission to access manager data.';
        } else if (statusCode === 404) {
          errorMessage = 'Manager data not found.';
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

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    fetchFranchises();
  };

  // Function to clear search and filters
  const clearFilters = () => {
    setSearchQuery('');
    setCurrentPage(1);
    setSortBy('createdAt');
    setSortOrder('desc');
    // fetchFranchises will be called by the useEffect when state changes
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Handle nested address fields
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value
        }
      });
    } else {
      // Handle regular fields
      setFormData({
        ...formData,
        [name]: value
      });
    }

    console.log('Updated form data:', formData);
  };

  const handleAddFranchise = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/franchises`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Franchise added successfully');
        setShowAddModal(false);
        setFormData({
          name: '',
          address: {
            street: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India'
          },
          contactNumber: '',
          email: '',
          manager: ''
        });
        fetchFranchises();
      } else {
        toast.error('Failed to add franchise');
      }
    } catch (error) {
      console.error('Add franchise error:', error);

      // Detailed error handling
      let errorMessage = 'Failed to add franchise';

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const statusCode = error.response.status;
        const serverMessage = error.response.data?.message || '';

        if (statusCode === 400) {
          errorMessage = `Validation error: ${serverMessage || 'Please check your input'}`;
        } else if (statusCode === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (statusCode === 403) {
          errorMessage = 'You do not have permission to add franchises.';
        } else if (statusCode === 409) {
          errorMessage = `Franchise already exists: ${serverMessage}`;
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

  const handleEditFranchise = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/franchises/${currentFranchise._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Franchise updated successfully');
        setShowEditModal(false);
        setCurrentFranchise(null);
        fetchFranchises();
      } else {
        toast.error('Failed to update franchise');
      }
    } catch (error) {
      console.error('Update franchise error:', error);

      // Detailed error handling
      let errorMessage = 'Failed to update franchise';

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const statusCode = error.response.status;
        const serverMessage = error.response.data?.message || '';

        if (statusCode === 400) {
          errorMessage = `Validation error: ${serverMessage || 'Please check your input'}`;
        } else if (statusCode === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (statusCode === 403) {
          errorMessage = 'You do not have permission to update franchises.';
        } else if (statusCode === 404) {
          errorMessage = 'Franchise not found. It may have been deleted.';
        } else if (statusCode === 409) {
          errorMessage = `Conflict error: ${serverMessage}`;
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

  const handleDeleteFranchise = async (franchiseId) => {
    if (!window.confirm('Are you sure you want to delete this franchise?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/franchises/${franchiseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Franchise deleted successfully');
        fetchFranchises();
      } else {
        toast.error('Failed to delete franchise');
      }
    } catch (error) {
      console.error('Delete franchise error:', error);

      // Detailed error handling
      let errorMessage = 'Failed to delete franchise';

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const statusCode = error.response.status;
        const serverMessage = error.response.data?.message || '';

        if (statusCode === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (statusCode === 403) {
          errorMessage = 'You do not have permission to delete franchises.';
        } else if (statusCode === 404) {
          errorMessage = 'Franchise not found. It may have already been deleted.';
        } else if (statusCode === 409) {
          errorMessage = `Cannot delete: ${serverMessage || 'Franchise has associated data'}`;
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

  const openEditModal = (franchise) => {
    console.log('Opening edit modal with franchise:', franchise);
    setCurrentFranchise(franchise);

    // Create a default address structure if it doesn't exist
    const address = franchise.address || {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    };

    setFormData({
      name: franchise.name,
      address: {
        street: address.street || '',
        city: address.city || '',
        state: address.state || '',
        pincode: address.pincode || '',
        country: address.country || 'India'
      },
      contactNumber: franchise.contactNumber || '',
      email: franchise.email || '',
      manager: franchise.orderManager?._id || ''
    });

    setShowEditModal(true);
  };

  // We're now using server-side filtering, so we don't need to filter the franchises here
  const filteredFranchises = franchises;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-800">Franchise Management</h1>
          <button
            onClick={() => fetchFranchises()}
            className="ml-4 bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-full"
            title="Refresh franchise list"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          Add Franchise
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
            placeholder="Search franchises by name, location, or manager"
            className="flex-1 border border-gray-300 rounded-l px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r"
          >
            Search
          </button>
        </form>
      </div>

      {/* Franchises Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        error.includes('Network error') ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Connection Problem</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>{error}</p>
                  <p className="mt-1">Please check your internet connection and try again.</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => fetchFranchises()}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    Retry Connection
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800">Error fetching franchises</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                  {error.includes('Authentication') && (
                    <p className="mt-1">Please try logging out and logging back in.</p>
                  )}
                  {error.includes('Server error') && (
                    <p className="mt-1">The server encountered an error. Please try again later or contact support if the problem persists.</p>
                  )}
                </div>
                <div className="mt-4 flex">
                  <button
                    onClick={() => fetchFranchises()}
                    className="mr-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    Try Again
                  </button>
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      ) : filteredFranchises.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h2 className="text-xl font-semibold mt-4">No franchises found</h2>
          <p className="text-gray-600 mt-2">
            {searchQuery
              ? "No franchises match your search criteria."
              : "There are no franchises in the system yet."}
          </p>
          {searchQuery && (
            <button
              onClick={clearFilters}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      if (sortBy === 'name') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('name');
                        setSortOrder('asc');
                      }
                    }}
                  >
                    <div className="flex items-center">
                      Name
                      {sortBy === 'name' && (
                        <span className="ml-1">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      if (sortBy === 'address.city') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('address.city');
                        setSortOrder('asc');
                      }
                    }}
                  >
                    <div className="flex items-center">
                      Address
                      {sortBy === 'address.city' && (
                        <span className="ml-1">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Manager
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      if (sortBy === 'createdAt') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('createdAt');
                        setSortOrder('desc');
                      }
                    }}
                  >
                    <div className="flex items-center">
                      Created
                      {sortBy === 'createdAt' && (
                        <span className="ml-1">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFranchises.map((franchise) => (
                  <tr key={franchise._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{franchise.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {franchise.address ? (
                          <>
                            <div>{franchise.address.street}</div>
                            <div>{franchise.address.city}, {franchise.address.state}</div>
                            <div>{franchise.address.pincode}, {franchise.address.country}</div>
                          </>
                        ) : (
                          <span className="text-yellow-600">No address information</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {franchise.contactNumber && (
                          <div>{franchise.contactNumber}</div>
                        )}
                        {franchise.email && (
                          <div className="text-blue-600">{franchise.email}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {franchise.orderManager ? (
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <img
                              className="h-8 w-8 rounded-full"
                              src={franchise.orderManager.img_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(franchise.orderManager.name)}`}
                              alt={franchise.orderManager.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {franchise.orderManager.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {franchise.orderManager.email}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-yellow-600 text-sm">No manager assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(franchise.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link 
                          to={`/admin/franchises/${franchise._id}`} 
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => openEditModal(franchise)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteFranchise(franchise._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">First</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M7.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L3.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
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
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === i + 1
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
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
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Last</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 15.707a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 1.414L8.586 10 4.293 14.293a1 1 0 000 1.414z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M12.293 15.707a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 1.414L16.586 10l-4.293 4.293a1 1 0 000 1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Franchise Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Add New Franchise</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddFranchise}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Franchise Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Address *
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    id="street"
                    name="address.street"
                    placeholder="Street"
                    value={formData.address.street}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    id="city"
                    name="address.city"
                    placeholder="City"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      id="state"
                      name="address.state"
                      placeholder="State"
                      value={formData.address.state}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      id="pincode"
                      name="address.pincode"
                      placeholder="Pincode"
                      value={formData.address.pincode}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <input
                    type="text"
                    id="country"
                    name="address.country"
                    placeholder="Country"
                    value={formData.address.country}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contactNumber">
                  Contact Number
                </label>
                <input
                  type="text"
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="manager">
                  Manager
                </label>
                <select
                  id="manager"
                  name="manager"
                  value={formData.manager}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a manager</option>
                  {managers.map((manager) => (
                    <option key={manager._id} value={manager._id}>
                      {manager.name} ({manager.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                >
                  Add Franchise
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Franchise Modal */}
      {showEditModal && currentFranchise && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Edit Franchise</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setCurrentFranchise(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleEditFranchise}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-name">
                  Franchise Name *
                </label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Address *
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    id="edit-street"
                    name="address.street"
                    placeholder="Street"
                    value={formData.address.street}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    id="edit-city"
                    name="address.city"
                    placeholder="City"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      id="edit-state"
                      name="address.state"
                      placeholder="State"
                      value={formData.address.state}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      id="edit-pincode"
                      name="address.pincode"
                      placeholder="Pincode"
                      value={formData.address.pincode}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <input
                    type="text"
                    id="edit-country"
                    name="address.country"
                    placeholder="Country"
                    value={formData.address.country}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-contactNumber">
                  Contact Number
                </label>
                <input
                  type="text"
                  id="edit-contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-email">
                  Email
                </label>
                <input
                  type="email"
                  id="edit-email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-manager">
                  Manager
                </label>
                <select
                  id="edit-manager"
                  name="manager"
                  value={formData.manager}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a manager</option>
                  {managers.map((manager) => (
                    <option key={manager._id} value={manager._id}>
                      {manager.name} ({manager.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setCurrentFranchise(null);
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                >
                  Update Franchise
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FranchiseManagement;