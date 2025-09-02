import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const AuthDebug = () => {
  const { currentUser, isAuthenticated, token } = useContext(AuthContext);

  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-4 text-sm">
      <h3 className="font-bold mb-2">Auth Debug Info</h3>
      <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
      <p><strong>User Role:</strong> {currentUser?.role || 'Not logged in'}</p>
      <p><strong>User ID:</strong> {currentUser?._id || 'N/A'}</p>
      <p><strong>Username:</strong> {currentUser?.name || 'N/A'}</p>
      <p><strong>Email:</strong> {currentUser?.email || 'N/A'}</p>
      <p><strong>Token exists:</strong> {token ? 'Yes' : 'No'}</p>
      <p><strong>Local Storage Token:</strong> {localStorage.getItem('token') ? 'Exists' : 'None'}</p>
    </div>
  );
};

export default AuthDebug;
