import React from 'react';

const AboutUsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-green-800 mb-8">About Us</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-green-700 mb-4">Our Story</h2>
        <p className="text-gray-700 mb-4">
          Welcome to Ayura, a platform dedicated to bringing authentic Ayurvedic remedies to your doorstep. Our journey began with a simple mission: to make traditional Ayurvedic wisdom accessible to everyone seeking natural health solutions.
        </p>
        <p className="text-gray-700 mb-4">
          Founded in 2023, our team comprises passionate Ayurvedic enthusiasts, certified practitioners, and technology experts committed to bridging the gap between ancient healing traditions and modern convenience.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-green-700 mb-4">Our Commitment</h2>
        <p className="text-gray-700 mb-4">
          We are committed to providing only the highest quality Ayurvedic products that adhere to traditional formulations while meeting modern safety standards. Each product in our catalog is carefully sourced from trusted manufacturers and sellers who share our dedication to authenticity and efficacy.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="border-l-4 border-green-600 pl-4">
            <h3 className="font-semibold text-lg">Quality Assurance</h3>
            <p className="text-gray-600">We rigorously test all products to ensure they meet our strict quality guidelines.</p>
          </div>
          <div className="border-l-4 border-green-600 pl-4">
            <h3 className="font-semibold text-lg">Authentic Sources</h3>
            <p className="text-gray-600">All our products come directly from verified traditional manufacturers.</p>
          </div>
          <div className="border-l-4 border-green-600 pl-4">
            <h3 className="font-semibold text-lg">Expert Guidance</h3>
            <p className="text-gray-600">Our team includes certified Ayurvedic practitioners to ensure product integrity.</p>
          </div>
          <div className="border-l-4 border-green-600 pl-4">
            <h3 className="font-semibold text-lg">Customer First</h3>
            <p className="text-gray-600">We prioritize customer satisfaction and wellness above all else.</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-green-700 mb-4">Our Team</h2>
        <p className="text-gray-700 mb-4">
          Our diverse team brings together experts in Ayurveda, logistics, technology, and customer service to provide you with a seamless experience. From careful product selection to efficient delivery, we work tirelessly to ensure that you receive nothing but the best.
        </p>
        <div className="flex flex-col md:flex-row justify-center space-y-6 md:space-y-0 md:space-x-12 mt-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full mx-auto flex items-center justify-center">
              <span className="text-green-800 text-3xl font-semibold">DR</span>
            </div>
            <h3 className="font-semibold mt-3">Dr. Rajitha Perera</h3>
            <p className="text-sm text-gray-500">Ayurvedic Expert</p>
          </div>
          <div className="text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full mx-auto flex items-center justify-center">
              <span className="text-green-800 text-3xl font-semibold">SP</span>
            </div>
            <h3 className="font-semibold mt-3">Samantha Peiris</h3>
            <p className="text-sm text-gray-500">Operations Director</p>
          </div>
          <div className="text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full mx-auto flex items-center justify-center">
              <span className="text-green-800 text-3xl font-semibold">AF</span>
            </div>
            <h3 className="font-semibold mt-3">Amaya Fernando</h3>
            <p className="text-sm text-gray-500">Customer Relations</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;
