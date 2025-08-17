import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import api from '../../config/api';

const AdminBlogForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    status: 'published',
    featuredImage: null
  });
  
  const [loading, setLoading] = useState(id ? true : false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  
  const isEditing = !!id;
  
  const fetchBlogPost = async () => {
    try {
      const response = await api.get(`/api/blog/${id}`);
      const post = response.data.data;
      
      setFormData({
        title: post.title,
        content: post.content,
        tags: post.tags ? post.tags.join(', ') : '',
        status: post.status,
        featuredImage: post.featuredImage
      });
      
      if (post.featuredImage) {
        setPreview(post.featuredImage);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching blog post:', err);
      setError('Failed to fetch blog post');
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (isEditing) {
      fetchBlogPost();
    }
  }, [isEditing, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Preview the image
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    setFormData({
      ...formData,
      featuredImage: file
    });
  };
  
  const handleRemoveImage = () => {
    setPreview(null);
    setFormData({
      ...formData,
      featuredImage: null
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      let imageUrl = formData.featuredImage;
      
      // If there's a new image file, upload it first
      if (formData.featuredImage && typeof formData.featuredImage !== 'string') {
        const formDataImage = new FormData();
        formDataImage.append('image', formData.featuredImage);
        
        const imageResponse = await api.post('/api/uploads', formDataImage);
        imageUrl = imageResponse.data.url;
      }
      
      const postData = {
        title: formData.title,
        content: formData.content,
        tags: formData.tags,
        status: formData.status,
        featuredImage: imageUrl
      };
      
      if (isEditing) {
        await api.put(`/api/blog/${id}`, postData);
      } else {
        await api.post('/api/blog', postData);
      }
      
      navigate('/admin/blog');
    } catch (err) {
      console.error('Error saving blog post:', err);
      setError(err.response?.data?.message || 'Failed to save blog post');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title={isEditing ? 'Edit Blog Post' : 'Create Blog Post'}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEditing ? 'Edit Blog Post' : 'Create Blog Post'}>
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6">
        <div className="mb-6">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title*
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Content*
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows="15"
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            required
          ></textarea>
          <p className="text-xs text-gray-500 mt-1">
            You can use HTML for formatting (e.g., &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, etc.)
          </p>
        </div>
        
        <div className="mb-6">
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            placeholder="health, wellness, ayurveda (comma separated)"
          />
          <p className="text-xs text-gray-500 mt-1">
            Separate tags with commas (e.g., "health, wellness, ayurveda")
          </p>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Featured Image
          </label>
          <div className="mt-1 flex items-center">
            <div className="flex-grow">
              <input
                type="file"
                id="featuredImage"
                name="featuredImage"
                onChange={handleImageChange}
                accept="image/*"
                className="sr-only"
              />
              <label
                htmlFor="featuredImage"
                className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50"
              >
                Choose file
              </label>
            </div>
            {preview && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="ml-2 text-sm text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            )}
          </div>
          {preview && (
            <div className="mt-2">
              <img
                src={preview}
                alt="Preview"
                className="h-32 w-auto object-cover rounded-md"
              />
            </div>
          )}
        </div>
        
        <div className="mb-6">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/blog')}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {submitting ? 'Saving...' : isEditing ? 'Update Post' : 'Create Post'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
};

export default AdminBlogForm;
