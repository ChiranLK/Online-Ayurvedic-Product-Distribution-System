import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const SellerRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipcode: '',
    businessName: '',
    businessDescription: '',
    taxId: ''
  });
  const { register, loading, error, setError } = useContext(AuthContext);
  const navigate = useNavigate();

  const { 
    name, 
    email, 
    password, 
    passwordConfirm, 
    phone, 
    address, 
    city, 
    state, 
    zipcode, 
    businessName, 
    businessDescription, 
    taxId 
  } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    if (password !== passwordConfirm) {
      setError('Passwords do not match');
      return;
    }
    
    setError('');

    try {
      // Create the seller object
      const userData = {
        name,
        email,
        password,
        phone,
        address,
        city,
        state,
        zipcode,
        businessName,
        businessDescription,
        taxId,
        role: 'seller' // This is a seller registration
      };
      
      // Use AuthContext register function
      await register(userData);
      
      // Show success message and navigate to login
      alert('Thank you for registering! Your seller account has been created. Please login to continue.');
      navigate('/login');
      
    } catch (err) {
      // Error is handled by the AuthContext
      console.error('Seller registration error:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-green-800 mb-6">Register as a Seller</h1>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={onSubmit}>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="name">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={onChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="email">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="password">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={onChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Create a password"
                  required
                  minLength="6"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="passwordConfirm">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="passwordConfirm"
                  name="passwordConfirm"
                  value={passwordConfirm}
                  onChange={onChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Confirm your password"
                  required
                  minLength="6"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="phone">
                  Phone Number
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={phone}
                  onChange={onChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your phone number"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Address Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2" htmlFor="address">
                  Street Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={address}
                  onChange={onChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your street address"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="city">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={city}
                  onChange={onChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your city"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="state">
                  State
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={state}
                  onChange={onChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your state"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="zipcode">
                  ZIP Code
                </label>
                <input
                  type="text"
                  id="zipcode"
                  name="zipcode"
                  value={zipcode}
                  onChange={onChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your ZIP code"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Business Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="businessName">
                  Business Name
                </label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  value={businessName}
                  onChange={onChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your business name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="taxId">
                  Tax ID / Business Registration
                </label>
                <input
                  type="text"
                  id="taxId"
                  name="taxId"
                  value={taxId}
                  onChange={onChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your tax ID"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2" htmlFor="businessDescription">
                  Business Description
                </label>
                <textarea
                  id="businessDescription"
                  name="businessDescription"
                  value={businessDescription}
                  onChange={onChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Briefly describe your business and the products you sell"
                  rows="4"
                  required
                ></textarea>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registering...
                </span>
              ) : 'Register as Seller'}
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-gray-700">
              Already have an account? <Link to="/login" className="text-green-700 hover:text-green-800">
                Login here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerRegister;
