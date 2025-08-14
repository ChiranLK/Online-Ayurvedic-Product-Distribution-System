import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

// Admin Components
import AdminDashboard from '../dashboard/AdminDashboard';
import UserList from '../admin/UserList';
import ProductList from '../admin/ProductList';

// Seller Components
import SellerDashboard from '../dashboard/SellerDashboard';
import SellerProductList from '../seller/ProductList';
import ProductForm from '../seller/ProductForm';

// Customer Components
import CustomerDashboard from '../dashboard/CustomerDashboard';
import Cart from '../customer/Cart';
import Orders from '../customer/Orders';

// Common Components
import Unauthorized from '../common/Unauthorized';

const ProtectedRoutes = () => {
  return (
    <Routes>
      {/* Public route for unauthorized access */}
      <Route path="unauthorized" element={<Unauthorized />} />

      {/* Admin Routes */}
      <Route element={<PrivateRoute allowedRoles={['admin']} />}>
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="admin/users" element={<UserList />} />
        <Route path="admin/products" element={<ProductList />} />
      </Route>

      {/* Seller Routes */}
      <Route element={<PrivateRoute allowedRoles={['seller']} />}>
        <Route path="seller" element={<SellerDashboard />} />
        <Route path="seller/products" element={<SellerProductList />} />
        <Route path="seller/products/add" element={<ProductForm />} />
        <Route path="seller/products/:id/edit" element={<ProductForm />} />
      </Route>

      {/* Customer Routes */}
      <Route element={<PrivateRoute allowedRoles={['customer']} />}>
        <Route path="customer" element={<CustomerDashboard />} />
        <Route path="customer/orders" element={<Orders />} />
        <Route path="customer/cart" element={<Cart />} />
      </Route>

      {/* Dashboard route with role-based access */}
      <Route element={<PrivateRoute allowedRoles={['admin', 'seller', 'customer']} />}>
        <Route path="dashboard" element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* Catch-all route for protected routes - redirects to unauthorized */}
      <Route path="*" element={<Navigate to="/unauthorized" replace />} />
    </Routes>
  );
};

export default ProtectedRoutes;
