import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './components/pages/HomePage';

// Product Components
import ProductsList from './components/products/ProductsList';
import ProductDetail from './components/products/ProductDetail';
import AddProduct from './components/products/AddProduct';
import EditProduct from './components/products/EditProduct';

// Order Components
import OrdersList from './components/orders/OrdersList';
import OrderDetail from './components/orders/OrderDetail';

// Customer Components
import CustomersList from './components/customers/CustomersList';
import CustomerDetail from './components/customers/CustomerDetail';
import CustomerProfile from './components/customer/CustomerProfile';
import CustomerProfileEdit from './components/customer/CustomerProfileEdit';
import CustomerPasswordChange from './components/customer/CustomerPasswordChange';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import SellerRegister from './components/auth/SellerRegister';

// Cart Components
import Cart from './components/cart/Cart';
import Checkout from './components/cart/Checkout';

// Seller Components
import SellersList from './components/sellers/SellersList';
import SellerDetail from './components/sellers/SellerDetail';
import SellerProfile from './components/seller/SellerProfile';
import SellerProfileEdit from './components/seller/SellerProfileEdit';
import SellerPasswordChange from './components/seller/SellerPasswordChange';

// Admin Components
import AdminProfile from './components/admin/AdminProfile';
import AdminProfileEdit from './components/admin/AdminProfileEdit';
import AdminPasswordChange from './components/admin/AdminPasswordChange';

// Role-Based Routing
import PrivateRoute from './components/routing/PrivateRoute';
import ProfileRedirect from './components/routing/ProfileRedirect';
import Dashboard from './components/dashboard/Dashboard';
import Unauthorized from './components/common/Unauthorized';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            
            {/* Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register/seller" element={<SellerRegister />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Public Product Routes */}
            <Route path="/products" element={<ProductsList />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            
            {/* Public Cart Routes */}
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />

            {/* Role-protected Routes */}
            
            {/* Admin Routes */}
            <Route element={<PrivateRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/admin/profile" element={<AdminProfile />} />
              <Route path="/admin/profile/edit" element={<AdminProfileEdit />} />
              <Route path="/admin/profile/password" element={<AdminPasswordChange />} />
              <Route path="/admin/products" element={<ProductsList />} />
              <Route path="/admin/products/:id" element={<ProductDetail />} />
              <Route path="/admin/products/add" element={<AddProduct />} />
              <Route path="/admin/products/edit/:id" element={<EditProduct />} />
              <Route path="/admin/customers" element={<CustomersList />} />
              <Route path="/admin/customers/:id" element={<CustomerDetail />} />
              <Route path="/admin/sellers" element={<SellersList />} />
              <Route path="/admin/sellers/:id" element={<SellerDetail />} />
              <Route path="/admin/orders" element={<OrdersList />} />
              <Route path="/admin/orders/:id" element={<OrderDetail />} />
            </Route>
            
            {/* Seller Routes */}
            <Route element={<PrivateRoute allowedRoles={['seller']} />}>
              <Route path="/seller" element={<Dashboard />} />
              <Route path="/seller/profile" element={<SellerProfile />} />
              <Route path="/seller/profile/edit" element={<SellerProfileEdit />} />
              <Route path="/seller/profile/password" element={<SellerPasswordChange />} />
              <Route path="/seller/products" element={<ProductsList />} />
              <Route path="/seller/products/:id" element={<ProductDetail />} />
              <Route path="/seller/products/add" element={<AddProduct />} />
              <Route path="/seller/products/edit/:id" element={<EditProduct />} />
              <Route path="/seller/orders" element={<OrdersList />} />
              <Route path="/seller/orders/:id" element={<OrderDetail />} />
            </Route>
            
            {/* Customer Routes */}
            <Route element={<PrivateRoute allowedRoles={['customer']} />}>
              <Route path="/customer" element={<Dashboard />} />
              <Route path="/customer/profile" element={<CustomerProfile />} />
              <Route path="/customer/profile/edit" element={<CustomerProfileEdit />} />
              <Route path="/customer/profile/password" element={<CustomerPasswordChange />} />
              <Route path="/customer/orders" element={<OrdersList />} />
              <Route path="/customer/orders/:id" element={<OrderDetail />} />
              <Route path="/customer/cart" element={<Cart />} />
              <Route path="/customer/checkout" element={<Checkout />} />
            </Route>
            
            {/* Dashboard route for any authenticated user */}
            <Route element={<PrivateRoute allowedRoles={['admin', 'seller', 'customer']} />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<ProfileRedirect />} />
            </Route>
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
