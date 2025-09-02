import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../config/api';

const AdminAppointmentDetail = () => {
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await api.get(`/api/appointments/${id}`);
        setAppointment(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching appointment details:', err);
        setError('Failed to load appointment details');
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get appropriate status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-green-800">Appointment Details</h2>
        <div className="flex space-x-2">
          <Link
            to={`/admin/appointments/${id}/edit`}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Manage Appointment
          </Link>
          <Link
            to="/admin/appointments"
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Back to List
          </Link>
        </div>
      </div>

      {appointment && (
        <div>
          <div className="mb-6">
            <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusBadgeColor(appointment.status)}`}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Customer Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{appointment.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Request Date</p>
                  <p className="font-medium">{formatDate(appointment.createdAt)}</p>
                </div>
                <div>
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
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Scheduled Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">{formatDate(appointment.scheduledDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-medium">{appointment.scheduledTime || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Venue</p>
                    <p className="font-medium">{appointment.venue || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Health Problem/Reason</h3>
            <div className="p-4 bg-white rounded border border-gray-200">
              <p className="whitespace-pre-wrap">{appointment.problem}</p>
            </div>
          </div>

          {appointment.adminNotes && (
            <div className="mt-6 p-6 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700 mb-3">Admin Notes</h3>
              <div className="p-4 bg-white rounded border border-gray-200">
                <p className="whitespace-pre-wrap">{appointment.adminNotes}</p>
              </div>
            </div>
          )}

          {appointment.doctorNotes && (
            <div className="mt-6 p-6 bg-green-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700 mb-3">Doctor's Notes</h3>
              <div className="p-4 bg-white rounded border border-gray-200">
                <p className="whitespace-pre-wrap">{appointment.doctorNotes}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end mt-6 space-x-3">
            <Link
              to={`/admin/appointments/${id}/edit`}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Manage Appointment
            </Link>
            {appointment.status === 'approved' && (
              <Link
                to={`/admin/appointments/${id}/edit`}
                state={{ action: 'complete' }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Mark as Completed
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAppointmentDetail;
