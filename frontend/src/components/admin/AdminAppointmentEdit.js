import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../../config/api';

const AdminAppointmentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const initialAction = location.state?.action; // 'approve', 'reject', or 'complete' if coming from quick action
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    status: initialAction === 'approve' ? 'approved' : 
           initialAction === 'reject' ? 'rejected' : 
           initialAction === 'complete' ? 'completed' : '',
    scheduledDate: '',
    scheduledTime: '',
    venue: '',
    adminNotes: ''
  });

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await api.get(`/api/appointments/${id}`);
        const appointmentData = response.data.data;
        setAppointment(appointmentData);
        
        // Format date for the form
        const scheduledDate = appointmentData.scheduledDate ? 
          new Date(appointmentData.scheduledDate).toISOString().split('T')[0] : '';
        
        // Set form data - use initial action if provided, otherwise use appointment status
        setFormData({
          status: initialAction === 'approve' ? 'approved' : 
                 initialAction === 'reject' ? 'rejected' :
                 initialAction === 'complete' ? 'completed' : 
                 appointmentData.status || 'pending',
          scheduledDate: scheduledDate,
          scheduledTime: appointmentData.scheduledTime || '',
          venue: appointmentData.venue || '',
          adminNotes: appointmentData.adminNotes || ''
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching appointment details:', err);
        setError('Failed to load appointment details');
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    
    try {
      // Validate form data
      if (formData.status === 'approved' && (!formData.scheduledDate || !formData.scheduledTime || !formData.venue)) {
        throw new Error('When approving an appointment, date, time, and venue are required');
      }
      
      if (formData.status === 'rejected' && !formData.adminNotes) {
        throw new Error('Please provide a reason for rejecting the appointment');
      }
      
      // Use specific endpoints for approval, rejection, and completion
      if (formData.status === 'approved') {
        await api.put(`/api/appointments/${id}/approve`, {
          scheduledDate: formData.scheduledDate,
          scheduledTime: formData.scheduledTime,
          venue: formData.venue,
          adminNotes: formData.adminNotes
        });
        alert('Appointment approved successfully');
      } else if (formData.status === 'rejected') {
        await api.put(`/api/appointments/${id}/reject`, {
          adminNotes: formData.adminNotes
        });
        alert('Appointment rejected successfully');
      } else if (formData.status === 'completed') {
        await api.put(`/api/appointments/${id}/complete`, {
          doctorNotes: formData.adminNotes
        });
        alert('Appointment marked as completed successfully');
      } else {
        // For other status updates, use the general update endpoint
        await api.put(`/api/appointments/${id}`, formData);
        alert('Appointment updated successfully');
      }
      
      navigate('/admin/appointments');
    } catch (err) {
      console.error('Error updating appointment:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setUpdating(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
        <p>{error}</p>
      </div>
    );
  }

  // Get title and color based on status
  const getStatusInfo = (status) => {
    switch(status) {
      case 'approved':
        return { title: 'Approve Appointment', color: 'text-green-800' };
      case 'rejected':
        return { title: 'Reject Appointment', color: 'text-red-800' };
      case 'completed':
        return { title: 'Mark Appointment as Completed', color: 'text-blue-800' };
      default:
        return { title: 'Manage Appointment', color: 'text-green-800' };
    }
  };

  const statusInfo = getStatusInfo(formData.status);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-semibold ${statusInfo.color}`}>{statusInfo.title}</h2>
        <Link
          to="/admin/appointments"
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Back to Appointments
        </Link>
      </div>

      {appointment && (
        <div>
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Customer Information</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="mb-2"><span className="font-medium">Name:</span> {appointment.customerName}</p>
              <p className="mb-2"><span className="font-medium">Requested on:</span> {formatDate(appointment.createdAt)}</p>
              <p className="mb-2">
                <span className="font-medium">Preferred Date/Time:</span> {formatDate(appointment.preferredDate)}, {appointment.preferredTimeSlot}
              </p>
              <p className="mb-2 font-medium">Health Issue/Problem:</p>
              <p className="whitespace-pre-wrap bg-white p-3 rounded border">{appointment.problem}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="status">
                Appointment Status *
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                required
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {formData.status === 'approved' && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Schedule Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-gray-700 mb-2" htmlFor="scheduledDate">
                      Appointment Date *
                    </label>
                    <input
                      type="date"
                      id="scheduledDate"
                      name="scheduledDate"
                      value={formData.scheduledDate}
                      onChange={handleChange}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                      required={formData.status === 'approved'}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2" htmlFor="scheduledTime">
                      Appointment Time *
                    </label>
                    <input
                      type="time"
                      id="scheduledTime"
                      name="scheduledTime"
                      value={formData.scheduledTime}
                      onChange={handleChange}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                      required={formData.status === 'approved'}
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2" htmlFor="venue">
                    Venue/Location *
                  </label>
                  <input
                    type="text"
                    id="venue"
                    name="venue"
                    value={formData.venue}
                    onChange={handleChange}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter the location for the appointment"
                    required={formData.status === 'approved'}
                  />
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="adminNotes">
                {formData.status === 'completed' ? 'Doctor\'s Notes' : 'Admin Notes'} 
                {formData.status === 'rejected' && '(Please explain rejection reason)'}
                {formData.status === 'completed' && '(Add treatment details, observations, prescriptions, etc.)'}
              </label>
              <textarea
                id="adminNotes"
                name="adminNotes"
                value={formData.adminNotes}
                onChange={handleChange}
                rows={4}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                placeholder={formData.status === 'completed' 
                  ? "Add treatment details, observations, prescriptions, etc." 
                  : "Add any notes or instructions for the customer"
                }
                required={formData.status === 'rejected'}
              ></textarea>
              <p className="text-sm text-gray-500 mt-1">
                These notes will be visible to the customer when they view their appointment.
              </p>
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => navigate('/admin/appointments')}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 mr-4"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className={`px-6 py-2 ${
                  formData.status === 'approved' ? 'bg-green-600 hover:bg-green-700' :
                  formData.status === 'rejected' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-green-600 hover:bg-green-700'
                } text-white rounded-md ${
                  updating ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {updating ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </div>
                ) : 
                formData.status === 'approved' ? 'Approve Appointment' :
                formData.status === 'rejected' ? 'Reject Appointment' :
                formData.status === 'completed' ? 'Mark as Completed' :
                'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminAppointmentEdit;
