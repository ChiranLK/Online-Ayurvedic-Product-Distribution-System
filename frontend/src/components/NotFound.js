import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col justify-center items-center px-4 py-8">
      <div className="max-w-lg w-full text-center">
        <img 
          src="/404-ayurveda.svg" 
          alt="404 Error - Page Not Found" 
          className="mx-auto w-64 mb-6"
        />
        
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Page Not Found
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            to="/"
            className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg shadow-md hover:bg-green-700 transition-colors"
          >
            Back to Home
          </Link>
          
          <Link 
            to="/products"
            className="px-6 py-3 bg-white border border-green-600 text-green-600 font-medium rounded-lg shadow-md hover:bg-green-50 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
      
      <div className="mt-12 text-sm text-gray-500">
        <p>Need assistance? <Link to="/contact" className="text-green-600 hover:underline">Contact our support team</Link></p>
      </div>
    </div>
  );
};

export default NotFound;
