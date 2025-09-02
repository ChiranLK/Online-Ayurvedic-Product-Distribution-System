import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        // Add status filter if set
        const queryString = statusFilter ? `?status=${statusFilter}` : '';
        const response = await api.get(`/api/appointments${queryString}`);
        setAppointments(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Failed to load appointments');
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [statusFilter]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
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

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
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
        <h2 className="text-2xl font-semibold text-green-800">Manage Doctor Appointments</h2>
        <Link 
          to="/admin/appointments/today"
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg inline-flex items-center"
        >
          <i className="fas fa-calendar-day mr-2"></i>
          View Today's Schedule
        </Link>
      </div>

      {/* Filter by status */}
      <div className="mb-6">
        <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
          Filter by Status
        </label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={handleStatusFilterChange}
          className="w-full md:w-1/3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
        >
          <option value="">All Appointments</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {appointments.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requested
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preferred Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scheduled Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map(appointment => (
                <tr key={appointment._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{appointment.customerName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(appointment.createdAt)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(appointment.preferredDate)}</div>
                    <div className="text-xs text-gray-500">{appointment.preferredTimeSlot}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(appointment.status)}`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {appointment.scheduledDate ? formatDate(appointment.scheduledDate) : '-'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {appointment.scheduledTime || ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <Link 
                        to={`/admin/appointments/${appointment._id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </Link>
                      <Link 
                        to={`/admin/appointments/${appointment._id}/edit`}
                        className="text-green-600 hover:text-green-900"
                      >
                        Manage
                      </Link>
                      {appointment.status === 'pending' && (
                        <div className="flex space-x-2 ml-2">
                          <span className="text-gray-300">|</span>
                          <Link 
                            to={`/admin/appointments/${appointment._id}/edit`}
                            state={{ action: 'approve' }}
                            className="text-emerald-600 hover:text-emerald-800 font-semibold"
                          >
                            Approve
                          </Link>
                          <Link 
                            to={`/admin/appointments/${appointment._id}/edit`}
                            state={{ action: 'reject' }}
                            className="text-red-600 hover:text-red-800 font-semibold"
                          >
                            Reject
                          </Link>
                        </div>
                      )}
                      {appointment.status === 'approved' && (
                        <div className="flex space-x-2 ml-2">
                          <span className="text-gray-300">|</span>
                          <Link 
                            to={`/admin/appointments/${appointment._id}/edit`}
                            state={{ action: 'complete' }}
                            className="text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            Complete
                          </Link>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700 mb-2">No appointments found</h3>
          <p className="text-gray-500">
            {statusFilter ? `No appointments with status "${statusFilter}"` : 'There are no appointment requests yet'}
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;
