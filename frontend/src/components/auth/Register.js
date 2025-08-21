import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipcode: ''
  });
  const { register, loading, error, setError } = useContext(AuthContext);
  const navigate = useNavigate();

  const { name, email, password, passwordConfirm, phone, address, city, state, zipcode } = formData;

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
      // Create the user object
      const userData = {
        name,
        email,
        password,
        phone,
        address,
        city,
        state,
        zipcode,
        role: 'customer' // Default role is customer
      };
      
      // Use AuthContext register function
      await register(userData);
      
      // On successful registration, navigate to home page
      navigate('/');
      
    } catch (err) {
      // Error is handled by the AuthContext
      console.error('Registration error:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-green-800 mb-6">Create an Account</h1>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-6">
            <div className="font-bold mb-1">Registration Error:</div>
            <div>{error}</div>
            <div className="text-sm mt-2">
              If this error persists, please contact support or try again later.
            </div>
          </div>
        )}
        
        <form onSubmit={onSubmit}>
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
                type="tel"
                id="phone"
                name="phone"
                value={phone}
                onChange={onChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter your phone number"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="address">
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={address}
                onChange={onChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter your address"
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
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2" htmlFor="zipcode">
                Zipcode
              </label>
              <input
                type="text"
                id="zipcode"
                name="zipcode"
                value={zipcode}
                onChange={onChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter your zipcode"
              />
            </div>
          </div>
          
          <div className="mt-8">
            <button
              type="submit"
              className="w-full bg-green-700 hover:bg-green-800 text-white py-3 px-4 rounded-lg transition duration-200"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-2"></div>
                  <span>Registering...</span>
                </div>
              ) : 'Register'}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-green-700 hover:text-green-800">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
