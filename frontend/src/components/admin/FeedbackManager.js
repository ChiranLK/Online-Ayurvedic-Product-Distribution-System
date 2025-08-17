import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminNavigation from './AdminNavigation';
import api from '../../config/api';

const AdminFeedbackManager = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    unreadCount: 0,
    averageRating: 0,
    respondedCount: 0
  });

  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [filter, setFilter] = useState('all'); // all, read, unread, archived
  const [sortBy, setSortBy] = useState('createdAt'); // createdAt, rating, category
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    hasMore: false
  });
  
  // Function to load feedback data from API
  useEffect(() => {
    // Define the fetch function inside useEffect to avoid dependency issues
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Prepare query parameters
        let queryParams = `?page=${pagination.page}&limit=${pagination.limit}`;
        queryParams += `&sortBy=${sortBy}&sortOrder=${sortOrder}`;
        
        // Apply filters
        if (filter === 'read') queryParams += '&isRead=true';
        if (filter === 'unread') queryParams += '&isRead=false';
        if (filter === 'archived') queryParams += '&isArchived=true';
        if (filter === 'all') queryParams += '&isArchived=false';
        
        const response = await api.get(`/api/feedback${queryParams}`);
        setFeedbacks(response.data.data);
        setPagination({
          page: response.data.pagination.page,
          limit: response.data.pagination.limit,
          totalPages: response.data.pagination.totalPages,
          hasMore: response.data.pagination.hasMore
        });
        
        // Also fetch stats
        const statsResponse = await api.get('/api/feedback/stats');
        setStats(statsResponse.data.data);
      } catch (err) {
        console.error('Error fetching feedback:', err);
        setError('Failed to load feedback data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [filter, sortBy, sortOrder, pagination.page, pagination.limit]);
  
  // Reference functions for refresh button
  const refreshData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Prepare query parameters
      let queryParams = `?page=${pagination.page}&limit=${pagination.limit}`;
      queryParams += `&sortBy=${sortBy}&sortOrder=${sortOrder}`;
      
      // Apply filters
      if (filter === 'read') queryParams += '&isRead=true';
      if (filter === 'unread') queryParams += '&isRead=false';
      if (filter === 'archived') queryParams += '&isArchived=true';
      if (filter === 'all') queryParams += '&isArchived=false';
      
      const response = await api.get(`/api/feedback${queryParams}`);
      setFeedbacks(response.data.data);
      setPagination({
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
        totalPages: response.data.pagination.totalPages,
        hasMore: response.data.pagination.hasMore
      });
      
      // Also fetch stats
      const statsResponse = await api.get('/api/feedback/stats');
      setStats(statsResponse.data.data);
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setError('Failed to load feedback data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to toggle read status
  const toggleReadStatus = async (id) => {
    try {
      const feedback = feedbacks.find(f => f._id === id);
      await api.put(`/api/feedback/${id}`, { 
        isRead: !feedback.isRead 
      });
      
      // Update local state
      setFeedbacks(feedbacks.map(feedback => 
        feedback._id === id ? { ...feedback, isRead: !feedback.isRead } : feedback
      ));
      
      // Refresh all data
      refreshData();
    } catch (err) {
      console.error('Error updating feedback status:', err);
      alert('Failed to update feedback status. Please try again.');
    }
  };

  // Function to toggle archive status
  const toggleArchiveStatus = async (id) => {
    try {
      const feedback = feedbacks.find(f => f._id === id);
      await api.put(`/api/feedback/${id}`, { 
        isArchived: !feedback.isArchived 
      });
      
      // Update local state
      setFeedbacks(feedbacks.map(feedback => 
        feedback._id === id ? { ...feedback, isArchived: !feedback.isArchived } : feedback
      ));
      
      // Refresh data
      refreshData();
    } catch (err) {
      console.error('Error archiving feedback:', err);
      alert('Failed to archive feedback. Please try again.');
    }
  };

  // Function to open response modal
  const openResponseModal = (feedback) => {
    setCurrentFeedback(feedback);
    setResponseText(feedback.response || '');
  };

  // Function to save response
  const saveResponse = async () => {
    if (currentFeedback) {
      try {
        await api.put(`/api/feedback/${currentFeedback._id}`, { 
          response: responseText 
        });
        
        // Update local state
        setFeedbacks(feedbacks.map(feedback => 
          feedback._id === currentFeedback._id 
            ? { ...feedback, response: responseText, isRead: true } 
            : feedback
        ));
        
        setCurrentFeedback(null);
        setResponseText('');
        
        // Refresh stats
        refreshData();
      } catch (err) {
        console.error('Error saving response:', err);
        alert('Failed to save response. Please try again.');
      }
    }
  };

  // Function to delete feedback
  const deleteFeedback = async (id) => {
    if (window.confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
      try {
        await api.delete(`/api/feedback/${id}`);
        
        // Update local state
        setFeedbacks(feedbacks.filter(feedback => feedback._id !== id));
        
        // Refresh stats
        refreshData();
      } catch (err) {
        console.error('Error deleting feedback:', err);
        alert('Failed to delete feedback. Please try again.');
      }
    }
  };

  // Handle pagination
  const nextPage = () => {
    if (pagination.hasMore) {
      setPagination({
        ...pagination,
        page: pagination.page + 1
      });
    }
  };

  const prevPage = () => {
    if (pagination.page > 1) {
      setPagination({
        ...pagination,
        page: pagination.page - 1
      });
    }
  };

  // Function to get star rating display
  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, index) => (
      <span key={index} className={index < rating ? "text-yellow-500" : "text-gray-300"}>★</span>
    ));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminNavigation />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
        <h1 className="text-3xl font-bold text-green-800">Manage Feedback</h1>
        
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto">
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPagination({...pagination, page: 1}); // Reset to page 1 when changing filter
              }}
              className="px-3 py-2 border border-gray-300 rounded-md w-full md:w-auto appearance-none pr-8"
            >
              <option value="all">All Active</option>
              <option value="read">Read</option>
              <option value="unread">Unread</option>
              <option value="archived">Archived</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 fill-current text-gray-500" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
              </svg>
            </div>
          </div>
          
          <div className="relative">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-');
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
                setPagination({...pagination, page: 1}); // Reset to page 1 when changing sort
              }}
              className="px-3 py-2 border border-gray-300 rounded-md w-full md:w-auto appearance-none pr-8"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="rating-desc">Highest Rating</option>
              <option value="rating-asc">Lowest Rating</option>
              <option value="category-asc">Category (A-Z)</option>
              <option value="category-desc">Category (Z-A)</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 fill-current text-gray-500" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
              </svg>
            </div>
          </div>
          
          <button 
            onClick={refreshData}
            className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 p-4 rounded-md text-red-700 mb-4">
          {error}
          <button 
            onClick={refreshData} 
            className="ml-2 underline hover:text-red-900"
          >
            Retry
          </button>
        </div>
      ) : feedbacks.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Stats summary */}
          <div className="bg-gray-50 p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">Total Active Feedback</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">Unread</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.unreadCount}</p>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">Average Rating</p>
              <p className="text-2xl font-bold text-blue-600">{stats.averageRating.toFixed(1)}</p>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">Responded</p>
              <p className="text-2xl font-bold text-green-600">{stats.respondedCount}</p>
            </div>
          </div>

          {/* Feedback table */}
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {feedbacks.map((feedback) => (
                <tr key={feedback._id} className={`hover:bg-gray-50 ${!feedback.isRead && !feedback.isArchived ? 'bg-green-50' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{feedback.name}</div>
                    <div className="text-sm text-gray-500">{feedback.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {feedback.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{renderStars(feedback.rating)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      feedback.isArchived ? 'bg-gray-100 text-gray-800' : 
                      feedback.isRead ? 'bg-green-100 text-green-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {feedback.isArchived ? 'Archived' : feedback.isRead ? 'Read' : 'Unread'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openResponseModal(feedback)}
                      className="text-blue-600 hover:text-blue-900 mr-2"
                    >
                      {feedback.response ? 'Edit Response' : 'Respond'}
                    </button>
                    <button
                      onClick={() => toggleReadStatus(feedback._id)}
                      className={`${feedback.isRead ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'} mr-2`}
                    >
                      {feedback.isRead ? 'Mark Unread' : 'Mark Read'}
                    </button>
                    <button
                      onClick={() => toggleArchiveStatus(feedback._id)}
                      className={`${feedback.isArchived ? 'text-green-600 hover:text-green-900' : 'text-gray-600 hover:text-gray-900'} mr-2`}
                    >
                      {feedback.isArchived ? 'Unarchive' : 'Archive'}
                    </button>
                    <button
                      onClick={() => deleteFeedback(feedback._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{pagination.page}</span> of{' '}
                  <span className="font-medium">{pagination.totalPages}</span>
                </p>
              </div>
              <div className="flex-1 flex justify-end">
                <button
                  onClick={prevPage}
                  disabled={pagination.page === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 mr-3 ${
                    pagination.page === 1 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={nextPage}
                  disabled={!pagination.hasMore}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
                    !pagination.hasMore ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500">No feedback found matching your criteria.</p>
        </div>
      )}

      {currentFeedback && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4">
            <div className="border-b p-4">
              <h3 className="text-lg font-medium">Customer Feedback</h3>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h4 className="font-semibold">{currentFeedback.name} <span className="font-normal text-gray-500">({currentFeedback.email})</span></h4>
                <div className="flex items-center my-2">
                  <span className="mr-2">Rating:</span>
                  {renderStars(currentFeedback.rating)}
                </div>
                <p className="mt-1 text-gray-500">Category: {currentFeedback.category}</p>
                <p className="mt-1 text-gray-500">Date: {new Date(currentFeedback.createdAt).toLocaleString()}</p>
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <p className="text-gray-700">{currentFeedback.message}</p>
                </div>
                
                {currentFeedback.customer && (
                  <div className="mt-4 p-2 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-700">
                      <i className="fas fa-user-check mr-1"></i> Registered customer
                    </p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Your Response</label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="4"
                  placeholder="Type your response here..."
                ></textarea>
                
                {currentFeedback.respondedBy && (
                  <p className="text-xs text-gray-500 mt-2">
                    Last responded by: {currentFeedback.respondedBy.name} 
                    on {new Date(currentFeedback.respondedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 flex justify-between space-x-2 rounded-b-lg">
              <div>
                <button
                  onClick={() => toggleReadStatus(currentFeedback._id)}
                  className={`px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 ${
                    currentFeedback.isRead ? 'text-yellow-600' : 'text-green-600'
                  }`}
                >
                  {currentFeedback.isRead ? 'Mark Unread' : 'Mark Read'}
                </button>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentFeedback(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={saveResponse}
                  className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800"
                >
                  Save Response
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <Link to="/feedback" className="text-green-700 hover:text-green-900 font-medium">
          View Public Feedback Page
        </Link>
      </div>
    </div>
  );
};

export default AdminFeedbackManager;
