import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Authentication required');
          toast.error('Authentication required');
          navigate('/login');
          return;
        }
        
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/products/${productId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.data.success) {
          setProduct(response.data.product);
        } else {
          setError('Failed to fetch product details');
          toast.error('Failed to fetch product details');
        }
      } catch (error) {
        console.error('Fetch product details error:', error);
        setError('An error occurred while fetching product details');
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId, navigate]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error || 'Product not found'}</p>
          <button 
            onClick={() => navigate('/admin/products')} 
            className="mt-2 bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  // Calculate discounted price
  const discountedPrice = product.price * (1 - product.discount / 100);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Product Details</h1>
        <div className="flex space-x-2">
          <Link
            to="/admin/products"
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded"
          >
            Back to Products
          </Link>
          <Link
            to={`/products/${product._id}`}
            target="_blank"
            className="bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-4 rounded"
          >
            View Public Page
          </Link>
          <Link
            to="/admin/products"
            state={{ editProduct: product }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded"
          >
            Edit Product
          </Link>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          {/* Product Images */}
          <div>
            <div className="bg-gray-100 rounded-lg overflow-hidden h-80 mb-4">
              {product.image && product.image.length > 0 ? (
                <img 
                  src={product.image[0]} 
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* All Product Images */}
            {product.image && product.image.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">All Product Images</h3>
                <div className="grid grid-cols-4 gap-2">
                  {product.image.map((img, index) => (
                    <div key={index} className="h-20 bg-gray-100 rounded overflow-hidden">
                      <img 
                        src={img} 
                        alt={`${product.name} ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Product Details */}
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h1>
            
            {product.category && (
              <div className="mb-4">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                  {product.category.name}
                </span>
              </div>
            )}
            
            <div className="flex items-center mb-4">
              <span className="text-2xl font-bold text-gray-800">
                ${discountedPrice.toFixed(2)}
              </span>
              {product.discount > 0 && (
                <>
                  <span className="ml-2 text-lg text-gray-500 line-through">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="ml-2 bg-red-100 text-red-800 text-sm font-medium px-2 py-0.5 rounded">
                    {product.discount}% OFF
                  </span>
                </>
              )}
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
              <p className="text-gray-600">{product.description || 'No description provided'}</p>
            </div>
            
            {/* Stock Information */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Inventory Information</h3>
              <div className="bg-gray-50 p-4 rounded">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Warehouse Stock:</span>
                  <span className={`font-medium ${product.warehouseStock <= product.lowStockThreshold ? 'text-red-600' : 'text-green-600'}`}>
                    {product.warehouseStock} units
                    {product.warehouseStock <= product.lowStockThreshold && (
                      <span className="ml-2 text-xs bg-red-100 text-red-800 px-1 py-0.5 rounded">Low Stock</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Low Stock Threshold:</span>
                  <span className="font-medium">{product.lowStockThreshold} units</span>
                </div>
              </div>
            </div>
            
            {/* Additional Information */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Additional Information</h3>
              <div className="bg-gray-50 p-4 rounded">
                {product.manufacturer && (
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Manufacturer:</span>
                    <span className="font-medium">{product.manufacturer}</span>
                  </div>
                )}
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Created At:</span>
                  <span className="font-medium">{new Date(product.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">{new Date(product.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Product ID:</span>
                  <span className="font-medium text-xs">{product._id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;