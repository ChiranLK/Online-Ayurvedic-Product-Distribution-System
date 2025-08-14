import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const EditCustomer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipcode: ''
  });

  const [errors, setErrors] = useState({});
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch customer data
    const fetchCustomer = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/customers/${id}`);
        const customer = response.data;
        
        // Populate form with customer data (excluding password)
        setFormData({
          name: customer.name || '',
          email: customer.email || '',
          phone: customer.phone || '',
          address: customer.address || '',
          city: customer.city || '',
          state: customer.state || '',
          zipcode: customer.zipcode || ''
        });
        
        setLoading(false);
      } catch (error) {
        setSubmitMessage({ 
          type: 'error', 
          text: 'Failed to load customer data. Please try again later.' 
        });
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear specific error when field is changed
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;
    
    // Name validation
    if (!formData.name.trim()) {
      tempErrors.name = 'Name is required';
      isValid = false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      tempErrors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      tempErrors.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    // Phone validation
    const phoneRegex = /^\d{10}$/;
    if (!formData.phone.trim()) {
      tempErrors.phone = 'Phone number is required';
      isValid = false;
    } else if (!phoneRegex.test(formData.phone)) {
      tempErrors.phone = 'Please enter a valid 10-digit phone number';
      isValid = false;
    }
    
    // Address validation
    if (!formData.address.trim()) {
      tempErrors.address = 'Address is required';
      isValid = false;
    }
    
    // City validation
    if (!formData.city.trim()) {
      tempErrors.city = 'City is required';
      isValid = false;
    }
    
    // State validation
    if (!formData.state.trim()) {
      tempErrors.state = 'State is required';
      isValid = false;
    }
    
    // Zipcode validation
    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (!formData.zipcode.trim()) {
      tempErrors.zipcode = 'Zipcode is required';
      isValid = false;
    } else if (!zipRegex.test(formData.zipcode)) {
      tempErrors.zipcode = 'Please enter a valid zipcode (e.g., 12345 or 12345-6789)';
      isValid = false;
    }
    
    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        await axios.put(`http://localhost:5000/api/customers/${id}`, formData);
        
        setSubmitMessage({ 
          type: 'success', 
          text: 'Customer updated successfully!' 
        });
        
        // Redirect after a delay
        setTimeout(() => {
          navigate('/customers');
        }, 2000);
        
      } catch (error) {
        let errorMessage = 'Update failed. Please try again.';
        
        if (error.response && error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        
        setSubmitMessage({ type: 'error', text: errorMessage });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-green-800">Edit Customer</h2>
      
      {submitMessage.text && (
        <div className={`p-4 mb-4 rounded-md ${submitMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {submitMessage.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${errors.name ? 'border-red-500' : ''}`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${errors.email ? 'border-red-500' : ''}`}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${errors.phone ? 'border-red-500' : ''}`}
              placeholder="10-digit number"
            />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${errors.address ? 'border-red-500' : ''}`}
            />
            {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
          </div>
          
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${errors.city ? 'border-red-500' : ''}`}
            />
            {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
          </div>
          
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${errors.state ? 'border-red-500' : ''}`}
            />
            {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
          </div>
          
          <div>
            <label htmlFor="zipcode" className="block text-sm font-medium text-gray-700">Zipcode</label>
            <input
              type="text"
              id="zipcode"
              name="zipcode"
              value={formData.zipcode}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${errors.zipcode ? 'border-red-500' : ''}`}
              placeholder="12345 or 12345-6789"
            />
            {errors.zipcode && <p className="mt-1 text-sm text-red-600">{errors.zipcode}</p>}
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-6">
          <button
            type="button"
            onClick={() => navigate('/customers')}
            className="px-6 py-2 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Update Customer
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCustomer;
