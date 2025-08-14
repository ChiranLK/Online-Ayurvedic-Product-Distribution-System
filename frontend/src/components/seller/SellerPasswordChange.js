import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import PasswordUpdate from '../common/PasswordUpdate';

const SellerPasswordChange = () => {
  const { currentUser, isSeller } = useContext(AuthContext);

  if (!currentUser || !isSeller()) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">You must be logged in as a seller to access this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-800">Change Password</h1>
        <Link
          to="/seller/profile"
          className="text-blue-700 hover:text-blue-900 font-medium"
        >
          Back to Profile
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <PasswordUpdate />
      </div>
    </div>
  );
};

export default SellerPasswordChange;
