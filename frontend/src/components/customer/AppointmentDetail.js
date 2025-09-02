import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../config/api';

const AppointmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        console.log(`Fetching appointment details for ID: ${id}`);
        const response = await api.get(`/api/appointments/${id}`);
        console.log('Appointment data received:', response.data);
        setAppointment(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching appointment details:', err);
        let errorMessage = 'Failed to load appointment details';
        
        if (err.response) {
          console.error('Error response:', err.response.data);
          errorMessage = err.response.data.message || errorMessage;
        }
        
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id]);

  const handleCancelAppointment = async () => {
    if (!window.confirm('Are you sure you want to cancel this appointment request?')) {
      return;
    }

    try {
      await api.delete(`/api/appointments/${id}`);
      alert('Appointment cancelled successfully');
      navigate('/customer/appointments');
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      alert('Failed to cancel appointment: ' + (err.response?.data?.message || err.message));
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled yet';
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-blue-800">Appointment Details</h2>
        <Link
          to="/customer/appointments"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Appointments
        </Link>
      </div>

      {appointment && (
        <div>
          <div className="mb-6">
            <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full 
              ${appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                appointment.status === 'approved' ? 'bg-green-100 text-green-800' : 
                appointment.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                'bg-blue-100 text-blue-800'}`}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Requested Information</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Requested On</p>
                  <p className="font-medium">{formatDate(appointment.createdAt)}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Preferred Date</p>
                  <p className="font-medium">{formatDate(appointment.preferredDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Preferred Time</p>
                  <p className="font-medium">{appointment.preferredTimeSlot}</p>
                </div>
              </div>
            </div>

            {(appointment.status === 'approved' || appointment.scheduledDate) && (
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Appointment Schedule</h3>
                <div className="bg-blue-50 p-4 rounded-md">
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">{formatDate(appointment.scheduledDate)}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-medium">{appointment.scheduledTime || 'To be confirmed'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Venue</p>
                    <p className="font-medium">{appointment.venue || 'To be confirmed'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Health Problem/Reason</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="whitespace-pre-wrap">{appointment.problem}</p>
            </div>
          </div>

          {appointment.adminNotes && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Notes from Admin</h3>
              <div className="bg-blue-50 p-4 rounded-md">
                <p className="whitespace-pre-wrap">{appointment.adminNotes}</p>
              </div>
            </div>
          )}

          {appointment.doctorNotes && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Doctor's Notes</h3>
              <div className="bg-blue-50 p-4 rounded-md">
                <p className="whitespace-pre-wrap">{appointment.doctorNotes}</p>
              </div>
            </div>
          )}

          {appointment.status === 'pending' && (
            <div className="flex justify-end mt-6">
              <button
                onClick={handleCancelAppointment}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Cancel Appointment Request
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AppointmentDetail;
