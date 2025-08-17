import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../../App';

const Footer = () => {
  const { darkTheme, toggleTheme } = useContext(ThemeContext) || { darkTheme: false, toggleTheme: () => {} };
  return (
    <footer className="bg-green-800 text-white mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About Us</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-green-300">About Us</Link></li>
              <li><Link to="/vision" className="hover:text-green-300">Our Vision</Link></li>
              <li><Link to="/contact" className="hover:text-green-300">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-green-300">FAQ</Link></li>
              <li><Link to="/feedback" className="hover:text-green-300">Feedback</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-green-300">Home</Link></li>
              <li><Link to="/products" className="hover:text-green-300">Products</Link></li>
              <li><Link to="/sellers" className="hover:text-green-300">Sellers</Link></li>
              <li><Link to="/register" className="hover:text-green-300">Register</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products?category=Hair Care" className="hover:text-green-300">Hair Care</Link></li>
              <li><Link to="/products?category=Skin Care" className="hover:text-green-300">Skin Care</Link></li>
              <li><Link to="/products?category=Digestive Health" className="hover:text-green-300">Digestive Health</Link></li>
              <li><Link to="/products?category=Immunity Boosters" className="hover:text-green-300">Immunity Boosters</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <address className="not-italic text-sm space-y-2">
              <p>123 Ayurveda Lane</p>
              <p>Colombo, Sri Lanka</p>
              <p>Email: info@ayurveda.lk</p>
              <p>Phone: +94 11 2345678</p>
            </address>
          </div>
        </div>
        
        <div className="border-t border-green-700 mt-8 pt-6 text-sm">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              {/* Theme Toggle Button */}
              <div className="flex items-center">
                <span className="mr-2 text-sm">Theme:</span>
                <button 
                  onClick={toggleTheme} 
                  className="p-2 rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 transition-colors"
                  aria-label={darkTheme ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {darkTheme ? (
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs">Light Mode</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                      </svg>
                      <span className="text-xs">Dark Mode</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
                        <p className="text-center">&copy; {new Date().getFullYear()} Ayura. All rights reserved.</p>
          </div>
          <div className="flex justify-center space-x-4 mt-2">
            <Link to="/terms" className="hover:text-green-300">Terms & Conditions</Link>
            <Link to="/faq" className="hover:text-green-300">FAQ</Link>
            <Link to="/feedback" className="hover:text-green-300">Feedback</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
