import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../config/api';
import { AuthContext } from '../../context/AuthContext';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  
  const { isAuthenticated, currentUser } = useContext(AuthContext);
  
  useEffect(() => {
    fetchBlogPost();
  }, [id]);

  const fetchBlogPost = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/blog/${id}`);
      setPost(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching blog post:', err);
      setError('Failed to fetch blog post');
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      alert("Please login to like posts");
      return;
    }

    try {
      const response = await api.post(`/api/blog/${id}/like`);
      
      // Update the post in the state
      setPost({
        ...post,
        likes: response.data.liked 
          ? [...post.likes, currentUser._id] 
          : post.likes.filter(userId => userId !== currentUser._id)
      });
    } catch (err) {
      console.error('Error liking post:', err);
      setError('Failed to like post');
    }
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!comment.trim()) return;
    
    if (!isAuthenticated) {
      alert("Please login to comment");
      return;
    }

    try {
      const response = await api.post(`/api/blog/${id}/comments`, { text: comment });
      setPost(response.data.data);
      setComment('');
    } catch (err) {
      console.error('Error posting comment:', err);
      setError('Failed to post comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await api.delete(`/api/blog/${id}/comments/${commentId}`);
        // Refresh post data to get updated comments
        fetchBlogPost();
      } catch (err) {
        console.error('Error deleting comment:', err);
        setError('Failed to delete comment');
      }
    }
  };

  const handleDeletePost = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await api.delete(`/api/blog/${id}`);
        navigate('/blog');
      } catch (err) {
        console.error('Error deleting post:', err);
        setError('Failed to delete post');
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          <p>{error || 'Blog post not found'}</p>
          <Link to="/blog" className="text-sm underline mt-2 inline-block">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const isAuthor = isAuthenticated && currentUser._id === post.author._id;
  const isAdmin = isAuthenticated && currentUser.role === 'admin';
  const canEdit = isAuthor || isAdmin;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link to="/blog" className="text-green-600 hover:text-green-800 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Blog
        </Link>
      </div>

      {/* Blog Post Header */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
        {post.featuredImage && (
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-64 object-cover"
          />
        )}
        
        <div className="p-6 md:p-8">
          <div className="mb-6">
            {canEdit && (
              <div className="flex justify-end mb-4 space-x-2">
                <Link
                  to={`/blog/edit/${post._id}`}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  Edit
                </Link>
                <button
                  onClick={handleDeletePost}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </div>
            )}
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{post.title}</h1>
            
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="font-semibold text-gray-600">
                  {post.author.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-900">{post.author.name}</p>
                <p className="text-xs text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString()} • {post.views} views
                </p>
              </div>
            </div>
            
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag, index) => (
                  <Link
                    key={index}
                    to={`/blog?tag=${tag}`}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          {/* Blog Content */}
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          ></div>
          
          {/* Likes and Comments Count */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
            <button 
              onClick={handleLike}
              className={`flex items-center space-x-2 ${
                isAuthenticated && post.likes.includes(currentUser._id) 
                  ? 'text-red-500' 
                  : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <span>{post.likes.length} likes</span>
            </button>
            
            <div className="text-gray-500 flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span>{post.comments.length} comments</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Comments</h2>
          
          {isAuthenticated ? (
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <div className="mb-4">
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                  Leave a comment
                </label>
                <textarea
                  id="comment"
                  rows="3"
                  value={comment}
                  onChange={handleCommentChange}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  placeholder="Write your comment here..."
                  required
                ></textarea>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Post Comment
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-gray-50 p-4 rounded-md mb-6 text-center">
              <p>Please <Link to="/login" className="text-green-600 font-medium">login</Link> to leave a comment.</p>
            </div>
          )}
          
          {post.comments.length > 0 ? (
            <div className="space-y-4">
              {post.comments.map((comment) => (
                <div key={comment._id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start">
                      <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="font-semibold text-gray-600">
                          {comment.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{comment.user.name}</p>
                        <p className="text-xs text-gray-500 mb-2">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-700">{comment.text}</p>
                      </div>
                    </div>
                    
                    {isAuthenticated && (currentUser._id === comment.user._id || isAdmin || isAuthor) && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
