import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const FaqPage = () => {
  const [openItem, setOpenItem] = useState(null);

  const toggleItem = (index) => {
    if (openItem === index) {
      setOpenItem(null);
    } else {
      setOpenItem(index);
    }
  };

  const faqs = [
    {
      question: "What is Ayurveda?",
      answer: "Ayurveda is a traditional Indian system of medicine that has been practiced for thousands of years. It focuses on creating harmony between the body, mind, and spirit using a holistic approach to physical and mental health."
    },
    {
      question: "Are Ayura products organic?",
      answer: "Most of our products are made with organic ingredients sourced from trusted suppliers. Each product page specifies whether the product is certified organic. We are committed to providing natural products with minimal chemical additives."
    },
    {
      question: "How should I store Ayurvedic products?",
      answer: "Ayurvedic products should typically be stored in a cool, dry place away from direct sunlight. Most products come with specific storage instructions on their packaging. Following these instructions helps maintain the efficacy of the natural ingredients."
    },
    {
      question: "Do you ship internationally?",
      answer: "Yes, we offer international shipping to most countries. Shipping times and costs vary based on location. You can view the shipping options available for your country during the checkout process."
    },
    {
      question: "What is your return policy?",
      answer: "We accept returns within 14 days of delivery if the product is unopened and in its original packaging. For damaged or defective products, please contact our customer service team within 7 days of receiving your order."
    },
    {
      question: "Are your products tested on animals?",
      answer: "No, Ayura is committed to cruelty-free practices. None of our products or ingredients are tested on animals at any stage of product development."
    },
    {
      question: "Can I use Ayurvedic products if I'm pregnant or nursing?",
      answer: "While many Ayurvedic products are safe during pregnancy and nursing, we recommend consulting with your healthcare provider before using any new products during this time. Some herbs and ingredients may not be recommended during pregnancy."
    },
    {
      question: "Do you offer wholesale options?",
      answer: "Yes, we offer wholesale options for retailers interested in carrying our products. Please contact our business development team at wholesale@ayura.com for more information about our wholesale program."
    },
    {
      question: "How long do Ayurvedic products last before expiring?",
      answer: "The shelf life varies depending on the product. Most of our products have a shelf life of 1-2 years when unopened. Once opened, we recommend using the product within 6-12 months for optimal potency. Each product has an expiration date printed on the packaging."
    },
    {
      question: "Can I track my order?",
      answer: "Yes, once your order has been shipped, you will receive an email with tracking information. You can also log in to your account on our website to track your order status."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-green-800 mb-8">Frequently Asked Questions</h1>
      
      <div className="max-w-3xl mx-auto">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className="mb-4 border-b border-gray-200 pb-4"
          >
            <button 
              onClick={() => toggleItem(index)}
              className="flex justify-between items-center w-full text-left py-2 px-4 bg-white rounded-lg shadow-sm hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-expanded={openItem === index}
            >
              <h3 className="text-lg font-semibold text-green-800">{faq.question}</h3>
              <span className="ml-6">
                {openItem === index ? (
                  <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                )}
              </span>
            </button>
            
            {openItem === index && (
              <div className="mt-2 px-4 py-3 bg-green-50 rounded-lg">
                <p className="text-gray-700">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-green-800 mb-4">Still have questions?</h2>
        <p className="text-gray-700 mb-4">
          If you couldn't find the answer to your question in our FAQ, please don't hesitate to contact our customer service team.
        </p>
        <div className="flex space-x-4">
          <Link to="/contact" className="inline-block bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg transition">
            Contact Us
          </Link>
          <a href="mailto:support@ayura.com" className="inline-block border border-green-700 text-green-700 hover:bg-green-50 px-4 py-2 rounded-lg transition">
            Email Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default FaqPage;
