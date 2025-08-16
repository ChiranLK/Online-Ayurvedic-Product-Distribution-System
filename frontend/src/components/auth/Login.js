import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const { login, loading, error, setError } = useContext(AuthContext);
  const navigate = useNavigate();

  const { email, password } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    setError('');

    try {
      console.log('Attempting to login with email:', email);
      // Use AuthContext login function
      await login(email, password);
      
      // On successful login, navigate to dashboard or home
      console.log('Login successful, redirecting to dashboard');
      navigate('/dashboard');
      
    } catch (err) {
      // Detailed error logging
      console.error('Login error:', err);
      
      if (err.response) {
        console.error('Server error response:', err.response.data);
        setError(err.response.data.message || 'Invalid login credentials');
      } else if (err.request) {
        console.error('No response received:', err.request);
        setError('Unable to reach server. Please check if the backend is running on port 5000.');
      } else {
        console.error('Error setting up request:', err.message);
        setError(`Login failed: ${err.message}`);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-green-800 mb-6">Login to Your Account</h1>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={onSubmit}>
          <div className="mb-6">
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
          
          <div className="mb-6">
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
              placeholder="Enter your password"
              required
              minLength="6"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-green-700 hover:bg-green-800 text-white py-2 px-4 rounded-lg transition duration-200"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-2"></div>
                <span>Logging in...</span>
              </div>
            ) : 'Login'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-green-700 hover:text-green-800">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
