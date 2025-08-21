import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const FAQs = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  // FAQ categories and questions
  const faqCategories = [
    {
      name: 'Orders & Shipping',
      faqs: [
        {
          question: 'How can I track my order?',
          answer: 'You can track your order by logging into your account and navigating to the "Orders" section. Click on the specific order you want to track and you will see its current status. We also send tracking information via email once your order has been shipped.'
        },
        {
          question: 'How long will it take to receive my order?',
          answer: 'Delivery times depend on your location. For local deliveries within Colombo, delivery typically takes 1-2 business days. For other areas in Sri Lanka, it usually takes 3-5 business days. International shipping may take 7-14 business days depending on the destination country.'
        },
        {
          question: 'Do you ship internationally?',
          answer: 'Yes, we ship to most countries worldwide. International shipping rates and delivery times vary by destination. You can view shipping options and costs during checkout.'
        },
        {
          question: 'What are the shipping costs?',
          answer: 'Shipping costs depend on your location and the weight of your order. We offer free shipping on orders over Rs. 5,000 within Sri Lanka. For international orders, shipping costs are calculated at checkout based on weight and destination.'
        }
      ]
    },
    {
      name: 'Products & Usage',
      faqs: [
        {
          question: 'Are your products organic?',
          answer: 'Many of our products are made with organic ingredients. Each product page specifies whether the product is certified organic. We prioritize natural ingredients and traditional Ayurvedic formulations.'
        },
        {
          question: 'How should I store my Ayurvedic products?',
          answer: 'Most Ayurvedic products should be stored in a cool, dry place away from direct sunlight. Some products may require refrigeration after opening - this will be indicated on the packaging. Always ensure containers are tightly closed after use.'
        },
        {
          question: 'Are your products suitable for vegans?',
          answer: 'Many of our products are vegan-friendly, but not all. Products that contain honey, ghee, or other animal-derived ingredients are clearly labeled. Please check individual product descriptions for details or contact our customer support if you have specific questions.'
        },
        {
          question: 'Do your products have expiration dates?',
          answer: 'Yes, all our products have expiration dates printed on the packaging. Typically, our products have a shelf life of 1-2 years if unopened. Once opened, most products should be used within 6-12 months for optimal effectiveness.'
        }
      ]
    },
    {
      name: 'Returns & Refunds',
      faqs: [
        {
          question: 'What is your return policy?',
          answer: 'We accept returns within 14 days of delivery if the product is unused, in its original packaging, and in resalable condition. For detailed information, please visit our Return Policy page.'
        },
        {
          question: 'How do I initiate a return?',
          answer: 'To initiate a return, please login to your account, go to your order history, select the order with the item you wish to return, and follow the return instructions. You can also contact our customer support team for assistance.'
        },
        {
          question: 'When will I receive my refund?',
          answer: 'Once we receive and inspect your return, we will process your refund. The funds will be credited back to your original payment method within 5-10 business days, depending on your bank or credit card provider.'
        },
        {
          question: 'Can I exchange a product?',
          answer: 'Yes, we do offer exchanges for products of equal or lesser value. If you wish to exchange for a product of higher value, you will need to pay the difference. Please contact our customer support team to arrange an exchange.'
        }
      ]
    },
    {
      name: 'Account & Payment',
      faqs: [
        {
          question: 'How do I create an account?',
          answer: 'You can create an account by clicking on the "Register" button at the top of our website. Fill in your personal details, create a password, and submit the form. You will receive a confirmation email to verify your account.'
        },
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept Visa, Mastercard, American Express, and PayPal. We also offer Cash on Delivery (COD) for orders within Sri Lanka. For bank transfers, please contact our customer support.'
        },
        {
          question: 'Is my payment information secure?',
          answer: 'Yes, all payment information is encrypted and processed securely. We use industry-standard SSL encryption to protect your personal and financial data. We do not store your credit card information on our servers.'
        },
        {
          question: 'Can I change my account details?',
          answer: 'Yes, you can update your account information anytime by logging into your account and navigating to the "My Profile" section. From there, you can edit your personal details, change your password, and manage your addresses.'
        }
      ]
    }
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Frequently Asked Questions</h1>
        <p className="text-gray-600">
          Find answers to common questions about our products, ordering, shipping, and more.
          If you can't find what you're looking for, please <Link to="/customer/support" className="text-green-600 hover:underline">contact our support team</Link>.
        </p>
      </div>

      {/* Search box */}
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            className="w-full md:w-2/3 px-4 py-2 border border-gray-300 rounded-md pl-10"
            placeholder="Search for answers..."
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* FAQ Categories */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {faqCategories.map((category, index) => (
          <button
            key={index}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-green-500 hover:shadow-md transition-all text-center"
            onClick={() => document.getElementById(`category-${index}`).scrollIntoView({ behavior: 'smooth' })}
          >
            <h3 className="text-lg font-semibold text-gray-800">{category.name}</h3>
            <p className="text-gray-500 text-sm">{category.faqs.length} questions</p>
          </button>
        ))}
      </div>

      {/* FAQ Accordions */}
      {faqCategories.map((category, categoryIndex) => (
        <div key={categoryIndex} id={`category-${categoryIndex}`} className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">{category.name}</h2>
          <div className="space-y-4">
            {category.faqs.map((faq, faqIndex) => {
              const index = `${categoryIndex}-${faqIndex}`;
              return (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <button
                    className="w-full text-left p-4 flex justify-between items-center bg-white hover:bg-gray-50"
                    onClick={() => toggleAccordion(index)}
                  >
                    <span className="font-medium text-gray-800">{faq.question}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 text-gray-500 transform transition-transform ${activeIndex === index ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {activeIndex === index && (
                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                      <p className="text-gray-700">{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Still Have Questions */}
      <div className="bg-green-50 p-6 rounded-lg border border-green-200 text-center">
        <h2 className="text-xl font-semibold text-green-800 mb-2">Still Have Questions?</h2>
        <p className="text-green-700 mb-4">
          Our support team is here to help you with any questions or concerns.
        </p>
        <Link
          to="/customer/support"
          className="inline-block px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
};

export default FAQs;
