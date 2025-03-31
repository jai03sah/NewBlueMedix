import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount: '0',
    category: '',
    warehouseStock: '0',
    lowStockThreshold: '10',
    manufacturer: '',
    image: []
  });
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    image: ''
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [currentPage, selectedCategory, sortBy, sortOrder]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Build query parameters
      let url = `${process.env.REACT_APP_API_URL}/api/products?page=${currentPage}`;
      
      if (selectedCategory) {
        url += `&category=${selectedCategory}`;
      }
      
      if (searchQuery) {
        url += `&search=${searchQuery}`;
      }
      
      url += `&sortBy=${sortBy}&sortOrder=${sortOrder}`;
      
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setProducts(response.data.products);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        setError('Failed to fetch products');
        toast.error('Failed to fetch products');
      } 
    } catch (error) {
      console.error('Fetch products error:', error);
      setError('An error occurred while fetching products');
      toast.error('Failed to load products');
    } finally {
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
        console.log('Categories loaded:', response.data.categories);
        setCategories(response.data.categories);

        // If no categories exist, show a warning
        if (response.data.categories.length === 0) {
          toast.warning('No categories found. Please create a category first before adding products.');
        }
      } else {
        toast.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Fetch categories error:', error);
      toast.error('Failed to load categories');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    fetchProducts();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryFormData({
      ...categoryFormData,
      [name]: value
    });
  };

  // Function to validate MongoDB ObjectId
  const isValidObjectId = (id) => {
    return id && typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id.trim());
  };

  // Function to prepare category ID for API requests
  const prepareCategoryId = (categoryId) => {
    if (!categoryId) return '';

    // If it's an object with _id property
    if (typeof categoryId === 'object' && categoryId._id) {
      return categoryId._id.toString().trim();
    }

    // If it's a string
    if (typeof categoryId === 'string') {
      return categoryId.trim();
    }

    // Default case
    return String(categoryId).trim();
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    
    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreview(previews);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    // Validate category is selected
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }

    // Prepare and validate the category ID
    const categoryId = prepareCategoryId(formData.category);
    console.log('Prepared category ID:', categoryId);

    // Validate that the category ID is a valid MongoDB ObjectId
    if (!isValidObjectId(categoryId)) {
      toast.error('Invalid category ID format. Please select a valid category.');
      console.error('Invalid category ID format:', categoryId);
      return;
    }

    try {
      const token = localStorage.getItem('token');

      // Log the selected category ID for debugging
      console.log('Selected category ID:', formData.category);

      // We already prepared and validated categoryId above

      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        discount: formData.discount,
        category: categoryId, // Use the trimmed ID
        warehouseStock: formData.warehouseStock,
        lowStockThreshold: formData.lowStockThreshold,
        manufacturer: formData.manufacturer
      };

      // If there are no image files, use regular JSON
      if (imageFiles.length === 0) {
        console.log('Sending as JSON:', productData);

        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/products`,
          productData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          toast.success('Product added successfully');
          setShowAddModal(false);
          setFormData({
            name: '',
            description: '',
            price: '',
            discount: '0',
            category: '',
            warehouseStock: '0',
            lowStockThreshold: '10',
            manufacturer: '',
            image: []
          });
          fetchProducts();
        } else {
          toast.error('Failed to add product');
        }
        return;
      }

      // If there are image files, use FormData
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name);
      formDataObj.append('description', formData.description);
      formDataObj.append('price', formData.price);
      formDataObj.append('discount', formData.discount);
      // Fix: Add null check before calling trim()
      formDataObj.append('category', categoryId); // Use the already validated categoryId
      formDataObj.append('warehouseStock', formData.warehouseStock);
      formDataObj.append('lowStockThreshold', formData.lowStockThreshold);
      formDataObj.append('manufacturer', formData.manufacturer);

      // Append each image file
      imageFiles.forEach(file => {
        formDataObj.append('images', file);
      });
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/products`,
        formDataObj,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        toast.success('Product added successfully');
        setShowAddModal(false);
        setFormData({
          name: '',
          description: '',
          price: '',
          discount: '0',
          category: '',
          warehouseStock: '0',
          lowStockThreshold: '10',
          manufacturer: '',
          image: []
        });
        setImageFiles([]);
        setImagePreview([]);
        fetchProducts();
      } else {
        toast.error('Failed to add product');
      }
    } catch (error) {
      console.error('Add product error:', error);

      // Check for specific error messages
      if (error.response?.data?.message === 'Category not found') {
        toast.error('The selected category was not found. Please select a valid category.');

        // Refresh categories list
        fetchCategories();
      } else {
        toast.error(error.response?.data?.message || 'Failed to add product');
      }
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();

    // Validate category is selected
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }

    // Prepare and validate the category ID
    const categoryId = prepareCategoryId(formData.category);
    console.log('Prepared category ID for edit:', categoryId);

    // Validate that the category ID is a valid MongoDB ObjectId
    if (!isValidObjectId(categoryId)) {
      toast.error('Invalid category ID format. Please select a valid category.');
      console.error('Invalid category ID format for edit:', categoryId);
      return;
    }

    try {
      const token = localStorage.getItem('token');

      // Log the selected category ID for debugging
      console.log('Selected category ID for edit:', formData.category);

      // We already prepared and validated categoryId above

      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        discount: formData.discount,
        category: categoryId, // Use the trimmed ID
        warehouseStock: formData.warehouseStock,
        lowStockThreshold: formData.lowStockThreshold,
        manufacturer: formData.manufacturer
      };

      // If there are no new image files, use regular JSON
      if (imageFiles.length === 0) {
        console.log('Sending as JSON for edit:', productData);

        const response = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/products/${currentProduct._id}`,
          productData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          toast.success('Product updated successfully');
          setShowEditModal(false);
          setCurrentProduct(null);
          setImagePreview([]);
          fetchProducts();
        } else {
          toast.error('Failed to update product');
        }
        return;
      }

      // If there are image files, use FormData
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name);
      formDataObj.append('description', formData.description);
      formDataObj.append('price', formData.price);
      formDataObj.append('discount', formData.discount);
      // Fix: Add null check before calling trim()
      formDataObj.append('category', categoryId); // Use the already validated categoryId
      formDataObj.append('warehouseStock', formData.warehouseStock);
      formDataObj.append('lowStockThreshold', formData.lowStockThreshold);
      formDataObj.append('manufacturer', formData.manufacturer);

      // Append each image file if there are new images
      if (imageFiles.length > 0) {
        imageFiles.forEach(file => {
          formDataObj.append('images', file);
        });
      }
      
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/products/${currentProduct._id}`,
        formDataObj,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        toast.success('Product updated successfully');
        setShowEditModal(false);
        setCurrentProduct(null);
        setImageFiles([]);
        setImagePreview([]);
        fetchProducts();
      } else {
        toast.error('Failed to update product');
      }
    } catch (error) {
      console.error('Update product error:', error);

      // Check for specific error messages
      if (error.response?.data?.message === 'Category not found') {
        toast.error('The selected category was not found. Please select a valid category.');

        // Refresh categories list
        fetchCategories();
      } else {
        toast.error(error.response?.data?.message || 'Failed to update product');
      }
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/products/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Product deleted successfully');
        fetchProducts();
      } else {
        toast.error('Failed to delete product');
      }
    } catch (error) {
      console.error('Delete product error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const openEditModal = (product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      discount: product.discount.toString(),
      category: product.category?._id || '',
      warehouseStock: product.warehouseStock.toString(),
      lowStockThreshold: product.lowStockThreshold?.toString() || '10',
      manufacturer: product.manufacturer || ''
    });
    
    // Set image preview from existing product images
    if (product.image && product.image.length > 0) {
      setImagePreview(product.image);
    } else {
      setImagePreview([]);
    }
    
    setImageFiles([]);
    setShowEditModal(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          Add Product
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by name or description"
                className="flex-grow border border-gray-300 rounded-l px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r"
              >
                Search
              </button>
            </form>
          </div>
          
          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Sort */}
          <div>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-');
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
                setCurrentPage(1);
              }}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-red-500">{error}</p>
            <button
              onClick={() => fetchProducts()}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            >
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No products found. Add your first product!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-12 w-12 bg-gray-100 rounded overflow-hidden">
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.category?.name || 'Uncategorized'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${product.price.toFixed(2)}</div>
                      {product.discount > 0 && (
                        <div className="text-xs text-red-500">
                          {product.discount}% off
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${
                        product.warehouseStock <= product.lowStockThreshold 
                          ? 'text-red-600 font-medium' 
                          : 'text-gray-900'
                      }`}>
                        {product.warehouseStock} in stock
                      </div>
                      {product.warehouseStock <= product.lowStockThreshold && (
                        <div className="text-xs text-red-500">
                          Low stock
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openEditModal(product)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && products.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-700">
            Showing page {pagination.page} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded ${
                currentPage === 1
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded ${
                currentPage === totalPages
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Add New Product</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setImageFiles([]);
                  setImagePreview([]);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddProduct}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                      Product Name *
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
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
                      Price *
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="discount">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      id="discount"
                      name="discount"
                      value={formData.discount}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {!formData.category && (
                      <p className="text-red-500 text-xs mt-1">Please select a category</p>
                    )}
                    {categories.length === 0 && (
                      <div className="mt-2">
                        <p className="text-red-500 text-xs mb-1">No categories available</p>
                        <button
                          type="button"
                          onClick={() => setShowAddCategoryModal(true)}
                          className="text-blue-600 text-xs underline"
                        >
                          Create a category first
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="warehouseStock">
                      Warehouse Stock
                    </label>
                    <input
                      type="number"
                      id="warehouseStock"
                      name="warehouseStock"
                      value={formData.warehouseStock}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lowStockThreshold">
                      Low Stock Threshold
                    </label>
                    <input
                      type="number"
                      id="lowStockThreshold"
                      name="lowStockThreshold"
                      value={formData.lowStockThreshold}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="manufacturer">
                      Manufacturer
                    </label>
                    <input
                      type="text"
                      id="manufacturer"
                      name="manufacturer"
                      value={formData.manufacturer}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="images">
                      Product Images
                    </label>
                    <input
                      type="file"
                      id="images"
                      name="images"
                      onChange={handleImageChange}
                      multiple
                      accept="image/*"
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {/* Image Preview */}
                  {imagePreview.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Image Preview
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {imagePreview.map((src, index) => (
                          <div key={index} className="h-24 bg-gray-100 rounded overflow-hidden">
                            <img 
                              src={src} 
                              alt={`Preview ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setImageFiles([]);
                    setImagePreview([]);
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Add New Category</h2>
              <button
                onClick={() => setShowAddCategoryModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();

              if (!categoryFormData.name) {
                toast.error('Category name is required');
                return;
              }

              try {
                const token = localStorage.getItem('token');

                const response = await axios.post(
                  `${process.env.REACT_APP_API_URL}/api/categories`,
                  categoryFormData,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`
                    }
                  }
                );

                if (response.data.success) {
                  toast.success('Category created successfully');
                  setCategoryFormData({ name: '', image: '' });
                  setShowAddCategoryModal(false);
                  fetchCategories();
                } else {
                  toast.error('Failed to create category');
                }
              } catch (error) {
                console.error('Create category error:', error);
                toast.error(error.response?.data?.message || 'Failed to create category');
              }
            }}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category-name">
                  Category Name *
                </label>
                <input
                  type="text"
                  id="category-name"
                  name="name"
                  value={categoryFormData.name}
                  onChange={handleCategoryInputChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category-image">
                  Image URL (Optional)
                </label>
                <input
                  type="text"
                  id="category-image"
                  name="image"
                  value={categoryFormData.image}
                  onChange={handleCategoryInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && currentProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Edit Product</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setCurrentProduct(null);
                  setImageFiles([]);
                  setImagePreview([]);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleEditProduct}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-name">
                      Product Name *
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
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-description">
                      Description
                    </label>
                    <textarea
                      id="edit-description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-price">
                      Price *
                    </label>
                    <input
                      type="number"
                      id="edit-price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-discount">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      id="edit-discount"
                      name="discount"
                      value={formData.discount}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-category">
                      Category
                    </label>
                    <select
                      id="edit-category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {!formData.category && (
                      <p className="text-red-500 text-xs mt-1">Please select a category</p>
                    )}
                  </div>
                </div>
                <div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-warehouseStock">
                      Warehouse Stock
                    </label>
                    <input
                      type="number"
                      id="edit-warehouseStock"
                      name="warehouseStock"
                      value={formData.warehouseStock}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-lowStockThreshold">
                      Low Stock Threshold
                    </label>
                    <input
                      type="number"
                      id="edit-lowStockThreshold"
                      name="lowStockThreshold"
                      value={formData.lowStockThreshold}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-manufacturer">
                      Manufacturer
                    </label>
                    <input
                      type="text"
                      id="edit-manufacturer"
                      name="manufacturer"
                      value={formData.manufacturer}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-images">
                      Product Images (Upload new to replace existing)
                    </label>
                    <input
                      type="file"
                      id="edit-images"
                      name="images"
                      onChange={handleImageChange}
                      multiple
                      accept="image/*"
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {/* Image Preview */}
                  {imagePreview.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Current Images
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {imagePreview.map((src, index) => (
                          <div key={index} className="h-24 bg-gray-100 rounded overflow-hidden">
                            <img 
                              src={src} 
                              alt={`Preview ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setCurrentProduct(null);
                    setImageFiles([]);
                    setImagePreview([]);
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                >
                  Update Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;