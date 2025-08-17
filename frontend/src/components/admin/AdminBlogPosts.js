import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import api from '../../config/api';

const AdminBlogPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/blog', {
        params: { 
          sort: 'createdAt',
          order: 'desc',
          limit: 50
        }
      });
      setPosts(response.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching blog posts:', err);
      setError('Failed to fetch blog posts');
      setLoading(false);
    }
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleDeletePost = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        await api.delete(`/api/blog/${id}`);
        fetchBlogPosts(); // Refresh posts after deletion
      } catch (err) {
        console.error('Error deleting blog post:', err);
        setError('Failed to delete blog post');
      }
    }
  };

  // Filter posts based on search term and status
  const filteredPosts = posts.filter(post => {
    const matchesStatus = statusFilter === '' || post.status === statusFilter;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.author.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <AdminLayout title="Blog Management">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Blog Management">
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          <p>{error}</p>
          <button 
            className="text-sm underline mt-1"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Blog Posts</h1>
        <Link
          to="/admin/blog/add"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Add New Post
        </Link>
      </div>

      {/* Filter and Search */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by title, content, or author"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
      </div>

      {/* Blog Posts List */}
      {filteredPosts.length > 0 ? (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPosts.map(post => (
                <tr key={post._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {post.title.length > 50 ? post.title.substring(0, 50) + '...' : post.title}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center mt-1">
                      <span className="mr-4">
                        <i className="far fa-eye mr-1"></i> {post.views}
                      </span>
                      <span className="mr-4">
                        <i className="far fa-heart mr-1"></i> {post.likes.length}
                      </span>
                      <span>
                        <i className="far fa-comment mr-1"></i> {post.comments.length}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{post.author.name}</div>
                    <div className="text-sm text-gray-500">{post.author.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${post.status === 'published' ? 'bg-green-100 text-green-800' : 
                        post.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'}`}>
                      {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/blog/${post._id}`} className="text-blue-600 hover:text-blue-900 mr-3">
                      View
                    </Link>
                    <Link to={`/admin/blog/edit/${post._id}`} className="text-indigo-600 hover:text-indigo-900 mr-3">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeletePost(post._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white p-6 text-center rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No blog posts found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter ? "Try changing your search or filter criteria." : "Get started by creating a new blog post."}
          </p>
          <div className="mt-6">
            <Link
              to="/admin/blog/add"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              New Blog Post
            </Link>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminBlogPosts;
