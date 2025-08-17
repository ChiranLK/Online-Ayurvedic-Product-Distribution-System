import React from 'react';

const VisionPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-green-800 mb-8">Our Vision & Mission</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-green-700 mb-4">Our Vision</h2>
          
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              To be the leading global platform connecting authentic Ayurvedic traditions with modern wellness seekers, 
              empowering people to embrace natural healing through accessible, high-quality Ayurvedic products.
            </p>
            
            <div className="bg-green-50 border-l-4 border-green-600 p-4 my-6">
              <p className="italic text-green-800">
                "We envision a world where the ancient wisdom of Ayurveda is seamlessly integrated into daily wellness 
                practices, creating healthier communities and honoring the rich heritage of natural healing."
              </p>
            </div>
            
            <p className="text-gray-700">
              We strive to preserve and promote the authentic principles of Ayurveda while making them relevant and 
              accessible in today's modern world, bridging the gap between traditional wisdom and contemporary wellness needs.
            </p>
          </div>
          
          <h3 className="text-lg font-semibold text-green-700 mb-3">Key Aspirations</h3>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Become the most trusted global platform for authentic Ayurvedic products</li>
            <li>Create a seamless ecosystem connecting traditional producers with global consumers</li>
            <li>Establish new standards for quality and authenticity in Ayurvedic commerce</li>
            <li>Preserve and promote the rich heritage of Ayurvedic knowledge</li>
          </ul>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-green-700 mb-4">Our Mission</h2>
          
          <p className="text-gray-700 mb-6">
            Our mission is to create an accessible, transparent, and reliable marketplace that connects authentic Ayurvedic 
            product makers with conscious consumers while upholding the highest standards of quality, sustainability, and 
            ethical business practices.
          </p>
          
          <h3 className="text-lg font-semibold text-green-700 mb-3">We Commit To:</h3>
          
          <div className="space-y-4">
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-green-800">Quality Assurance</h4>
              <p className="text-gray-600">Rigorously verifying all products to ensure they meet traditional Ayurvedic 
                standards and modern safety requirements.</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-green-800">Empowering Traditional Producers</h4>
              <p className="text-gray-600">Supporting small-scale Ayurvedic manufacturers and family businesses 
                by providing them fair access to global markets.</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-green-800">Education & Awareness</h4>
              <p className="text-gray-600">Spreading knowledge about Ayurvedic principles and practices through 
                accessible educational content and community engagement.</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-green-800">Sustainability</h4>
              <p className="text-gray-600">Ensuring our operations and supply chain prioritize environmental 
                sustainability and ethical sourcing practices.</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-green-800">Customer-Centric Approach</h4>
              <p className="text-gray-600">Providing exceptional service, transparency, and personalized guidance 
                to help customers find the perfect Ayurvedic solutions for their needs.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <h2 className="text-xl font-semibold text-green-700 mb-4">Our Values</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border-b-2 border-green-500 pb-4">
            <h3 className="text-lg font-semibold mb-2">Authenticity</h3>
            <p className="text-gray-700">We honor traditional Ayurvedic principles without compromise, ensuring all 
              products maintain the integrity of this ancient healing system.</p>
          </div>
          
          <div className="border-b-2 border-green-500 pb-4">
            <h3 className="text-lg font-semibold mb-2">Transparency</h3>
            <p className="text-gray-700">We provide clear information about sourcing, ingredients, and manufacturing 
              processes to build trust with our customers.</p>
          </div>
          
          <div className="border-b-2 border-green-500 pb-4">
            <h3 className="text-lg font-semibold mb-2">Holistic Wellness</h3>
            <p className="text-gray-700">We believe in addressing the root causes of health concerns and promoting 
              balance in body, mind, and spirit.</p>
          </div>
          
          <div className="border-b-2 border-green-500 pb-4">
            <h3 className="text-lg font-semibold mb-2">Community</h3>
            <p className="text-gray-700">We foster connections between producers, practitioners, and consumers, 
              creating a global Ayurvedic community based on shared values.</p>
          </div>
          
          <div className="border-b-2 border-green-500 pb-4">
            <h3 className="text-lg font-semibold mb-2">Sustainability</h3>
            <p className="text-gray-700">We prioritize environmentally responsible practices throughout our 
              supply chain and operations.</p>
          </div>
          
          <div className="border-b-2 border-green-500 pb-4">
            <h3 className="text-lg font-semibold mb-2">Innovation</h3>
            <p className="text-gray-700">We embrace modern technology and research to enhance the accessibility 
              and effectiveness of traditional Ayurvedic solutions.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisionPage;
