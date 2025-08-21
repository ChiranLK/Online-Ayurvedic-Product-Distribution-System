import React, { useState, useEffect, lazy, Suspense } from 'react';
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

const InventoryReport = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sellerFilter, setSellerFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [sellers, setSellers] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/products');
        console.log('Products API response:', response.data);
        
        // Handle both data structures: response.data.data (if wrapped) or response.data (if direct array)
        const productsData = response.data.data || response.data || [];
        console.log('Processed products data:', productsData);
        setProducts(productsData);
        
        // Extract unique categories and sellers
        extractCategoriesAndSellers(productsData);
        
        setLoading(false);
      } catch (err) {
        setError(`Failed to fetch products: ${err.message}`);
        setLoading(false);
        console.error('Error fetching products:', err);
      }
    };

    fetchProducts();
  }, []);

  const extractCategoriesAndSellers = (productsData) => {
    const allCategories = productsData.map(product => product.category).filter(Boolean);
    const uniqueCategories = [...new Set(allCategories)];
    setCategories(uniqueCategories);
    
    const allSellers = productsData
      .filter(product => product.seller && typeof product.seller === 'object')
      .map(product => ({
        _id: product.seller._id,
        name: product.seller.name || 'Unknown Seller'
      }));
    
    // Remove duplicates
    const uniqueSellers = allSellers.filter((seller, index, self) =>
      index === self.findIndex((s) => s && s._id === seller._id)
    );
    
    setSellers(uniqueSellers);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
  };

  const handleSellerFilterChange = (e) => {
    setSellerFilter(e.target.value);
  };

  const handleStockFilterChange = (e) => {
    setStockFilter(e.target.value);
  };

  const filteredProducts = products.filter(product => {
    // Handle potential null/undefined values safely
    if (!product) return false;
    
    const nameMatch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const categoryMatch = !categoryFilter || product.category === categoryFilter;
    
    let sellerMatch = !sellerFilter;
    if (sellerFilter && product.seller) {
      sellerMatch = product.seller._id === sellerFilter;
    }
    
    let stockMatch = true;
    if (stockFilter === 'instock') {
      stockMatch = (product.countInStock || 0) > 0;
    } else if (stockFilter === 'lowstock') {
      stockMatch = (product.countInStock || 0) > 0 && (product.countInStock || 0) <= 10;
    } else if (stockFilter === 'outofstock') {
      stockMatch = (product.countInStock || 0) === 0;
    }
    
    return nameMatch && categoryMatch && sellerMatch && stockMatch;
  });

  // Calculate inventory statistics
  const totalProducts = filteredProducts.length;
  const totalStock = filteredProducts.reduce((sum, product) => sum + (product.countInStock || 0), 0);
  const outOfStockCount = filteredProducts.filter(product => (product.countInStock || 0) === 0).length;
  const lowStockCount = filteredProducts.filter(product => 
    (product.countInStock || 0) > 0 && (product.countInStock || 0) <= 10
  ).length;

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
      doc.text('Inventory Report', pageWidth / 2, 15, { align: 'center' });
      
      // Add report date
      doc.setFontSize(12);
      const reportDateText = `Report generated on ${new Date().toLocaleDateString()}`;
      doc.text(reportDateText, pageWidth / 2, 22, { align: 'center' });
      
      // Add filters if applied
      let filterText = '';
      if (categoryFilter) filterText += `Category: ${categoryFilter} `;
      if (sellerFilter) {
        const seller = sellers.find(s => s._id === sellerFilter);
        if (seller) filterText += `Seller: ${seller.name} `;
      }
      if (stockFilter) filterText += `Stock Status: ${stockFilter} `;
      if (searchTerm) filterText += `Search: ${searchTerm}`;
      
      if (filterText) {
        doc.text(`Filters: ${filterText}`, pageWidth / 2, 29, { align: 'center' });
      }
      
      // Add summary section
      doc.setFontSize(14);
      doc.text('Summary', 14, 40);
      
      doc.setFontSize(12);
      doc.text(`Total Products: ${totalProducts}`, 14, 48);
      doc.text(`Total Stock Count: ${totalStock} units`, 14, 55);
      doc.text(`Out of Stock Products: ${outOfStockCount}`, 14, 62);
      doc.text(`Low Stock Products: ${lowStockCount}`, 14, 69);
      
      // Add products table
      const tableColumn = [
        "Product ID", 
        "Name", 
        "Category", 
        "Price", 
        "Stock",
        "Seller"
      ];
      
      const tableRows = filteredProducts.map(product => [
        product._id.substring(product._id.length - 8),
        product.name || 'Unknown Product',
        product.category || 'Uncategorized',
        `LKR ${(product.price || 0).toFixed(2)}`,
        product.countInStock || 0,
        product.seller ? (typeof product.seller === 'object' ? product.seller.name : 'Unknown') : 'Unknown'
      ]);
      
      // Check if autotable plugin is available
      if (doc.autoTable) {
        doc.autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: 75,
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
        doc.text("Table plugin not loaded. Basic report generated.", 14, 75);
        
        // Add basic table manually
        let yPos = 85;
        for (let i = 0; i < Math.min(tableRows.length, 10); i++) {
          doc.text(`${tableRows[i][0]}: ${tableRows[i][1]} - ${tableRows[i][4]} units`, 14, yPos);
          yPos += 7;
        }
        
        if (tableRows.length > 10) {
          doc.text(`... and ${tableRows.length - 10} more products`, 14, yPos + 7);
        }
      }
      
      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text('Ayurveda - Inventory Report', 14, doc.internal.pageSize.height - 10);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 25, doc.internal.pageSize.height - 10);
      }
      
      // Save the PDF
      doc.save(`Inventory_Report_${new Date().toISOString().split('T')[0]}.pdf`);
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
      const wsData = filteredProducts.map(product => ({
        'Product ID': product._id,
        'Name': product.name || 'Unknown Product',
        'Description': product.description || '',
        'Category': product.category || 'Uncategorized',
        'Price': product.price || 0,
        'Stock': product.countInStock || 0,
        'Seller': product.seller ? (typeof product.seller === 'object' ? product.seller.name : 'Unknown') : 'Unknown'
      }));
      
      const ws = XLSX.utils.json_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Inventory Report');
      
      if (saveAs) {
        // If FileSaver is available, use it
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `Inventory_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
      } else {
        // Fallback to XLSX.writeFile if available
        if (XLSX.writeFile) {
          XLSX.writeFile(wb, `Inventory_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
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
  const [csvData, setCsvData] = useState([]);
  
  useEffect(() => {
    // Only prepare CSV data if the library is loaded and we have products
    if (filteredProducts.length > 0) {
      const data = filteredProducts.map(product => ({
        'Product ID': product._id,
        'Name': product.name || 'Unknown Product',
        'Description': product.description || '',
        'Category': product.category || 'Uncategorized',
        'Price': product.price || 0,
        'Stock': product.countInStock || 0,
        'Seller': product.seller ? (typeof product.seller === 'object' ? product.seller.name : 'Unknown') : 'Unknown'
      }));
      setCsvData(data);
    }
  }, [filteredProducts]);

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
        <h1 className="text-2xl font-bold text-gray-800">Inventory Reports</h1>
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
                document.getElementById('csv-download-inventory').click();
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
                id="csv-download-inventory"
                data={csvData}
                filename={`Inventory_Report_${new Date().toISOString().split('T')[0]}.csv`}
              />
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Products
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div>
            <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Category
            </label>
            <select
              id="category-filter"
              value={categoryFilter}
              onChange={handleCategoryFilterChange}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            >
              <option value="">All Categories</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>{category}</option>
              ))}
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
            <label htmlFor="stock-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Stock
            </label>
            <select
              id="stock-filter"
              value={stockFilter}
              onChange={handleStockFilterChange}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            >
              <option value="">All Stock Levels</option>
              <option value="instock">In Stock</option>
              <option value="lowstock">Low Stock (≤ 10)</option>
              <option value="outofstock">Out of Stock</option>
            </select>
          </div>
          <div className="flex items-end">
            <button 
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('');
                setSellerFilter('');
                setStockFilter('');
              }}
              className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Products</h3>
          <p className="text-3xl font-bold text-gray-900">{totalProducts}</p>
          <p className="text-sm text-gray-500 mt-1">
            {filteredProducts.length !== products.length ? `Filtered from ${products.length} total products` : 'All products'}
          </p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Stock</h3>
          <p className="text-3xl font-bold text-gray-900">{totalStock}</p>
          <p className="text-sm text-gray-500 mt-1">Units in inventory</p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Low Stock Products</h3>
          <p className="text-3xl font-bold text-gray-900">{lowStockCount}</p>
          <p className="text-sm text-gray-500 mt-1">10 or fewer units</p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Out of Stock</h3>
          <p className="text-3xl font-bold text-gray-900">{outOfStockCount}</p>
          <p className="text-sm text-gray-500 mt-1">
            {((outOfStockCount / totalProducts) * 100).toFixed(1)}% of products
          </p>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Inventory Details</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seller
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <tr key={product._id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {product.image && (
                          <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded-full object-cover" src={product.image} alt={product.name} />
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {product._id.substring(product._id.length - 8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.category || 'Uncategorized'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.seller ? (typeof product.seller === 'object' ? product.seller.name : 'Unknown') : 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        LKR {(product.price || 0).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.countInStock || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        (product.countInStock || 0) > 10 ? 'bg-green-100 text-green-800' :
                        (product.countInStock || 0) > 0 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {(product.countInStock || 0) > 10 ? 'In Stock' :
                         (product.countInStock || 0) > 0 ? 'Low Stock' :
                         'Out of Stock'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No products found
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

export default InventoryReport;
