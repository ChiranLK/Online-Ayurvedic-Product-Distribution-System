import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../App';
import CartIcon from '../cart/CartIcon';
import categories from '../../config/categories';

const Navbar = () => {
  const context = useContext(AuthContext);
  const { currentUser, token, logout } = context || { currentUser: null, token: null, logout: () => {} };
  const { darkTheme, toggleTheme } = useContext(ThemeContext) || { darkTheme: false, toggleTheme: () => {} };
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Refs for detecting clicks outside the dropdowns
  const profileMenuRef = useRef(null);
  const productsDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navigate = useNavigate();
  
  // Determine if user is authenticated based on token
  const isAuthenticated = !!token;
  
  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };
  
  // Close dropdowns when clicking outside or pressing escape
  useEffect(() => {
    function handleClickOutside(event) {
      // Handle profile dropdown
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
      
      // Handle products dropdown (desktop)
      if (productsDropdownRef.current && !productsDropdownRef.current.contains(event.target)) {
        setIsProductsDropdownOpen(false);
      }
      
      // We don't close the mobile menu when clicking outside because it's typical for mobile
      // menus to require an explicit close action by the user
    }
    
    // Handle Escape key press
    function handleEscapeKey(event) {
      if (event.key === 'Escape') {
        setIsProfileMenuOpen(false);
        setIsProductsDropdownOpen(false);
        setIsMenuOpen(false);
        setMobileProductsOpen(false);
      }
    }
    
    // Add event listeners
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    
    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  // Get dashboard link based on user role
  const getDashboardLink = () => {
    if (!currentUser) return '/login';
    
    switch (currentUser?.role) {
      case 'admin':
        return '/admin/dashboard'; // Redirect to proper admin dashboard
      case 'seller':
        return '/seller';
      case 'customer':
        return '/customer';
      default:
        return '/dashboard';
    }
  };

  // Handle logout and redirect to home page
  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
    setIsMenuOpen(false);
    // Redirect to home page
    window.location.href = '/';
  };

  return (
    <nav className="bg-green-800 text-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="font-bold flex items-center space-x-2">
            <img 
              src={darkTheme 
                ? "/images/home/ayurveda logo white.png" 
                : "/images/home/ayurveda logo black.png"} 
              alt="Ayura Logo"
              className="h-10 w-auto"
            />
            <div className="flex flex-col">
              <span className="text-xl font-bold leading-none">Ayura</span>
              <span className="text-xs italic text-green-300">Ancient Healing for Modern Living</span>
            </div>
          </Link>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden" ref={mobileMenuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setIsMenuOpen(!isMenuOpen);
                } else if (e.key === 'Escape') {
                  setIsMenuOpen(false);
                }
              }}
              className="text-white focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-opacity-50 rounded-md p-2"
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6 items-center">
            <Link to="/" className="hover:text-green-300 transition">Home</Link>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-1 rounded-l border border-gray-300 focus:outline-none focus:ring-1 focus:ring-green-500 text-gray-800 w-40"
              />
              <button 
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-r transition duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
            
            {/* Products Dropdown */}
            <div className="relative" ref={productsDropdownRef}>
              <button
                onClick={() => setIsProductsDropdownOpen(!isProductsDropdownOpen)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setIsProductsDropdownOpen(!isProductsDropdownOpen);
                  } else if (e.key === 'Escape') {
                    setIsProductsDropdownOpen(false);
                  }
                }}
                className="hover:text-green-300 transition flex items-center focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-opacity-50 rounded-md px-2 py-1"
                aria-expanded={isProductsDropdownOpen}
                aria-haspopup="true"
              >
                Products
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-4 w-4 ml-1 transition-transform duration-200 ${isProductsDropdownOpen ? 'rotate-180' : ''}`} 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              <div 
                className={`absolute left-0 mt-2 w-64 bg-white rounded-md shadow-xl z-20 transition-all duration-200 origin-top-left ${
                  isProductsDropdownOpen 
                    ? 'transform scale-100 opacity-100' 
                    : 'transform scale-95 opacity-0 pointer-events-none'
                }`}
              >
                <Link 
                  to="/products" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-100 font-medium transition duration-150"
                  onClick={() => setIsProductsDropdownOpen(false)}
                  tabIndex={isProductsDropdownOpen ? 0 : -1}
                >
                  All Products
                </Link>
                <div className="border-t border-gray-100"></div>
                {categories.map((category, index) => (
                  <Link 
                    key={index}
                    to={`/products?category=${encodeURIComponent(category)}`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-100 transition duration-150"
                    onClick={() => setIsProductsDropdownOpen(false)}
                    tabIndex={isProductsDropdownOpen ? 0 : -1}
                  >
                    {category}
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Blog Link - Visible to all users */}
            <Link
              to="/blog"
              className="hover:text-green-300 transition focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-opacity-50 rounded-md px-3 py-1 mx-1"
            >
              Blog
            </Link>
            
            {isAuthenticated ? (
              <>
                {/* Admin Links */}
                {currentUser?.role === 'admin' && (
                  <>
                    <Link to="/admin/users" className="hover:text-green-300 transition mx-1">Users</Link>
                    <Link to="/admin/products" className="hover:text-green-300 transition mx-1">Products</Link>
                    <Link to="/admin/orders" className="hover:text-green-300 transition mx-1">Orders</Link>
                    <Link to="/admin/reports/sales" className="hover:text-green-300 transition mx-1">Sales Reports</Link>
                    <Link to="/admin/reports/inventory" className="hover:text-green-300 transition mx-1">Inventory Reports</Link>
                  </>
                )}
                
                {/* Seller Links */}
                {currentUser?.role === 'seller' && (
                  <>
                    <Link to="/seller/products" className="hover:text-green-300 transition">My Products</Link>
                    <Link to="/seller/orders" className="hover:text-green-300 transition">Orders</Link>
                  </>
                )}
                
                {/* Customer Links */}
                {currentUser?.role === 'customer' && (
                  <>
                    <Link to="/customer/orders" className="hover:text-green-300 transition">My Orders</Link>
                  </>
                )}
                
                {/* Profile Dropdown */}
                <div className="relative ml-3" ref={profileMenuRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setIsProfileMenuOpen(!isProfileMenuOpen);
                      } else if (e.key === 'Escape') {
                        setIsProfileMenuOpen(false);
                      }
                    }}
                    className="flex items-center hover:text-green-300 transition focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-opacity-50 rounded-md px-2 py-1"
                    aria-expanded={isProfileMenuOpen}
                    aria-haspopup="true"
                  >
                    <span className="mr-1">{currentUser?.name || 'User'}</span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-4 w-4 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  <div 
                    className={`absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-xl z-20 transition-all duration-200 origin-top-right ${
                      isProfileMenuOpen 
                        ? 'transform scale-100 opacity-100' 
                        : 'transform scale-95 opacity-0 pointer-events-none'
                    }`}
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="text-sm font-medium text-gray-800">{currentUser?.email || 'User'}</p>
                    </div>
                    <Link 
                      to={getDashboardLink()} 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-100 transition duration-150"
                      onClick={() => setIsProfileMenuOpen(false)}
                      tabIndex={isProfileMenuOpen ? 0 : -1}
                    >
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Dashboard
                      </div>
                    </Link>
                    <Link 
                      to={currentUser?.role ? `/${currentUser.role}/profile` : '/profile'} 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-100 transition duration-150"
                      onClick={() => setIsProfileMenuOpen(false)}
                      tabIndex={isProfileMenuOpen ? 0 : -1}
                    >
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </div>
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-100 transition duration-150"
                      tabIndex={isProfileMenuOpen ? 0 : -1}
                    >
                      <div className="flex items-center text-red-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </div>
                    </button>
                  </div>
                </div>
                
                {/* Cart Icon (only for customers) */}
                {(currentUser?.role === 'customer' || !currentUser?.role) && (
                  <CartIcon />
                )}
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-green-300 transition">Login</Link>
                <Link to="/register" className="hover:text-green-300 transition">Register</Link>
                <CartIcon />
              </>
            )}
          </div>
        </div>
        
        {/* Mobile Menu */}
        <div 
          className={`md:hidden py-4 bg-green-700 transition-all duration-300 ease-in-out overflow-hidden ${
            isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          }`}
          aria-hidden={!isMenuOpen}
          role="menu"
        >
            {/* Mobile Search */}
            <form onSubmit={(e) => { handleSearch(e); setIsMenuOpen(false); }} className="px-4 mb-3">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-grow px-4 py-2 rounded-l border border-gray-300 focus:outline-none text-gray-800"
                />
                <button 
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-r transition duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>

            <Link 
              to="/" 
              className="block py-2 px-4 hover:bg-green-600 transition duration-150"
              onClick={() => setIsMenuOpen(false)}
              tabIndex={isMenuOpen ? 0 : -1}
            >Home</Link>
            
            {/* Products Section with Toggle */}
            <div className="relative">
              <button 
                className="flex justify-between items-center w-full py-2 px-4 hover:bg-green-600 transition duration-150 focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-opacity-50 text-left"
                onClick={() => setMobileProductsOpen(!mobileProductsOpen)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setMobileProductsOpen(!mobileProductsOpen);
                  } else if (e.key === 'Escape') {
                    setMobileProductsOpen(false);
                  }
                }}
                aria-expanded={mobileProductsOpen}
                aria-controls="mobile-products-menu"
                tabIndex={isMenuOpen ? 0 : -1}
              >
                <span>Products</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-200 ${mobileProductsOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              <div 
                id="mobile-products-menu"
                className={`bg-green-800 transition-all duration-300 overflow-hidden ${
                  mobileProductsOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <Link 
                  to="/products" 
                  className="block py-2 px-8 hover:bg-green-600 transition duration-150"
                  onClick={() => {
                    setMobileProductsOpen(false);
                    setIsMenuOpen(false);
                  }}
                  tabIndex={mobileProductsOpen && isMenuOpen ? 0 : -1}
                >
                  All Products
                </Link>
                {categories.map((category, index) => (
                  <Link 
                    key={index}
                    to={`/products?category=${encodeURIComponent(category)}`}
                    className="block py-2 px-8 hover:bg-green-600 transition duration-150"
                    onClick={() => {
                      setMobileProductsOpen(false);
                      setIsMenuOpen(false);
                    }}
                    tabIndex={mobileProductsOpen && isMenuOpen ? 0 : -1}
                  >
                    {category}
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Blog Link - Mobile */}
            <Link
              to="/blog"
              className="block py-2 px-4 hover:bg-green-600 transition duration-150"
              onClick={() => setIsMenuOpen(false)}
              tabIndex={isMenuOpen ? 0 : -1}
            >
              Blog
            </Link>
            
            {/* Authentication-dependent menu items */}
            {isAuthenticated ? (
              <>
                {/* User Info Section */}
                <div className="px-4 py-3 border-t border-b border-green-600 bg-green-800 mb-2">
                  <p className="text-xs text-green-300">Signed in as</p>
                  <p className="text-sm font-medium">{currentUser?.name || 'User'}</p>
                  <p className="text-xs text-green-300">{currentUser?.email}</p>
                </div>
                
                <Link 
                  to={getDashboardLink()} 
                  className="flex items-center py-2 px-4 hover:bg-green-600 transition duration-150"
                  onClick={() => setIsMenuOpen(false)}
                  tabIndex={isMenuOpen ? 0 : -1}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </Link>
                
                {/* Role-specific mobile menu items */}
                {currentUser?.role === 'admin' && (
                  <div className="border-t border-green-600 pt-1">
                    <Link 
                      to="/admin/users" 
                      className="flex items-center py-2 px-4 hover:bg-green-600 transition duration-150"
                      onClick={() => setIsMenuOpen(false)}
                      tabIndex={isMenuOpen ? 0 : -1}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      Users
                    </Link>
                    <Link 
                      to="/admin/products" 
                      className="flex items-center py-2 px-4 hover:bg-green-600 transition duration-150"
                      onClick={() => setIsMenuOpen(false)}
                      tabIndex={isMenuOpen ? 0 : -1}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      Products
                    </Link>
                    <Link 
                      to="/admin/orders" 
                      className="flex items-center py-2 px-4 hover:bg-green-600 transition duration-150"
                      onClick={() => setIsMenuOpen(false)}
                      tabIndex={isMenuOpen ? 0 : -1}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Orders
                    </Link>
                  </div>
                )}
                
                {currentUser?.role === 'seller' && (
                  <div className="border-t border-green-600 pt-1">
                    <Link 
                      to="/seller/products" 
                      className="flex items-center py-2 px-4 hover:bg-green-600 transition duration-150"
                      onClick={() => setIsMenuOpen(false)}
                      tabIndex={isMenuOpen ? 0 : -1}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      My Products
                    </Link>
                    <Link 
                      to="/seller/orders" 
                      className="flex items-center py-2 px-4 hover:bg-green-600 transition duration-150"
                      onClick={() => setIsMenuOpen(false)}
                      tabIndex={isMenuOpen ? 0 : -1}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Orders
                    </Link>
                  </div>
                )}
                
                {currentUser?.role === 'customer' && (
                  <div className="border-t border-green-600 pt-1">
                    <Link 
                      to="/customer/orders" 
                      className="flex items-center py-2 px-4 hover:bg-green-600 transition duration-150"
                      onClick={() => setIsMenuOpen(false)}
                      tabIndex={isMenuOpen ? 0 : -1}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      My Orders
                    </Link>
                    <Link 
                      to="/customer/cart" 
                      className="flex items-center py-2 px-4 hover:bg-green-600 transition duration-150"
                      onClick={() => setIsMenuOpen(false)}
                      tabIndex={isMenuOpen ? 0 : -1}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Cart
                      <span className="ml-2"><CartIcon /></span>
                    </Link>
                  </div>
                )}
                
                <div className="border-t border-green-600 mt-2 pt-1">
                  <Link 
                    to={currentUser?.role ? `/${currentUser.role}/profile` : '/profile'} 
                    className="flex items-center py-2 px-4 hover:bg-green-600 transition duration-150"
                    onClick={() => setIsMenuOpen(false)}
                    tabIndex={isMenuOpen ? 0 : -1}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </Link>
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center w-full text-left py-2 px-4 hover:bg-green-600 text-red-300 transition duration-150"
                    tabIndex={isMenuOpen ? 0 : -1}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="flex items-center py-2 px-4 hover:bg-green-600 transition duration-150"
                  onClick={() => setIsMenuOpen(false)}
                  tabIndex={isMenuOpen ? 0 : -1}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="flex items-center py-2 px-4 hover:bg-green-600 transition duration-150"
                  onClick={() => setIsMenuOpen(false)}
                  tabIndex={isMenuOpen ? 0 : -1}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Register
                </Link>
                <Link 
                  to="/cart" 
                  className="flex items-center py-2 px-4 hover:bg-green-600 transition duration-150"
                  onClick={() => setIsMenuOpen(false)}
                  tabIndex={isMenuOpen ? 0 : -1}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Cart
                  <span className="ml-2"><CartIcon /></span>
                </Link>
              </>
            )}
          </div>
      </div>
    </nav>
  );
};

export default Navbar;
