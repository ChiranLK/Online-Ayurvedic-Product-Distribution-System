import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';

// Lazy load export libraries to prevent build errors if they're not available
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

const SalesReport = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [sellerFilter, setSellerFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sellers, setSellers] = useState([]);
  const [csvData, setCsvData] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        console.log('Fetching orders for sales report...');
        const response = await api.get('/api/orders');
        console.log('Orders API response:', response.data);
        
        // Handle both data structures: response.data.data (if wrapped) or response.data (if direct array)
        const ordersData = response.data.data || response.data || [];
        console.log('Processed orders data:', ordersData);
        setOrders(ordersData);
        
        // Extract unique sellers
        extractSellers(ordersData);
        
        setLoading(false);
      } catch (err) {
        setError(`Failed to fetch orders: ${err.message}`);
        setLoading(false);
        console.error('Error fetching orders:', err);
      }
    };

    fetchOrders();
  }, []);

  const extractSellers = (ordersData) => {
    const allSellers = ordersData
      .filter(order => order.items && Array.isArray(order.items))
      .flatMap(order => order.items)
      .filter(item => item && item.seller && typeof item.seller === 'object')
      .map(item => ({
        _id: item.seller._id,
        name: item.seller.name || 'Unknown Seller'
      }));
    
    // Remove duplicates
    const uniqueSellers = allSellers.filter((seller, index, self) =>
      index === self.findIndex((s) => s && s._id === seller._id)
    );
    
    setSellers(uniqueSellers);
  };

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSellerFilterChange = (e) => {
    setSellerFilter(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const filteredOrders = orders.filter(order => {
    // Handle potential null/undefined values safely
    if (!order) return false;
    
    let dateMatch = true;
    if (dateRange.startDate) {
      dateMatch = dateMatch && new Date(order.createdAt || order.orderDate) >= new Date(dateRange.startDate);
    }
    if (dateRange.endDate) {
      dateMatch = dateMatch && new Date(order.createdAt || order.orderDate) <= new Date(`${dateRange.endDate}T23:59:59`);
    }
    
    let sellerMatch = !sellerFilter;
    if (sellerFilter && order.items && Array.isArray(order.items)) {
      sellerMatch = order.items.some(item => 
        item && item.seller && item.seller._id === sellerFilter
      );
    }
    
    let statusMatch = !statusFilter || (order.status && order.status.toLowerCase() === statusFilter.toLowerCase());
    
    return dateMatch && sellerMatch && statusMatch;
  });

  // Calculate sales statistics
  const filteredTotalSales = filteredOrders.reduce((total, order) => {
    return order.status?.toLowerCase() !== 'cancelled' 
      ? total + (order.totalAmount || 0) 
      : total;
  }, 0);
  
  const filteredTotalOrders = filteredOrders.filter(order => 
    order.status?.toLowerCase() !== 'cancelled'
  ).length;

  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
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
      doc.text('Sales Report', pageWidth / 2, 15, { align: 'center' });
      
      // Add report date range
      doc.setFontSize(12);
      const reportDateText = `Report generated on ${new Date().toLocaleDateString()}`;
      doc.text(reportDateText, pageWidth / 2, 22, { align: 'center' });
      
      if (dateRange.startDate || dateRange.endDate) {
        const filterText = `Date Range: ${dateRange.startDate || 'All'} to ${dateRange.endDate || 'All'}`;
        doc.text(filterText, pageWidth / 2, 29, { align: 'center' });
      }
      
      // Add summary section
      doc.setFontSize(14);
      doc.text('Summary', 14, 40);
      
      doc.setFontSize(12);
      doc.text(`Total Orders: ${filteredTotalOrders}`, 14, 48);
      doc.text(`Total Sales: LKR ${filteredTotalSales.toFixed(2)}`, 14, 55);
      
      // Add orders table
      const tableColumn = [
        "Order ID", 
        "Customer", 
        "Date", 
        "Items", 
        "Amount", 
        "Status"
      ];
      
      const tableRows = filteredOrders.map(order => [
        order._id.substring(order._id.length - 8),
        typeof order.customerId === 'object' ? order.customerId?.name : 'Unknown Customer',
        formatDate(order.createdAt || order.orderDate),
        order.items?.length || 0,
        `LKR ${(order.totalAmount || 0).toFixed(2)}`,
        order.status || 'Unknown'
      ]);
      
      // Check if autotable plugin is available
      if (doc.autoTable) {
        doc.autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: 65,
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
        doc.text("Table plugin not loaded. Basic report generated.", 14, 65);
        
        // Add basic table manually
        let yPos = 75;
        for (let i = 0; i < Math.min(tableRows.length, 10); i++) {
          doc.text(`${tableRows[i][0]}: ${tableRows[i][1]} - ${tableRows[i][4]}`, 14, yPos);
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
        doc.text('Ayurveda - Sales Report', 14, doc.internal.pageSize.height - 10);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 25, doc.internal.pageSize.height - 10);
      }
      
      // Save the PDF
      doc.save(`Sales_Report_${new Date().toISOString().split('T')[0]}.pdf`);
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
        'Customer': typeof order.customerId === 'object' ? order.customerId?.name : 'Unknown Customer',
        'Date': formatDate(order.createdAt || order.orderDate),
        'Item Count': order.items?.length || 0,
        'Amount': order.totalAmount || 0,
        'Status': order.status || 'Unknown'
      }));
      
      const ws = XLSX.utils.json_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sales Report');
      
      if (saveAs) {
        // If FileSaver is available, use it
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `Sales_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
      } else {
        // Fallback to XLSX.writeFile if available
        if (XLSX.writeFile) {
          XLSX.writeFile(wb, `Sales_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
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
        'Customer': typeof order.customerId === 'object' ? order.customerId?.name : 'Unknown Customer',
        'Date': formatDate(order.createdAt || order.orderDate),
        'Item Count': order.items?.length || 0,
        'Amount': order.totalAmount || 0,
        'Status': order.status || 'Unknown'
      }));
      setCsvData(data);
    }
  }, [filteredOrders]);

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
        <h1 className="text-2xl font-bold text-gray-800">Sales Reports</h1>
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
                // CSV Link component is available, but we need to trigger it programmatically
                document.getElementById('csv-download-sales').click();
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
                id="csv-download-sales"
                data={csvData}
                filename={`Sales_Report_${new Date().toISOString().split('T')[0]}.csv`}
              />
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="start-date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateRangeChange}
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
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateRangeChange}
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
              onChange={handleSellerFilterChange}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            >
              <option value="">All Sellers</option>
              {sellers.map(seller => (
                <option key={seller._id} value={seller._id}>
                  {seller.name}
                </option>
              ))}
            </select>
          </div>
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
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Total Orders</h2>
          <p className="text-3xl font-bold text-gray-900">{filteredTotalOrders}</p>
          <p className="text-sm text-gray-500 mt-1">Excluding cancelled orders</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Total Sales</h2>
          <p className="text-3xl font-bold text-gray-900">LKR {filteredTotalSales.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">Revenue from completed orders</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Average Order Value</h2>
          <p className="text-3xl font-bold text-gray-900">
            LKR {filteredTotalOrders > 0 ? (filteredTotalSales / filteredTotalOrders).toFixed(2) : '0.00'}
          </p>
          <p className="text-sm text-gray-500 mt-1">Average amount per order</p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Orders List</h2>
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map(order => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order._id.substring(order._id.length - 8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {typeof order.customerId === 'object' ? order.customerId?.name : 'Unknown Customer'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.createdAt || order.orderDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.items?.length || 0} items
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    LKR {(order.totalAmount || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${order.status?.toLowerCase() === 'delivered' ? 'bg-green-100 text-green-800' : ''}
                      ${order.status?.toLowerCase() === 'shipped' ? 'bg-blue-100 text-blue-800' : ''}
                      ${order.status?.toLowerCase() === 'processing' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${order.status?.toLowerCase() === 'pending' ? 'bg-orange-100 text-orange-800' : ''}
                      ${order.status?.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {order.status || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link to={`/admin/orders/${order._id}`} className="text-indigo-600 hover:text-indigo-900">
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="px-6 py-4 text-center text-gray-500">
            No orders found matching the selected filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesReport;
