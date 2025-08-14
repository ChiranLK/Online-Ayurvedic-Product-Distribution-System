import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-24 h-24 text-red-600 mb-6" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
        />
      </svg>
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Access Denied</h1>
      <p className="text-lg text-gray-600 mb-8">
        You don't have permission to access this page.
      </p>
      <Link 
        to="/" 
        className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200"
      >
        Return to Home
      </Link>
    </div>
  );
};

export default Unauthorized;
