import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState, createContext } from 'react';
import './App.css';
import { ModalProvider } from './context/ModalContext';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './components/pages/HomePage';

// Product Components
import ProductsList from './components/products/ProductsList';
import ProductDetail from './components/products/ProductDetail';
import EditProduct from './components/products/EditProduct';

// Order Components
import OrdersList from './components/orders/OrdersList';
import OrderDetail from './components/orders/OrderDetail';

// Customer Components
import CustomerDetail from './components/customers/CustomerDetail';
import CustomerProfile from './components/customer/CustomerProfile';
import CustomerProfileEdit from './components/customer/CustomerProfileEdit';
import CustomerPasswordChange from './components/customer/CustomerPasswordChange';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import SellerRegister from './components/auth/SellerRegister';

// Blog Components
import BlogList from './components/blog/BlogList';
import BlogDetail from './components/blog/BlogDetail';

// Cart Components
import Cart from './components/cart/Cart';
import Checkout from './components/cart/Checkout';

// Customer Support Components
import CustomerSupport from './components/customer/CustomerSupport';
import FAQs from './components/customer/FAQs';
import ReturnPolicy from './components/customer/ReturnPolicy';
import Wishlist from './components/customer/Wishlist';

// Seller Components
import SellerDetail from './components/sellers/SellerDetail';
import SellerProfile from './components/seller/SellerProfile';
import SellerProfileEdit from './components/seller/SellerProfileEdit';
import SellerPasswordChange from './components/seller/SellerPasswordChange';
import SellerProductList from './components/seller/ProductList';
import SellerAddProduct from './components/seller/AddProduct';
import SellerEditProduct from './components/seller/EditProduct';
import SellerInventory from './components/seller/Inventory';
import SellerOrdersList from './components/seller/OrdersList';

// Admin Components
import AdminDashboard from './components/dashboard/AdminDashboard';
import AdminProfile from './components/admin/AdminProfile';
import AdminProfileEdit from './components/admin/AdminProfileEdit';
import AdminPasswordChange from './components/admin/AdminPasswordChange';
import AdminFaqManager from './components/admin/FaqManager';
import AdminFeedbackManager from './components/admin/FeedbackManager';
import AdminUserList from './components/admin/AdminUserList';
import AdminUserDetail from './components/admin/AdminUserDetail';
import AdminUserEdit from './components/admin/AdminUserEdit';
import AdminCustomersList from './components/admin/AdminCustomersList';
import AdminSellersList from './components/admin/AdminSellersList';
import AdminOrdersList from './components/admin/AdminOrdersList';
import AdminOrderDetail from './components/admin/AdminOrderDetail';
import AdminCategories from './components/admin/AdminCategories';
import AdminUserAdd from './components/admin/AdminUserAdd';
import AdminBlogList from './components/admin/AdminBlogList';
import AdminBlogForm from './components/admin/AdminBlogForm';
import AdminSellerRequests from './components/admin/AdminSellerRequests';
import SalesReport from './components/admin/SalesReport';
import InventoryReport from './components/admin/InventoryReport';

// Company and Legal Pages
import AboutUsPage from './components/pages/company/AboutUsPage';
import ContactUsPage from './components/pages/company/ContactUsPage';
import VisionPage from './components/pages/company/VisionPage';
import FaqPage from './components/pages/company/FaqPage';
import FeedbackPage from './components/pages/company/FeedbackPage';
import TermsAndConditionsPage from './components/pages/legal/TermsAndConditionsPage';

// Role-Based Routing
import ProtectedRoute from './components/routing/ProtectedRoute';
import PrivateRoute from './components/routing/PrivateRoute';
import ProfileRedirect from './components/routing/ProfileRedirect';
import Dashboard from './components/dashboard/Dashboard';
import Unauthorized from './components/common/Unauthorized';

// Import our custom welcome popup component
import WelcomePopup from './components/common/WelcomePopup';

// Create context after all imports
export const ThemeContext = createContext();

