import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { AuthContext } from '../../context/AuthContext';
import { getFullImageUrl, handleImageError } from '../../utils/imageUtils';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, isCustomer } = useContext(AuthContext);
  const navigate = useNavigate();
  


  useEffect(() => {
    // Fetch products from the API
    const fetchProducts = async () => {
      try {
        const response = await api.get('/api/products');
        
        // Check if response has the expected structure
        if (response.data && Array.isArray(response.data.data)) {
          const products = response.data.data;
          
          // Get featured products (first 4)
          setFeaturedProducts(products.slice(0, 4));
          
          // Get popular products (next 4, or random if not enough)
          setPopularProducts(products.slice(4, 8));
        } else {
          console.warn('Unexpected API response structure:', response);
          setFeaturedProducts([]);
          setPopularProducts([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  const handleProductClick = (productId, event) => {
    if (!isAuthenticated) {
      event.preventDefault();
      if (window.confirm('You need to log in to view product details. Would you like to log in now?')) {
        // Pass the intended destination to redirect after login
        navigate('/login', { state: { from: `/products/${productId}` } });
      }
      return;
    }
  };
  
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-green-50 rounded-lg mb-12">
        <div className="container mx-auto px-4 py-12 md:py-24 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0 md:pr-12">
            <h1 className="text-4xl md:text-5xl font-bold text-green-900 mb-6">
              Authentic Ayurvedic Products for Your Wellbeing
            </h1>
            <p className="text-lg text-gray-700 mb-8">
              Discover the ancient healing wisdom of Ayurveda through our premium quality products sourced directly from trusted suppliers.
            </p>
            <div className="flex space-x-4">
              <Link 
                to="/products" 
                className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg font-medium transition transform hover:scale-105"
              >
                Explore Products
              </Link>
              <Link 
                to="/register" 
                className="border-2 border-green-700 text-green-700 hover:bg-green-50 px-6 py-3 rounded-lg font-medium transition"
              >
                Register Now
              </Link>
            </div>
          </div>
          <div className="md:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1577175889968-f551f5944abd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
              alt="Ayurvedic products" 
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>
      </div>
      
      {/* Categories Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center text-green-800 mb-12">Our Product Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {['Hair Care', 'Skin Care', 'Digestive Health', 'Immunity Boosters'].map((category) => (
            <div key={category} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition">
              <Link to={`/products?category=${category}`}>
                <div className="p-6 text-center">
                  <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-green-700 text-2xl">{category[0]}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">{category}</h3>
                  <p className="mt-2 text-gray-600 text-sm">Explore our {category.toLowerCase()} products</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>
      
      {/* Featured Products */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center text-green-800 mb-12">Featured Products</h2>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-700 border-opacity-50 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <div key={product._id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition transform hover:-translate-y-1">
                <Link 
                  to={`/products/${product._id}`}
                  onClick={(e) => handleProductClick(product._id, e)}
                >
                  <img 
                    src={getFullImageUrl(product.imageUrl)} 
                    alt={product.name} 
                    className="w-full h-48 object-cover"
                    onError={handleImageError}
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-800 mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-green-700">Rs. {product.price.toFixed(2)}</span>
                      <span className="text-xs py-1 px-2 bg-green-100 text-green-800 rounded-full">{product.category}</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
        
        <div className="text-center mt-10">
          <Link 
            to="/products" 
            className="inline-block bg-white border-2 border-green-700 text-green-700 hover:bg-green-50 px-6 py-3 rounded-lg font-medium transition"
          >
            View All Products
          </Link>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="mb-16 bg-green-50 py-12 rounded-lg">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-green-800 mb-12">Why Choose Ayurvedic Products?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-center mb-4">Natural Ingredients</h3>
              <p className="text-gray-600 text-center">
                Our products are made from 100% natural ingredients, free from harmful chemicals and artificial additives.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-center mb-4">Traditional Wisdom</h3>
              <p className="text-gray-600 text-center">
                Formulations based on ancient Ayurvedic principles passed down through generations.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-center mb-4">Holistic Well-being</h3>
              <p className="text-gray-600 text-center">
                Products designed to promote overall health and balance in body, mind, and spirit.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center text-green-800 mb-12">What Our Customers Say</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              name: "Priya Sharma",
              quote: "The Ayurvedic hair oil has completely transformed my hair. It's stronger and shinier than ever before!",
              avatar: "https://randomuser.me/api/portraits/women/54.jpg"
            },
            {
              name: "Amal Perera",
              quote: "I've been using the digestive herbal tea for a month now and my digestive issues have significantly improved.",
              avatar: "https://randomuser.me/api/portraits/men/32.jpg"
            },
            {
              name: "Lakshmi Devi",
              quote: "The face cream is amazing. My skin feels rejuvenated and the natural ingredients make it perfect for daily use.",
              avatar: "https://randomuser.me/api/portraits/women/67.jpg"
            }
          ].map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name} 
                  className="w-12 h-12 rounded-full mr-4"
                />
                <h4 className="font-semibold text-lg">{testimonial.name}</h4>
              </div>
              <p className="text-gray-600 italic">"{testimonial.quote}"</p>
              <div className="mt-4 flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
