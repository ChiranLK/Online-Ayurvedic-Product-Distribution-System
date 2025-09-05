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

const AppointmentReport = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [csvData, setCsvData] = useState([]);
  
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/admin/appointments');
        console.log('Appointments API response:', response.data);
        
        const appointmentsData = response.data.data || response.data || [];
        
        // Sort appointments by scheduledDate (most recent first)
        const sortedAppointments = appointmentsData.sort((a, b) => 
          new Date(b.scheduledDate) - new Date(a.scheduledDate)
        );
        
        setAppointments(sortedAppointments);
        setLoading(false);
      } catch (err) {
        setError(`Failed to fetch appointments: ${err.message}`);
        setLoading(false);
        console.error('Error fetching appointments:', err);
      }
    };

    fetchAppointments();
  }, []);

  // Filter appointments based on search term, status, and date
  const filteredAppointments = appointments.filter(appointment => {
    // Handle potential null/undefined values
    if (!appointment) return false;
    
    const nameMatch = appointment.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      appointment.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
                      
    const statusMatch = !statusFilter || appointment.status === statusFilter;
    
    let dateMatch = true;
    if (dateFilter) {
      const appointmentDate = new Date(appointment.scheduledDate).toISOString().split('T')[0];
      dateMatch = appointmentDate === dateFilter;
    }
    
    return nameMatch && statusMatch && dateMatch;
  });
  
  // Calculate statistics
  const totalAppointments = filteredAppointments.length;
  const pendingAppointments = filteredAppointments.filter(apt => apt.status === 'pending').length;
  const approvedAppointments = filteredAppointments.filter(apt => apt.status === 'approved').length;
  const completedAppointments = filteredAppointments.filter(apt => apt.status === 'completed').length;
  const cancelledAppointments = filteredAppointments.filter(apt => apt.status === 'cancelled').length;
  
  // Reset all filters
  const resetFilters = () => {
    setStatusFilter('');
    setDateFilter('');
    setSearchTerm('');
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
      doc.text('Appointment Report', pageWidth / 2, 15, { align: 'center' });
      
      // Add report date
      doc.setFontSize(12);
      const reportDateText = `Report generated on ${new Date().toLocaleDateString()}`;
      doc.text(reportDateText, pageWidth / 2, 22, { align: 'center' });
      
      // Add filters if applied
      let filterText = '';
      if (statusFilter) filterText += `Status: ${statusFilter} `;
      if (dateFilter) filterText += `Date: ${dateFilter} `;
      if (searchTerm) filterText += `Search: ${searchTerm}`;
      
      if (filterText) {
        doc.text(`Filters: ${filterText}`, pageWidth / 2, 29, { align: 'center' });
      }
      
      // Add summary section
      doc.setFontSize(14);
      doc.text('Summary', 14, 40);
      
      doc.setFontSize(12);
      doc.text(`Total Appointments: ${totalAppointments}`, 14, 48);
      doc.text(`Pending: ${pendingAppointments}`, 14, 55);
      doc.text(`Approved: ${approvedAppointments}`, 14, 62);
      doc.text(`Completed: ${completedAppointments}`, 14, 69);
      doc.text(`Cancelled: ${cancelledAppointments}`, 14, 76);
      
      // Add appointments table
      const tableColumn = [
        "ID", 
        "Patient Name", 
        "Scheduled Date", 
        "Time Slot", 
        "Status",
        "Contact"
      ];
      
      const tableRows = filteredAppointments.map(appointment => [
        appointment._id.substring(appointment._id.length - 8),
        appointment.patientName || 'N/A',
        new Date(appointment.scheduledDate).toLocaleDateString(),
        appointment.scheduledTime || 'N/A',
        appointment.status,
        appointment.contactNumber || 'N/A'
      ]);
      
      // Check if autotable plugin is available
      if (doc.autoTable) {
        doc.autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: 83,
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
        doc.text("Table plugin not loaded. Basic report generated.", 14, 83);
        
        // Add basic table manually
        let yPos = 93;
        for (let i = 0; i < Math.min(tableRows.length, 10); i++) {
          doc.text(`${tableRows[i][0]}: ${tableRows[i][1]} - ${tableRows[i][3]} - ${tableRows[i][4]}`, 14, yPos);
          yPos += 7;
        }
        
        if (tableRows.length > 10) {
          doc.text(`... and ${tableRows.length - 10} more appointments`, 14, yPos + 7);
        }
      }
      
      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text('Ayurveda - Appointment Report', 14, doc.internal.pageSize.height - 10);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 25, doc.internal.pageSize.height - 10);
      }
      
      // Save the PDF
      doc.save(`Appointment_Report_${new Date().toISOString().split('T')[0]}.pdf`);
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
      const wsData = filteredAppointments.map(appointment => ({
        'Appointment ID': appointment._id,
        'Patient Name': appointment.patientName || 'N/A',
        'Customer Name': appointment.customerName || 'N/A',
        'Contact Number': appointment.contactNumber || 'N/A',
        'Scheduled Date': new Date(appointment.scheduledDate).toLocaleDateString(),
        'Scheduled Time': appointment.scheduledTime || 'N/A',
        'Status': appointment.status,
        'Notes': appointment.notes || ''
      }));
      
      const ws = XLSX.utils.json_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Appointment Report');
      
      if (saveAs) {
        // If FileSaver is available, use it
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `Appointment_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
      } else {
        // Fallback to XLSX.writeFile if available
        if (XLSX.writeFile) {
          XLSX.writeFile(wb, `Appointment_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
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
    // Only prepare CSV data if we have appointments
    if (filteredAppointments.length > 0) {
      const data = filteredAppointments.map(appointment => ({
        'Appointment ID': appointment._id,
        'Patient Name': appointment.patientName || 'N/A',
        'Customer Name': appointment.customerName || 'N/A',
        'Contact Number': appointment.contactNumber || 'N/A',
        'Scheduled Date': new Date(appointment.scheduledDate).toLocaleDateString(),
        'Scheduled Time': appointment.scheduledTime || 'N/A',
        'Status': appointment.status,
        'Notes': appointment.notes || ''
      }));
      setCsvData(data);
    }
  }, [filteredAppointments]);

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
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
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
        <h1 className="text-2xl font-bold text-gray-800">Appointment Reports</h1>
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
                document.getElementById('csv-download-appointments').click();
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
                id="csv-download-appointments"
                data={csvData}
                filename={`Appointment_Report_${new Date().toISOString().split('T')[0]}.csv`}
              />
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by name..."
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
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
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
          <div className="flex items-end">
            <button 
              onClick={resetFilters}
              className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Appointments</h3>
          <p className="text-3xl font-bold text-gray-900">{totalAppointments}</p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-600 mb-2">Pending</h3>
          <p className="text-3xl font-bold text-yellow-600">{pendingAppointments}</p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-600 mb-2">Approved</h3>
          <p className="text-3xl font-bold text-green-600">{approvedAppointments}</p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-600 mb-2">Completed</h3>
          <p className="text-3xl font-bold text-blue-600">{completedAppointments}</p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Cancelled</h3>
          <p className="text-3xl font-bold text-red-600">{cancelledAppointments}</p>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Appointments List</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient Info
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Appointment Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Slot
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map(appointment => (
                  <tr key={appointment._id}>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.patientName || 'N/A'}
                        </div>
                        {appointment.customerName && appointment.customerName !== appointment.patientName && (
                          <div className="text-xs text-gray-500">
                            Booked by: {appointment.customerName}
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          ID: {appointment._id.substring(appointment._id.length - 8)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(appointment.scheduledDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {appointment.scheduledTime || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {appointment.contactNumber || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(appointment.status)}`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {appointment.notes || 'No notes'}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No appointments found
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

export default AppointmentReport;
