import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../config/api';

const AdminSellerRequests = () => {
  const { currentUser } = useContext(AuthContext);
  const [sellerRequests, setSellerRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingRequestId, setProcessingRequestId] = useState(null);

  useEffect(() => {
    const fetchSellerRequests = async () => {
      try {
        const response = await api.get('/api/seller-requests');
        setSellerRequests(response.data.data);
      } catch (err) {
        setError('Failed to load seller requests');
        console.error('Error fetching seller requests:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerRequests();
  }, []);

  const handleApprove = async (id) => {
    setProcessingRequestId(id);
    try {
      await api.put(`/api/seller-requests/${id}/approve`);
      
      // Update the local state to remove the approved request
      setSellerRequests(sellerRequests.filter(request => request._id !== id));
    } catch (err) {
      setError('Failed to approve seller request');
      console.error('Error approving seller request:', err);
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleReject = async (id) => {
    setProcessingRequestId(id);
    try {
      await api.put(`/api/seller-requests/${id}/reject`);
      
      // Update the local state to remove the rejected request
      setSellerRequests(sellerRequests.filter(request => request._id !== id));
    } catch (err) {
      setError('Failed to reject seller request');
      console.error('Error rejecting seller request:', err);
    } finally {
      setProcessingRequestId(null);
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">You don't have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-800">Seller Requests</h1>
        <Link
          to="/admin/sellers"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          View Sellers
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : sellerRequests.length === 0 ? (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p className="text-gray-600">No pending seller requests at this time.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Phone</th>
                <th className="py-3 px-4 text-left">Request Date</th>
                <th className="py-3 px-4 text-left">Reason</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sellerRequests.map((request) => (
                <tr key={request._id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4">{request.name}</td>
                  <td className="py-3 px-4">{request.email}</td>
                  <td className="py-3 px-4">{request.phone}</td>
                  <td className="py-3 px-4">
                    {new Date(request.sellerRequest.requestDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    {request.sellerRequest.reason.length > 50
                      ? `${request.sellerRequest.reason.substring(0, 50)}...`
                      : request.sellerRequest.reason}
                  </td>
                  <td className="py-3 px-4 space-x-2 text-center">
                    <button
                      onClick={() => handleApprove(request._id)}
                      disabled={processingRequestId === request._id}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      {processingRequestId === request._id ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleReject(request._id)}
                      disabled={processingRequestId === request._id}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      {processingRequestId === request._id ? 'Processing...' : 'Reject'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminSellerRequests;
