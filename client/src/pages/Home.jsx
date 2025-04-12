import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import PublicProductsLayout from '../components/layouts/PublicProductsLayout';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch featured products (newest products)
        const productsResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/products?limit=4&sortBy=createdAt&sortOrder=desc`
        );
        
        // Fetch categories
        const categoriesResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/categories?limit=4`
        );
        
        if (productsResponse.data.success) {
          setFeaturedProducts(productsResponse.data.products);
        }
        
        if (categoriesResponse.data.success) {
          setCategories(categoriesResponse.data.categories);
        }
      } catch (error) {
        console.error('Error fetching home page data:', error);
        // toast.error('Failed to load home page data'); 
      } finally {
        setLoading(false); 
      }
    };
    
    fetchData();
  }, []);

  return (
    <PublicProductsLayout>
      {/* Hero Section */}
      <section className="bg-blue-600 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Your Trusted Medical Supply Partner
              </h1> 
              <p className="text-xl mb-8">
                Quality healthcare products delivered to your doorstep. Browse our extensive catalog of medical supplies and equipment.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/products"
                  className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-md text-lg font-medium inline-block text-center"
                >
                  Shop Now
                </Link>
                <Link
                  to="/categories"
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-6 py-3 rounded-md text-lg font-medium inline-block text-center"
                >
                  Browse Categories
                </Link>
              </div>
            </div>
            <div className="hidden md:block"> 
              <img 
                src="https://img.freepik.com/free-vector/flat-design-medical-services-twitter-header_23-2149190590.jpg?t=st=1743588341~exp=1743591941~hmac=dfe9d21bcd5c60a7ef8a5a366b782d31adcb5a3f6690e1aeca7b9b4caa3b53ab&w=1380"
                alt="Medical Supplies"
                className="rounded-lg shadow-lg"
              /> 
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      {/* <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
            <p className="text-gray-600 mt-2">Discover our newest and most popular medical supplies</p>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <div 
                  key={product._id} 
                  className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <Link to={`/products/${product._id}`}>
                    <div className="h-48 bg-gray-200 relative">
                      {product.image && product.image.length > 0 ? (
                        <img 
                          src={product.image[0]} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gray-100">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      
                      {product.discount > 0 && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                          {product.discount}% OFF
                        </div>
                      )}
                    </div>
                  </Link>
                  
                  <div className="p-4">
                    <Link to={`/products/${product._id}`}>
                      <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600">{product.name}</h3>
                    </Link>
                    
                    <div className="flex items-center mt-1">
                      <span className="text-lg font-bold text-gray-800">
                        ${((product.price * (1 - product.discount / 100)).toFixed(2))}
                      </span>
                      {product.discount > 0 && (
                        <span className="ml-2 text-sm text-gray-500 line-through">
                          ${product.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-4">
                      <Link 
                        to={`/products/${product._id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm w-full block text-center"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-8">
            <Link
              to="/products"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-lg font-medium"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section> */}

<section className="py-12 bg-gray-50">
  <div className="container mx-auto px-4">
    {/* Section heading */}
    <div className="text-center mb-12">
      <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
      <p className="text-gray-600 mt-2">Discover our newest and most popular medical supplies</p>
    </div>

    {/* Loader if loading is true */}
    {loading ? (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-4 md:px-0">
        {/* ↑ Added md:grid-cols-3 and adjusted gap & padding for better alignment */}
        {featuredProducts.map((product) => (
          <div
            key={product._id}
            className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col"
          >
            {/* ↑ Added flex flex-col for better layout control */}

            <Link to={`/products/${product._id}`}>
              <div className="h-48 bg-gray-200 relative">
                {product.image && product.image.length > 0 ? (
                  <img
                    src={product.image[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}

                {product.discount > 0 && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    {product.discount}% OFF
                  </div>
                )}
              </div>
            </Link>

            <div className="p-4 flex flex-col flex-grow justify-between">
              {/* ↑ Ensures name, price, and button stay well aligned even if content varies */}
              <div>
                <Link to={`/products/${product._id}`}>
                  <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600">
                    {product.name}
                  </h3>
                </Link>

                <div className="flex items-center mt-1">
                  <span className="text-lg font-bold text-gray-800">
                    ${((product.price * (1 - product.discount / 100)).toFixed(2))}
                  </span>
                  {product.discount > 0 && (
                    <span className="ml-2 text-sm text-gray-500 line-through">
                      ${product.price.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <Link
                  to={`/products/${product._id}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm w-full block text-center"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}

    {/* CTA Button */}
    <div className="text-center mt-12">
      {/* ↑ Increased top margin for spacing consistency */}
      <Link
        to="/products"
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-lg font-medium"
      >
        View All Products
      </Link>
    </div>
  </div>
</section>



      {/* Categories Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Product Categories</h2>
            <p className="text-gray-600 mt-2">Browse our wide range of medical categories</p>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Link 
                  key={category._id} 
                  to={`/products?category=${category._id}`}
                  className="bg-gray-50 shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="h-48 bg-gray-200 relative">
                    {category.image ? (
                      <img 
                        src={category.image} 
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="text-xl font-semibold text-gray-800">{category.name}</h3>
                    <div className="mt-2">
                      <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        Browse Products
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          <div className="text-center mt-8">
            <Link
              to="/categories"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-lg font-medium"
            >
              View All Categories
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose BlueMedix</h2>
            <p className="text-gray-600 mt-2">We're committed to providing the best medical supplies and service</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-blue-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Assured</h3>
              <p className="text-gray-600">
                All our products meet the highest quality standards and are sourced from trusted manufacturers.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-blue-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">
                We offer quick and reliable shipping to ensure you receive your medical supplies when you need them.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-blue-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.5 9.5v5M14.5 9.5v5" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Support</h3>
              <p className="text-gray-600">
                Our team of healthcare professionals is available to provide guidance and answer your questions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-12 bg-white" id="about-us">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">About BlueMedix</h2>
            <p className="text-gray-600 mt-2">Your trusted partner in healthcare supplies since 2010</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="BlueMedix Team"
                className="rounded-lg shadow-lg w-full h-auto"
              />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Our Mission</h3>
              <p className="text-gray-600 mb-6">
                At BlueMedix, our mission is to provide high-quality medical supplies and equipment to healthcare professionals and individuals at competitive prices. We believe that access to quality healthcare products should be simple, affordable, and reliable.
              </p>

              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Our Story</h3>
              <p className="text-gray-600 mb-6">
                Founded in 2010, BlueMedix began as a small family-owned business with a passion for improving healthcare accessibility. Over the years, we've grown into a nationwide network of franchises, serving thousands of customers while maintaining our commitment to quality and customer satisfaction.
              </p>

              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Our Values</h3>
              <ul className="text-gray-600 list-disc pl-5 space-y-2">
                <li>Quality: We source only the best products from trusted manufacturers</li>
                <li>Integrity: We operate with honesty and transparency in all our dealings</li>
                <li>Service: We put our customers first and strive to exceed expectations</li>
                <li>Innovation: We continuously seek better ways to serve our customers</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="py-12 bg-gray-50" id="contact">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Contact Us</h2>
            <p className="text-gray-600 mt-2">We're here to help with any questions or concerns</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-blue-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Phone Support</h3>
              <p className="text-gray-600 mb-2">
                Customer Service: <a href="tel:+18001234567" className="text-blue-600 hover:underline">1-800-123-4567</a>
              </p>
              <p className="text-gray-600">
                Technical Support: <a href="tel:+18009876543" className="text-blue-600 hover:underline">1-800-987-6543</a>
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Monday-Friday: 8am-8pm EST<br />
                Saturday: 9am-5pm EST
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-blue-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Email Us</h3>
              <p className="text-gray-600 mb-2">
                General Inquiries: <a href="mailto:info@bluemedix.com" className="text-blue-600 hover:underline">info@bluemedix.com</a>
              </p>
              <p className="text-gray-600 mb-2">
                Customer Support: <a href="mailto:support@bluemedix.com" className="text-blue-600 hover:underline">support@bluemedix.com</a>
              </p>
              <p className="text-gray-600">
                Business Development: <a href="mailto:business@bluemedix.com" className="text-blue-600 hover:underline">business@bluemedix.com</a>
              </p>
              <p className="text-gray-500 text-sm mt-2">
                We typically respond within 24 hours
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-blue-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Visit Us</h3>
              <p className="text-gray-600 mb-2">
                BlueMedix Headquarters<br />
                123 Medical Plaza, Suite 400<br />
                New Delhi, Delhi 110001<br />
                India
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Office Hours: Monday-Friday 9am-5pm
              </p>
              <a
                href="https://maps.google.com/?q=New+Delhi+India"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 text-blue-600 hover:underline"
              >
                Get Directions
              </a>
            </div>
          </div>

          <div className="mt-12 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-center">Send Us a Message</h3>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                <input
                  type="text"
                  id="name"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  id="email"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  placeholder="john@example.com"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  id="subject"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  placeholder="How can we help you?"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  id="message"
                  rows="4"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Please provide details about your inquiry..."
                ></textarea>
              </div>
              <div className="md:col-span-2 text-center">
                <button
                  type="submit"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-lg font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    // Show a success message
                    toast.success("Thank you for your message! We'll get back to you soon.");
                    // Clear the form
                    e.target.closest('form').reset();
                  }}
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Shop?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Browse our extensive catalog of medical supplies and equipment. Quality products at competitive prices.
          </p>
          <Link
            to="/products"
            className="inline-block bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-md text-lg font-medium"
          >
            Shop Now
          </Link>
        </div>
      </section>
    </PublicProductsLayout>
  );
};

export default Home;