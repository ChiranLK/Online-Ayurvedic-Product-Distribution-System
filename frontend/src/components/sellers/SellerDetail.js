import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

const SellerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSellerDetails = async () => {
      try {
        // In a real app, fetch from API
        // const response = await axios.get(`http://localhost:5000/api/sellers/${id}`);
        // setSeller(response.data);
        
        // Mock data
        const mockSeller = {
          _id: id,
          name: 'Herbal Distributors Pvt Ltd',
          email: 'sales@herbaldist.com',
          phone: '0712345678',
          address: 'No. 123, Main Street, Kurunegala, Sri Lanka',
          contactPerson: 'Amara Perera',
          registrationNumber: 'SL12345678',
          productsSupplied: ['1', '5', '9'],
          createdAt: '2023-05-10T09:30:00.000Z',
          description: 'A leading distributor of Ayurvedic products in Sri Lanka with over 15 years of experience. Specializing in high-quality herbal preparations and traditional remedies.',
          paymentTerms: 'Net 30 days',
          rating: 4.8,
          reviews: [
            { id: 'r1', text: 'Excellent products and reliable delivery.', rating: 5, author: 'Customer 1', date: '2023-08-15T10:30:00.000Z' },
            { id: 'r2', text: 'Good quality but sometimes delayed shipments.', rating: 4, author: 'Customer 2', date: '2023-09-22T14:15:00.000Z' },
          ]
        };
        
        setSeller(mockSeller);
        
        // Mock products data
        const mockProducts = [
          {
            _id: '1',
            name: 'Ashwagandha Powder',
            category: 'Herbal Supplements',
            price: 2500,
            quantity: 100,
            image: 'https://images.unsplash.com/photo-1626198226928-99ef1ba1d285?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
          },
          {
            _id: '5',
            name: 'Aloe Vera Gel',
            category: 'Skin Care',
            price: 1800,
            quantity: 75,
            image: 'https://images.unsplash.com/photo-1596046611348-7db3c12eac56?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
          },
          {
            _id: '9',
            name: 'Neem Face Wash',
            category: 'Skin Care',
            price: 950,
            quantity: 120,
            image: 'https://images.unsplash.com/photo-1556228578-5f6c19ec7d98?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
          }
        ];
        
        setProducts(mockProducts);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching seller details:', err);
        setError('Failed to load seller details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchSellerDetails();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this seller? This action cannot be undone.')) {
      try {
        // In a real app, delete via API
        // await axios.delete(`http://localhost:5000/api/sellers/${id}`);
        
        console.log(`Deleting seller with ID: ${id}`);
        navigate('/sellers');
      } catch (err) {
        console.error('Error deleting seller:', err);
        setError('Failed to delete seller. Please try again later.');
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-700 border-opacity-50 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading seller details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
        <p>{error}</p>
        <button 
          onClick={() => navigate('/sellers')}
          className="mt-2 text-red-700 underline"
        >
          Return to sellers list
        </button>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg mb-6">
        <p>Seller not found. The requested seller may have been deleted or does not exist.</p>
        <button 
          onClick={() => navigate('/sellers')}
          className="mt-2 text-yellow-800 underline"
        >
          Return to sellers list
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          to="/sellers"
          className="text-green-700 hover:text-green-900 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Sellers
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">{seller.name}</h1>
            
            <div className="flex space-x-4">
              <Link
                to={`/sellers/edit/${id}`}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Edit
              </Link>
              
              <button
                onClick={handleDelete}
                className="flex items-center text-red-600 hover:text-red-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Delete
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <div className="prose max-w-none">
                <h2 className="text-xl font-semibold mb-2">About the Seller</h2>
                <p className="text-gray-700 mb-4">{seller.description}</p>
                
                <div className="flex items-center mb-4">
                  <span className="text-gray-700 font-medium mr-2">Rating:</span>
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg 
                        key={i}
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-5 w-5 ${i < Math.floor(seller.rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-1 text-gray-600">{seller.rating} / 5</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div>
                    <p className="text-gray-600 font-medium">Contact Person</p>
                    <p className="text-gray-800">{seller.contactPerson}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <p className="text-gray-600 font-medium">Phone</p>
                    <p className="text-gray-800">{seller.phone}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-gray-600 font-medium">Email</p>
                    <p className="text-gray-800">{seller.email}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-gray-600 font-medium">Address</p>
                    <p className="text-gray-800">{seller.address}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <p className="text-gray-600 font-medium">Registration Number</p>
                    <p className="text-gray-800">{seller.registrationNumber}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div>
                    <p className="text-gray-600 font-medium">Payment Terms</p>
                    <p className="text-gray-800">{seller.paymentTerms}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products supplied by this seller */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Products Supplied</h2>
            
            {products.length === 0 ? (
              <p className="text-gray-500 italic">No products found for this seller.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div key={product._id} className="border rounded-lg overflow-hidden flex">
                    <div className="w-1/3">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="w-2/3 p-3">
                      <h3 className="font-medium text-gray-800">{product.name}</h3>
                      <p className="text-sm text-gray-600">{product.category}</p>
                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-green-700 font-medium">Rs. {product.price.toLocaleString()}</span>
                        <Link 
                          to={`/products/${product._id}`} 
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-4">Reviews</h2>
            
            {seller.reviews && seller.reviews.length > 0 ? (
              <div className="space-y-6">
                {seller.reviews.map((review) => (
                  <div key={review.id} className="border-b pb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-800">{review.author}</span>
                      <span className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg 
                          key={i}
                          xmlns="http://www.w3.org/2000/svg" 
                          className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-gray-700">{review.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No reviews yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDetail;
