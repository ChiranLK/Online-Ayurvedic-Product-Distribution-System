import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminNavigation from './AdminNavigation';

const AdminFaqManager = () => {
  const [faqs, setFaqs] = useState([
    {
      id: 1,
      question: "What is Ayurveda?",
      answer: "Ayurveda is a traditional Indian system of medicine that has been practiced for thousands of years. It focuses on creating harmony between the body, mind, and spirit using a holistic approach to physical and mental health.",
      isActive: true
    },
    {
      id: 2,
      question: "Are Ayura products organic?",
      answer: "Most of our products are made with organic ingredients sourced from trusted suppliers. Each product page specifies whether the product is certified organic. We are committed to providing natural products with minimal chemical additives.",
      isActive: true
    },
    {
      id: 3,
      question: "How should I store Ayurvedic products?",
      answer: "Ayurvedic products should typically be stored in a cool, dry place away from direct sunlight. Most products come with specific storage instructions on their packaging. Following these instructions helps maintain the efficacy of the natural ingredients.",
      isActive: true
    },
    {
      id: 4,
      question: "Do you ship internationally?",
      answer: "Yes, we offer international shipping to most countries. Shipping times and costs vary based on location. You can view the shipping options available for your country during the checkout process.",
      isActive: true
    },
    {
      id: 5,
      question: "What is your return policy?",
      answer: "We accept returns within 14 days of delivery if the product is unopened and in its original packaging. For damaged or defective products, please contact our customer service team within 7 days of receiving your order.",
      isActive: true
    }
  ]);

  const [editMode, setEditMode] = useState(false);
  const [currentFaq, setCurrentFaq] = useState(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  // Function to handle toggling FAQ visibility
  const toggleFaqStatus = (id) => {
    setFaqs(faqs.map(faq => 
      faq.id === id ? { ...faq, isActive: !faq.isActive } : faq
    ));
  };

  // Function to delete FAQ
  const deleteFaq = (id) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      setFaqs(faqs.filter(faq => faq.id !== id));
    }
  };

  // Function to edit FAQ
  const editFaq = (faq) => {
    setEditMode(true);
    setCurrentFaq(faq);
    setNewQuestion(faq.question);
    setNewAnswer(faq.answer);
  };

  // Function to add new FAQ
  const addNewFaq = () => {
    setEditMode(true);
    setCurrentFaq(null);
    setNewQuestion('');
    setNewAnswer('');
  };

  // Function to save FAQ (add or update)
  const saveFaq = (e) => {
    e.preventDefault();

    if (!newQuestion.trim() || !newAnswer.trim()) {
      alert('Question and answer cannot be empty');
      return;
    }

    if (currentFaq) {
      // Update existing FAQ
      setFaqs(faqs.map(faq => 
        faq.id === currentFaq.id 
          ? { ...faq, question: newQuestion, answer: newAnswer } 
          : faq
      ));
    } else {
      // Add new FAQ
      const newId = Math.max(0, ...faqs.map(faq => faq.id)) + 1;
      setFaqs([...faqs, { 
        id: newId, 
        question: newQuestion, 
        answer: newAnswer,
        isActive: true
      }]);
    }
    
    // Reset form
    setEditMode(false);
    setCurrentFaq(null);
    setNewQuestion('');
    setNewAnswer('');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminNavigation />
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-green-800">Manage FAQs</h1>
        <button 
          onClick={addNewFaq}
          className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg"
        >
          Add New FAQ
        </button>
      </div>

      {editMode ? (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-green-800 mb-4">
            {currentFaq ? 'Edit FAQ' : 'Add New FAQ'}
          </h2>
          <form onSubmit={saveFaq} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Question</label>
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter question"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Answer</label>
              <textarea
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="5"
                placeholder="Enter answer"
              ></textarea>
            </div>
            <div className="flex space-x-2 justify-end">
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Question
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {faqs.map((faq) => (
                <tr key={faq.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{faq.question}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${faq.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {faq.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => toggleFaqStatus(faq.id)}
                      className={`text-indigo-600 hover:text-indigo-900 mr-4 ${faq.isActive ? 'text-amber-600 hover:text-amber-900' : 'text-green-600 hover:text-green-900'}`}
                    >
                      {faq.isActive ? 'Hide' : 'Show'}
                    </button>
                    <button
                      onClick={() => editFaq(faq)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteFaq(faq.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8">
        <Link to="/faq" className="text-green-700 hover:text-green-900 font-medium">
          View Public FAQ Page
        </Link>
      </div>
    </div>
  );
};

export default AdminFaqManager;
