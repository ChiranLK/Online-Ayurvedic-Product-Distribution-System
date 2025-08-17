import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';
import { ModalContext } from '../../context/ModalContext';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { openModal } = useContext(ModalContext);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Get the URL search params to check if we should filter by role
        const urlParams = new URLSearchParams(window.location.search);
        const roleParam = urlParams.get('role');
        
        // If role param exists, set it in the state
        if (roleParam) {
          setRoleFilter(roleParam);
        }

        // Construct API URL with role filter if needed
        const apiUrl = roleParam 
          ? `/api/admin/users?role=${roleParam}` 
          : '/api/admin/users';
        
        const response = await api.get(apiUrl);
        setUsers(response.data.data || []);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch users');
        setLoading(false);
        console.error('Error fetching users:', err);
      }
    };

    // Fetch users from API
    fetchUsers();
  }, []);

  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter users based on role and search term
  const filteredUsers = users.filter(user => {
    const matchesRole = roleFilter === '' || user.role === roleFilter;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const toggleUserStatus = async (userId, currentStatus, userName = 'User') => {
    const newStatus = !currentStatus;
    const action = newStatus ? 'activate' : 'deactivate';
    
    openModal({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
      message: `Are you sure you want to ${action} ${userName}?`,
      type: 'warning',
      confirmText: 'Yes, Continue',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          // Call the API to update the user's status
          await api.put(`/api/admin/users/${userId}`, { isActive: newStatus });
          
          // Update the local state after successful API call
          setUsers(users.map(user => 
            user._id === userId ? { ...user, isActive: newStatus } : user
          ));
          
          // Show success message
          openModal({
            title: 'Success',
            message: `${userName} has been ${newStatus ? 'activated' : 'deactivated'} successfully.`,
            type: 'success',
            confirmText: 'OK'
          });
        } catch (err) {
          console.error('Error updating user status:', err);
          
          // Show error message
          openModal({
            title: 'Error',
            message: err.response?.data?.message || `Failed to ${action} user.`,
            type: 'error',
            confirmText: 'OK'
          });
        }
      }
    });
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <Link
          to="/admin/users/add"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Add New User
        </Link>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="w-full md:w-1/4">
          <label htmlFor="role-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Role
          </label>
          <select
            id="role-filter"
            value={roleFilter}
            onChange={handleRoleFilterChange}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="seller">Seller</option>
            <option value="customer">Customer</option>
          </select>
        </div>

        <div className="w-full md:w-3/4">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search Users
          </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by name or email"
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : user.role === 'seller' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <Link to={`/admin/users/${user._id}`} className="text-blue-600 hover:text-blue-900">
                      View
                    </Link>
                    <Link to={`/admin/users/${user._id}/edit`} className="text-green-600 hover:text-green-900">
                      Edit
                    </Link>
                    <button
                      onClick={() => toggleUserStatus(user._id, user.isActive, user.name)}
                      className={`${
                        user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                      }`}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-4">
          <p className="text-gray-500">No users found.</p>
        </div>
      )}
    </div>
  );
};

export default UserList;
