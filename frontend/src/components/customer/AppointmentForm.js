import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { AuthContext } from '../../context/AuthContext';
import AuthDebug from '../common/AuthDebug';

const AppointmentForm = () => {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isDebugMode, setIsDebugMode] = useState(true); // Set to true to see debug info
  
  // Get tomorrow's date for minimum date in date picker
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const formattedTomorrow = tomorrow.toISOString().split('T')[0];
  
  // Get date 3 months from now for max date
  const threeMonthsLater = new Date();
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
  const formattedThreeMonthsLater = threeMonthsLater.toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    problem: '',
    preferredDate: '',
    preferredTimeSlot: ''
  });

  const { problem, preferredDate, preferredTimeSlot } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    // Validation
    if (!problem || !preferredDate || !preferredTimeSlot) {
      setError('All fields are required');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Submit appointment request
      await api.post('/api/appointments', formData);
      
      // Show success message and reset form
      setSuccess(true);
      setFormData({
        problem: '',
        preferredDate: '',
        preferredTimeSlot: ''
      });
      
      // After 3 seconds, redirect to appointments list
      setTimeout(() => {
        navigate('/customer/appointments');
      }, 3000);
      
    } catch (err) {
      console.error('Error creating appointment:', err);
      setError(err.response?.data?.message || 'Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="text-center p-6 bg-yellow-100 rounded-lg">
        <p>Please log in to request an appointment.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-blue-800 mb-6">Request Appointment with Ayurvedic Doctor</h2>
      
      {isDebugMode && <AuthDebug />}
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-blue-100 text-blue-700 p-4 rounded-lg mb-6">
          <p className="font-bold">Appointment request submitted successfully!</p>
          <p className="mt-2">Our admin team will review your request and schedule an appointment. You will be notified once your appointment is confirmed.</p>
          <p className="mt-2">Redirecting to your appointments list...</p>
        </div>
      )}

      <form onSubmit={onSubmit}>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="problem">
            Health Problem or Reason for Visit *
          </label>
          <textarea
            id="problem"
            name="problem"
            value={problem}
            onChange={onChange}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 h-32"
            placeholder="Please describe your health concerns or reason for requesting an appointment with our Ayurvedic doctor"
            required
          ></textarea>
          <p className="text-sm text-gray-500 mt-1">
            Please provide as much detail as possible about your symptoms, health history, or any specific concerns.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="preferredDate">
              Preferred Date *
            </label>
            <input
              type="date"
              id="preferredDate"
              name="preferredDate"
              value={preferredDate}
              onChange={onChange}
              min={formattedTomorrow}
              max={formattedThreeMonthsLater}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Select a date between tomorrow and 3 months from now.
            </p>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="preferredTimeSlot">
              Preferred Time of Day *
            </label>
            <select
              id="preferredTimeSlot"
              name="preferredTimeSlot"
              value={preferredTimeSlot}
              onChange={onChange}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select preferred time</option>
              <option value="Morning">Morning (9 AM - 12 PM)</option>
              <option value="Afternoon">Afternoon (1 PM - 4 PM)</option>
              <option value="Evening">Evening (5 PM - 7 PM)</option>
            </select>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-600 mb-4">
            <strong>Note:</strong> This is a request for an appointment. Our admin team will review your request and 
            contact you to confirm the date, time, and venue for your appointment with our Ayurvedic doctor.
          </p>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || success}
              className={`px-6 py-2 rounded-md shadow-sm font-medium text-white ${
                loading || success ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-800'
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </div>
              ) : success ? 'Submitted' : 'Request Appointment'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;
