import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';

const AdminOrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sellerFilter, setSellerFilter] = useState('');
  const [sellers, setSellers] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        console.log('Fetching orders...');
        const response = await api.get('/api/orders');
        console.log('Orders API response:', response.data);
        
        // Handle both data structures: response.data.data (if wrapped) or response.data (if direct array)
        const ordersData = response.data.data || response.data || [];
        console.log('Processed orders data:', ordersData);
        setOrders(ordersData);
        
        // Extract unique sellers from order items
        const allSellers = [];
        ordersData.forEach(order => {
          console.log('Processing order:', order);
          
          // Check if seller exists in order directly
          if (order.sellerId) {
            allSellers.push({
              _id: order.sellerId._id,
              name: order.sellerId.name || 'Unknown Seller'
            });
          }
          
          // Also check items for sellers
          if (order.items && order.items.length > 0) {
            order.items.forEach(item => {
              if (item.sellerId && item.sellerId._id) {
                allSellers.push({
                  _id: item.sellerId._id,
                  name: item.sellerId.name || 'Unknown Seller'
                });
              }
            });
          }
        });
        
        // Remove duplicates
        const uniqueSellers = allSellers.filter((seller, index, self) =>
          index === self.findIndex((s) => s && s._id === seller._id)
        );
        
        console.log('Unique sellers:', uniqueSellers);
        setSellers(uniqueSellers);
        
        setLoading(false);
      } catch (err) {
        setError(`Failed to fetch orders: ${err.message}`);
        setLoading(false);
        console.error('Error fetching orders:', err);
        console.error('Error details:', err.response?.data || 'No response data');
      }
    };

    fetchOrders();
  }, []);

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleSellerFilterChange = (e) => {
    setSellerFilter(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter orders based on search term, status, and seller
  const filteredOrders = orders.filter(order => {
    // Handle potential null/undefined values safely
    if (!order || !order._id) return false;
    
    const orderIdString = order._id.toString();
    const customerName = order.customerId?.name?.toLowerCase() || '';
    
    // Be flexible with status case and format
    const orderStatus = order.status?.toLowerCase() || '';
    const filterStatus = statusFilter?.toLowerCase() || '';
    const matchesStatus = filterStatus === '' || orderStatus === filterStatus;
    
    // Check seller directly on order or in items
    let matchesSeller = sellerFilter === '';
    
    // If order has a direct sellerId
    if (order.sellerId && order.sellerId._id === sellerFilter) {
      matchesSeller = true;
    }
    
    // Or check if any item in the order has the selected seller
    if (!matchesSeller && order.items && Array.isArray(order.items)) {
      matchesSeller = order.items.some(item => 
        item && item.sellerId && item.sellerId._id === sellerFilter
      );
    }
    
    const matchesSearch = orderIdString.includes(searchTerm.toLowerCase()) || 
                         customerName.includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSeller && matchesSearch;
  });

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      console.log(`Updating order ${orderId} to status: ${newStatus}`);
      
      // Call the API to update the order's status
      await api.put(`/api/orders/${orderId}`, { status: newStatus });
      
      // Update the local state after successful API call
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      
      alert(`Order status updated to ${newStatus} successfully`);
    } catch (err) {
      console.error('Error updating order status:', err);
      alert(`Failed to update order status: ${err.message}`);
    }
  };

  // Function to calculate order total
  const calculateOrderTotal = (order) => {
    // Return direct totalAmount if available
    if (order.totalAmount) {
      return order.totalAmount;
    }
    // Calculate from items if totalAmount not available
    return order.items?.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0) || 0;
  };

  // Function to get appropriate status badge color
  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to group orders by seller
  const getOrdersBySeller = () => {
    const sellerOrdersMap = {};
    
    filteredOrders.forEach(order => {
      if (order.items && order.items.length > 0) {
        // Group order items by seller ID
        const itemsBySeller = {};
        
        order.items.forEach(item => {
          if (item.sellerId && item.sellerId._id) {
            const sellerId = item.sellerId._id;
            
            if (!itemsBySeller[sellerId]) {
              itemsBySeller[sellerId] = {
                sellerId: item.sellerId._id,
                sellerName: item.sellerId.name || 'Unknown Seller',
                items: []
              };
            }
            
            itemsBySeller[sellerId].items.push(item);
          }
        });
        
        // For each seller, add the order to their list
        Object.values(itemsBySeller).forEach(sellerData => {
          const sellerId = sellerData.sellerId;
          const sellerName = sellerData.sellerName;
          
          if (!sellerOrdersMap[sellerId]) {
            sellerOrdersMap[sellerId] = {
              _id: sellerId,
              name: sellerName,
              orders: [],
              customers: {} // Group orders by customer
            };
          }
          
          // Only add the order once per seller
          const orderExists = sellerOrdersMap[sellerId].orders.some(o => o._id === order._id);
          if (!orderExists) {
            sellerOrdersMap[sellerId].orders.push(order);
            
            // Group by customer
            const customerId = order.customerId?._id;
            if (customerId) {
              if (!sellerOrdersMap[sellerId].customers[customerId]) {
                sellerOrdersMap[sellerId].customers[customerId] = {
                  _id: customerId,
                  name: order.customerId.name || 'Unknown Customer',
                  orders: []
                };
              }
              sellerOrdersMap[sellerId].customers[customerId].orders.push(order);
            }
          }
        });
      }
    });
    
    return sellerOrdersMap;
  };
  
  const ordersBySeller = getOrdersBySeller();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
      </div>

      {/* Filter and Search */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label htmlFor="seller-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Seller
            </label>
            <select
              id="seller-filter"
              value={sellerFilter}
              onChange={handleSellerFilterChange}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            >
              <option value="">All Sellers</option>
              {sellers.map(seller => (
                <option key={seller._id} value={seller._id}>{seller.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by order ID or customer name"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
      </div>

      {/* View Selector */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex gap-4">
          <button 
            className={`px-4 py-2 rounded ${statusFilter === '' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setStatusFilter('')}
          >
            All Orders
          </button>
          <button 
            className={`px-4 py-2 rounded ${statusFilter.toLowerCase() === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setStatusFilter('Pending')}
          >
            Pending Orders
          </button>
          <button 
            className={`px-4 py-2 rounded ${statusFilter.toLowerCase() === 'processing' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setStatusFilter('Processing')}
          >
            Processing Orders
          </button>
          <button 
            className={`px-4 py-2 rounded ${statusFilter.toLowerCase() === 'shipped' ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setStatusFilter('Shipped')}
          >
            Shipped Orders
          </button>
          <button 
            className={`px-4 py-2 rounded ${statusFilter.toLowerCase() === 'delivered' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setStatusFilter('Delivered')}
          >
            Delivered Orders
          </button>
          <button 
            className={`px-4 py-2 rounded ${statusFilter.toLowerCase() === 'cancelled' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setStatusFilter('Cancelled')}
          >
            Cancelled Orders
          </button>
        </div>
      </div>

      {/* Orders By Seller View */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Orders by Seller</h2>
        
        {Object.keys(ordersBySeller).length > 0 ? (
          Object.keys(ordersBySeller).map(sellerId => (
            <div key={sellerId} className="bg-white shadow rounded-lg mb-6 overflow-hidden">
              <div className="bg-gray-100 p-4 border-b">
                <h3 className="text-lg font-semibold">{ordersBySeller[sellerId].name}</h3>
                <p className="text-sm text-gray-500">
                  {ordersBySeller[sellerId].orders.length} {ordersBySeller[sellerId].orders.length === 1 ? 'Order' : 'Orders'}
                </p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
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
                    {ordersBySeller[sellerId].orders.map(order => (
                      <tr key={order._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {order._id.substring(order._id.length - 8)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {typeof order.customerId === 'object' ? order.customerId?.name : 'Unknown Customer'}
                          </div>
                          {typeof order.customerId === 'object' && order.customerId?.email && (
                            <div className="text-xs text-gray-500">{order.customerId.email}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(order.createdAt || order.orderDate).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(order.createdAt || order.orderDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            LKR {calculateOrderTotal(order).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.items ? `${order.items.length} ${order.items.length === 1 ? 'item' : 'items'}` : '0 items'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
                            {order.status || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link to={`/admin/orders/${order._id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                            View
                          </Link>
                          <div className="inline-block relative">
                            <select 
                              className="text-indigo-600 hover:text-indigo-900 bg-transparent border-none cursor-pointer"
                              value=""
                              onChange={(e) => {
                                if (e.target.value) {
                                  updateOrderStatus(order._id, e.target.value);
                                  e.target.value = '';
                                }
                              }}
                            >
                              <option value="">Update Status</option>
                              <option value="Pending">Set as Pending</option>
                              <option value="Processing">Set as Processing</option>
                              <option value="Shipped">Set as Shipped</option>
                              <option value="Delivered">Set as Delivered</option>
                              <option value="Cancelled">Set as Cancelled</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
            No orders found
          </div>
        )}
      </div>
      
      {/* All Orders Table */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">All Orders</h2>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seller
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
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
                {filteredOrders.length > 0 ? (
                  filteredOrders.map(order => (
                    <tr key={order._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order._id.substring(order._id.length - 8)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {typeof order.customerId === 'object' ? order.customerId?.name : 'Unknown Customer'}
                        </div>
                        {typeof order.customerId === 'object' && order.customerId?.email && (
                          <div className="text-xs text-gray-500">{order.customerId.email}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {order.items && order.items.length > 0 ? (
                          <div>
                            <div className="text-sm text-gray-900">
                              {typeof order.items[0].sellerId === 'object' && order.items[0].sellerId?.name 
                                ? order.items[0].sellerId?.name 
                                : 'Unknown Seller'}
                            </div>
                            {order.items.length > 1 && (
                              <div className="text-xs text-gray-500">
                                + {order.items.length - 1} more {order.items.length - 1 === 1 ? 'seller' : 'sellers'}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">No Items</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(order.createdAt || order.orderDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(order.createdAt || order.orderDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          LKR {calculateOrderTotal(order).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.items ? `${order.items.length} ${order.items.length === 1 ? 'item' : 'items'}` : '0 items'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
                          {order.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link to={`/admin/orders/${order._id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                          View
                        </Link>
                        <div className="inline-block relative">
                          <select 
                            className="text-indigo-600 hover:text-indigo-900 bg-transparent border-none cursor-pointer"
                            value=""
                            onChange={(e) => {
                              if (e.target.value) {
                                updateOrderStatus(order._id, e.target.value);
                                e.target.value = '';
                              }
                            }}
                          >
                            <option value="">Update Status</option>
                            <option value="Pending">Set as Pending</option>
                            <option value="Processing">Set as Processing</option>
                            <option value="Shipped">Set as Shipped</option>
                            <option value="Delivered">Set as Delivered</option>
                            <option value="Cancelled">Set as Cancelled</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrdersList;