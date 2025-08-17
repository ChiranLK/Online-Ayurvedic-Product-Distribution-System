import React, { useState, useContext } from 'react';
import api from '../../../config/api';
import { AuthContext } from '../../../context/AuthContext';

const FeedbackPage = () => {
  const { currentUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: currentUser ? currentUser.name : '',
    email: currentUser ? currentUser.email : '',
    category: '',
    rating: '',
    message: ''
  });
  
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  const handleRatingChange = (rating) => {
    setFormData(prevState => ({
      ...prevState,
      rating
    }));
    
    // Clear rating error if it exists
    if (errors.rating) {
      setErrors(prev => ({
        ...prev,
        rating: undefined
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email address is invalid";
    if (!formData.category) newErrors.category = "Please select a category";
    if (!formData.rating) newErrors.rating = "Please select a rating";
    if (!formData.message.trim()) newErrors.message = "Feedback message is required";
    else if (formData.message.length < 10) newErrors.message = "Message must be at least 10 characters";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      setSubmitError('');
      
      try {
        await api.post('/api/feedback', formData);
        setSubmitted(true);
        // Reset form
        setFormData({
          name: currentUser ? currentUser.name : '',
          email: currentUser ? currentUser.email : '',
          category: '',
          rating: '',
          message: ''
        });
      } catch (error) {
        console.error('Error submitting feedback:', error);
        setSubmitError(
          error.response?.data?.error || 
          'There was an error submitting your feedback. Please try again.'
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-green-800 mb-8">Share Your Feedback</h1>
      
      {submitted ? (
        <div className="max-w-2xl mx-auto bg-green-100 p-6 rounded-lg shadow-md">
          <svg className="w-16 h-16 text-green-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h2 className="text-2xl font-semibold text-green-800 text-center mb-2">Thank You for Your Feedback!</h2>
          <p className="text-center text-gray-700 mb-4">
            We appreciate you taking the time to share your thoughts with us. Your feedback helps us improve our products and services.
          </p>
          <div className="text-center">
            <button
              onClick={() => setSubmitted(false)}
              className="bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-lg font-medium transition"
            >
              Submit Another Feedback
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-700 mb-6">
            Your feedback is important to us! Please share your thoughts about our products, website experience, or customer service.
          </p>
          
          {submitError && (
            <div className="mb-6 p-3 bg-red-100 text-red-700 border border-red-300 rounded-lg">
              <p>{submitError}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Your Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="John Doe"
                disabled={currentUser && Boolean(currentUser.name)}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Your Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="john@example.com"
                disabled={currentUser && Boolean(currentUser.email)}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Feedback Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a category</option>
                <option value="Product">Product Quality</option>
                <option value="Website">Website Experience</option>
                <option value="Delivery">Shipping & Delivery</option>
                <option value="CustomerService">Customer Service</option>
                <option value="Suggestion">Suggestion</option>
                <option value="Other">Other</option>
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
            </div>
            
            <div>
              <span className="block text-sm font-medium text-gray-700 mb-1">
                Rating *
              </span>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(star)}
                    className={`text-2xl focus:outline-none ${
                      formData.rating >= star ? 'text-yellow-500' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              {errors.rating && <p className="mt-1 text-sm text-red-600">{errors.rating}</p>}
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Your Feedback *
              </label>
              <textarea
                id="message"
                name="message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.message ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Please share your experience or suggestions..."
              ></textarea>
              {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg font-medium transition"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Submit Feedback'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-green-50 rounded-lg border border-green-200">
        <h2 className="text-xl font-semibold text-green-800 mb-4">Why Your Feedback Matters</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Helps us improve product quality and selection</li>
          <li>Allows us to enhance your shopping experience</li>
          <li>Guides our development of new features and services</li>
          <li>Enables us to better address your needs and preferences</li>
        </ul>
      </div>
    </div>
  );
};

export default FeedbackPage;
