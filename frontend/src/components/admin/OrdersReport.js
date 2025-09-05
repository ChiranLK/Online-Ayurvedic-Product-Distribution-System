import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import { format } from 'date-fns';

// Lazy load export libraries
let jsPDF;
let XLSX;
let saveAs;
let CSVLinkComponent;

// Try to import the libraries
try {
  // Dynamic imports for PDF generation
  import('jspdf').then(module => {
    jsPDF = module.default;
    import('jspdf-autotable');
  }).catch(err => console.error('Error loading jsPDF:', err));
  
  // Import for Excel export
  import('xlsx').then(module => {
    XLSX = module;
  }).catch(err => console.error('Error loading xlsx:', err));
  
  // Import for file saving
  import('file-saver').then(module => {
    saveAs = module.saveAs;
  }).catch(err => console.error('Error loading file-saver:', err));
  
  // Import for CSV export
  import('react-csv').then(module => {
    CSVLinkComponent = module.CSVLink;
  }).catch(err => console.error('Error loading react-csv:', err));
} catch (error) {
  console.error('Error importing export libraries:', error);
}

const OrdersReport = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [csvData, setCsvData] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [sellerFilter, setSellerFilter] = useState('');
  const [sellers, setSellers] = useState([]);
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        console.log('Fetching orders from /api/admin/orders...');
        
        const response = await api.get('/api/admin/orders');
        console.log('Response received:', response.status);
        
        if (response.data && response.data.success) {
          console.log('Successfully fetched orders. Count:', response.data.count || 'N/A');
          const ordersData = response.data.orders || [];
          
          // Sort orders by date (most recent first)
          const sortedOrders = ordersData.sort((a, b) => {
            // Use orderDate if available, fall back to createdAt
            const dateA = new Date(b.orderDate || b.createdAt);
            const dateB = new Date(a.orderDate || a.createdAt);
            return dateA - dateB;
          });
          
          setOrders(sortedOrders);
        } else {
          console.warn('No orders found or success flag is false');
          setOrders([]);
        }
        
        setLoading(false);
      } catch (err) {
        setError(`Failed to fetch orders: ${err.message}`);
        setLoading(false);
        console.error('Error fetching orders:', err);
        console.error('Response details:', err.response?.data || 'No response data');
      }
    };
    
    const fetchSellers = async () => {
      try {
        const response = await api.get('/api/admin/sellers');
        if (response.data && response.data.sellers) {
          setSellers(response.data.sellers);
        }
      } catch (err) {
        console.error('Error fetching sellers:', err);
      }
    };

    fetchOrders();
    fetchSellers();
  }, []);

  // Apply filters
  const getFilteredOrders = () => {
    return orders.filter(order => {
      // Handle potential null/undefined values
      if (!order) return false;
      
      // Search term filter (customer name or order ID)
      const searchMatch = order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        order.customerId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        false;
                      
      // Status filter - Normalize case for matching
      const orderStatus = order.status?.toLowerCase() || '';
      const filterStatus = statusFilter?.toLowerCase() || '';
      const statusMatch = !statusFilter || orderStatus === filterStatus;
      
      // Date filter (single date)
      let dateMatch = true;
      if (dateFilter) {
        const orderDate = new Date(order.orderDate || order.createdAt).toISOString().split('T')[0];
        dateMatch = orderDate === dateFilter;
      }
      
      // Date range filter
      let dateRangeMatch = true;
      if (dateRange.startDate && dateRange.endDate) {
        const orderDate = new Date(order.orderDate || order.createdAt);
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        // Set endDate to end of day (23:59:59)
        endDate.setHours(23, 59, 59, 999);
        
        dateRangeMatch = orderDate >= startDate && orderDate <= endDate;
      }
      
      // Seller filter
      let sellerMatch = true;
      if (sellerFilter) {
        // Check if any item in the order has the selected seller
        sellerMatch = order.items.some(item => 
          (item.sellerId && item.sellerId._id === sellerFilter) ||
          (item.productId && item.productId.sellerId && item.productId.sellerId._id === sellerFilter)
        );
      }
      
      return searchMatch && statusMatch && dateMatch && dateRangeMatch && sellerMatch;
    });
  };

  const filteredOrders = getFilteredOrders();
  
  // Calculate statistics
  const totalOrders = filteredOrders.length;
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  
  // Case-insensitive status comparison
  const pendingOrders = filteredOrders.filter(order => 
    order.status?.toLowerCase() === 'pending').length;
  const processingOrders = filteredOrders.filter(order => 
    order.status?.toLowerCase() === 'processing').length;
  const shippedOrders = filteredOrders.filter(order => 
    order.status?.toLowerCase() === 'shipped').length;
  const deliveredOrders = filteredOrders.filter(order => 
    order.status?.toLowerCase() === 'delivered').length;
  const cancelledOrders = filteredOrders.filter(order => 
    order.status?.toLowerCase() === 'cancelled').length;
  
  // Reset all filters
  const resetFilters = () => {
    setStatusFilter('');
    setDateFilter('');
    setDateRange({ startDate: '', endDate: '' });
    setSearchTerm('');
    setSellerFilter('');
  };
  
  // Generate PDF report
  const generatePDF = () => {
    if (!jsPDF) {
      alert('PDF generation library is still loading. Please try again in a moment.');
      return;
    }
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Add title
      doc.setFontSize(18);
      doc.text('Orders Report', pageWidth / 2, 15, { align: 'center' });
      
      // Add report date
      doc.setFontSize(12);
      const reportDateText = `Report generated on ${new Date().toLocaleDateString()}`;
      doc.text(reportDateText, pageWidth / 2, 22, { align: 'center' });
      
      // Add filters if applied
      let filterText = '';
      if (statusFilter) filterText += `Status: ${statusFilter} `;
      if (dateFilter) filterText += `Date: ${dateFilter} `;
      if (dateRange.startDate && dateRange.endDate) {
        filterText += `Period: ${dateRange.startDate} to ${dateRange.endDate} `;
      }
      if (sellerFilter) {
        const seller = sellers.find(s => s._id === sellerFilter);
        if (seller) filterText += `Seller: ${seller.name} `;
      }
      if (searchTerm) filterText += `Search: ${searchTerm}`;
      
      if (filterText) {
        doc.text(`Filters: ${filterText}`, pageWidth / 2, 29, { align: 'center' });
      }
      
      // Add summary section
      doc.setFontSize(14);
      doc.text('Summary', 14, 40);
      
      doc.setFontSize(12);
      doc.text(`Total Orders: ${totalOrders}`, 14, 48);
      doc.text(`Total Revenue: LKR ${totalRevenue.toFixed(2)}`, 14, 55);
      doc.text(`Pending: ${pendingOrders}`, 14, 62);
      doc.text(`Processing: ${processingOrders}`, 14, 69);
      doc.text(`Shipped: ${shippedOrders}`, 14, 76);
      doc.text(`Delivered: ${deliveredOrders}`, 14, 83);
      doc.text(`Cancelled: ${cancelledOrders}`, 14, 90);
      
      // Add orders table
      const tableColumn = [
        "Order ID", 
        "Customer", 
        "Date", 
        "Items", 
        "Total",
        "Status"
      ];
      
      const tableRows = filteredOrders.map(order => [
        order._id.substring(order._id.length - 8),
        order.customerId?.name || 'Guest',
        new Date(order.orderDate || order.createdAt).toLocaleDateString(),
        order.items?.length || 0,
        `LKR ${(order.totalAmount || 0).toFixed(2)}`,
        order.status?.charAt(0).toUpperCase() + order.status?.slice(1).toLowerCase() || 'Unknown'
      ]);
      
      // Check if autotable plugin is available
      if (doc.autoTable) {
        doc.autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: 97,
          theme: 'grid',
          styles: {
            fontSize: 10,
            cellPadding: 3,
            overflow: 'linebreak',
            halign: 'left'
          },
          headStyles: {
            fillColor: [39, 100, 59],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [240, 240, 240]
          }
        });
      } else {
        // Fallback if autoTable is not available
        doc.text("Table plugin not loaded. Basic report generated.", 14, 97);
        
        // Add basic table manually
        let yPos = 107;
        for (let i = 0; i < Math.min(tableRows.length, 10); i++) {
          doc.text(`${tableRows[i][0]}: ${tableRows[i][1]} - ${tableRows[i][3]} items - ${tableRows[i][4]}`, 14, yPos);
          yPos += 7;
        }
        
        if (tableRows.length > 10) {
          doc.text(`... and ${tableRows.length - 10} more orders`, 14, yPos + 7);
        }
      }
      
      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text('Ayurveda - Orders Report', 14, doc.internal.pageSize.height - 10);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 25, doc.internal.pageSize.height - 10);
      }
      
      // Save the PDF
      doc.save(`Orders_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please check if all required libraries are loaded.');
    }
  };
  
  // Export to Excel
  const exportToExcel = () => {
    if (!XLSX) {
      alert('Excel export library is still loading. Please try again in a moment.');
      return;
    }
    
    try {
      const wsData = filteredOrders.map(order => ({
        'Order ID': order._id,
        'Customer Name': order.customerId?.name || 'Guest',
        'Customer Email': order.customerId?.email || 'N/A',
        'Order Date': new Date(order.orderDate || order.createdAt).toLocaleDateString(),
        'Status': order.status?.charAt(0).toUpperCase() + order.status?.slice(1).toLowerCase() || 'Unknown',
        'Items Count': order.items?.length || 0,
        'Total Amount': `LKR ${(order.totalAmount || 0).toFixed(2)}`,
        'Payment Method': order.paymentMethod || 'N/A',
        'Delivery Address': order.deliveryAddress || 'N/A'
      }));
      
      const ws = XLSX.utils.json_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Orders Report');
      
      if (saveAs) {
        // If FileSaver is available, use it
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `Orders_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
      } else {
        // Fallback to XLSX.writeFile if available
        if (XLSX.writeFile) {
          XLSX.writeFile(wb, `Orders_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
        } else {
          alert('File saving library not loaded. Please try again in a moment.');
        }
      }
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export to Excel. Please check if all required libraries are loaded.');
    }
  };
  
  // Prepare CSV data
  useEffect(() => {
    // Only prepare CSV data if we have orders
    if (filteredOrders.length > 0) {
      const data = filteredOrders.map(order => ({
        'Order ID': order._id,
        'Customer Name': order.customerId?.name || 'Guest',
        'Customer Email': order.customerId?.email || 'N/A',
        'Order Date': new Date(order.orderDate || order.createdAt).toLocaleDateString(),
        'Status': order.status?.charAt(0).toUpperCase() + order.status?.slice(1).toLowerCase() || 'Unknown',
        'Items Count': order.items?.length || 0,
        'Total Amount': `LKR ${(order.totalAmount || 0).toFixed(2)}`,
        'Payment Method': order.paymentMethod || 'N/A',
        'Delivery Address': order.deliveryAddress || 'N/A'
      }));
      setCsvData(data);
    }
  }, [filteredOrders]);

  // Format date function
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'PP');  // Formats as "Apr 29, 2020"
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-800">Orders Reports</h1>
        <div className="flex gap-2">
          <button 
            onClick={generatePDF} 
            className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Export to PDF
          </button>
          
          <button 
            onClick={exportToExcel} 
            className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export to Excel
          </button>
          
          {/* CSV Export Button */}
          <button 
            onClick={() => {
              if (CSVLinkComponent) {
                document.getElementById('csv-download-orders').click();
              } else {
                alert('CSV export library is still loading. Please try again in a moment.');
              }
            }}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export to CSV
          </button>
          
          {/* Hidden CSV Link that we'll click programmatically */}
          {CSVLinkComponent && (
            <div style={{ display: 'none' }}>
              <CSVLinkComponent
                id="csv-download-orders"
                data={csvData}
                filename={`Orders_Report_${new Date().toISOString().split('T')[0]}.csv`}
              />
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by order ID or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Date
            </label>
            <input
              type="date"
              id="date-filter"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="start-date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="end-date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div>
            <label htmlFor="seller-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Seller
            </label>
            <select
              id="seller-filter"
              value={sellerFilter}
              onChange={(e) => setSellerFilter(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            >
              <option value="">All Sellers</option>
              {sellers.map(seller => (
                <option key={seller._id} value={seller._id}>{seller.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button 
            onClick={resetFilters}
            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 mb-6">
        <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Orders</h3>
          <p className="text-3xl font-bold text-gray-900">{totalOrders}</p>
          <p className="text-lg text-green-600 mt-1">Revenue: LKR {totalRevenue.toFixed(2)}</p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 lg:col-span-1">
          <h3 className="text-lg font-semibold text-yellow-600 mb-2">Pending</h3>
          <p className="text-3xl font-bold text-yellow-600">{pendingOrders}</p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 lg:col-span-1">
          <h3 className="text-lg font-semibold text-blue-600 mb-2">Processing</h3>
          <p className="text-3xl font-bold text-blue-600">{processingOrders}</p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 lg:col-span-1">
          <h3 className="text-lg font-semibold text-indigo-600 mb-2">Shipped</h3>
          <p className="text-3xl font-bold text-indigo-600">{shippedOrders}</p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 lg:col-span-1">
          <h3 className="text-lg font-semibold text-green-600 mb-2">Delivered</h3>
          <p className="text-3xl font-bold text-green-600">{deliveredOrders}</p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 lg:col-span-1">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Cancelled</h3>
          <p className="text-3xl font-bold text-red-600">{cancelledOrders}</p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Orders List</h2>
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
                  Items
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length > 0 ? (
                filteredOrders.map(order => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order._id.substring(order._id.length - 8)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {order.customerId?.name || 'Guest'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.customerId?.email || 'No email'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(order.orderDate || order.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      LKR {(order.totalAmount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status?.toLowerCase())}`}>
                        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1).toLowerCase() || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <a 
                        href={`/admin/orders/${order._id}`} 
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View
                      </a>
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
  );
};

export default OrdersReport;