function App() {
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [darkTheme, setDarkTheme] = useState(() => {
    // Check if user has saved theme preference
    const savedTheme = localStorage.getItem('darkTheme');
    // If preference exists, use it; otherwise check system preference
    if (savedTheme !== null) {
      return JSON.parse(savedTheme);
    }
    // Check if system prefers dark mode
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  // Set theme class on body element
  useEffect(() => {
    if (darkTheme) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    // Save theme preference
    localStorage.setItem('darkTheme', JSON.stringify(darkTheme));
  }, [darkTheme]);
  
  // Toggle theme function
  const toggleTheme = () => {
    setDarkTheme(!darkTheme);
  };
  
  useEffect(() => {
    // Check if this is the first visit
    const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
    if (!hasVisitedBefore) {
      // Show popup after a short delay for better UX
      setTimeout(() => {
        setShowWelcomePopup(true);
        // Set flag in localStorage
        localStorage.setItem('hasVisitedBefore', 'true');
      }, 1000);
    }
    
    // Also check for first login
    const handleStorageChange = () => {
      // Check if user just logged in for the first time
      const isFirstLogin = localStorage.getItem('isFirstLogin');
      const token = localStorage.getItem('token');
      
      if (token && isFirstLogin === 'true') {
        setTimeout(() => {
          setShowWelcomePopup(true);
          // Reset the first login flag
          localStorage.setItem('isFirstLogin', 'false');
        }, 1000);
      }
    };
    
    // Add event listener for storage changes
    window.addEventListener('storage', handleStorageChange);
    // Also check on initial load
    handleStorageChange();
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <Router>
      <ThemeContext.Provider value={{ darkTheme, toggleTheme }}>
        <ModalProvider>
          <div className={`flex flex-col min-h-screen ${darkTheme ? 'dark' : ''}`}>
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
          {showWelcomePopup && <WelcomePopup onClose={() => setShowWelcomePopup(false)} />}
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
            
            {/* Company and Legal Pages */}
            <Route path="/about" element={<AboutUsPage />} />
            <Route path="/contact" element={<ContactUsPage />} />
            <Route path="/vision" element={<VisionPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/terms" element={<TermsAndConditionsPage />} />
            
            {/* Protected Cart Routes - redirects to login if not authenticated */}
            <Route path="/cart" element={<ProtectedRoute roles="customer"><Cart /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute roles="customer"><Checkout /></ProtectedRoute>} />

            {/* Role-protected Routes */}
            
            {/* Admin Routes */}
            <Route element={<PrivateRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/profile" element={<AdminProfile />} />
              <Route path="/admin/profile/edit" element={<AdminProfileEdit />} />
              <Route path="/admin/profile/password" element={<AdminPasswordChange />} />
              <Route path="/admin/products" element={<ProductsList />} />
              <Route path="/admin/products/edit/:id" element={<EditProduct />} />
              <Route path="/admin/products/:id" element={<ProductDetail />} />
              <Route path="/admin/users" element={<AdminUserList />} />
              <Route path="/admin/users/edit/:id" element={<AdminUserEdit />} />
              <Route path="/admin/users/:id" element={<AdminUserDetail />} />
              <Route path="/admin/customers" element={<AdminCustomersList />} />
              <Route path="/admin/customers/:id" element={<CustomerDetail />} />
              <Route path="/admin/sellers/pending" element={<AdminSellersList approvalFilter="pending" />} />
              <Route path="/admin/sellers/:id" element={<SellerDetail />} />
              <Route path="/admin/sellers" element={<AdminSellersList />} />
              <Route path="/admin/orders" element={<AdminOrdersList />} />
              <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
              <Route path="/admin/faq" element={<AdminFaqManager />} />
              <Route path="/admin/feedback" element={<AdminFeedbackManager />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
              <Route path="/admin/reports/sales" element={<SalesReport />} />
              <Route path="/admin/reports/inventory" element={<InventoryReport />} />
              <Route path="/admin/users/add" element={<AdminUserAdd />} />
              <Route path="/admin/blog" element={<AdminBlogList />} />
              <Route path="/admin/blog/new" element={<AdminBlogForm />} />
              <Route path="/admin/blog/edit/:id" element={<AdminBlogForm />} />
              <Route path="/admin/seller-requests" element={<AdminSellerRequests />} />
            </Route>
            
            {/* Seller Routes */}
            <Route element={<PrivateRoute allowedRoles={['seller']} />}>
              <Route path="/seller" element={<Dashboard />} />
              <Route path="/seller/profile" element={<SellerProfile />} />
              <Route path="/seller/profile/edit" element={<SellerProfileEdit />} />
              <Route path="/seller/profile/password" element={<SellerPasswordChange />} />
              <Route path="/seller/products" element={<SellerProductList />} />
              <Route path="/seller/products/add" element={<SellerAddProduct />} />
              <Route path="/seller/products/edit/:id" element={<SellerEditProduct />} />
              <Route path="/seller/products/:id" element={<ProductDetail />} />
              <Route path="/seller/inventory" element={<SellerInventory />} />
              <Route path="/seller/orders" element={<SellerOrdersList />} />
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
              <Route path="/customer/support" element={<CustomerSupport />} />
              <Route path="/customer/wishlist" element={<Wishlist />} />
            </Route>
            
            {/* Public Routes */}
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/return-policy" element={<ReturnPolicy />} />
            
            {/* Public Blog Routes */}
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:id" element={<BlogDetail />} />
            
            {/* Dashboard route for any authenticated user */}
            <Route element={<PrivateRoute allowedRoles={['admin', 'seller', 'customer']} />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<ProfileRedirect />} />
            </Route>
          </Routes>
        </main>
        <Footer />
          </div>
        </ModalProvider>
      </ThemeContext.Provider>
    </Router>
  );
}

export default App;
