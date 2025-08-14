import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-green-800 text-white mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About Us</h3>
            <p className="text-sm">
              We are dedicated to providing high-quality Ayurvedic products 
              sourced from trusted sellers across the country.
            </p>
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
        
        <div className="border-t border-green-700 mt-8 pt-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Ayurvedic Product Distribution System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
