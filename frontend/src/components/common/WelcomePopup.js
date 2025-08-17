import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Welcome popup component for first-time visitors
 * @param {Object} props Component props
 * @param {Function} props.onClose Function to close the popup
 */
const WelcomePopup = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all animate-fade-in-up">
        <div className="relative p-6 text-center">
          <button 
            onClick={onClose} 
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Logo/Icon */}
          <div className="mb-4 flex justify-center">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-green-800 mb-3">Welcome to Ayurvedic Products!</h2>
          
          <p className="text-gray-600 mb-6">
            Discover traditional Ayurvedic remedies and natural products for your health and wellness journey.
          </p>
          
          <div className="mb-6 bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-700 mb-2">Today's Special Offers</h3>
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-bold">🎉 New Customer Discount:</span> Use code <span className="font-mono bg-green-100 px-2 py-1 rounded">WELCOME20</span> for 20% off your first order!
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-white p-2 rounded shadow-sm">
                <p className="font-bold text-green-800">Triphala Churna</p>
                <p className="text-xs text-gray-500">Rs.350 <span className="line-through">Rs.450</span></p>
                <p className="text-xs text-red-500">22% Off</p>
              </div>
              <div className="bg-white p-2 rounded shadow-sm">
                <p className="font-bold text-green-800">Brahmi Ghrita</p>
                <p className="text-xs text-gray-500">Rs.520 <span className="line-through">Rs.650</span></p>
                <p className="text-xs text-red-500">20% Off</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Get 15% off on your first order! Use code: <span className="font-bold">WELCOME15</span>
            </p>
            <div className="text-xs text-gray-500">*Terms and conditions apply</div>
          </div>
          
          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 justify-center">
            <Link 
              to="/register" 
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 shadow-sm"
              onClick={onClose}
            >
              Sign Up Now
            </Link>
            <Link 
              to="/products" 
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 shadow-sm"
              onClick={onClose}
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePopup;
