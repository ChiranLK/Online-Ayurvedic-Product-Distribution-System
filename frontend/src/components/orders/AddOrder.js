import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AddOrder = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  
  // For search and filters
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  
  // Order form state
  const [orderData, setOrderData] = useState({
    customerId: '',
    shippingAddress: '',
    billingAddress: '',
    paymentMethod: 'Credit Card',
    notes: '',
    items: []
  });
  
  // Selected products for order
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    // Fetch customers and products data
    const fetchData = async () => {
      try {
        // In a real app, fetch from API
        // const customersResponse = await axios.get('http://localhost:5000/api/customers');
        // const productsResponse = await axios.get('http://localhost:5000/api/products');
        // setCustomers(customersResponse.data);
        // setProducts(productsResponse.data);
        
        // Mock data
        const mockCustomers = [
          {
            _id: '1',
            name: 'Kamal Perera',
            email: 'kamal@example.com',
            phone: '0771234567',
            address: '456 Beach Road, Colombo 03, Sri Lanka',
          },
          {
            _id: '2',
            name: 'Nimal Silva',
            email: 'nimal@example.com',
            phone: '0772345678',
            address: '789 Hill Street, Kandy, Sri Lanka',
          },
          {
            _id: '3',
            name: 'Sunil Fonseka',
            email: 'sunil@example.com',
            phone: '0773456789',
            address: '123 River Lane, Galle, Sri Lanka',
          }
        ];
        
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
            _id: '2',
            name: 'Triphala Tablets',
            category: 'Herbal Supplements',
            price: 1800,
            quantity: 150,
            image: 'https://images.unsplash.com/photo-1607078441490-8342a3feff46?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
          },
          {
            _id: '3',
            name: 'Turmeric Capsules',
            category: 'Herbal Supplements',
            price: 1500,
            quantity: 200,
            image: 'https://images.unsplash.com/photo-1626198138066-7891428d1a74?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
          },
          {
            _id: '4',
            name: 'Herbal Hair Oil',
            category: 'Hair Care',
            price: 1200,
            quantity: 80,
            image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
          },
          {
            _id: '5',
            name: 'Aloe Vera Gel',
            category: 'Skin Care',
            price: 1800,
            quantity: 75,
            image: 'https://images.unsplash.com/photo-1596046611348-7db3c12eac56?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
          }
        ];
        
        setCustomers(mockCustomers);
        setProducts(mockProducts);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load required data. Please try again later.');
      }
    };
    
    fetchData();
  }, []);

  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    customer.phone.includes(customerSearchTerm)
  );

  // Filter products based on search term
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  const handleCustomerSelect = (customer) => {
    setOrderData({
      ...orderData,
      customerId: customer._id,
      shippingAddress: customer.address,
      billingAddress: customer.address
    });
  };

  const handleAddProduct = (product) => {
    // Check if product is already in the order
    const existingItem = selectedProducts.find(item => item.productId === product._id);
    
    if (existingItem) {
      // Update quantity if product already in order
      setSelectedProducts(
        selectedProducts.map(item => 
          item.productId === product._id 
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
            : item
        )
      );
    } else {
      // Add new product to order
      setSelectedProducts([
        ...selectedProducts,
        {
          productId: product._id,
          productName: product.name,
          price: product.price,
          quantity: 1,
          subtotal: product.price,
          image: product.image
        }
      ]);
    }
    
    setProductSearchTerm('');
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setSelectedProducts(
      selectedProducts.map(item => 
        item.productId === productId 
          ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.price }
          : item
      )
    );
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(item => item.productId !== productId));
  };

  const calculateTotals = () => {
    const subtotal = selectedProducts.reduce((sum, item) => sum + item.subtotal, 0);
    const shippingFee = 500; // Fixed shipping fee
    const tax = Math.round(subtotal * 0.15); // 15% tax
    const total = subtotal + shippingFee + tax;
    
    return { subtotal, shippingFee, tax, total };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderData({
      ...orderData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate form
      if (!orderData.customerId) {
        throw new Error('Please select a customer');
      }
      
      if (selectedProducts.length === 0) {
        throw new Error('Please add at least one product to the order');
      }
      
      if (!orderData.shippingAddress || !orderData.billingAddress) {
        throw new Error('Shipping and billing addresses are required');
      }

      const { subtotal, shippingFee, tax, total } = calculateTotals();
      
      // Prepare order data for submission
      const orderPayload = {
        ...orderData,
        items: selectedProducts,
        totalAmount: total,
        shippingFee,
        tax,
        discount: 0,
        status: 'Pending',
        paymentStatus: 'Pending',
        orderDate: new Date().toISOString()
      };

      // In a real app, post to API
      // const response = await axios.post('http://localhost:5000/api/orders', orderPayload);
      
      // Simulate API call
      console.log('Creating new order:', orderPayload);
      
      // Redirect on success
      setTimeout(() => {
        setLoading(false);
        navigate('/orders');
      }, 1000);
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to create order. Please try again later.');
    }
  };

  // Get the customer name from the selected customer ID
  const getCustomerName = () => {
    const customer = customers.find(c => c._id === orderData.customerId);
    return customer ? customer.name : 'Select a customer';
  };

  return (
    <div>
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          to="/orders"
          className="text-green-700 hover:text-green-900 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Orders
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Order</h1>
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Customer Selection */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">1. Select Customer</h2>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Selected Customer:</p>
                    <p className="text-lg">{getCustomerName()}</p>
                  </div>
                  
                  {orderData.customerId && (
                    <button
                      type="button"
                      onClick={() => setOrderData({
                        ...orderData,
                        customerId: '',
                        shippingAddress: '',
                        billingAddress: ''
                      })}
                      className="text-red-600 hover:text-red-800"
                    >
                      Change
                    </button>
                  )}
                </div>
              </div>

              {!orderData.customerId && (
                <div>
                  <div className="relative mb-4">
                    <input
                      type="text"
                      value={customerSearchTerm}
                      onChange={(e) => setCustomerSearchTerm(e.target.value)}
                      placeholder="Search customers by name, email, or phone..."
                      className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 absolute right-3 top-2 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>

                  <div className="overflow-x-auto max-h-60 border rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredCustomers.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                              No customers found
                            </td>
                          </tr>
                        ) : (
                          filteredCustomers.map((customer) => (
                            <tr key={customer._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{customer.email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{customer.phone}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <button
                                  type="button"
                                  onClick={() => handleCustomerSelect(customer)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Select
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Product Selection */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">2. Add Products</h2>
              
              <div className="relative mb-4">
                <input
                  type="text"
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                  placeholder="Search products by name or category..."
                  className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 absolute right-3 top-2 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {productSearchTerm && (
                <div className="overflow-x-auto max-h-60 border rounded-lg mb-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                            No products found
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((product) => (
                          <tr key={product._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0">
                                  <img className="h-10 w-10 rounded object-cover" src={product.image} alt={product.name} />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{product.category}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">Rs. {product.price.toLocaleString()}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{product.quantity} in stock</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <button
                                type="button"
                                onClick={() => handleAddProduct(product)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Add
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Selected Products */}
              <div className="border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedProducts.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                          No products added to the order yet
                        </td>
                      </tr>
                    ) : (
                      selectedProducts.map((item) => (
                        <tr key={item.productId}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <img className="h-10 w-10 rounded object-cover" src={item.image} alt={item.productName} />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">Rs. {item.price.toLocaleString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <button
                                type="button"
                                onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                                className="text-gray-500 hover:text-gray-700 p-1"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                              <span className="mx-2 text-gray-700">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                                className="text-gray-500 hover:text-gray-700 p-1"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">Rs. {item.subtotal.toLocaleString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveProduct(item.productId)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {selectedProducts.length > 0 && (
                    <tfoot>
                      <tr className="bg-gray-50">
                        <td colSpan="3" className="px-6 py-3 text-right font-medium">Subtotal:</td>
                        <td className="px-6 py-3 font-medium">Rs. {calculateTotals().subtotal.toLocaleString()}</td>
                        <td></td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td colSpan="3" className="px-6 py-3 text-right font-medium">Shipping Fee:</td>
                        <td className="px-6 py-3 font-medium">Rs. {calculateTotals().shippingFee.toLocaleString()}</td>
                        <td></td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td colSpan="3" className="px-6 py-3 text-right font-medium">Tax (15%):</td>
                        <td className="px-6 py-3 font-medium">Rs. {calculateTotals().tax.toLocaleString()}</td>
                        <td></td>
                      </tr>
                      <tr className="bg-gray-100">
                        <td colSpan="3" className="px-6 py-3 text-right font-medium text-lg">Total:</td>
                        <td className="px-6 py-3 font-medium text-lg">Rs. {calculateTotals().total.toLocaleString()}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>

            {/* Order Details */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">3. Order Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="shippingAddress" className="block text-sm font-medium text-gray-700">
                      Shipping Address
                    </label>
                    <textarea
                      id="shippingAddress"
                      name="shippingAddress"
                      rows="3"
                      value={orderData.shippingAddress}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
                      required
                    ></textarea>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="sameAsBilling"
                      checked={orderData.shippingAddress === orderData.billingAddress}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setOrderData({
                            ...orderData,
                            billingAddress: orderData.shippingAddress
                          });
                        }
                      }}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="sameAsBilling" className="ml-2 block text-sm text-gray-900">
                      Billing address same as shipping address
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="billingAddress" className="block text-sm font-medium text-gray-700">
                      Billing Address
                    </label>
                    <textarea
                      id="billingAddress"
                      name="billingAddress"
                      rows="3"
                      value={orderData.billingAddress}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
                      required
                    ></textarea>
                  </div>
                </div>

                <div>
                  <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
                    Payment Method
                  </label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={orderData.paymentMethod}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
                    required
                  >
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Cash on Delivery">Cash on Delivery</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="PayPal">PayPal</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows="3"
                    value={orderData.notes}
                    onChange={handleInputChange}
                    placeholder="Special instructions for delivery or any other notes"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/orders')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || selectedProducts.length === 0}
                className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${(loading || selectedProducts.length === 0) ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Order...
                  </span>
                ) : (
                  'Create Order'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddOrder;
