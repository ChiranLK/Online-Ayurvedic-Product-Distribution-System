import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';

const TodaysSchedule = () => {
  const [schedule, setSchedule] = useState({
    morning: [],
    afternoon: [],
    evening: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [today, setToday] = useState('');

  useEffect(() => {
    const fetchTodaysAppointments = async () => {
      try {
        const response = await api.get('/api/appointments/today');
        console.log('Today\'s appointments response:', response.data);
        
        if (response.data && response.data.data) {
          setSchedule(response.data.data);
          setToday(response.data.formattedDate);
        } else {
          console.error('Invalid response format:', response.data);
          setError('Invalid response format from server');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching today\'s schedule:', err);
        setError('Failed to load today\'s schedule');
        setLoading(false);
      }
    };

    fetchTodaysAppointments();
  }, []);

  // Format time for better display
  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return timeString;
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

  // Render an appointment card
  const renderAppointmentCard = (appointment) => {
    return (
      <div key={appointment._id} className="bg-white p-4 rounded-lg shadow mb-4 border-l-4 border-green-600">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-medium text-lg text-gray-900">{appointment.customerName}</h4>
            <div className="mt-1">
              <span className="text-gray-600 font-medium">Time:</span> 
              <span className="text-gray-800 ml-1">{formatTime(appointment.scheduledTime)}</span>
            </div>
            <div className="mt-1">
              <span className="text-gray-600 font-medium">Venue:</span> 
              <span className="text-gray-800 ml-1">{appointment.venue}</span>
            </div>
            {appointment.problem && (
              <div className="mt-2">
                <span className="text-gray-600 font-medium">Health Issue:</span>
                <p className="text-gray-800 mt-1 text-sm">{appointment.problem}</p>
              </div>
            )}
          </div>
          <Link 
            to={`/admin/appointments/${appointment._id}`} 
            className="bg-green-50 hover:bg-green-100 text-green-800 font-medium py-1 px-3 rounded-md text-sm"
          >
            Details
          </Link>
        </div>
      </div>
    );
  };
  
  // Render a time slot section
  const renderTimeSlot = (title, appointments, iconClass) => {
    return (
      <div className="mb-6">
        <div className="flex items-center mb-3">
          <i className={`${iconClass} mr-2 text-green-600`}></i>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <span className="bg-green-100 text-green-800 text-xs font-semibold ml-2 px-2.5 py-0.5 rounded">
            {appointments.length} Appointments
          </span>
        </div>
        
        {appointments.length > 0 ? (
          <div className="space-y-3">
            {appointments.map(appointment => renderAppointmentCard(appointment))}
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-gray-500">No appointments scheduled</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-green-800">Today's Schedule</h2>
        <span className="text-gray-600 font-medium">{today}</span>
      </div>

      <div className="divide-y divide-gray-200">
        {renderTimeSlot("Morning (9AM-12PM)", schedule.morning, "fas fa-sun")}
        {renderTimeSlot("Afternoon (1PM-5PM)", schedule.afternoon, "fas fa-cloud-sun")}
        {renderTimeSlot("Evening (6PM-9PM)", schedule.evening, "fas fa-moon")}
      </div>
      
      <div className="mt-6 flex justify-between">
        <Link 
          to="/admin/appointments" 
          className="text-gray-600 hover:text-gray-900 flex items-center"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back to All Appointments
        </Link>
        <button
          onClick={() => window.print()}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded inline-flex items-center"
        >
          <i className="fas fa-print mr-2"></i>
          Print Schedule
        </button>
      </div>
    </div>
  );
};

export default TodaysSchedule;
