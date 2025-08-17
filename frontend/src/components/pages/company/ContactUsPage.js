import React, { useState } from 'react';

const ContactUsPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    
    // Validate form
    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Here you would normally submit the form to your backend API
    // For now, we'll just simulate a successful submission
    
    // Simulating API call delay
    setTimeout(() => {
      setSubmitted(true);
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-green-800 mb-8">Contact Us</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-green-700 mb-4">Get in Touch</h2>
          
          {submitted ? (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
              <strong className="font-bold">Thank you!</strong>
              <span className="block sm:inline"> Your message has been sent successfully. We'll get back to you soon.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}
              
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Name *</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required 
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email *</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required 
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">Subject</label>
                <input 
                  type="text" 
                  id="subject" 
                  name="subject" 
                  value={formData.subject} 
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" 
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Message *</label>
                <textarea 
                  id="message" 
                  name="message" 
                  value={formData.message} 
                  onChange={handleChange}
                  rows="5" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required 
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-md font-medium transition"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-green-700 mb-4">Contact Information</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-gray-800 font-semibold mb-2">Address</h3>
              <p className="text-gray-600">
                123 Ayurveda Lane<br />
                Colombo 00500<br />
                Sri Lanka
              </p>
            </div>
            
            <div>
              <h3 className="text-gray-800 font-semibold mb-2">Phone</h3>
              <p className="text-gray-600">
                Customer Support: +94 11 2345678<br />
                Business Inquiries: +94 11 2345679
              </p>
            </div>
            
            <div>
              <h3 className="text-gray-800 font-semibold mb-2">Email</h3>
              <p className="text-gray-600">
                Customer Support: support@ayurvedicproducts.lk<br />
                Business Inquiries: business@ayurvedicproducts.lk
              </p>
            </div>
            
            <div>
              <h3 className="text-gray-800 font-semibold mb-2">Hours of Operation</h3>
              <p className="text-gray-600">
                Monday - Friday: 9:00 AM - 6:00 PM<br />
                Saturday: 9:00 AM - 1:00 PM<br />
                Sunday: Closed
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;
