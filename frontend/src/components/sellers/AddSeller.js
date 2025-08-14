import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AddSeller = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sellerData, setSellerData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    contactPerson: '',
    registrationNumber: '',
    description: '',
    paymentTerms: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSellerData({
      ...sellerData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate form
      const requiredFields = ['name', 'email', 'phone', 'address'];
      const missingFields = requiredFields.filter(field => !sellerData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sellerData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // In a real app, post to API
      // const response = await axios.post('http://localhost:5000/api/sellers', sellerData);
      
      // Simulate API call
      console.log('Adding new seller:', sellerData);
      
      // Redirect on success
      setTimeout(() => {
        setLoading(false);
        navigate('/sellers');
      }, 1000);
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to add seller. Please try again later.');
    }
  };

  return (
    <div>
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          to="/sellers"
          className="text-green-700 hover:text-green-900 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Sellers
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Add New Seller</h1>
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="md:col-span-2">
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Basic Information</h2>
                <div className="h-px bg-gray-200 mb-4"></div>
              </div>

              <div className="space-y-1">
                <label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center">
                  Seller Name <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={sellerData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
                  required
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="registrationNumber" className="text-sm font-medium text-gray-700">
                  Registration Number
                </label>
                <input
                  type="text"
                  id="registrationNumber"
                  name="registrationNumber"
                  value={sellerData.registrationNumber}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="contactPerson" className="text-sm font-medium text-gray-700">
                  Contact Person
                </label>
                <input
                  type="text"
                  id="contactPerson"
                  name="contactPerson"
                  value={sellerData.contactPerson}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="paymentTerms" className="text-sm font-medium text-gray-700">
                  Payment Terms
                </label>
                <select
                  id="paymentTerms"
                  name="paymentTerms"
                  value={sellerData.paymentTerms}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
                >
                  <option value="">-- Select Payment Terms --</option>
                  <option value="Net 30 days">Net 30 days</option>
                  <option value="Net 60 days">Net 60 days</option>
                  <option value="Net 90 days">Net 90 days</option>
                  <option value="Immediate Payment">Immediate Payment</option>
                  <option value="Cash on Delivery">Cash on Delivery</option>
                </select>
              </div>

              {/* Contact Information */}
              <div className="md:col-span-2">
                <h2 className="text-lg font-semibold text-gray-700 mb-2 mt-4">Contact Information</h2>
                <div className="h-px bg-gray-200 mb-4"></div>
              </div>

              <div className="space-y-1">
                <label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center">
                  Email <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={sellerData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
                  required
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center">
                  Phone <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={sellerData.phone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
                  required
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label htmlFor="address" className="text-sm font-medium text-gray-700 flex items-center">
                  Address <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows="3"
                  value={sellerData.address}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
                  required
                ></textarea>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <h2 className="text-lg font-semibold text-gray-700 mb-2 mt-4">Additional Information</h2>
                <div className="h-px bg-gray-200 mb-4"></div>
              </div>

              <div className="md:col-span-2 space-y-1">
                <label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  value={sellerData.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
                  placeholder="Tell us about this seller..."
                ></textarea>
                <p className="mt-1 text-sm text-gray-500">
                  Provide a brief description of the seller, their specialties, years in business, etc.
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/sellers')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Save Seller'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddSeller;
