import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ManagerInventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState([]);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({
    quantity: 0,
    lowStockThreshold: 0
  });
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'category'
  const [noProductsAssigned, setNoProductsAssigned] = useState(false); // Flag to check if admin has assigned products

  // Fetch categories and check product availability on component mount
  useEffect(() => {
    fetchCategories();
    checkProductAvailability();
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [categoryFilter, searchQuery, currentPage, sortBy, sortOrder]);

  // Check if there are any products in the system
  const checkProductAvailability = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      if (!token || !user || !user.franchise) {
        return;
      }

      // First check if there are any products assigned to this franchise
      const franchiseStockResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/franchise-stock/franchise/${user.franchise}?limit=1`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (franchiseStockResponse.data && franchiseStockResponse.data.success) {
        const stockItems = franchiseStockResponse.data.stockItems || [];

        if (stockItems.length === 0) {
          // If no products assigned to franchise, check if there are any products in the system at all
          const productsResponse = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/products?limit=1`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

          if (productsResponse.data && productsResponse.data.success) {
            if (productsResponse.data.products && productsResponse.data.products.length > 0) {
              // Products exist in system but none assigned to this franchise
              setNoProductsAssigned(true);
              console.log('Products exist in system but none assigned to this franchise');
            } else {
              // No products in the system at all
              setNoProductsAssigned(true);
              console.log('No products available in the system');
            }
          }
        } else {
          // Products are assigned to this franchise
          setNoProductsAssigned(false);
          console.log('Products are assigned to this franchise');
        }
      }

      // Also check if there are any categories
      const categoriesResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/categories`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (categoriesResponse.data && categoriesResponse.data.success) {
        const fetchedCategories = categoriesResponse.data.categories || [];
        console.log('Initial categories check:', fetchedCategories.length, 'categories found');
      }
    } catch (error) {
      console.error('Error checking product availability:', error);
      // Don't show toast for this secondary request
    }
  };

  const fetchProducts = async () => {
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

      // Build query parameters
      let url = `${process.env.REACT_APP_API_URL}/api/franchise-stock/franchise/${user.franchise}`;
      const queryParams = [];

      // Add search parameter if provided
      if (searchQuery.trim()) {
        queryParams.push(`search=${encodeURIComponent(searchQuery.trim())}`);
      }

      // Add category filter if selected
      if (categoryFilter !== 'all') {
        queryParams.push(`category=${encodeURIComponent(categoryFilter)}`);
      }

      // Add sorting parameters
      if (sortBy) {
        queryParams.push(`sortBy=${encodeURIComponent(sortBy)}`);
        queryParams.push(`sortOrder=${encodeURIComponent(sortOrder)}`);
      }

      // Add pagination parameters
      queryParams.push(`page=${currentPage}`);
      queryParams.push(`limit=20`);

      // Combine all query parameters
      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }

      console.log('Fetching inventory with URL:', url);


      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data && response.data.success) {
        // The API returns stockItems array with populated product details
        const stockItems = response.data.stockItems || [];

        // Check if there are any products assigned to this franchise
        if (stockItems.length === 0 && !searchQuery && categoryFilter === 'all') {
          // Make an additional check to see if there are products in the system
          try {
            const productsResponse = await axios.get(
              `${process.env.REACT_APP_API_URL}/api/products?limit=1`,
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            );

            if (productsResponse.data && productsResponse.data.success) {
              // If there are products in the system but none assigned to this franchise
              if (productsResponse.data.products && productsResponse.data.products.length > 0) {
                setNoProductsAssigned(true);
                setProducts([]);
                setTotalPages(1);
                console.log('Products exist in system but none assigned to this franchise');
              } else {
                // No products in the system at all
                setNoProductsAssigned(true);
                setProducts([]);
                setTotalPages(1);
                console.log('No products in the system at all');
              }
            }
          } catch (error) {
            console.error('Error checking product availability:', error);
            // Default to assuming no products assigned
            setNoProductsAssigned(true);
            setProducts([]);
            setTotalPages(1);
          }
          return;
        } else {
          setNoProductsAssigned(false);
        }

        // Transform the data to match our component's expected format
        const transformedProducts = await Promise.all(stockItems.map(async (item) => {
          // Ensure we have complete category information
          let categoryInfo = item.product.category;

          // If category is just an ID, fetch the full category information
          if (categoryInfo && typeof categoryInfo === 'string') {
            try {
              const categoryResponse = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/categories/${categoryInfo}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                }
              );

              if (categoryResponse.data && categoryResponse.data.success) {
                categoryInfo = categoryResponse.data.category;
              }
            } catch (error) {
              console.error('Error fetching category details:', error);
              // Keep the category ID if we can't fetch details
            }
          }

          return {
            _id: item.product._id,
            name: item.product.name,
            price: item.product.price,
            image: item.product.image,
            category: categoryInfo, // Use the full category object
            quantity: item.quantity,
            lowStockThreshold: item.product.lowStockThreshold || 5,
            stockId: item._id, // Keep the stock ID for updates
            lastUpdated: item.lastUpdated
          };
        }));

        // Set the products directly - we're already filtering by category in the API call
        setProducts(transformedProducts);

        // Set total pages from response if available, otherwise default to 1
        if (response.data.totalPages) {
          setTotalPages(response.data.totalPages);
        } else {
          setTotalPages(Math.ceil(transformedProducts.length / 20));
        }

        console.log('Loaded products:', transformedProducts.length);
        console.log('Category filter:', categoryFilter);

        // Log product categories for debugging
        const categoryIds = transformedProducts.map(p => p.category?._id).filter(Boolean);
        console.log('Product category IDs:', categoryIds);

        if (transformedProducts.length === 0 && currentPage > 1) {
          // If we get an empty page and we're not on page 1, go back to page 1
          setCurrentPage(1);
        }
      } else {
        setError(response.data?.message || 'Failed to fetch inventory');
        toast.error('Failed to fetch inventory');
      }
    } catch (error) {
      console.error('Fetch inventory error:', error);
      handleApiError(error, 'An error occurred while fetching inventory');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/categories`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data && response.data.success) {
        const fetchedCategories = response.data.categories || [];
        setCategories(fetchedCategories);
        console.log('Fetched categories:', fetchedCategories);

        // Try to get product counts by category for better debugging
        try {
          const statsResponse = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/categories/stats/products-count`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

          if (statsResponse.data && statsResponse.data.success) {
            console.log('Category product counts:', statsResponse.data.categoriesWithCount);
          }
        } catch (statsError) {
          console.error('Error fetching category stats:', statsError);
        }
      }
    } catch (error) {
      console.error('Fetch categories error:', error);
      // Don't show toast for this secondary request
    }
  };

  const handleApiError = (error, defaultMessage) => {
    let errorMessage = defaultMessage;

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
        errorMessage = 'You do not have permission to access inventory data.';
      } else if (statusCode === 404) {
        errorMessage = 'Inventory data not found.';
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

  // Group products by category
  const getProductsByCategory = () => {
    // Create a deep copy of the products array to avoid mutation issues
    const productsCopy = JSON.parse(JSON.stringify(products));
    const groupedProducts = {};

    // First, create an entry for each category
    categories.forEach(category => {
      groupedProducts[category._id] = {
        categoryInfo: category,
        products: []
      };
    });

    // Add an "Uncategorized" group
    groupedProducts['uncategorized'] = {
      categoryInfo: { _id: 'uncategorized', name: 'Uncategorized' },
      products: []
    };

    // Now, add each product to its category group
    productsCopy.forEach(product => {
      console.log('Processing product:', product.name, 'Category:', product.category);

      if (product.category && product.category._id) {
        // Check if this category exists in our groupedProducts
        if (groupedProducts[product.category._id]) {
          groupedProducts[product.category._id].products.push(product);
        } else {
          console.log('Category not found in groupedProducts:', product.category._id);
          // If category doesn't exist in our groups, add it
          groupedProducts[product.category._id] = {
            categoryInfo: {
              _id: product.category._id,
              name: product.category.name || 'Unknown Category'
            },
            products: [product]
          };
        }
      } else {
        // If product has no category
        groupedProducts['uncategorized'].products.push(product);
      }
    });

    console.log('Grouped products:', groupedProducts);

    // Convert to array and sort categories by name
    const result = Object.values(groupedProducts)
      .filter(group => group.products.length > 0) // Only include categories with products
      .sort((a, b) => a.categoryInfo.name.localeCompare(b.categoryInfo.name));

    console.log('Categorized products:', result);
    return result;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    // fetchProducts will be called by the useEffect when searchQuery changes
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

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setSortBy('name');
    setSortOrder('asc');
    setCurrentPage(1);
  };

  const startEditing = (product) => {
    setEditingProduct(product._id);
    setEditFormData({
      quantity: product.quantity || 0,
      lowStockThreshold: product.lowStockThreshold || 5
    });
  };

  const cancelEditing = () => {
    setEditingProduct(null);
    setEditFormData({
      quantity: 0,
      lowStockThreshold: 0
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: parseInt(value, 10) || 0
    });
  };

  const updateInventory = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      if (!token || !user || !user.franchise) {
        toast.error('Authentication required');
        return;
      }

      // Find the current product to get its current quantity
      const currentProduct = products.find(p => p._id === productId);
      if (!currentProduct) {
        toast.error('Product not found');
        return;
      }

      // Calculate the quantity difference
      const quantityDifference = editFormData.quantity - currentProduct.quantity;
      const isAddition = quantityDifference >= 0;

      // Prepare the request payload
      const payload = {
        quantity: Math.abs(quantityDifference),
        isAddition: isAddition
      };

      // Use the franchise-stock API endpoint
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/franchise-stock/franchise/${user.franchise}/product/${productId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data && response.data.success) {
        toast.success('Inventory updated successfully');

        // Update the product in the state
        setProducts(prevProducts =>
          prevProducts.map(product =>
            product._id === productId
              ? {
                  ...product,
                  quantity: editFormData.quantity,
                  lowStockThreshold: editFormData.lowStockThreshold,
                  lastUpdated: new Date().toISOString()
                }
              : product
          )
        );

        // Exit edit mode
        cancelEditing();
      } else {
        toast.error(response.data?.message || 'Failed to update inventory');
      }
    } catch (error) {
      console.error('Update inventory error:', error);
      handleApiError(error, 'Failed to update inventory');
    }
  };

  const getStockStatusClass = (product) => {
    if (!product.quantity || product.quantity === 0) {
      return 'bg-red-100 text-red-800'; // Out of stock
    } else if (product.quantity <= product.lowStockThreshold) {
      return 'bg-yellow-100 text-yellow-800'; // Low stock
    } else {
      return 'bg-green-100 text-green-800'; // In stock
    }
  };

  const getStockStatusText = (product) => {
    if (!product.quantity || product.quantity === 0) {
      return 'Out of Stock';
    } else if (product.quantity <= product.lowStockThreshold) {
      return 'Low Stock';
    } else {
      return 'In Stock';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
          <button
            onClick={() => fetchProducts()}
            className="ml-4 bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-full"
            title="Refresh inventory"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div className="flex space-x-2">
          {/* View Mode Toggle */}
          <div className="mr-4 flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md text-sm ${viewMode === 'list'
                ? 'bg-white shadow-sm text-green-700'
                : 'text-gray-600 hover:text-gray-800'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              List View
            </button>
            <button
              onClick={() => setViewMode('category')}
              className={`px-3 py-1 rounded-md text-sm ${viewMode === 'category'
                ? 'bg-white shadow-sm text-green-700'
                : 'text-gray-600 hover:text-gray-800'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
              Category View
            </button>
          </div>

          <button
            onClick={() => fetchProducts()}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded flex items-center"
          >
            <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Refresh
          </button>
          {(searchQuery || categoryFilter !== 'all' || sortBy !== 'name' || sortOrder !== 'asc') && (
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                placeholder="Search by product name or SKU"
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

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
                console.log('Category filter changed to:', e.target.value);
              }}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="mt-2 text-xs text-gray-500">
              {categories.length} categories available
            </div>
          </div>
        </div>
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
              onClick={() => fetchProducts()}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Try Again
            </button>
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Reset Filters
            </button>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          {noProductsAssigned ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 className="text-xl font-semibold mt-4">No Products Available</h2>
              <p className="text-gray-600 mt-2">
                No products have been assigned to your franchise inventory by the administrator.
              </p>
              <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 text-blue-700">
                <p className="font-bold">What to do next:</p>
                <ul className="list-disc list-inside mt-2 text-left">
                  <li>Contact your administrator to request product assignments</li>
                  <li>The admin needs to add products to the system and assign them to your franchise</li>
                  <li>Once products are assigned, they will appear in your inventory</li>
                  <li>You can then manage stock levels for your franchise</li>
                </ul>
              </div>
              <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700">
                <p className="font-bold">Important:</p>
                <p className="mt-1">
                  Your inventory will remain empty until the administrator assigns products to your franchise.
                  You cannot add products directly - this must be done by an administrator.
                </p>
              </div>
              <button
                onClick={() => fetchProducts()}
                className="mt-6 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded inline-flex items-center"
              >
                <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Check Again
              </button>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h2 className="text-xl font-semibold mt-4">No products found</h2>
              <p className="text-gray-600 mt-2">
                {categoryFilter !== 'all'
                  ? "There are no products in this category."
                  : searchQuery
                    ? `No products match "${searchQuery}"`
                    : "There are no products in your franchise inventory yet."}
              </p>
            </>
          )}
        </div>
      ) : viewMode === 'list' ? (
        // List View
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
                      Product
                      {sortBy === 'name' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className={`ml-1 h-4 w-4 ${sortOrder === 'asc' ? '' : 'transform rotate-180'}`} viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('price')}
                  >
                    <div className="flex items-center">
                      Price
                      {sortBy === 'price' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className={`ml-1 h-4 w-4 ${sortOrder === 'asc' ? '' : 'transform rotate-180'}`} viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('quantity')}
                  >
                    <div className="flex items-center">
                      Quantity
                      {sortBy === 'quantity' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className={`ml-1 h-4 w-4 ${sortOrder === 'asc' ? '' : 'transform rotate-180'}`} viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Low Stock Threshold
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded overflow-hidden">
                          {product.image && product.image.length > 0 ? (
                            <img
                              src={product.image[0]}
                              alt={product.name}
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
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            SKU: {product.sku || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category ? product.category.name : 'Uncategorized'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${product.price ? product.price.toFixed(2) : '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingProduct === product._id ? (
                        <input
                          type="number"
                          name="quantity"
                          min="0"
                          value={editFormData.quantity}
                          onChange={handleEditFormChange}
                          className="w-20 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      ) : (
                        product.quantity || 0
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStockStatusClass(product)}`}>
                        {getStockStatusText(product)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingProduct === product._id ? (
                        <input
                          type="number"
                          name="lowStockThreshold"
                          min="1"
                          value={editFormData.lowStockThreshold}
                          onChange={handleEditFormChange}
                          className="w-20 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      ) : (
                        product.lowStockThreshold || 5
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingProduct === product._id ? (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => updateInventory(product._id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-red-600 hover:text-red-900"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing(product)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Update
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Category View
        <div className="space-y-8">
          {getProductsByCategory().length === 0 ? (
            <div className="bg-white shadow-md rounded-lg p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              <h2 className="text-xl font-semibold mt-4">No categorized products found</h2>
              <p className="text-gray-600 mt-2">
                There are no products with categories in your inventory.
              </p>
            </div>
          ) : (
            getProductsByCategory().map((categoryGroup) => (
              <div key={categoryGroup.categoryInfo._id} className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="bg-green-700 text-white px-6 py-3 flex justify-between items-center">
                  <h3 className="text-lg font-semibold">{categoryGroup.categoryInfo.name}</h3>
                  <span className="bg-white text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                    {categoryGroup.products.length} {categoryGroup.products.length === 1 ? 'Product' : 'Products'}
                  </span>
                </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Low Stock Threshold
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categoryGroup.products.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded overflow-hidden">
                              {product.image && product.image.length > 0 ? (
                                <img
                                  src={product.image[0]}
                                  alt={product.name}
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
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                SKU: {product.sku || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${product.price ? product.price.toFixed(2) : '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {editingProduct === product._id ? (
                            <input
                              type="number"
                              name="quantity"
                              min="0"
                              value={editFormData.quantity}
                              onChange={handleEditFormChange}
                              className="w-20 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          ) : (
                            product.quantity || 0
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStockStatusClass(product)}`}>
                            {getStockStatusText(product)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {editingProduct === product._id ? (
                            <input
                              type="number"
                              name="lowStockThreshold"
                              min="1"
                              value={editFormData.lowStockThreshold}
                              onChange={handleEditFormChange}
                              className="w-20 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          ) : (
                            product.lowStockThreshold || 5
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {editingProduct === product._id ? (
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => updateInventory(product._id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="text-red-600 hover:text-red-900"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEditing(product)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Update
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )))}
        </div>
      )}

          { /* Pagination - Hidden until API supports pagination */}
          {/* {totalPages > 1 && (
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

                    {[...Array(totalPages).keys()].map(number => {
                      const pageNumber = number + 1;
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
          )} */}

          {/* Show total count instead */}
          <div className="bg-white px-4 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-700 text-center">
              Showing {products.length} items
            </p>
          </div>
        </div>
      )};

export default ManagerInventory;