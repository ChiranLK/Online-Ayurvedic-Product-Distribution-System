import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import api from '../../config/api';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/categories');
      setCategories(response.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to fetch categories');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCategory({ ...newCategory, [name]: value });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newCategory.name.trim()) {
      setError('Category name is required');
      return;
    }
    
    try {
      await api.post('/api/categories', newCategory);
      setNewCategory({ name: '', description: '' });
      fetchCategories();
    } catch (err) {
      console.error('Error creating category:', err);
      setError('Failed to create category');
    }
  };

  const startEditing = (category) => {
    setEditingId(category._id);
    setEditForm({ name: category.name, description: category.description || '' });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({ name: '', description: '' });
  };

  const saveEdit = async (id) => {
    if (!editForm.name.trim()) {
      setError('Category name is required');
      return;
    }
    
    try {
      await api.put(`/api/categories/${id}`, editForm);
      fetchCategories();
      setEditingId(null);
    } catch (err) {
      console.error('Error updating category:', err);
      setError('Failed to update category');
    }
  };

  const deleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await api.delete(`/api/categories/${id}`);
        fetchCategories();
      } catch (err) {
        console.error('Error deleting category:', err);
        setError('Failed to delete category');
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Category Management">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Category Management">
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

      {/* Add new category form */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Add New Category</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Category Name*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={newCategory.name}
                onChange={handleInputChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                id="description"
                name="description"
                value={newCategory.description}
                onChange={handleInputChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Add Category
          </button>
        </form>
      </div>

      {/* Categories list */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Products
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.length > 0 ? (
              categories.map((category) => (
                <tr key={category._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === category._id ? (
                      <input
                        type="text"
                        name="name"
                        value={editForm.name}
                        onChange={handleEditInputChange}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                      />
                    ) : (
                      <div className="text-sm font-medium text-gray-900">{category.name}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === category._id ? (
                      <input
                        type="text"
                        name="description"
                        value={editForm.description}
                        onChange={handleEditInputChange}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                      />
                    ) : (
                      <div className="text-sm text-gray-500">{category.description || '-'}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{category.productCount || 0}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {editingId === category._id ? (
                      <>
                        <button
                          onClick={() => saveEdit(category._id)}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditing(category)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteCategory(category._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                  No categories found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default AdminCategories;
