import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const FranchiseStockManagement = () => {
  const [products, setProducts] = useState([]);
  const [franchises, setFranchises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productLoading, setProductLoading] = useState(false);
  const [franchiseLoading, setFranchiseLoading] = useState(false);
  const [stockLoading, setStockLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedFranchise, setSelectedFranchise] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [stockData, setStockData] = useState([]);
  const [viewMode, setViewMode] = useState('product'); // 'product' or 'franchise'
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [bulkAssignMode, setBulkAssignMode] = useState(false);
  const [selectedFranchises, setSelectedFranchises] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [bulkQuantity, setBulkQuantity] = useState(10);

  useEffect(() => {
    fetchProducts();
    fetchFranchises();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setProductLoading(true);
      const token = localStorage.getItem('token');
      
      let url = `${process.env.REACT_APP_API_URL}/api/products?limit=100`;
      
      if (selectedCategory) {
        url += `&category=${selectedCategory}`;
      }
      
      if (searchQuery) {
        url += `&search=${searchQuery}`;
      }
      
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        toast.error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Fetch products error:', error);
      toast.error('Failed to load products');
    } finally {
      setProductLoading(false);
      setLoading(false);
    }
  };

  const fetchFranchises = async () => {
    try {
      setFranchiseLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/franchises`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setFranchises(response.data.franchises);
      } else {
        toast.error('Failed to fetch franchises');
      }
    } catch (error) {
      console.error('Fetch franchises error:', error);
      toast.error('Failed to load franchises');
    } finally {
      setFranchiseLoading(false);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/categories`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setCategories(response.data.categories);
      } else {
        toast.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Fetch categories error:', error);
      toast.error('Failed to load categories');
    }
  };

  const fetchStockForProduct = async (productId) => {
    try {
      setStockLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/franchise-stock/product/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setStockData(response.data.stockItems || []);
      } else {
        toast.error('Failed to fetch stock data');
        setStockData([]);
      }
    } catch (error) {
      console.error('Fetch stock error:', error);
      toast.error('Failed to load stock data');
      setStockData([]);
    } finally {
      setStockLoading(false);
    }
  };

  const fetchStockForFranchise = async (franchiseId) => {
    try {
      setStockLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/franchise-stock/franchise/${franchiseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setStockData(response.data.stockItems || []);
      } else {
        toast.error('Failed to fetch franchise stock data');
        setStockData([]);
      }
    } catch (error) {
      console.error('Fetch franchise stock error:', error);
      toast.error('Failed to load franchise stock data');
      setStockData([]);
    } finally {
      setStockLoading(false);
    }
  };

  const handleProductChange = (e) => {
    const productId = e.target.value;
    setSelectedProduct(productId);
    if (productId) {
      fetchStockForProduct(productId);
    } else {
      setStockData([]);
    }
  };

  const handleFranchiseChange = (e) => {
    const franchiseId = e.target.value;
    setSelectedFranchise(franchiseId);
    if (franchiseId) {
      fetchStockForFranchise(franchiseId);
    } else {
      setStockData([]);
    }
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleUpdateStock = async () => {
    if (!selectedProduct || !selectedFranchise || quantity < 0) {
      toast.error('Please select a product, franchise, and enter a valid quantity');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/franchise-stock/franchise/${selectedFranchise}/product/${selectedProduct}`,
        {
          quantity: parseInt(quantity),
          isAddition: true
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Stock updated successfully');
        
        // Refresh stock data based on current view
        if (viewMode === 'product') {
          fetchStockForProduct(selectedProduct);
        } else {
          fetchStockForFranchise(selectedFranchise);
        }
      } else {
        toast.error('Failed to update stock');
      }
    } catch (error) {
      console.error('Update stock error:', error);
      toast.error(error.response?.data?.message || 'Failed to update stock');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAssign = async () => {
    if (selectedProducts.length === 0 || selectedFranchises.length === 0 || bulkQuantity < 0) {
      toast.error('Please select at least one product, one franchise, and enter a valid quantity');
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');
    let successCount = 0;
    let errorCount = 0;

    // Create a progress toast
    const toastId = toast.info(
      `Assigning products to franchises: 0/${selectedProducts.length * selectedFranchises.length} completed`,
      { autoClose: false }
    );

    try {
      const totalOperations = selectedProducts.length * selectedFranchises.length;
      let completedOperations = 0;

      for (const productId of selectedProducts) {
        for (const franchiseId of selectedFranchises) {
          try {
            await axios.put(
              `${process.env.REACT_APP_API_URL}/api/franchise-stock/franchise/${franchiseId}/product/${productId}`,
              {
                quantity: parseInt(bulkQuantity),
                isAddition: true
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            );
            successCount++;
          } catch (error) {
            console.error(`Error assigning product ${productId} to franchise ${franchiseId}:`, error);
            errorCount++;
          }

          completedOperations++;
          // Update progress toast
          toast.update(toastId, {
            render: `Assigning products to franchises: ${completedOperations}/${totalOperations} completed`,
          });
        }
      }

      // Close progress toast
      toast.dismiss(toastId);

      if (successCount > 0) {
        toast.success(`Successfully assigned ${successCount} product-franchise combinations`);
      }
      
      if (errorCount > 0) {
        toast.error(`Failed to assign ${errorCount} product-franchise combinations`);
      }

      // Refresh stock data if we're viewing a specific product or franchise
      if (viewMode === 'product' && selectedProduct) {
        fetchStockForProduct(selectedProduct);
      } else if (viewMode === 'franchise' && selectedFranchise) {
        fetchStockForFranchise(selectedFranchise);
      }
    } catch (error) {
      console.error('Bulk assign error:', error);
      toast.error('An error occurred during bulk assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelection = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleFranchiseSelection = (franchiseId) => {
    setSelectedFranchises(prev => {
      if (prev.includes(franchiseId)) {
        return prev.filter(id => id !== franchiseId);
      } else {
        return [...prev, franchiseId];
      }
    });
  };

  const selectAllProducts = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(product => product._id));
    }
  };

  const selectAllFranchises = () => {
    if (selectedFranchises.length === franchises.length) {
      setSelectedFranchises([]);
    } else {
      setSelectedFranchises(franchises.map(franchise => franchise._id));
    }
  };

  const toggleBulkAssignMode = () => {
    setBulkAssignMode(!bulkAssignMode);
    // Clear selections when toggling modes
    setSelectedProducts([]);
    setSelectedFranchises([]);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Franchise Stock Management</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('product')}
            className={`px-4 py-2 rounded ${
              viewMode === 'product'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            View by Product
          </button>
          <button
            onClick={() => setViewMode('franchise')}
            className={`px-4 py-2 rounded ${
              viewMode === 'franchise'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            View by Franchise
          </button>
          <button
            onClick={toggleBulkAssignMode}
            className={`px-4 py-2 rounded ${
              bulkAssignMode
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {bulkAssignMode ? 'Exit Bulk Mode' : 'Bulk Assign Mode'}
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="w-full md:w-auto">
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Search
          </button>
        </form>
      </div>

      {bulkAssignMode ? (
        // Bulk Assign Mode
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Bulk Assign Products to Franchises</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Product Selection */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Select Products</h3>
                <button
                  type="button"
                  onClick={selectAllProducts}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {selectedProducts.length === products.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="border rounded-lg max-h-60 overflow-y-auto">
                {productLoading ? (
                  <div className="p-4 text-center">Loading products...</div>
                ) : products.length === 0 ? (
                  <div className="p-4 text-center">No products found</div>
                ) : (
                  <ul className="divide-y">
                    {products.map(product => (
                      <li key={product._id} className="p-2 hover:bg-gray-50">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product._id)}
                            onChange={() => handleProductSelection(product._id)}
                            className="h-4 w-4 text-blue-600"
                          />
                          <span>{product.name}</span>
                          <span className="text-xs text-gray-500">
                            ({product.category?.name || 'No Category'})
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {selectedProducts.length} products selected
              </div>
            </div>

            {/* Franchise Selection */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Select Franchises</h3>
                <button
                  type="button"
                  onClick={selectAllFranchises}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {selectedFranchises.length === franchises.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="border rounded-lg max-h-60 overflow-y-auto">
                {franchiseLoading ? (
                  <div className="p-4 text-center">Loading franchises...</div>
                ) : franchises.length === 0 ? (
                  <div className="p-4 text-center">No franchises found</div>
                ) : (
                  <ul className="divide-y">
                    {franchises.map(franchise => (
                      <li key={franchise._id} className="p-2 hover:bg-gray-50">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedFranchises.includes(franchise._id)}
                            onChange={() => handleFranchiseSelection(franchise._id)}
                            className="h-4 w-4 text-blue-600"
                          />
                          <span>{franchise.name}</span>
                          <span className="text-xs text-gray-500">
                            ({franchise.address?.city}, {franchise.address?.state})
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {selectedFranchises.length} franchises selected
              </div>
            </div>
          </div>

          {/* Quantity and Submit */}
          <div className="flex items-end space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity to Add
              </label>
              <input
                type="number"
                min="0"
                value={bulkQuantity}
                onChange={(e) => setBulkQuantity(e.target.value)}
                className="p-2 border border-gray-300 rounded w-32"
              />
            </div>
            <button
              onClick={handleBulkAssign}
              disabled={loading || selectedProducts.length === 0 || selectedFranchises.length === 0}
              className={`bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded ${
                loading || selectedProducts.length === 0 || selectedFranchises.length === 0
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              {loading ? 'Processing...' : 'Assign Products to Franchises'}
            </button>
          </div>

          <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  This will add the specified quantity to each selected product in each selected franchise.
                  For example, if you select 3 products and 2 franchises with quantity 10, it will add 10 units
                  of each product to each franchise (6 operations total).
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Single Assignment Mode
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Assign Product to Franchise</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Product
              </label>
              <select
                value={selectedProduct}
                onChange={handleProductChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Select a product</option>
                {products.map(product => (
                  <option key={product._id} value={product._id}>
                    {product.name} ({product.category?.name || 'No Category'})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Franchise
              </label>
              <select
                value={selectedFranchise}
                onChange={handleFranchiseChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Select a franchise</option>
                {franchises.map(franchise => (
                  <option key={franchise._id} value={franchise._id}>
                    {franchise.name} ({franchise.address?.city}, {franchise.address?.state})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity to Add
              </label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
          
          <button
            onClick={handleUpdateStock}
            disabled={loading || !selectedProduct || !selectedFranchise}
            className={`bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded ${
              loading || !selectedProduct || !selectedFranchise
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            {loading ? 'Updating...' : 'Update Stock'}
          </button>
        </div>
      )}

      {/* Stock Data Display */}
      {!bulkAssignMode && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              {viewMode === 'product' 
                ? (selectedProduct 
                  ? `Stock for ${products.find(p => p._id === selectedProduct)?.name || 'Selected Product'}`
                  : 'Select a product to view stock')
                : (selectedFranchise
                  ? `Inventory for ${franchises.find(f => f._id === selectedFranchise)?.name || 'Selected Franchise'}`
                  : 'Select a franchise to view inventory')
              }
            </h2>
          </div>
          
          {stockLoading ? (
            <div className="p-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600">Loading stock data...</p>
            </div>
          ) : stockData.length === 0 ? (
            <div className="p-6 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="mt-4 text-gray-600">
                {viewMode === 'product' 
                  ? (selectedProduct ? 'No stock data found for this product' : 'Select a product to view stock data')
                  : (selectedFranchise ? 'No inventory found for this franchise' : 'Select a franchise to view inventory')
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {viewMode === 'product' ? (
                      <>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Franchise
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                      </>
                    ) : (
                      <>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                      </>
                    )}
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stockData.map(item => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      {viewMode === 'product' ? (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {item.franchise?.name || 'Unknown Franchise'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {item.franchise?.address?.city}, {item.franchise?.address?.state}
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {item.product?.name || 'Unknown Product'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {item.product?.category?.name || 'No Category'}
                            </div>
                          </td>
                        </>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(item.lastUpdated).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            if (viewMode === 'product') {
                              setSelectedFranchise(item.franchise?._id);
                            } else {
                              setSelectedProduct(item.product?._id);
                            }
                            setQuantity(10);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Update
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FranchiseStockManagement;