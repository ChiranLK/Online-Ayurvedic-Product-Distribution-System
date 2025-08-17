import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';
import { AuthContext } from '../../context/AuthContext';

const BlogList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [availableTags, setAvailableTags] = useState([]);
  
  const { isAuthenticated, currentUser } = useContext(AuthContext);
  
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
          status: 'published'
        }
      });
      
      setPosts(response.data.data || []);
      
      // Extract all unique tags
      const tags = response.data.data.reduce((allTags, post) => {
        if (post.tags && post.tags.length > 0) {
          post.tags.forEach(tag => {
            if (!allTags.includes(tag)) {
              allTags.push(tag);
            }
          });
        }
        return allTags;
      }, []);
      
      setAvailableTags(tags);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching blog posts:', err);
      setError('Failed to fetch blog posts');
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleTagFilterChange = (e) => {
    setTagFilter(e.target.value);
  };

  const handleLike = async (postId) => {
    if (!isAuthenticated) {
      alert("Please login to like posts");
      return;
    }

    try {
      const response = await api.post(`/api/blog/${postId}/like`);
      
      // Update the post in the state
      setPosts(posts.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            likes: response.data.liked 
              ? [...post.likes, currentUser._id] 
              : post.likes.filter(id => id !== currentUser._id)
          };
        }
        return post;
      }));
    } catch (err) {
      console.error('Error liking post:', err);
      setError('Failed to like post');
    }
  };

  // Filter posts based on search term and tag
  const filteredPosts = posts.filter(post => {
    const matchesTag = tagFilter === '' || (post.tags && post.tags.includes(tagFilter));
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.author.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTag && matchesSearch;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Blog</h1>
          <p className="text-gray-600">Explore articles on Ayurvedic health and wellness</p>
        </div>
        {isAuthenticated && (
          <Link
            to="/blog/create"
            className="mt-4 md:mt-0 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Write a Post
          </Link>
        )}
      </div>

      {/* Filter and Search */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableTags.length > 0 && (
            <div>
              <label htmlFor="tag-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Tag
              </label>
              <select
                id="tag-filter"
                value={tagFilter}
                onChange={handleTagFilterChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Tags</option>
                {availableTags.map((tag, index) => (
                  <option key={index} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          )}
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

      {/* Blog Posts */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map(post => (
            <div key={post._id} className="bg-white shadow rounded-lg overflow-hidden">
              {post.featuredImage && (
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 hover:text-green-600">
                    <Link to={`/blog/${post._id}`}>
                      {post.title}
                    </Link>
                  </h2>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.content.replace(/<[^>]*>?/gm, '').substring(0, 150)}...
                </p>
                
                {post.tags && post.tags.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="font-semibold text-sm text-gray-600">
                        {post.author.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-2">
                      <p className="text-sm font-medium text-gray-900">{post.author.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleLike(post._id)}
                      className={`flex items-center space-x-1 ${
                        isAuthenticated && post.likes.includes(currentUser._id) 
                          ? 'text-red-500' 
                          : 'text-gray-500 hover:text-red-500'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                      <span>{post.likes.length}</span>
                    </button>
                    <span className="text-gray-500 flex items-center space-x-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <span>{post.comments.length}</span>
                    </span>
                  </div>
                </div>
                
                <Link
                  to={`/blog/${post._id}`}
                  className="mt-4 block text-center py-2 bg-green-50 text-green-600 rounded-md hover:bg-green-100"
                >
                  Read More
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-10 text-center rounded-lg shadow">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No blog posts found</h3>
          <p className="mt-1 text-gray-500">
            {searchTerm || tagFilter ? "Try changing your search or filter criteria." : "Check back later for new posts."}
          </p>
          {isAuthenticated && (
            <div className="mt-6">
              <Link
                to="/blog/create"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Write the First Post
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BlogList;
